<!-- from https://bl.ocks.org/mbostock/3680958 -->
<canvas id="random"></canvas>
<canvas id = "grid"></canvas>
<script>
import d3 from "src/external/d3.v5.js"


var width = 300
var height = 150

var randomCanvas = d3.select(lively.query(this, "#random")),
    randomContext = randomCanvas.node().getContext("2d")

var gridCanvas = d3.select(lively.query(this, "#grid")),
    gridContext = gridCanvas.node().getContext("2d")

function randomX() {
  return Math.random() * width
}

function randomY() {
  return Math.random() * height
}

var amount = 2000
var count = 0
var randomData = d3.range(amount).map(function() { return [randomX(), randomY()]; });
var gridData = []

for (let i = 0; i < height; i++) {
  for (let j = 0; j < width; j++) {
    gridData.push([j, i])
    count += 1
    if (count === amount) {
      break
    }
  }
  if (count === amount) {
      break
  }
}

draw(randomContext, randomData)
draw(gridContext, gridData)

function draw(context, data) {
  var i = -1, n = data.length, d;
  context.beginPath();
  while (++i < n) {
    d = data[i];
    context.moveTo(d[0], d[1]);
    context.arc(d[0], d[1], 2.5, 0, 2 * Math.PI);
  }
  context.fill();
}


</script>