package controllers

import play.api._
import play.api.mvc._

import scala.concurrent.Future

class Application extends Controller {

  def index(path:String) = Action.async {
    Future.successful(Ok(views.html.index()))
  }

}
