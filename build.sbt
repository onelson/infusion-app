name := """infusion-app"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

logBuffered := false

libraryDependencies ++= Seq(
  jdbc,
  cache,
  filters,
  ws,
  specs2 % Test
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

wartremoverErrors in (Compile, compile) ++= Warts.allBut(Wart.Var)
wartremoverWarnings in (Compile, compile) ++= Seq(Wart.Var)

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

dist <<= dist dependsOn buildClient
