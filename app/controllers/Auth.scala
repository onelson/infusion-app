package controllers

import javax.inject.Inject


import com.ning.http.client.providers.netty.response.NettyResponse

import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

import play.api.Configuration
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSCookie, WSResponse, WSClient}
import play.api.Logger


final case class Player(membershipId: String, displayName: String)

object Player {
  implicit val format: Format[Player] = (
    (JsPath \ "membershipId").format[String] and
    (JsPath \ "displayName").format[String]
  )(Player.apply, unlift(Player.unapply))

}

final case class Creds(username: String, password: String, platform: String)

object Creds {
  implicit val reads: Reads[Creds] = (
    (__ \ "username").read[String] and
    (__ \ "password").read[String] and
    (__ \ "platform").read[String]
  )(Creds.apply _)
}


class Auth @Inject() (ws: WSClient, config: Configuration) extends Controller {

  val API_KEY =
    config.getString("afc.bungieApiKey").fold("")((v: String) => v)

  def authenticate =
    Action.async(BodyParsers.parse.json) { request =>
      request.body.asOpt[Creds] match {
        case Some(creds) => creds.platform match {
          case "psn" => doLoginPsn(creds.username, creds.password)
          case "xbox" => Future.successful(BadRequest("Xbox login currently unavailable"))
          case _ => Future.successful(BadRequest("Invalid Membership Type"))
        }
        case _ => Future.successful(BadRequest("Missing credential info"))
      }
    }

  def getLoggedInResult(resp: WSResponse): Future[Result] = {

    val bungieCookies: Seq[(String, String)] = Seq(
      ("bungled", resp.cookie("bungled").flatMap(_.value).getOrElse("")),
      ("bungleatk", resp.cookie("bungleatk").flatMap(_.value).getOrElse("")),
      ("bungledid", resp.cookie("bungledid").flatMap(_.value).getOrElse(""))
    )

    ws.url("https://www.bungie.net/Platform/User/GetBungieNetUser/")
      .withHeaders(
        "X-API-Key" -> API_KEY,
        "X-CSRF" -> bungieCookies.head._2,
        "Cookie" -> bungieCookies.iterator.map(x => s"${x._1}=${x._2}").mkString(";")
      ).get().map {
      resp => Ok(resp.json).withSession(bungieCookies: _*)
    }
  }

  def doLoginPsn(username: String, password: String): Future[Result] = {
    val loginUrl = "https://auth.api.sonyentertainmentnetwork.com/login.do"
    val authBaseUrl = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/authorize"

    val authParams = Seq(
      "response_type" -> "code",
      "client_id" -> "78420c74-1fdf-4575-b43f-eb94c7d770bf",
      "redirect_uri" -> "https://www.bungie.net/en/User/SignIn/Psnid",
      "scope" -> "psn:s2s",
      "locale" -> "en"
    )

    val loginParams = Map[String, Seq[String]](
      "rememberSignIn" -> Seq("1"),
      "j_username" -> Seq(username),
      "j_password" -> Seq(password)
    )

    ws.url(authBaseUrl).get()
      .flatMap { resp =>
        resp.cookie("JSESSIONID").flatMap(_.value) match {
          case Some(token) => ws.url(loginUrl)
            .withFollowRedirects(false)
            .withHeaders("Cookie" -> s"JSESSIONID=$token")
            .post(loginParams).flatMap { resp: WSResponse =>
              if (resp.header("location").exists(_.contains("authentication_error")) || resp.cookie("JSESSIONID").isEmpty) {
                Future.successful(BadRequest("Invalid Credentials."))
              } else {
                val secondToken = resp.cookie("JSESSIONID").flatMap(_.value).get
                ws.url(authBaseUrl)
                  .withHeaders("Cookie" -> s"JSESSIONID=$secondToken")
                  .withQueryString(authParams: _*).withFollowRedirects(false).get().flatMap { resp: WSResponse =>
                  resp.header("location") match {
                    case Some(redirectUrl) =>
                      if (redirectUrl.contains("bungie.net")) {
                        ws.url(redirectUrl).get().flatMap { resp: WSResponse =>
                          resp.status match {
                            case OK => getLoggedInResult(resp)
                            case _ => Future.successful(Forbidden("Bungie oauth completion failed."))
                          }
                        }
                      } else {
                        Future.successful(Forbidden("PSN Authentication failed."))
                      }
                    case _ => Future.successful(InternalServerError("Unknown error."))
                  }

                }

              }

            }
          case _ => Future.successful(InternalServerError("Failed to get initial oauth token from PSN."))
        }
     }

  }

}
