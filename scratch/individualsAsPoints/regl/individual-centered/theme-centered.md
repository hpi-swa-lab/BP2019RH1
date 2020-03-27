<link href="../style.css" rel="stylesheet" type="text/css" />

<button id="random-button">Animate grouping randomly</button>
<button id="grid-button">Animate grouped by district</button>
<button id="individual-center-button">Center on selected individual</button>


<button id="toggle-background">Toggle Darkmode</button>
<div id="wrapper">
  <div id="filter-container" class="flex flex-horizontal">
  </div>

  <div id='my-canvas' class="left"></div>
  <div class="right inspectorPanel">
    Center: 
    <div class="inspector">
      <lively-inspector id="center-inspector"></lively-inspector>
    </div>
    <br> Point:
    <div class="inspector">
      <lively-inspector id="inspector"></lively-inspector>
    </div>
  </div>
</div>

<svg width="1400" height="1200"></svg>

<script>
import d3 from "src/external/d3.v5.js"
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js"
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js" 

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { ReGL } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/regl-point-wrapper.js"
import { addSelectionEventListener } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/point-selection.js"
import { Selector } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/point-selection2.js"
import { Filterer } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/point-filter.js"

// Some constants to use
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1000;
const MAX_SPEED = 25;
const POINT_SIZE = 7;
const POINT_COUNT = 50000;

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas width="1400" height="1000"></canvas>
var svg = lively.query(this, "svg")
var inspector = lively.query(this, "#inspector")
var centerInspector = lively.query(this, "#center-inspector")
var context = canvas.getContext("webgl") 
var regl = new ReGL(context)
var world = this

let attributes = ["gender", "region", "state", "zone", "district", "age"]

var selectPreferences = {"multipleSelect": false};

let backgroundColor = [255, 255, 255, 1]

divCanvas.appendChild(canvas)
divCanvas.appendChild(svg)

var mp = mp2(divCanvas)
var mb = mb2(divCanvas)


var filterer = new Filterer(attributes)
var selector = new Selector(this.parentElement, mb, mp, selectPreferences, inspector)

// Make scales
let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(["male", "female"])
let attributeColorScale = d3.scaleOrdinal(d3.schemeSet2).domain(attributes)
let xScale
let xAxis



// Filter

const drawPoints = (inputPoints) => { 
  if (inputPoints == null) inputPoints = points;
  xScale = initDistrictScale(filterer.getFilteredData(inputPoints))
  colorScale = initColorScale(filterer.getFilteredData(inputPoints))
  xAxis = d3.axisBottom(xScale)
  
  regl.drawPoints({
    points: filterer.getFilteredData(inputPoints)
  });
}




let removeScale = (containerElement) => {
  return () => { d3.select(containerElement).select("g").remove() }
}
let removeIndividualCenter = (containerElement) => {
  return () => { let conElement = d3.select(containerElement);
                 conElement.selectAll("path").remove();
                 conElement.selectAll("text").remove();
                 conElement.selectAll("rect").remove(); }
}

let resetSelectionPoints = () => {selector.updateSelectableObjects(points)}


let addScale = () => {
  d3.select(svg).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 0 + "," + 1000 + ")")
    .call(xAxis)
  .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");
}

let removeAndAddScale = (containerElement) => {
  return () => {
    d3.select(containerElement).select("g").remove();
    d3.select(svg).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 0 + "," + 1000 + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");
  }
}



let getTargetPositionRandom = (point) => {
  return randomIntFromInterval(0, MAX_WIDTH)
}

let getTargetPositionDistrict = (point) => {
  return xScale(point.district) + randomIntFromInterval(10, xScale.bandwidth() - 10)
}

var points = []
//= createData(POINT_COUNT);
//   initScalesAndAxes(points)
//  initFilterSelect(points)

/*drawPoints({
  pointWidth: POINT_SIZE,
  points: points.filter(activeFilterExpr)
});*/

var selectPreferences = {"multipleSelect": false};

AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA").then(result => {
  let data = result
  
  points = initData(data)
  
  xScale = initDistrictScale(points)
  colorScale = initColorScale(points)
  xAxis = d3.axisBottom(xScale)

  filterer.initFilterSelectBoxes(lively.query(world, "#filter-container"), points, world, drawPoints)
  selector.init(points, drawPoints)
  selector.start()
  
  drawPoints(points)
})

addEvtListenerAnimation(lively.query(this, "#random-button"), getTargetPositionRandom, [removeScale(svg), removeIndividualCenter(svg), resetSelectionPoints])
addEvtListenerAnimation(lively.query(this, "#grid-button"), getTargetPositionDistrict, [removeIndividualCenter(svg), removeAndAddScale(svg), resetSelectionPoints])


lively.query(this, "#toggle-background").addEventListener("click", () => {
  backgroundColor = [255-backgroundColor[0], 255-backgroundColor[1], 255-backgroundColor[2],1]
  regl.setBackgroundColor({r: backgroundColor[0], g: backgroundColor[1], b: backgroundColor[2]})
  
  drawPoints(points)
})

function initDistrictScale(data) {
  const uniqueDistrict = [...new Set(data.map(item => item.district))];
  let scale = d3.scaleBand().domain(uniqueDistrict).range([0, MAX_WIDTH])
  return scale
}

function initColorScale(data) {
  const uniqueGender = [...new Set(data.map(item => item.gender))];
  let scale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueGender)
  return scale
}

//------- Data Helpers ---------//

function randomFromInterval(min, max) {
  return Math.random() * (max - min) + min;
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max));
}
/*
function createData(dataCount) {
  var data = [];
  for (var i = 0; i < dataCount; i++) {
    let x = randomIntFromInterval(POINT_SIZE, MAX_WIDTH)
    let y = randomIntFromInterval(POINT_SIZE, MAX_HEIGHT)
    let gender = genderNames[randomIntFromInterval(0, genderNames.length - 1)]
    
    var datum = {
      age: randomIntFromInterval(10,99),
      district: districtNames[randomIntFromInterval(0, districtNames.length - 1)],
      gender: gender,
      themes: {},
      
      drawing: {
        id: i,
        speed: randomFromInterval(1, MAX_SPEED),
        y: y,
        x: x,
        sy: y,
        sx: x,
        highlighted: false,
        size: randomIntFromInterval(POINT_SIZE, POINT_SIZE),
        color: d3.rgb(colorScale(gender)), 
        defaultColor: d3.rgb(colorScale(gender)),
      }
    };

    data.push(datum);
  }
  return data;
}*/

function initData(data) {
  let result = data
  
  for (var i = 0; i < result.length; i++) {
    let x = randomIntFromInterval(POINT_SIZE, MAX_WIDTH)
    let y = randomIntFromInterval(POINT_SIZE, MAX_HEIGHT)
    
    result[i]["drawing"] = {
      id: i,
      y: y,
      x: x,
      sy: y,
      sx: x,
      highlighted: false,
      size: POINT_SIZE,
      color: d3.rgb(colorScale(result[i].gender)),
      defaultColor: d3.rgb(colorScale(result[i].gender)),
    };
  }
  
  return result
}

//------- EventListener ---------//
function addEvtListenerAnimation(button, getTargetPosition, beforeAnimation) {
  button.addEventListener("click", () => {
    const duration = 2000
    const ease = d3.easeCubic
    
    beforeAnimation.forEach(f => f())
    
    points.forEach((point) => {
      point.drawing.x = getTargetPosition(point)
    });
    
    var currentPoints = filterer.getFilteredData(points)
    
    let timer = d3.timer((elapsed) => {
      const t = Math.min(1, ease(elapsed / duration))

      regl.animatePoints({
        points: currentPoints,
        tick: t,
      })

      if (t === 1) {
        timer.stop()
        points.forEach(point => {point.drawing.sx = point.drawing.x; point.drawing.sy = point.drawing.y})
      }
    })
  })
}

var radius = 125;
var arcThickness = 20;
let padAngle = 0.02

var arc = d3.arc()
    .innerRadius(function(d){return d[3] * radius - arcThickness / 2;})
    .outerRadius(function(d){return d[3] * radius + arcThickness / 2;})
    .startAngle(function(d){return cScale(d[1]);})
    .endAngle(function(d){return cScale(d[0]);})
    .padAngle([padAngle]);
    
var cScale = d3.scaleLinear()
    .domain([1,0])
    .range([Math.PI/ 2, 2 * Math.PI + Math.PI/2]);
    

            
let individualCenterButton = lively.query(this, "#individual-center-button")

individualCenterButton.addEventListener("click", () => {

  if (selector.selectedObjects.length <= 0) {
    return;
  }
  removeScale(svg);
  removeIndividualCenter(svg);
  resetSelectionPoints();
  
  removeIndividualCenter(svg);
  resetSelectionPoints();  
  
  let center = points[selector.selectedObjects[0]];
  discardNotSelectedThemes(points);
  centerInspector.inspect(center)
  
  
  let themeDifferingPoints = calculateThemeDifference(points, center);
  let differingAttributeCounts = calculateDifferingAttributeCounts(center, themeDifferingPoints);
  let angleDictAndArcs = calculateAttributeMarginsAndAngles(differingAttributeCounts, themeDifferingPoints)
  
  let angleDict = angleDictAndArcs[0]
  let arcs = angleDictAndArcs[1]
  
  var canvasPositionInfo = canvas.getBoundingClientRect();
  var canvasWidth = canvasPositionInfo.width;
  var canvasHeight = canvasPositionInfo.height;

  let centerCopy = JSON.parse(JSON.stringify(center))
  centerCopy.drawing.x = canvasWidth / 2;
  centerCopy.drawing.y = canvasHeight / 2;
  
  let drawingPoints = []
  debugger
  for (var i = 0; i < themeDifferingPoints.length; i++) {
    themeDifferingPoints[i].forEach(point => 
     {
      let randomAngle = randomFromInterval(angleDict[i][point.differingAttributes].startAngle, angleDict[i][point.differingAttributes].endAngle);
      point.drawing.angle = randomAngle
      point.drawing.x = centerCopy.drawing.x + radius * (i+1) * Math.cos(randomAngle);
      point.drawing.y = centerCopy.drawing.y - radius * (i+1) * Math.sin(randomAngle); 
      drawingPoints.push(point)
      }
      
  )
  }
  
  drawingPoints.push(centerCopy)
let SVG = d3.select(svg)
 
 d3.select(svg).selectAll("path")
  .data(arcs)
  .enter()
  .append("path")
  .style("fill", function(d){return d3.rgb(attributeColorScale(d[2]));})
  .style("opacity", 0.3)
  .attr("transform", "translate(" + centerCopy.drawing.x + "," + centerCopy.drawing.y +")")
  .attr("d", arc);

// Add one dot in the legend for each name.
var size = 20
var distance = 70

SVG.selectAll("mydots")
  .data(attributes)
  .enter()
  .append("rect")
    .attr("x", function(d,i){ return 10 + i * (size + distance)} )
    .attr("y", 1000) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return attributeColorScale(d)})

// Add one dot in the legend for each name.
SVG.selectAll("mylabels")
  .data(attributes)
  .enter()
  .append("text")
    .attr("x", function(d,i){ return 10 + i*(size + distance) + size*1.4} )
    .attr("y", 1000 + size/2 ) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return attributeColorScale(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  
 
  drawPoints(drawingPoints)
  selector.updateSelectableObjects(drawingPoints)
    
})

function calculateDifferingPoints(center, points) {
    let differingPoints = []
    for (var point of points) {
      let count = 0
      let differingAttributes = []
      for (var attr of attributes) {
        if (center[attr] != point[attr]) {
          count ++;
          differingAttributes.push(attr)
        }
      }
      let pointCopy = JSON.parse(JSON.stringify(point))
      pointCopy["differingAttributes"] = differingAttributes
      if (differingPoints[count]) {
        differingPoints[count].push(pointCopy)
      } else {
        differingPoints[count] = [pointCopy]
      }
  }
  return differingPoints
}

function calculateDifferingAttributes(center, point) {
  let differingAttributes = []
  for (var attr of attributes) {
      if (center[attr] != point[attr]) differingAttributes.push(attr)
    }
  return differingAttributes
}

function calculateDifferingAttributeCounts(center, differingPoints) {

  let differingAttributeCounts = []
  for (var i = 0; i < differingPoints.length; i++) {
    differingAttributeCounts[i] = {totalCount: 0};

    differingPoints[i].forEach(point => 
    { point["differingAttributes"] =  calculateDifferingAttributes(center, point)
      point.differingAttributes.sort();
  initOrIncrementCount(differingAttributeCounts[i],point.differingAttributes);
      differingAttributeCounts[i]["totalCount"]++;
    })
    const ordered = {};
    Object.keys(differingAttributeCounts[i]).sort().forEach(function(key) {
      ordered[key] = differingAttributeCounts[i][key];})
    differingAttributeCounts[i] = ordered;
  }
  return differingAttributeCounts
}

function existsPrefix(differingAttributeCounts, i, prefix) {
  let keys = Object.keys(differingAttributeCounts[i-1])
  for (var j = 0; j < keys.length; j++) {
    if (i == 2) {
      if (keys[j] == prefix[0]) {return true;}
    } else {
      let attrKeys = Object.keys(differingAttributeCounts[i-1][keys[j]])
      for (var k = 0; k < attrKeys.length; k++) { 
        let possiblePrefix = attrKeys[k]
        if (possiblePrefix.split(",") == prefix) return true} 
    }
  }
  return false;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function perm(xs) {
  let ret = [];

  for (let i = 0; i < xs.length; i = i + 1) {
    let rest = perm(xs.slice(0, i).concat(xs.slice(i + 1)));

    if(!rest.length) {
      ret.push([xs[i]])
    } else {
      for(let j = 0; j < rest.length; j = j + 1) {
        ret.push([xs[i]].concat(rest[j]))
      }
    }
  }
  return ret;
}

function calculateAttributeMarginsAndAngles(differingAttributeCounts, differingPoints){
  let margins = []
  let arcs = []
  let angleDict = []
  
  for (var i = 0; i < differingAttributeCounts.length; i++) {
    margins[i] = {};
    Object.keys(differingAttributeCounts[i]).forEach(attr => margins[i][attr] = differingAttributeCounts[i][attr] / differingAttributeCounts[i]["totalCount"])
  }
  
  for (var i = 0; i < margins.length; i++) {
    let count = 0;
    angleDict[i] = {};
    for (var key of Object.keys(margins[i])) {
       if (margins[i][key] == 0 || key == "totalCount") continue;
       arcs.push([count, count + margins[i][key], key, i+1])
       angleDict[i][key] = {startAngle:  (count * 2 * Math.PI * padAngle * 3) + (count * 2 * Math.PI), endAngle: (count + margins[i][key]) * 2 * Math.PI - ((count + margins[i][key]) * 2 * Math.PI * (padAngle * 3))}
       count += margins[i][key]
    }
  }

  return [angleDict, arcs]
  
}

function initOrIncrementCount(obj, index) {
  if (obj[index]) {
    obj[index]++;
  }
  else {
    obj[index] = 1;
  }
}

/* calculateMargins
let margins = []
Object.keys(differingAttributeCounts[i]).forEach(attr => margins[i][attr] = differingAttributeCounts[i][attr] / totalDifferingIndividuals)
 margins[i] = {}
 */
 
// Geometry helpers

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function getRandomColor(count) {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function discardNotSelectedThemes(points) {
  points.forEach(point =>
  {let filteredThemes = {}
    for (let [key,value] of Object.entries(point.themes)) {
      if (value == 1) {
        filteredThemes[key] = 1
      }
    }
    point.themes = filteredThemes
  }
  )
}

function calculateThemeDifference(points, center) {
  let themeDifferingPoints = []
  points.forEach(point =>
    {let intersection = Object.keys(point.themes).filter(value => Object.keys(center.themes).includes(value));
     let size = Object.keys(center.themes).length - intersection.length;
     if (!themeDifferingPoints[size]) themeDifferingPoints[size] = []
     let pointCopy = JSON.parse(JSON.stringify(point))
     themeDifferingPoints[size].push(pointCopy);
    }
  )
  return themeDifferingPoints;
}



</script>
