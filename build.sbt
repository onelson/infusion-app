name := """infusion-app"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.7"

logBuffered := false

libraryDependencies ++= Seq(
  jdbc,
  cache,
  filters,
  ws,
  specs2 % Test,
  "org.json4s" %% "json4s-native" % "3.3.0",
  "org.xerial" % "sqlite-jdbc" % "3.8.11.2",
  "com.typesafe.slick" %% "slick" % "3.1.0"
)

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"

// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator

fork in run := true

scalacOptions ++= Seq(
  "-deprecation",
  "-encoding", "UTF-8",
  "-feature",
  "-language:existentials",
  "-language:higherKinds",
  "-language:implicitConversions",
  "-unchecked",
//  "-Xfatal-warnings",
  "-Xlint",
  "-Yno-adapted-args",
  //"-Ywarn-dead-code", -- ignore as we want a few examples, not correct code.
  "-Ywarn-numeric-widen",
  "-Ywarn-value-discard",
  "-Xfuture"
)

wartremoverErrors in (Compile, compile) ++= Warts.allBut(Wart.Var, Wart.Throw)
wartremoverWarnings in (Compile, compile) ++= Seq(Wart.Var, Wart.Throw)

val routesMain = settingKey[File]("")
routesMain := target.value / "scala-2.11" / "routes" / "main"
wartremoverExcluded ++= Seq(
  routesMain.value / "controllers" / "ReverseRoutes.scala",
  routesMain.value / "controllers" / "javascript" / "JavaScriptReverseRoutes.scala",
  routesMain.value / "router" / "Routes.scala" ,
  routesMain.value / "router" / "RoutesPrefix.scala"
)



lazy val buildClient = taskKey[Unit]("perform the client src build")

buildClient := {
  "./build-client.sh" !
}

stage <<= stage dependsOn buildClient


herokuAppName in Compile := "immense-plateau-3425"

herokuIncludePaths in Compile := Seq(
  "app", "conf/routes", "bungie-db"
)


// runs `gulp watch` in the client-src dir when running the app via `sbt run`
import ClientBuild._
import play.PlayImport.PlayKeys.playRunHooks

playRunHooks <+= (baseDirectory / "client-src").map(base => ClientBuild(base))
