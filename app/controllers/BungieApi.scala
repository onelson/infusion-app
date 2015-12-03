package controllers


import javax.inject.Inject
import java.io._
import java.util.zip.ZipInputStream

import scala.concurrent.Future

import play.api.Configuration
import play.api.mvc.{Request, Session, Action, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.Logger

import slick.driver.SQLiteDriver.api._
import slick.jdbc.GetResult


final case class DbItem(raw: String) {
  val json = Json.parse(raw)
  val itemHash: Long = (json \ "itemHash").as[Long]
  val bucketTypeHash: Long = (json \ "bucketTypeHash").as[Long]
}

final case class ItemSummary(
    itemHash: Long,
    itemId: String,
    characterIndex: Int,
    isGridComplete: Boolean,
    value: Int,  // get from primaryStat.value,
    damageType: Int
)

object ItemSummary {
  implicit val itemSummaryWrites: Writes[ItemSummary] = (
    (JsPath \ "itemHash").write[Long] and
    (JsPath \ "itemId").write[String] and
    (JsPath \ "characterIndex").write[Int] and
    (JsPath \ "isGridComplete").write[Boolean] and
    (JsPath \ "value").write[Int] and
    (JsPath \ "damageType").write[Int]
  )(unlift(ItemSummary.unapply))

  implicit val itemSummaryReads: Reads[ItemSummary] = (
    (JsPath \ "itemHash").read[Long] and
    (JsPath \ "itemId").read[String] and
    (JsPath \ "characterIndex").read[Int] and
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
  def apply(summary: ItemSummary, dbItem: DbItem) = {
    new ItemDetail(
      summary=summary,
      bucketTypeHash=dbItem.bucketTypeHash,
      tierType=(dbItem.json \ "tierType").as[Int],
      tierTypeName=(dbItem.json \ "tierTypeName").as[String],
      itemName=(dbItem.json \ "itemName").as[String],
      icon=(dbItem.json \ "icon").as[String],
      qualityLevel=(dbItem.json \ "qualityLevel").as[Int])
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

  val GearSlots = VaultSlots ++ InventorySlots

}


class BungieApi @Inject() (ws: WSClient, config: Configuration) extends Controller {

  val API_KEY =
    config.getString("afc.bungieApiKey").fold("")((v: String) => v)
  val DATA_DIR  =
    config.getString("afc.bungieDataDir").fold("")((v: String) => v)
  val DB_FILE  =
    config.getString("afc.bungieDbFile").fold("")((v: String) => v)

  val membershipTypes = Map("psn" -> "TigerPSN", "xbox" -> "TigerXbox")


  def requestHeadersFromSession(session: Session) = {
    val bungieCookies: Seq[(String, String)] = Seq(
      ("bungled", session("bungled")),
      ("bungleatk", session("bungleatk")),
      ("bungledid", session("bungledid"))
    )

    Seq(
      ("x-api-key", API_KEY),
      ("x-csrf", session("bungled")),
      ("Cookie", bungieCookies.iterator.map(x => s"${x._1}=${x._2}").mkString(";"))
    )
  }

  implicit val getItemResult:GetResult[DbItem] =
    GetResult(r => DbItem(r.nextString))

  val db = Database.forURL(s"jdbc:sqlite:$DATA_DIR$DB_FILE")

  def getItems = {
    val query = sql"select json from DestinyInventoryItemDefinition".as[DbItem]
    db.run(query)
  }

  implicit val dbItems: Future[Map[Long, DbItem]] = getItems.map { (items: Seq[DbItem]) =>
      items.map(i => (i.itemHash, i)).toMap[Long, DbItem]
    }

  def fetch(path: String)(implicit request: Request[_]) = {
    val url = "https://www.bungie.net/Platform/Destiny" + path
    Logger.debug(s"fetching: $url")
    ws.url(url)
      .withQueryString("definitions" -> "false")
      .withHeaders(requestHeadersFromSession(request.session): _*)
  }

  def dbInfo() = Action.async {
    ws.url("http://www.bungie.net/Platform/Destiny/Manifest/")
      .withHeaders("X-api-key" -> API_KEY).get().flatMap {
      resp =>
        val dbVersion = (resp.json \ "Response" \ "version").as[String]
        val dbUrl = "http://www.bungie.net" + (resp.json \ "Response" \ "mobileWorldContentPaths" \ "en").as[String]

        // TODO: check tmp for existing db file for this version.
        // Skip the download if we already have it.

        ws.url(dbUrl).get().flatMap {
          dbResp =>
            val buf = new Array[Byte](1024)
            val zis = new ZipInputStream(new ByteArrayInputStream(dbResp.bodyAsBytes))
            val entry = zis.getNextEntry
            val out = File.createTempFile(s"bungie-db.$dbVersion.", ".sqlite")
            val fos = new FileOutputStream(out.getAbsolutePath)
            var len = zis.read(buf)

            while (len > 0) {
              fos.write(buf, 0, len)
              len = zis.read(buf)
            }

            fos.close()

            val db = Database.forURL(s"jdbc:sqlite:${out.getAbsolutePath}")
            val q = sql"select count(json) from DestinyInventoryItemDefinition".as[Int]
            db.run(q.head).map { result =>
              Ok(result.toString)
            }
        }
    }
  }


  def gear(platform: String, membershipId: String) = Action.async { implicit request =>

    val membershipType = membershipTypes(platform)

    fetch(s"/$membershipType/Account/$membershipId/Items/").get().flatMap {
      response: WSResponse => {
        val toons = (response.json \ "Response" \ "data" \ "characters")
          .as[Seq[JsValue]].map(js => (js \ "characterBase").as[Toon])
        dbItems.map { implicit dbi =>
            (response.json \ "Response" \ "data" \ "items").as[Seq[JsObject]]
              .map(_.asOpt[ItemSummary])
              .filter(_.isDefined)
              .map {
                case Some(summary) =>
                  dbi.get(summary.itemHash) match {
                    case Some(dbItem) => Some(ItemDetail(summary, dbItem))
                    case _ =>
                      Logger.warn(s"no details found for itemHash: ${summary.itemHash}")
                      None
                  }
              }.filter(x => {
              x.isDefined && Buckets.GearSlots.contains(x.fold(0l)(_.bucketTypeHash))
              }).map {
                case Some(detail) => (detail.summary.itemId, detail)
              }
        }.map { gear =>
          Ok(Json.obj(
            "toons" -> toons,
            "gear" -> Json.toJson(gear.toMap)
          ))
        }
      }
    }
  }
}
