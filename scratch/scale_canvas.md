<div id="chart">
<canvas id="foreground"></canvas>
<canvas id="background"></canvas>
<svg></svg>
</div>

<style>
canvas, svg {
  position: absolute;
  top: 0;
  left: 0;
}
</style>

<script>
import d3 from "src/external/d3.v5.js"

var m = [30, 30, 30, 10],
    w = 960 - m[1] - m[3],
    h = 500 - m[0] - m[2];
var x = 0;

let districtNames = ["banadir", "mogadishu", "awdal", "jubbaland", "baki"]
let genderNames = ["f", "m", "NA", "NC"]

let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(genderNames)
let xScale = d3.scalePoint().domain(districtNames).range([0, w])
let xAxis = d3.axisBottom(xScale)

d3.select(lively.query(this, "#chart"))
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .style("padding", m.join("px ") + "px")
    
d3.select(lively.query(this, "canvas"))
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .style("padding", m.join("px ") + "px")

var foreground = lively.query(this, "#foreground").getContext("2d");
var background = lively.query(this, "#background").getContext("2d"); 
foreground.strokeStyle = "rgba(0, 100, 160, 0.24)"
background.strokeStyle = "rgba(0,0,0,0.62)"


var svg = d3.select(lively.query(this, "svg"))
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])

var innerGroup = svg.append("g")
    .attr("transform", "translate(" + m[1] + "," + m[0] + ")");

var data = createData(1000)

innerGroup.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 0 + "," + h + ")")
    .call(xAxis)

/*var circles = innerGroup.selectAll("g.points")
  .data(data)
  .enter().append("g").append("circle")
    .attr("cx", function(d) {return xScale(d.district)})
    .attr("cy", function(d) {return randomIntFromInterval(0, h)})
    .attr("r", "5")*/

data.forEach((datum) => {
  drawPoint(foreground, m[1] + xScale(datum.district), m[0] + randomIntFromInterval(50, h-100), 5)
});


function drawPoint(ctx, x, y, r) {
  drawCircle(ctx, x - r*2, y - r/2, r, 0, 2*Math.PI)
}

function drawCircle(ctx, x, y, r, startangle, endangle) {
  ctx.beginPath();
  ctx.arc(x, y, r, startangle, endangle);
  ctx.fillStyle = "red";
  ctx.fill();
}

function randomFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max));
}

function createData(dataCount) {
  var data = [];
  for (var i = 0; i < dataCount; i++) {
    let y = randomIntFromInterval(m[0], w + m[0])
    var datum = {
      id: i,
      age: randomIntFromInterval(10,99),
      district: districtNames[randomIntFromInterval(0, districtNames.length - 1)],
      gender: genderNames[randomIntFromInterval(0, genderNames.length - 1)],
    };

    data.push(datum);
  }
  return data;
}

</script>

