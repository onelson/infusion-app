resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/releases/"

logLevel := Level.Warn

addSbtPlugin("org.brianmckenna" % "sbt-wartremover" % "0.14")
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.4.3")
addSbtPlugin("com.heroku" % "sbt-heroku" % "0.5.1")

