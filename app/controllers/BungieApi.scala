package controllers

import javax.inject.Inject
import play.api.Configuration
import play.api.mvc.{Action, Controller}

import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.Logger
import slick.jdbc.GetResult

import scala.concurrent.{Future, ExecutionContext}


final case class Player(membershipId: String, displayName: String)
final case class Item(json: String)
final case class Weapon(id: Int, json: String)
final case class Armor(id: Int, json: String)


class BungieApi @Inject() (ws: WSClient, config: Configuration) extends Controller {

  val API_KEY =
    config.getString("afc.bungieApiKey").fold("")((v: String) => v)
  val DATA_DIR  =
    config.getString("afc.bungieDataDir").fold("")((v: String) => v)

  val membershipTypes = Map("psn" -> "TigerPSN", "xbox" -> "TigerXbox")

  import slick.driver.SQLiteDriver.api._
  implicit val getItemResult:GetResult[Item] =
    GetResult(r => Item(r.nextString))

  val dbfile = s"${DATA_DIR}world_sql_content_ff0841056879dd1652679d51d6632e78.content"
  Logger.debug(dbfile)
  val db = Database.forURL(s"jdbc:sqlite:$dbfile")

  def getItems = {
    val query = sql"select json from DestinyInventoryItemDefinition".as[Item]
    db.run(query)
  }

  var weaponInfo = Map[Int, Weapon]()
  var armorInfo = Map[Int, Armor]()



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
      .withHeaders("X-API-Key" -> API_KEY).get()
  }

  /**
   *
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
      items => Ok(Json.toJson(for (i <- items) yield Json.parse(i.json)))
    }
  }

//  def inventory(platform: String, membershipId: Int) = Action.async {
//    fetch(s"/$platform/Account/$membershipId/Summary/").map {
//      response: WSResponse =>
//        (response.json \ "Response" \ "data" \ "characters").as[Seq[Toon]]
//        (response.json \ "Response" \ "data" \ "items").as[Seq[Item]]
//    }
//
//    for {
//      charInv <- fetch(s"/2/Account/$membershipId/Character/$characterId/Inventory/?definitions=true")
//
//    }
//  }
}
