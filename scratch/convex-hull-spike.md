<canvas id="canvas2d" width="100" height="100"></canvas>
<canvas id="canvasregl" width="100" height="100"></canvas>


<script>
import d3 from "https://d3js.org/d3-polygon.v1.min.js";
var canvas = lively.query(this, "#canvas2d");
var width = canvas.width;
var height = canvas.height;
var ctx = canvas.getContext('2d');
let points = [[1,1], [1,40], [40,40], [40,1], [20, 20]]

var pointsArray = d3.polygonHull(points);
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'rgb(100, 100, 100)';
ctx.beginPath();
ctx.moveTo(pointsArray[0][0], pointsArray[0][1]);
pointsArray.shift()
pointsArray.forEach((point) => {
  debugger;
  ctx.lineTo(point[0], point[1]);
})
ctx.closePath();
ctx.fill();



var canvasRegl = lively.query(this, '#canvasregl');





</script>