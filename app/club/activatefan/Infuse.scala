package club.activatefan


object Infuse { // thanks apsu!

  val COST = 3

  final case class InfuseResult(light: Int, marks: Int, steps: Seq[Int]) {
    def pretty: String = {
      s"Light: $light, Marks: $marks, Infusion: ${steps.mkString(" -> ")}"
    }
  }


  def permutate(low: Int, high: Int, mid: Seq[Int]): Seq[Seq[Int]] = {
    Seq(Seq(low, high)) ++ {
      for {
        l <- 1 until mid.size + 1
        perm <- mid.combinations(l)
      } yield Seq(low) ++ perm :+ high
    }
  }

  def infuse(base: Int, target: Int, exotic: Boolean): Int = {
    val diff = target - base
    if (diff < (if (exotic) 4 else 6)) target
    else (diff * 0.8).toInt + base
  }

  def walk(items: Seq[Int], exotic: Boolean): InfuseResult = {
    val res = items.reduce((x: Int, y: Int) => infuse(x, y, exotic))
    InfuseResult(res, (items.size - 1) * COST, items)
  }

  def calculate(items: Seq[Int], exotic: Boolean): String = {
    val ordered = items.sorted
    val (low, high, mid) = (ordered.head, ordered.last, ordered.tail.dropRight(1))

    println(s"##### Infusing $low light item towards $high light target #####")

    val perms = permutate(low, high, mid)
    val paths = for {perm <- perms.sortBy(_.head)} yield walk(perm, exotic)

    var bestLight = InfuseResult(0, 100, Nil)
    var bestMarks = InfuseResult(0, 100, Nil)

    for { result <- paths } {

      // If light is best we've seen, or same light but least marks
      if (result.light > bestLight.light ||
        (result.light == bestLight.light && result.marks < bestLight.marks)) {
        bestLight = result
      }

      // If marks is least we've seen, or same marks but best light
      if (result.marks < bestMarks.marks ||
        (result.marks == bestMarks.marks && result.light > bestMarks.light)) {
        bestMarks = result
      }
      // Print each possible path
      println(result.pretty)
    }

    // Show best light, but least marks
    println("##### Best light with least marks #####")
    println(bestLight.pretty)

    // Show least marks, but best light
    println("##### Least marks with best light #####")
    println(bestMarks.pretty)

    bestMarks.pretty
  }

}
