<!-- from https://bl.ocks.org/mbostock/3680958 -->
<canvas class="canvas"></canvas>

<script>
import d3 from "src/external/d3.v5.js"

var canvas = d3.select(lively.query(this, ".canvas")),
    context = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height");
    
canvas.call(d3.zoom()
    .extent([[0,0], [width, height]])
    .scaleExtent([0.5, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoom))

var randomX = d3.randomNormal(width / 2, 80),
    randomY = d3.randomNormal(height / 2, 80),
    data = d3.range(2000).map(function() { return [randomX(), randomY()]; });

draw();

function zoom() {
  var transform = d3.event.transform;
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);
  draw();
  context.restore();
}

function draw() {
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