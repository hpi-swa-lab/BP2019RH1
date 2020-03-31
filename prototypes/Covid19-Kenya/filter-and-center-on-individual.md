<link href="style.css" rel="stylesheet" type="text/css" />

<button id="random-button">Animate grouping randomly</button>
<button id="grid-button">Animate grouped by county</button>
<button id="theme-individual-center-button">Center on selected individual by themes</button>
<button id="demographic-individual-center-button">Center on selected individual by demographic attributes</button>

<button id="toggle-background">Toggle Darkmode</button>
<div id="wrapper">
  <div id="filter-container" class="flex flex-horizontal"></div>
  <div id="active-filters" class="flex flex-horizontal"></div>
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
import { Selector } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/Covid19-Kenya/helper-classes/point-selection2.js"
import { Filterer } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/Covid19-Kenya/helper-classes/point-filter.js"

// Some constants to use
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1000;
const MAX_SPEED = 25;
const POINT_SIZE = 7;
const POINT_COUNT = 50000;

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas width="1200" height="1000"></canvas>
var svg = lively.query(this, "svg")
var inspector = lively.query(this, "#inspector")
var centerInspector = lively.query(this, "#center-inspector")
var context = canvas.getContext("webgl") 
var regl = new ReGL(context)
var world = this

let attributes = ["gender", "county", "age", "languages", "constituency", ["themes", "L3"]]

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
  xScale = initCountyScale(filterer.getFilteredData(inputPoints))
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

let getTargetPositionCounty = (point) => {
  return xScale(point.county) + randomIntFromInterval(10, xScale.bandwidth() - 10)
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

AVFParser.loadCovidData().then(result => {
  let data = result
  
  points = initData(data)
  
  xScale = initCountyScale(points)
  colorScale = initColorScale(points)
  xAxis = d3.axisBottom(xScale)
  
  filterer.initFilterSelectBoxes(lively.query(world, "#filter-container"), lively.query(world, "#active-filters"), points, world, drawPoints)
  selector.init(points, drawPoints)
  selector.start()
  
  drawPoints(points)
})

addEvtListenerAnimation(lively.query(this, "#random-button"), getTargetPositionRandom, [removeScale(svg), removeIndividualCenter(svg), resetSelectionPoints])
addEvtListenerAnimation(lively.query(this, "#grid-button"), getTargetPositionCounty, [removeIndividualCenter(svg), removeAndAddScale(svg), resetSelectionPoints])


lively.query(this, "#toggle-background").addEventListener("click", () => {
  backgroundColor = [255-backgroundColor[0], 255-backgroundColor[1], 255-backgroundColor[2],1]
  regl.setBackgroundColor({r: backgroundColor[0], g: backgroundColor[1], b: backgroundColor[2]})
  
  drawPoints(points)
})

function initCountyScale(data) {
  const uniqueCounty = [...new Set(data.map(item => item.county))];
  let scale = d3.scaleBand().domain(uniqueCounty).range([0, MAX_WIDTH])
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

var radius = 80;
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
    

            
let themeIndividualCenterButton = lively.query(this, "#theme-individual-center-button")

themeIndividualCenterButton.addEventListener("click", () => {

  if (selector.selectedObjects.length <= 0) {
    return;
  }
  removeScale(svg)();
  removeIndividualCenter(svg)();
  
  let center = points[selector.selectedObjects[0]];
  //discardNotSelectedThemes(points);
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
var distance = 90

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

let demographicIndividualCenterButton = lively.query(this, "#demographic-individual-center-button")

demographicIndividualCenterButton.addEventListener("click", () => {


  if (selector.selectedObjects.length <= 0) {
    return;
  }
  
  removeScale(svg)();
  removeIndividualCenter(svg)();
  
  let center = points[selector.selectedObjects[0]];
  centerInspector.inspect(center)

  let differingPoints = calculateDifferingPoints(center, points)
  let differingAttributeCounts = calculateDifferingAttributeCountsDemographic(differingPoints)
  let angleDictAndArcs = calculateAttributeMarginsAndAnglesDemographic(differingAttributeCounts, differingPoints)
  
  let angleDict = angleDictAndArcs[0]
  let arcs = angleDictAndArcs[1]
  
  var canvasPositionInfo = canvas.getBoundingClientRect();
  var canvasWidth = canvasPositionInfo.width;
  var canvasHeight = canvasPositionInfo.height;

  let centerCopy = JSON.parse(JSON.stringify(center))
  centerCopy.drawing.x = canvasWidth / 2;
  centerCopy.drawing.y = canvasHeight / 2;
  
  let drawingPoints = []
  for (var i = 1; i < differingPoints.length; i++) {
    if (!differingPoints[i]) continue;
    differingPoints[i].forEach(point => 
     {if (angleDict[point.differingAttributes]) {
      let randomAngle = randomFromInterval(angleDict[point.differingAttributes].startAngle, angleDict[point.differingAttributes].endAngle);
      point.drawing.angle = randomAngle
      point.drawing.x = centerCopy.drawing.x + radius * i * Math.cos(randomAngle);
      point.drawing.y = centerCopy.drawing.y - radius * i * Math.sin(randomAngle); 
      drawingPoints.push(point)
     }
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
var distance = 90

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

function calculateDifferingAttributeCountsDemographic(differingPoints) {
  let differingAttributeCounts = []
  for (var i = 1; i < differingPoints.length; i++) {
    if (!differingPoints[i]) continue;
    differingAttributeCounts[i] = {totalCount: 0};
    differingPoints[i].forEach(point => 
    { point.differingAttributes.sort();
      initOrIncrementCount(differingAttributeCounts[i],point.differingAttributes);
      differingAttributeCounts[i]["totalCount"]++;
    }
    )
    const ordered = {};
    Object.keys(differingAttributeCounts[i]).sort().forEach(function(key) {
      ordered[key] = differingAttributeCounts[i][key];})
    differingAttributeCounts[i] = ordered;
  }
  return differingAttributeCounts
}

function calculateAttributeMarginsAndAnglesDemographic(differingAttributeCounts, differingPoints){
  let margins = []
  let arcs = []
  let angleDict = {}
  
  for (var i = 1; i < differingAttributeCounts.length; i++) {
    if (!differingAttributeCounts[i]) continue;
    margins[i] = {};
    Object.keys(differingAttributeCounts[i]).forEach(attr => margins[i][attr] = differingAttributeCounts[i][attr] / differingAttributeCounts[i]["totalCount"])
  }
  
  var padding = Math.PI * padAngle;
  
  for (var i = 1; i < margins.length; i++) {
    if (!margins[i]) continue;
    let count = 0;

    for (var key of Object.keys(margins[i])) {
       if (margins[i][key] == 0 || key == "totalCount") continue;
       arcs.push([count, count + margins[i][key], key, i]);
       
       if (count == 0 && margins[i][key] == 1) {
          angleDict[key] = { startAngle: 0, endAngle: 2 * Math.PI}
      } else if (padding >= margins[i][key] * 2 * Math.PI) {
         angleDict[key] = 
          { startAngle:  (count * 2 * Math.PI), 
            endAngle: (count + margins[i][key]) * 2 * Math.PI }; 
      } else {
        angleDict[key] = 
          { startAngle: padding  + (count * 2 * Math.PI), 
            endAngle: (count + margins[i][key]) * 2 * Math.PI - padding};
      }
      count += margins[i][key];
      }
       
  }
  return [angleDict, arcs]
  
}

function calculateAttributeMarginsAndAngles(differingAttributeCounts, differingPoints){
  let margins = []
  let arcs = []
  let angleDict = []
  
  for (var i = 0; i < differingAttributeCounts.length; i++) {
    margins[i] = {};
    Object.keys(differingAttributeCounts[i]).forEach(attr => margins[i][attr] = differingAttributeCounts[i][attr] / differingAttributeCounts[i]["totalCount"])
  }

  var padding = Math.PI * padAngle;
  
  for (var i = 0; i < margins.length; i++) {
    let count = 0;
    angleDict[i] = {};
    for (var key of Object.keys(margins[i])) {
       if (margins[i][key] == 0 || key == "totalCount") continue;
       arcs.push([count, count + margins[i][key], key, i+1])
       
        if (count == 0 && margins[i][key] == 1) {
          angleDict[i][key] = { startAngle: 0, endAngle: 2 * Math.PI}
      } else if (padding >= margins[i][key] * 2 * Math.PI) {
         angleDict[i][key] = 
          { startAngle:  (count * 2 * Math.PI), 
            endAngle: (count + margins[i][key]) * 2 * Math.PI }; 
      } else {
        angleDict[i][key] = 
          { startAngle: padding  + (count * 2 * Math.PI), 
            endAngle: (count + margins[i][key]) * 2 * Math.PI - padding};
      }
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


 
// Geometry helpers

function toRadians (angle) {
  return angle * (Math.PI / 180);
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
    {if (point.themes["L3"] instanceof Array) {
     let intersection = point.themes["L3"].filter(value => center.themes["L3"].includes(value));
     let size = center.themes["L3"].length - intersection.length;
     if (!themeDifferingPoints[size]) themeDifferingPoints[size] = []
     let pointCopy = JSON.parse(JSON.stringify(point))
     themeDifferingPoints[size].push(pointCopy);
     }
    }
  )
  return themeDifferingPoints;
}



</script>
