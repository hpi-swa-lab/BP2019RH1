<canvas id="canvas" width="1500" height="1200"></canvas>

<script>
import d3 from "src/external/d3.v5.js";
import d3Hull from "https://d3js.org/d3-polygon.v1.min.js"

var canvas = lively.query(this, "#canvas");
var width = canvas.width;
var height = canvas.height;


var ctx = canvas.getContext('2d');


var color = {
  "a": {r: 100, g: 2, b: 230, opacity: 1},
  "b": {r: 2, g: 100, b: 230, opacity: 1},
  "c": {r: 50, g: 220, b: 2, opacity: 1}
}

let groups = ["embedded", "dedicated", "something"]

const nodes = d3.range(3000).map((d,i) => {
  if (i < 100) {
        return { color: "c", embedded: true, dedicated: true, something: true, centerx: 400, centery: 400}
      }
  if (i < 200) {
    return { color: "b", embedded: false, dedicated: true, something: true, centerx: 700, centery: 400}
  }
  if (i < 300) {
        return { color: "c", embedded: true, dedicated: true, something: false, centerx: 100, centery: 400}
      }
  if (i < 400) {
    return { color: "b", embedded: false, dedicated: true, something: false, centerx: 400, centery: 800}
  }
  if (i < 500) {
    return { color: "c", embedded: false, dedicated: false, something: true, centerx: 800, centery:  0}
      }
  if (i < 600) {
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
setTimeout(() => { simulation.stop()}, 10000);
let groupMemberGroups, nodesToDraw;
ticked();


function ticked() {
  groupMemberGroups = groups.map(groupName => nodes
    .filter(node => node[groupName])
    .map(node => ({x: node.x, y: node.y, r: 2, drawing: { x: node.x, y: node.y, size: 4, color: color[node.color] }})))

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  nodesToDraw = [];
  
  groupMemberGroups.forEach( groupMembers => {
    let hull = d3Hull.polygonHull(groupMembers.map(groupMember=>[groupMember.x, groupMember.y]));
    nodesToDraw.push(...groupMembers);
    drawHull(hull);
  })

  nodesToDraw.forEach( node => {
    let r = node.drawing.color.r;
    let g = node.drawing.color.g;
    let b = node.drawing.color.b;
    let a = node.drawing.color.opacity;
    let color = 'rgb(' + r + ',' + g + ',' + b + ',' + a + ')'
    drawCoordinates(node.x, node.y, node.drawing.size, color);
  })
}

function drawHull(pointsArray){
  debugger;
  ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.beginPath();
  ctx.moveTo(pointsArray[0][0], pointsArray[0][1]);
  pointsArray.shift()
  pointsArray.forEach((point) => {
    ctx.lineTo(point[0], point[1]);
  })
  ctx.closePath();
  ctx.fill();
}

function moveToFirstPlace(firstPlace, ctx){
  ctx.moveTo(firstPlace[0], firstPlace[1]);
}

function drawPathToEveryPoint(points, ctx) {
  
}

function drawCoordinates(x,y, pointSize, pointColor){
    ctx.fillStyle = pointColor;
    ctx.beginPath(); //Start path
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    ctx.fill(); // Close the path and fill.
}

</script>