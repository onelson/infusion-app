package controllers


import javax.inject.Inject
import java.io._
import java.util.zip.ZipInputStream

import play.api.cache.{Cached, CacheApi}
import play.api.mvc.Session
import slick.driver.SQLiteDriver

import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

import play.api.Configuration
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.Logger

import slick.driver.SQLiteDriver.api.{Database, actionBasedSQLInterpolation}
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
    itemHash: Long,
    itemId: String,
    characterIndex: Int,
    isGridComplete: Boolean,
    value: Int,
    damageType: Int,
    bucketTypeHash: Long,
    tierType: Int,
    tierTypeName: String,
    itemName: String,
    icon: String
)

object ItemDetail {
  def apply(summary: ItemSummary, dbItem: DbItem) = {
    new ItemDetail(
      itemHash=summary.itemHash,
      itemId=summary.itemId,
      characterIndex=summary.characterIndex,
      isGridComplete=summary.isGridComplete,
      value=summary.value,
      damageType=summary.damageType,
      bucketTypeHash=dbItem.bucketTypeHash,
      tierType=(dbItem.json \ "tierType").as[Int],
      tierTypeName=(dbItem.json \ "tierTypeName").as[String],
      itemName=(dbItem.json \ "itemName").as[String],
      icon=(dbItem.json \ "icon").as[String]
    )
  }

  implicit val format: Format[ItemDetail] = (
    (JsPath \ "itemHash").format[Long] and
    (JsPath \ "itemId").format[String] and
    (JsPath \ "characterIndex").format[Int] and
    (JsPath \ "isGridComplete").format[Boolean] and
    (JsPath \ "value").format[Int] and
    (JsPath \ "damageType").format[Int] and
    (JsPath \ "bucketTypeHash").format[Long] and
    (JsPath \ "tierType").format[Int] and
    (JsPath \ "tierTypeName").format[String] and
    (JsPath \ "itemName").format[String] and
    (JsPath \ "icon").format[String]
  )(ItemDetail.apply, unlift(ItemDetail.unapply))

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


class BungieApi @Inject() (ws: WSClient, config: Configuration, cache: CacheApi, cached: Cached) extends Controller {

  val API_KEY =
    config.getString("afc.bungieApiKey").fold("")((v: String) => v)
  val DATA_DIR  =
    config.getString("afc.bungieDataDir").fold("")((v: String) => v)

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

  implicit val getItemResult: GetResult[DbItem] =
    GetResult(r => DbItem(r.nextString))

  def lookupActivities(ids: Seq[Long]): Future[Map[Long, JsValue]] = {
    val q =
      sql"""
         SELECT json
         FROM DestinyActivityDefinition
         WHERE id IN (#${ids.map(_.toInt).mkString(", ")})
        """
    destinyDb.run(q.as[String])
      .map(x => x.toSeq.map(Json.parse).map(js => (js \ "activityHash").as[Long]-> js ).toMap)
  }

  def lookupItems(ids: Seq[Long]): Future[Map[Long, DbItem]] = {
    val q =
      sql"""
         SELECT json
         FROM DestinyInventoryItemDefinition
         WHERE id IN (#${ids.map(_.toInt).mkString(", ")})
        """
    destinyDb.run(q.as[DbItem]).map(_.toSeq.map(x => x.itemHash -> x).toMap)
  }

  def fetch(path: String)(implicit request: Request[_]) = {
    val url = "https://www.bungie.net/Platform/Destiny" + path
    Logger.debug(s"fetching: $url")
    ws.url(url)
      .withQueryString("definitions" -> "false")
      .withHeaders(requestHeadersFromSession(request.session): _*)
  }

  lazy val destinyDb = {
    val (dbVersion, dbUrl) = cache.getOrElse[(String, String)]("dbInfo", 1.hour) {
      Await.result(
        ws.url("http://www.bungie.net/Platform/Destiny/Manifest/")
        .withHeaders("X-api-key" -> API_KEY).get().map { resp =>
        ((resp.json \ "Response" \ "version").as[String],
          "http://www.bungie.net" + (resp.json \ "Response" \ "mobileWorldContentPaths" \ "en").as[String])
      }, 30.seconds)
    }

    val dbFile = new File(DATA_DIR, s"$dbVersion.sqlite")

    if (!dbFile.exists()) {
      Logger.debug("Fetching new db file.")
      Await.result(
        ws.url(dbUrl).get().map {
          dbResp =>
            val buf = new Array[Byte](1024)
            val zis = new ZipInputStream(new ByteArrayInputStream(dbResp.bodyAsBytes))
            val _ = zis.getNextEntry
            val fos = new FileOutputStream(dbFile.getAbsolutePath)
            var len = zis.read(buf)

            while (len > 0) {
              fos.write(buf, 0, len)
              len = zis.read(buf)
            }

            fos.close()
        },
        30.seconds
      )
    }
    Database.forURL(s"jdbc:sqlite:$dbFile")
  }


  def gear(platform: String, membershipId: String) = Action.async { implicit request =>

    val membershipType = membershipTypes(platform)

    fetch(s"/$membershipType/Account/$membershipId/Items/").get().flatMap {
      response: WSResponse => {
        val toons = (response.json \ "Response" \ "data" \ "characters")
          .as[Seq[JsValue]].map(js => (js \ "characterBase").as[Toon])

        val summaries =
          (response.json \ "Response" \ "data" \ "items").as[Seq[JsObject]]
            .flatMap(_.asOpt[ItemSummary])

        lookupItems(summaries.map(_.itemHash)).map { lookups =>
          summaries.map { summary =>
            lookups.get(summary.itemHash).flatMap {
              case dbItem => Some(ItemDetail(summary, dbItem))
              case _ =>
                Logger.warn(s"no details found for itemHash: ${summary.itemHash}")
                None
            }
          }
        }.map { maybeItems =>
          maybeItems
            .flatten
            .filter(x => Buckets.GearSlots.contains(x.bucketTypeHash))
            .map(detail => (detail.itemId, detail))
        }.map { gear =>
          Ok(Json.obj(
            "toons" -> toons,
            "gear" -> Json.toJson(gear.toMap)
          ))
        }
      }
    }
  }

  def activities = cached.status(_ => "activities", 200, 3600) {
    Action.async {
      ws.url("http://www.bungie.net/Platform/Destiny/Advisors")
        .withQueryString("definitions" -> "true")
        .withHeaders("x-api-key" -> API_KEY).get().flatMap { resp =>
        val data = resp.json \ "Response" \ "data"

        val nightfallDetailId = (data \ "nightfall" \ "specificActivityHash").as[Long]
        val nightfallSkullId = (data \ "nightfall" \ "activityBundleHash").as[Long]
        val skullIndexes =
          ((data \ "nightfall" \ "tiers").as[Seq[JsValue]].head \"skullIndexes").as[Seq[Int]]

        val dailyCrucibleId = (data \ "dailyCrucible" \ "activityBundleHash").as[Long]
        val dailyStoryId = (data \ "dailyChapter" \ "activityBundleHash").as[Long]
        val weeklyCrucibleId = (data \ "weeklyCrucible" \\ "activityBundleHash").head.as[Long]

        lookupActivities(Seq(
          nightfallSkullId,
          nightfallDetailId,
          dailyCrucibleId,
          dailyStoryId,
          weeklyCrucibleId
        )).map { lookups =>

          val skulls = (lookups(nightfallSkullId) \ "skulls").as[Seq[JsValue]]

          val nightfallDetails = lookups(nightfallDetailId)

          val payload = Json.obj(
            "nightfall" -> Json.obj(
              "name" -> (nightfallDetails \ "activityName").as[String],
              "image" -> (nightfallDetails \ "pgcrImage").as[String],
              "skulls" -> skullIndexes.map(skulls(_))
            ),
            "dailyStory" -> (lookups(dailyStoryId) \ "activityName").as[String],
            "dailyCrucible" -> (lookups(dailyCrucibleId) \ "activityName").as[String],
            "weeklyCrucible" -> (lookups(weeklyCrucibleId) \ "activityName").as[String]
          )

          Ok(payload)
        }

      }
    }
  }

  def solve = Action.async(BodyParsers.parse.json) { implicit request =>
    val subject = (request.body \ "subject").as[ItemDetail]
    val others = (request.body \ "others").as[Seq[ItemDetail]].filter(_.tierType >= Infuse.RARE).groupBy(_.value).map {
      case (value, items) => items.sortBy(_.tierType).head
    }.toSeq

    assert(others.length < 20)

    Infuse.report(subject, others).map { case (bestValue, bestCost) =>

      val payload = Json.obj(
        "bestValue" -> Json.toJson(bestValue),
        "bestCost" -> Json.toJson(bestCost)
      )

      Ok(Json.toJson(payload))
    }

  }

}

final case class Solution(value: Int, cost: Int, steps: Seq[ItemDetail])

object Solution {
  implicit val format: Writes[Solution] = (
      (JsPath \ "value").write[Int] and
      (JsPath \ "cost").write[Int] and
      (JsPath \ "steps").write[Seq[ItemDetail]]
    )(unlift(Solution.unapply))
}

object Infuse {

  val RARE = 4
  val LEGENDARY = 5
  val EXOTIC = 6
  val COST = 3

  def infuse(baseValue: Int, targetValue: Int, baseIsExotic: Boolean): Int = {
    val diff = targetValue - baseValue
    val (comp: Int, scale: Double) = if (baseIsExotic) ( 4, 0.7 )  else ( 6, 0.8 )

    if (diff <= comp) {
      targetValue
    } else {
      baseValue + math.BigDecimal(diff * scale).setScale(0, math.BigDecimal.RoundingMode.HALF_EVEN).toInt
    }
  }

  def calculateSteps(low: ItemDetail, high: ItemDetail, items: Seq[ItemDetail]): Seq[Seq[ItemDetail]] = {
    val head = Seq(low, high)
    val tail = for {
      i <- items.indices
      middles <- items.combinations(i + 1)
    } yield Seq(low) ++ middles.toSeq :+ high
    head +: tail
  }

  def report(subject: ItemDetail, others: Seq[ItemDetail]): Future[(Option[Solution], Option[Solution])] = {
    val items = others.filter(x => x.value > subject.value).sortBy(_.value)

    def worst = Solution(0, Int.MaxValue, Nil)

    var bestValue = worst
    var bestCost = worst

    Future {
      if (items.nonEmpty) {
        calculateSteps(subject, items.last, items.dropRight(1)).map { steps: Seq[ItemDetail] =>
          val value = steps.par.map(_.value).reduce((x, y) => infuse(x, y, subject.tierType == EXOTIC))
          Solution(value, (steps.length - 1) * COST, steps)
        }.foreach { result: Solution =>

          if (result.value > bestValue.value ||
            (result.value == bestValue.value && result.cost < bestValue.cost)) {
            bestValue = result
          }

          if (result.cost < bestCost.cost ||
            (result.cost == bestCost.cost && result.value > bestCost.value)) {
            bestCost = result
          }
        }

        if (bestValue != bestCost) {
          (Some(bestValue), Some(bestCost))
        }
        else {
          (Some(bestValue), None)
        }
      } else {
        (None, None)
      }
    }

  }

}