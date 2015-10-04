package controllers

import javax.inject.Inject
import play.api.Configuration
import play.api.mvc.{Action, Controller}

import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSResponse, WSClient}
import play.api.Logger

import scala.concurrent.{Future, ExecutionContext}


final case class Player(membershipId: String, displayName: String)

class BungieApi @Inject() (ws: WSClient, config: Configuration) extends Controller {
  val MembershipTypes = Seq("TigerPSN", "TigerXbox")

  val API_KEY =
    config.getString("afc.bungieApiKey").fold("")((key: String) => key)

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
   * @param membershipType Should be one of values in `MembershipTypes`
   * @param playerName Name of the player to find
   */
  def playerSearch(membershipType: String, playerName: String) = Action.async {
    if (!MembershipTypes.contains(membershipType)) {
      Future.successful(BadRequest("Invalid Membership Type"))
    } else fetch(s"/SearchDestinyPlayer/$membershipType/$playerName/").map {
      response: WSResponse =>
        (response.json \ "Response" ).as[Seq[Player]].headOption match {
          case Some(player) => Ok(Json.toJson(player))
          case _ => NotFound("Player not found.")
        }
      }
  }
}
