package controllers

import javax.inject.Inject
import scala.concurrent.Future

import play.api.Configuration
import play.api.mvc.{Action, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.Logger

import slick.driver.SQLiteDriver.api._
import slick.jdbc.GetResult

final case class Player(membershipId: String, displayName: String)
final case class DbItem(raw: String) {
  val json = Json.parse(raw)
  val itemHash: Long = (json \ "itemHash").as[Long]
  val bucketTypeHash: Long = (json \ "bucketTypeHash").as[Long]
}

final case class ItemSummary(
    itemHash: Long,
    isGridComplete: Boolean,
    value: Int,  // get from primaryStat.value,
    damageType: Int
)

object ItemSummary {
  implicit val itemSummaryWrites: Writes[ItemSummary] = (
    (JsPath \ "itemHash").write[Long] and
    (JsPath \ "isGridComplete").write[Boolean] and
    (JsPath \ "value").write[Int] and
    (JsPath \ "damageType").write[Int]
  )(unlift(ItemSummary.unapply))

  implicit val itemSummaryReads: Reads[ItemSummary] = (
    (JsPath \ "itemHash").read[Long] and
    (JsPath \ "isGridComplete").read[Boolean] and
    (JsPath \ "primaryStat" \"value").read[Int] and
    (JsPath \ "damageType").read[Int]
  )(ItemSummary.apply _)
}

final case class ItemDetail(
    summary: ItemSummary,
    bucketTypeHash: Long,
    tierType: Int,
    tierTypeName: String,
    itemName: String,
    icon: String,
    qualityLevel: Int
)

object ItemDetail {
  def apply(summary: ItemSummary)(implicit dbItems: Map[Long, DbItem]) = {
    val dbData = dbItems(summary.itemHash)
    new ItemDetail(
      summary=summary,
      bucketTypeHash=dbData.bucketTypeHash,
      tierType=(dbData.json \ "tierType").as[Int],
      tierTypeName=(dbData.json \ "tierTypeName").as[String],
      itemName=(dbData.json \ "itemName").as[String],
      icon=(dbData.json \ "icon").as[String],
      qualityLevel=(dbData.json \ "qualityLevel").as[Int])
  }

  implicit val writes: Writes[ItemDetail] = (
    (JsPath \ "summary").write[ItemSummary] and
    (JsPath \ "bucketTypeHash").write[Long] and
    (JsPath \ "tierType").write[Int] and
    (JsPath \ "tierTypeName").write[String] and
    (JsPath \ "itemName").write[String] and
    (JsPath \ "icon").write[String] and
    (JsPath \ "qualityLevel").write[Int]
  )(unlift(ItemDetail.unapply))

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

  implicit val dbItems: Future[Map[Long, DbItem]] = getItems.map { (items: Seq[DbItem]) =>
      items
        .filter(i => Buckets.InventorySlots.contains(i.bucketTypeHash))
        .map(i => (i.itemHash, i)).toMap[Long, DbItem]
    }

  implicit val playerReads: Format[Player] = (
    (JsPath \ "membershipId").format[String] and
    (JsPath \ "displayName").format[String]
  )(Player.apply, unlift(Player.unapply))

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

            val vaultGear = dbItems.map { implicit dbi =>
                val items = (response.json \ "Response" \ "data" \ "inventory" \ "items")
                  .as[Seq[JsValue]]
                  .map(js => js.asOpt[ItemSummary])
                  .filter(_.isDefined)
                  .map { case Some(summary) => ItemDetail(summary) }.groupBy(_.bucketTypeHash)
              Gearset("vault", items)
            }


            val toonGear = toons.map { t =>
              fetch(s"/2/Account/${t.membershipId}/Character/${t.characterId}/Inventory/").flatMap {
                resp: WSResponse => {
                  val equippable = (resp.json \ "Response" \ "data" \ "buckets" \ "Equippable").as[Seq[JsValue]]

                   dbItems.map { implicit db =>
                     val items = equippable.map(
                      (js: JsValue) => {
                        val bucket = (js \ "bucketHash").as[Long]
                        val items = (js \ "items").as[Seq[JsValue]]
                        (bucket, items)
                      }).filter {
                      pair => Buckets.InventorySlots.contains(pair._1)
                    }.map(pair => (pair._1, pair._2.map(js => ItemDetail(js.as[ItemSummary])))
                    ).toMap[Long, Seq[ItemDetail]]
                    Gearset(t.characterId, items)
                  }
                }
              }
            }

            Future.sequence(vaultGear +: toonGear).map(gearsets => Ok(
              Json.obj(
                "vault" -> Json.toJson(gearsets.head),
                "toons" -> Json.toJson(gearsets.tail)
              )
            ))

          }
        }
      case _ => Future.successful(BadRequest("Invalid Membership Type"))
    }
  }
}


final case class Gearset(
    owner: String,
    helmet: Seq[ItemDetail],
    chest: Seq[ItemDetail],
    arms: Seq[ItemDetail],
    boots: Seq[ItemDetail],
    classItem: Seq[ItemDetail],
    artifact: Seq[ItemDetail],
    primary: Seq[ItemDetail],
    special: Seq[ItemDetail],
    heavy: Seq[ItemDetail],
    ghost: Seq[ItemDetail])


object Gearset {

  def apply(owner: String, items: Map[Long, Seq[ItemDetail]]) = new Gearset(
    owner,
    helmet = items.getOrElse(Buckets.Helmet, Nil),
    chest = items.getOrElse(Buckets.Chest, Nil),
    arms = items.getOrElse(Buckets.Arms, Nil),
    boots = items.getOrElse(Buckets.Boots, Nil),
    classItem = items.getOrElse(Buckets.ClassItem, Nil),
    artifact = items.getOrElse(Buckets.Artifact, Nil),
    primary = items.getOrElse(Buckets.PrimaryWeapon, Nil),
    special = items.getOrElse(Buckets.SpecialWeapon, Nil),
    heavy = items.getOrElse(Buckets.HeavyWeapon, Nil),
    ghost = items.getOrElse(Buckets.Ghost, Nil)
  )

  implicit val writes: Writes[Gearset] = (
    (JsPath \ "owner").write[String] and
    (JsPath \ "helmet").write[Seq[ItemDetail]] and
    (JsPath \ "chest").write[Seq[ItemDetail]] and
    (JsPath \ "arms").write[Seq[ItemDetail]] and
    (JsPath \ "boots").write[Seq[ItemDetail]] and
    (JsPath \ "classItem").write[Seq[ItemDetail]] and
    (JsPath \ "artifact").write[Seq[ItemDetail]] and
    (JsPath \ "primaryWeapon").write[Seq[ItemDetail]] and
    (JsPath \ "specialWeapon").write[Seq[ItemDetail]] and
    (JsPath \ "heavyWeapon").write[Seq[ItemDetail]] and
    (JsPath \ "ghost").write[Seq[ItemDetail]]
  )(unlift(Gearset.unapply))

}
