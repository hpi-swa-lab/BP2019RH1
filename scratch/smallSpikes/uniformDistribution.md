<!-- from https://bl.ocks.org/mbostock/3680958 -->
<canvas id="random"></canvas>
<canvas id="grid"></canvas>
<canvas id="circle"></canvas>
<canvas id="even"></canvas> 

<script>
import d3 from "src/external/d3.v5.js"

var height = 150
var width = 300
var pointSize= 6
var amount = 1025

function draw(context, data) {
  var i = -1, n = data.length, d;
  if (n !== 1025) {
    console.log(context.canvas.id, "did not provide the correct amount")
  }
  context.beginPath();
  while (++i < n) {
    d = data[i];
    context.moveTo(d[0], d[1]);
    context.arc(d[0], d[1], 2.5, 0, 2 * Math.PI);
  }
  context.fill();
}
// randomCanvas
var randomCanvas = d3.select(lively.query(this, "#random")),
    randomContext = randomCanvas.node().getContext("2d")

function randomX() {
  return Math.random() * width
}

function randomY() {
  return Math.random() * height
}

var randomData = d3.range(amount).map(function() { return [randomX(), randomY()]; });

draw(randomContext, randomData)

// gridCanvas
var gridCanvas = d3.select(lively.query(this, "#grid")),
    gridContext = gridCanvas.node().getContext("2d")
    
var count = 0
var gridData = []

for (let i = 0; i < height/pointSize; i++) {
  for (let j = 0; j < width/pointSize; j++) {
    gridData.push([j*pointSize, i*pointSize])
    count += 1
    if (count === amount) {
      break
    }
  }
  if (count === amount) {
    break
  }
}

draw(gridContext, gridData)

// circleCanvas
// TODO: Compute how many "circles" / levels we need to draw for the given amount of points

var circleCanvas = d3.select(lively.query(this, "#circle")),
    circleContext = circleCanvas.node().getContext("2d")

var center = [width / 2, height / 2]
var circleData = []

for (let i = 1; i < 10; i+=2) {
  for (let j = 0; j < i; j++) {
    circleData.push([center[0] + (j - parseInt(i / 2)) * pointSize, center[1] - parseInt(i / 2) * pointSize])
    circleData.push([center[0] + (j - parseInt(i / 2)) * pointSize, center[1] + parseInt(i / 2) * pointSize])
  }
  for (let k = 0; k < (i - 2); k++) {
    circleData.push([center[0] - (parseInt(i / 2)) * pointSize, center[1] + (k - parseInt(i / 2) + 1) * pointSize])
    circleData.push([center[0] + (parseInt(i / 2)) * pointSize, center[1] + (k - parseInt(i / 2) + 1) * pointSize])
  }
}

draw(circleContext, circleData)

// evenCanvas
var evenCanvas = d3.select(lively.query(this, "#even")),
    evenContext = evenCanvas.node().getContext("2d")

var area = width * height
var squareArea = area / amount
var edgeLength = Math.sqrt(squareArea)
var count = 0
var evenData = []
for (let j = 0; j < height; j += edgeLength) {
  for (let i = 0; i < width; i += edgeLength) {
    evenData.push([i, j])
    count++
  }
}
console.log(evenData)
if (count > amount) {
  evenData = evenData.slice(0, amount)
  draw(evenContext, evenData)
}


</script>