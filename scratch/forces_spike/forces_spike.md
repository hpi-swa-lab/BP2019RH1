<canvas id="canvas" width="1500" height="800"></canvas>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import ForcesStructure from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/forces-structure.js"
import CenterCoordinatesForGroups from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/center-coordinates.js"
import d3 from "src/external/d3.v5.js";
import d3Hull from "https://d3js.org/d3-polygon.v1.min.js"

var canvas = lively.query(this, '#canvas')
var context = canvas.getContext('2d')
var width = canvas.width
var height = canvas.height

var individuals, groups, themeGroups

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
  
  let centerCoordinates = new CenterCoordinatesForGroups(groups)
  let forcesStructure = new ForcesStructure(individuals, groups)
  
  individuals.forEach( individual => 
    individual['center'] = centerCoordinates.coordinatesForGroup(individual.group)
  )
  
  var simulation = d3.forceSimulation()
   .force("collision", d3.forceCollide(5).iterations(1))
   .force("x", d3.forceX(individual => individual.center.x).strength(0.1))
   .force("y", d3.forceY(individual => individual.center.y).strength(0.1))
   .force("center", d3.forceCenter(width / 2, height / 2))
   .alphaDecay(0.001)
   .alpha(0.1)
    .nodes(individuals)
    .on("tick", ticked)
   .stop()
  
  setTimeout(() => { simulation.restart() }, 250);
  setTimeout(() => { simulation.stop()}, 30000);
  
  ticked();
    
})

function ticked() {
  setDrawingInformationForNodes()
  drawAllNodes()
  getHulls().forEach( hull => {
    drawHull(hull)
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
    let hull = d3Hull.polygonHull(themeMembers.map(themeMember => [themeMember.x, themeMember.y]));
    hull = getPaddedHull(hull);
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
  context.clearRect(0, 0, canvas.width, canvas.height);
  individuals.forEach( individual => {
    drawCoordinates(individual.drawing.x, individual.drawing.y, individual.drawing.size)
  })
}

function drawCoordinates(x,y, pointSize){
    context.fillStyle = 'rgba(100, 20, 230, 1)'
    context.beginPath(); //Start path
    context.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    context.fill(); // Close the path and fill.
}

function drawHull(pointsArray){
  debugger;
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