<div id="root-div">
  <canvas id="canvas" width="1500" height="800"></canvas>
</div>

<style>

.tooltip {
  position: absolute;
  text-align: center;
  width: auto;
  height: auto;
  padding: 8px;
  margin-top: -20px;
  font: 14px sans-serif;
  background: #ddd;
  pointer-events: none;
  z-index: 5;
}


</style>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import ForcesStructure from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/forces-structure.js"
import CenterCoordinatesForGroups from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/center-coordinates.js"
import d3 from "src/external/d3.v5.js";
import d3Hull from "https://d3js.org/d3-polygon.v1.min.js"

var rootDiv = lively.query(this, '#root-div')

var canvas = lively.query(this, '#canvas')

var context = canvas.getContext('2d')
var width = canvas.width
var height = canvas.height

var individuals, 
    groups, 
    themeGroups,
    centers,
    hulls
var dotsOnScreen = []
    
var simulation, 
    centerCoordinates,
    transform,
    radius

var tooltip = <div></div>;
tooltip.className = "tooltip"
tooltip.style.display = "none"
tooltip.style.width = "auto"

rootDiv.appendChild(tooltip)

AVFParser.loadCovidData().then( (data) => {
  individuals = data
  let themes = individuals.map( individual => individual.themes['L3'])
  themes = new Set(themes.flat())
  
  themeGroups = ['how_spread_transmitted', 'kenya_update', 'gratitude', 'nothing']
  groups = [
    {'name': '1',
    'themes': ['how_spread_transmitted']},
    {'name': '2', 
    'themes': ['kenya_update']},
    {'name': '3',
    'themes': ['gratitude']},
    {'name': '4',
    'themes': ['kenya_update', 'gratitude']},
    {'name': '5',
    'themes': ['kenya_update', 'how_spread_transmitted']},
    {'name': '6',
    'themes': ['gratitude', 'how_spread_transmitted']},
    {'name': '7',
    'themes': ['kenya_update', 'how_spread_transmitted', 'gratitude']},
    {'name': 'nothing',
    'themes': []}
    ]
  
  centerCoordinates = new CenterCoordinatesForGroups(groups)
  centers = centerCoordinates.getAllCenterCoordinatesWithGroups()
  dotsOnScreen.push(...centers)
  dotsOnScreen.push(...individuals)
  
  let forcesStructure = new ForcesStructure(individuals, groups)
  
  individuals.forEach( individual => 
    individual['center'] = centerCoordinates.coordinatesForGroup(individual.group)
  )
  
  
  simulation = d3.forceSimulation()
   .force("collision", d3.forceCollide(5).iterations(1))
   .force("x", d3.forceX(individual => individual.center.x).strength(0.1))
   .force("y", d3.forceY(individual => individual.center.y).strength(0.1))
   .alphaDecay(0.001)
   .alpha(0.3)
    .nodes(individuals)
    .on("tick", ticked)
   .stop()
   
  radius = 10
  transform = d3.zoomIdentity
  
  
  setTimeout(() => { simulation.restart() }, 250);
  //setTimeout(() => { simulation.stop()}, 10000);
  
  ticked();
  
  d3.select(canvas)
    .call(d3.drag().subject(dragSubject).on("drag", dragged).on("end", dragended))
    //.call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))
  d3.select(canvas)
    .on("mouseover", mouseover)
    .on('mousemove', hover)
    .on("mouseout", mouseout)

  
})

function mouseover() {
  tooltip.style.display = "block"
}

function mouseout() {
  tooltip.style.display = "none"
}

function hover(){
  var mousePosition = d3.mouse(this);
  let hoveredHulls = getHullsUnderMouse(mousePosition);
  let text = ''
  hoveredHulls.forEach( hull => {
    text += hull.name + '   '
  })
  
  tooltip.style.left = (mousePosition[0] + 15) + "px"
  tooltip.style.top =  (mousePosition[1] - 5) + "px"
  tooltip.innerHTML = "<b>Themes </b> <br>" + text
}

function getHullsUnderMouse(mousePosition){
  let hoveredHulls = [];
  hulls.forEach(hull => {
    if(d3Hull.polygonContains(hull.border, mousePosition)){
      hoveredHulls.push({name: hull.group})
    }
  })
  return hoveredHulls;
}




// ---------------------------
// dragging / drawing
// --------------------------- 

function dragSubject() {
  console.log("dragsubject start")
  var i,
  x = transform.invertX(d3.event.x),
  y = transform.invertY(d3.event.y),
  dx,
  dy;
  for (i = dotsOnScreen.length - 1; i >= 0; --i) {
    let node = dotsOnScreen[i];
    dx = x - node.x;
    dy = y - node.y;

    if ((dx * dx + dy * dy < radius * radius) && node.is_center) { 
      node.x =  transform.applyX(node.x);
      node.y = transform.applyY(node.y);

      return node;
    }
  }

  console.log("dragsubject start +")
}


function dragged() {
  let node = d3.event.subject;
  node.fx = transform.invertX(d3.event.x)
  node.fy = transform.invertY(d3.event.y)
  centerCoordinates.setCoordinatesForGroup(node.group, {x: d3.event.x, y: d3.event.y})
  individuals.forEach( (individual, idx) => {
      individual['center'] = centerCoordinates.coordinatesForGroup(individual.group)
  })
  
  simulation 
      .force("x", d3.forceX(individual => individual.center.x).strength(0.1))
      .force("y", d3.forceY(individual => individual.center.y).strength(0.1))
  simulation.alpha(0.3).restart();
  //setTimeout(() => { simulation.stop()}, 10000);
}

function dragended() {
  let node = d3.event.subject;
  node.fx = null;
  node.fy = null;
  node.x = transform.invertX(d3.event.x)
  node.y = transform.invertY(d3.event.y)
  centerCoordinates.setCoordinatesForGroup(node.group, {x: d3.event.x, y: d3.event.y})
  
  individuals.forEach( (individual, idx) => {
      individual['center'] = centerCoordinates.coordinatesForGroup(individual.group)
  })
  
  if(!d3.event.active) {
    simulation 
      .force("x", d3.forceX(individual => individual.center.x).strength(0.1))
      .force("y", d3.forceY(individual => individual.center.y).strength(0.1))
    simulation.alpha(0.3).restart();
    //setTimeout(() => { simulation.stop()}, 10000);
  }
}



function ticked() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  setDrawingInformationForNodes()
  drawForceCenter()
  drawAllNodes()
  drawHulls()
}

function drawHulls(){
  hulls = getHulls()
  hulls.forEach( hull => {
    drawHull(hull.border)
  })
}

function setDrawingInformationForNodes() {
  individuals.forEach( individual => {
    let drawingInfo = {
      x: individual.x,
      y: individual.y,
      size: 3,
      color: {r: 100, g: 20, b: 150, opacity: 1}
    }
    individual['drawing'] = drawingInfo
  })
}

function drawAllNodes() {
  
  individuals.forEach( individual => {
    drawCoordinates(individual.drawing.x, individual.drawing.y, individual.drawing.size)
  })
}

function drawCoordinatesWithColor(x,y, pointSize, color){
    context.fillStyle = color;
    context.beginPath(); //Start path
    context.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    context.fill(); // Close the path and fill.
}

function drawCoordinates(x,y, pointSize){
   drawCoordinatesWithColor(x,y,pointSize, 'rgba(100, 20, 230, 1)');
}

function drawForceCenter() {
  let allCenterCoordinates = centerCoordinates.getAllCenterCoordinatesWithGroups()
  allCenterCoordinates.forEach(center => {
    drawCoordinatesWithColor(center.x, center.y, radius, 'rgba(255, 0, 0, 1)')
  })
}

function getHulls() {
  let hulls = [];
  themeGroups.forEach( themeGroup => {
    let themeMembers = individuals.filter(individual => {
      if(themeGroup === 'nothing') {
        return individual.group === 'nothing'
      } else {
        return individual.themes['L3'].includes(themeGroup)
      }
    })
    let hull = {};
    hull['group'] = themeGroup;
    hull['border'] = d3Hull.polygonHull(themeMembers.map(themeMember => [themeMember.x, themeMember.y]));
    hull.border = getPaddedHull(hull.border);
    hulls.push(hull)
  })
  return hulls
}

function getPaddedHull(hull){
  let paddedHull = [];
  let centroid = d3Hull.polygonCentroid(hull);
  hull.forEach(cornerPoint => {
    paddedHull.push(padd(cornerPoint, centroid));
  })
  return paddedHull;
}

function padd(cornerPoint, center){
  let x = center[0] + ( (cornerPoint[0] - center[0]) * 1.2)
  let y = center[1] + ( (cornerPoint[1] - center[1]) * 1.2)
  return [x,y]
}


function drawHull(pointsArray){
  context.fillStyle = 'rgba(200, 200, 200, 0.3)';
  context.beginPath();
  context.moveTo(pointsArray[0][0], pointsArray[0][1]);
  pointsArray.shift()
  pointsArray.forEach((point) => {
    context.lineTo(point[0], point[1]);
  })
  context.closePath();
  context.fill();
}
  
</script>