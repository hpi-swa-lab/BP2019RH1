<canvas id="canvas" width="1500" height="1200"></canvas>

<script>
import { ReGL } from "../src/internal/individuals-as-points/common/regl-point-wrapper.js";
import d3 from "src/external/d3.v5.js";

var canvas = lively.query(this, "#canvas");
var width = canvas.width;
var height = canvas.height;

var context = canvas.getContext('webgl');
// var ctx = canvas.getContext('2d');
var regl = new ReGL(context);

var color = {
  "a": {r: 100, g: 2, b: 230, opacity: 1},
  "b": {r: 2, g: 100, b: 230, opacity: 1},
  "c": {r: 50, g: 220, b: 2, opacity: 1}
}

let groups = ["embedded", "dedicated", "something"]

const nodes = d3.range(9000).map((d,i) => {
  if (i < 2000) {
        return { color: "c", embedded: true, dedicated: true, something: true, centerx: 400, centery: 400}
      }
  if (i < 3000) {
    return { color: "b", embedded: false, dedicated: true, something: true, centerx: 700, centery: 400}
  }
  if (i < 4000) {
        return { color: "c", embedded: true, dedicated: true, something: false, centerx: 100, centery: 400}
      }
  if (i < 5000) {
    return { color: "b", embedded: false, dedicated: true, something: false, centerx: 400, centery: 800}
  }
  if (i < 5500) {
    return { color: "c", embedded: false, dedicated: false, something: true, centerx: 800, centery:  0}
      }
  if (i < 6000) {
    return { color: "b", embedded: true, dedicated: false, something: false, centerx: 0, centery: 0}
  }
  
  return { color: "a", embedded: true, dedicated: false, something: true, centerx: 400, centery: 0}
})

var simulation = d3.forceSimulation()
   .force("collision", d3.forceCollide(4).iterations(1))
   .force("x", d3.forceX(a => a.centerx).strength(0.1))
   .force("y", d3.forceY(a => a.centery).strength(0.1))
   .force("center", d3.forceCenter(width / 2, height / 2))
   .alphaDecay(0.001)
   .alpha(0.1)
    .nodes(nodes)
    .on("tick", ticked)
   .stop()

setTimeout(() => { simulation.restart() }, 250);
setTimeout(() => { simulation.stop()}, 40000);
let points, nodesToDraw;
ticked();


function ticked() {
  points = groups.map(groupName => nodes
    .filter(node => node[groupName])
    .map(node => ({x: node.x, y: node.y, r: 2, drawing: { x: node.x, y: node.y, size: 4, color: color[node.color] }})))

  nodesToDraw = [];

  points.forEach( p => {
  let circle = d3.packEnclose(p); 
  let drawing = {x: circle.x, y: circle.y, size: circle.r, color: {r: 100, g: 100, b: 100, opacity: 0.5}};
  circle.drawing = drawing;
  nodesToDraw.push(...p)
   nodesToDraw.push(circle)
  })
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  nodesToDraw.forEach( node => {
    let r = node.drawing.color.r;
    let g = node.drawing.color.g;
    let b = node.drawing.color.b;
    let a = node.drawing.color.opacity;
    let color = 'rgb(' + r + ',' + g + ',' + b + ',' + a + ')'
    //drawCoordinates(node.x, node.y, node.drawing.size, color);
  })
  
  regl.drawPoints({ points: nodesToDraw })
}

function drawCoordinates(x,y, pointSize, pointColor){
    ctx.fillStyle = pointColor;
    ctx.beginPath(); //Start path
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    ctx.fill(); // Close the path and fill.
}

</script>