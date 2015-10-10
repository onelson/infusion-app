package controllers

import javax.inject.Inject
import scala.concurrent.{Future, ExecutionContext}

import play.api.Configuration
import play.api.mvc.{Action, Controller}

import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.Logger

import slick.driver.SQLiteDriver.api._
import slick.jdbc.GetResult

final case class Player(membershipId: String, displayName: String)
final case class DbItem(raw: String) {
  val json = Json.parse(raw)
}

final case class ItemSummary(
    itemHash: Long,
    bucketHash: Option[Long],
    isGridComplete: Boolean,
    value: Int,  // get from primaryStat.value,
    damageType: Int
)

object ItemSummary {
  implicit val itemSummaryWrites: Writes[ItemSummary] = (
    (JsPath \ "itemHash").write[Long] and
    (JsPath \ "bucketHash").writeNullable[Long] and
    (JsPath \ "isGridComplete").write[Boolean] and
    (JsPath \ "value").write[Int] and
    (JsPath \ "damageType").write[Int]
  )(unlift(ItemSummary.unapply))

  implicit val itemSummaryReads: Reads[ItemSummary] = (
    (JsPath \ "itemHash").read[Long] and
    (JsPath \ "bucketHash").readNullable[Long] and
    (JsPath \ "isGridComplete").read[Boolean] and
    (JsPath \ "primaryStat" \"value").read[Int] and
    (JsPath \ "damageType").read[Int]
  )(ItemSummary.apply _)
}

final case class Toon(membershipId: String, characterId: String, membershipType: Int)

object Toon {
  implicit val toonFormat: Format[Toon] = (
    (JsPath \ "membershipId").format[String] and
    (JsPath \ "characterId").format[String] and
    (JsPath \ "membershipType").format[Int]
  )(Toon.apply, unlift(Toon.unapply))
}

object Buckets {

  val Helmet = 3448274439l
  val Chest = 14239492l
  val Arms = 3551918588l
  val Boots = 20886954l
  val ClassItem = 1585787867l
  val Artifact = 434908299l

  val PrimaryWeapon = 1498876634l
  val SpecialWeapon = 2465295065l
  val HeavyWeapon = 953998645l
  val Ghost = 4023194814l

  val InventorySlots = Seq(
    Helmet,
    Chest,
    Arms,
    Boots,
    ClassItem,
    Artifact,
    PrimaryWeapon,
    SpecialWeapon,
    HeavyWeapon,
    Ghost)

  val VaultArmor = 3003523923l
  val VaultWeapon = 4046403665l

  val VaultSlots = Seq(VaultArmor, VaultWeapon)

}


class BungieApi @Inject() (ws: WSClient, config: Configuration) extends Controller {

  val API_KEY =
    config.getString("afc.bungieApiKey").fold("")((v: String) => v)
  val DATA_DIR  =
    config.getString("afc.bungieDataDir").fold("")((v: String) => v)
  val DB_FILE  =
    config.getString("afc.bungieDbFile").fold("")((v: String) => v)

  val membershipTypes = Map("psn" -> "TigerPSN", "xbox" -> "TigerXbox")

  implicit val getItemResult:GetResult[DbItem] =
    GetResult(r => DbItem(r.nextString))

  val db = Database.forURL(s"jdbc:sqlite:$DATA_DIR$DB_FILE")

  def getItems = {
    val query = sql"select json from DestinyInventoryItemDefinition".as[DbItem]
    db.run(query)
  }

  implicit val playerReads: Format[Player] = (
    (JsPath \ "membershipId").format[String] and
    (JsPath \ "displayName").format[String]
  )(Player.apply, unlift(Player.unapply))

  implicit val context: ExecutionContext =
    play.api.libs.concurrent.Execution.Implicits.defaultContext

  def fetch(path: String) = {
    val url = "https://www.bungie.net/Platform/Destiny" + path
    Logger.debug(s"fetching: $url")
    ws.url(url)
      .withQueryString("definitions" -> "false")
      .withHeaders("X-API-Key" -> API_KEY).get()
  }

  /**
   * @param platform Should be one of keys in `membershipTypes`
   * @param playerName Name of the player to find
   */
  def playerSearch(platform: String, playerName: String) = Action.async {
    membershipTypes.get(platform) match {
      case Some(membershipType) => fetch(s"/SearchDestinyPlayer/$membershipType/$playerName/").map {
        response: WSResponse =>
          (response.json \ "Response" ).as[Seq[Player]].headOption match {
            case Some(player) => Ok(Json.toJson(player))
            case _ => NotFound("Player not found.")
          }
      }
      case _ => Future.successful(BadRequest("Invalid Membership Type"))
    }
  }

  def dbtest = Action.async {
    getItems.map {
      (items: Seq[DbItem]) =>
        val groups = items.groupBy((item: DbItem) => (item.json \ "bucketTypeHash").get.toString())

        val buckets: Map[String, JsArray] = groups.map {
          case (k, v) => (k.toString, Json.arr(v.map((i: DbItem) => (i.json \ "itemTypeName").getOrElse(JsNull)).distinct))
        }

        Ok(Json.toJson(buckets))
    }
  }

  def inventory(platform: String, membershipId: String) = Action.async {
    membershipTypes.get(platform) match {
      case Some(membershipType) =>
        fetch(s"/$membershipType/Account/$membershipId/Summary/").flatMap {
          response: WSResponse => {

            val toons = (response.json \ "Response" \ "data" \ "characters").as[Seq[JsValue]].map(js => (js \ "characterBase").as[Toon])

            val vaultItems = (response.json \ "Response" \ "data" \ "inventory" \ "items")
              .as[Seq[JsValue]]
              .map(js => js.asOpt[ItemSummary])
              .filter(_.isDefined)
              .map(_.get)

            val toonGear = toons.map { t =>
              fetch(s"/2/Account/${t.membershipId}/Character/${t.characterId}/Inventory/").map {
                resp: WSResponse => {
                  val equippable = (resp.json \ "Response" \ "data" \ "buckets" \ "Equippable").as[Seq[JsValue]]
                  val items = equippable
                      .map {(js: JsValue) => {
                          val bucket = (js \ "bucketHash").as[Long]
                          val items = (js \ "items").as[Seq[JsValue]]
                          (bucket, items)
                        }
                      }
                      .filter { pair => Buckets.InventorySlots.contains(pair._1) }.toMap

                  Gearset(t.characterId,
                    helmet = extractItems(items.get(Buckets.Helmet)),
                    chest = extractItems(items.get(Buckets.Chest)),
                    arms = extractItems(items.get(Buckets.Arms)),
                    boots = extractItems(items.get(Buckets.Boots)),
                    classItem = extractItems(items.get(Buckets.ClassItem)),
                    artifact = extractItems(items.get(Buckets.Artifact)),
                    primary = extractItems(items.get(Buckets.PrimaryWeapon)),
                    special = extractItems(items.get(Buckets.SpecialWeapon)),
                    heavy = extractItems(items.get(Buckets.HeavyWeapon)),
                    ghost = extractItems(items.get(Buckets.Ghost))
                  )
                }
              }
            }

            Future.sequence(toonGear).map(toons => Ok(
              Json.obj(
                "toons" -> Json.toJson(toons)
//                "vault" -> Json.toJson(Gearset("", items = vaultItems))
              )
            ))

          }
        }
      case _ => Future.successful(BadRequest("Invalid Membership Type"))
    }
  }

  def extractItems(maybeItems: Option[Seq[JsValue]]): Seq[ItemSummary] = maybeItems.map {
    data => data.map(_.as[ItemSummary])
  }.getOrElse(Nil)

}


final case class Gearset(
    owner: String,
    helmet: Seq[ItemSummary],
    chest: Seq[ItemSummary],
    arms: Seq[ItemSummary],
    boots: Seq[ItemSummary],
    classItem: Seq[ItemSummary],
    artifact: Seq[ItemSummary],
    primary: Seq[ItemSummary],
    special: Seq[ItemSummary],
    heavy: Seq[ItemSummary],
    ghost: Seq[ItemSummary])


object Gearset {
  implicit val gearsetWrites: Writes[Gearset] = (
    (JsPath \ "owner").write[String] and
    (JsPath \ "helmet").write[Seq[ItemSummary]] and
    (JsPath \ "chest").write[Seq[ItemSummary]] and
    (JsPath \ "arms").write[Seq[ItemSummary]] and
    (JsPath \ "boots").write[Seq[ItemSummary]] and
    (JsPath \ "classItem").write[Seq[ItemSummary]] and
    (JsPath \ "artifact").write[Seq[ItemSummary]] and
    (JsPath \ "primaryWeapon").write[Seq[ItemSummary]] and
    (JsPath \ "specialWeapon").write[Seq[ItemSummary]] and
    (JsPath \ "heavyWeapon").write[Seq[ItemSummary]] and
    (JsPath \ "ghost").write[Seq[ItemSummary]]
  )(unlift(Gearset.unapply))

}
