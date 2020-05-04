<link href="style.css" rel="stylesheet" type="text/css" />

<br>

<div id="themeCenterPanel" class="flexRow"> 
  <button id="theme-individual-center-button" style="height:30px">Center on selected individual by themes</button> 
  <div class="flexColumn">
    <label for="theme-attribute-select"> Compare using: </label>
    <select multiple id="theme-attribute-select"></select>
  </div>
</div>
<br>

<div id="demographicCenterPanel" class="flexRow"> 
  <button id="demographic-individual-center-button" style="height:30px">Center on selected individual by demographic attributes</button> 
  <div class="flexColumn">
    <label for="demographic-attribute-select"> Compare using: </label>
    <select multiple id="demographic-attribute-select"></select>
  </div>
</div>
<br>

<div id="wrapper">
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

<style>
.tooltip {
  position: absolute;
  text-align: center;
  width: auto;
  height: auto;
  padding: 8px;
  margin-top: -20px;
  font: 10px sans-serif;
  background: #ddd;
  pointer-events: none;
  z-index: 5;
}
.flexRow {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.flexColumn {
  display: flex;
  flex-direction: column;
}
</style>


<script>
import d3 from "src/external/d3.v5.js"
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js"
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js" 

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { ReGL } from "./npm-modules/regl-point-wrapper.js"
import { Selector } from "./helper-classes/point-selection2.js"
import { Tooltip } from "./individual-center/tooltip-individual-center.js"
import { ArcDrawer } from "./individual-center/arcDrawer.js"

// Canvas constants
const MAX_WIDTH = 1200
const MAX_HEIGHT = 1000

// Point constants
const POINT_SIZE = 7
const POINT_COUNT = 50000

var points = []
var attributes = ["gender", "county", "age", "languages", "constituency"]
let colorAttributes = ["gender", "county", "age", "languages", "constituency", ""]
var selectPreferences = {"multipleSelect": false};

// Arc constants 

var padding = 50
var radius = 80
var arcThickness = 40
let padAngle = 0.02



// Legend constants

var legendDotSize = 20
var legendDotDistance = 100

// add DOM elements that need to be added programatically

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas></canvas>;
canvas.width = MAX_WIDTH
canvas.height = MAX_HEIGHT
canvas.style.position = "absolute"

var svg = lively.query(this, "svg")
svg.style.position = "absolute"
var d3Svg = d3.select(svg)


var tooltip = new Tooltip()

divCanvas.appendChild(canvas)
divCanvas.appendChild(svg)
divCanvas.appendChild(tooltip.getDiv())


var inspector = lively.query(this, "#inspector")
var centerInspector = lively.query(this, "#center-inspector")

var themeAttributeSelect = lively.query(this, "#theme-attribute-select")
var demographicAttributeSelect = lively.query(this, "#demographic-attribute-select")

attributes.forEach((attribute) => {
      if(!(attribute instanceof Array)) {
        themeAttributeSelect.options[themeAttributeSelect.options.length] = new Option(attribute)
        demographicAttributeSelect.options[demographicAttributeSelect.options.length] = new Option(attribute)
      }
})

let themeIndividualCenterButton = lively.query(this, "#theme-individual-center-button")
let demographicIndividualCenterButton = lively.query(this, "#demographic-individual-center-button")


// initialize context

var world = this
var context = canvas.getContext("webgl") 

// initialize helper objects

var regl = new ReGL(context)

var mp = mp2(divCanvas)
var mb = mb2(divCanvas)

var selector = new Selector(this.parentElement, mb, mp, selectPreferences, inspector)

// Make scales
var attributeColorScale = d3.scaleOrdinal(d3.schemeSet2).domain(colorAttributes)
var cScale = d3.scaleLinear()
    .domain([1,0])
    .range([Math.PI/ 2, 2 * Math.PI + Math.PI/2]);

// Initialize d3 elements


var arc = d3.arc()
    .innerRadius(function(d){return d[3] * radius - arcThickness / 2 + d[4]*(arcThickness / d[5]);})
    .outerRadius(function(d){return d[3] * radius - arcThickness / 2 +  (d[4] + 1) * (arcThickness / d[5]);})
    .startAngle(function(d){return cScale(d[1]);})
    .endAngle(function(d){return cScale(d[0]);})
    .padAngle([padAngle]);
    

// Load data 

AVFParser.loadCovidData().then(result => {
  let data = result
  
  points = initData(data)
  
  selector.init(points, drawPoints)
  selector.start()
  
  drawPoints(points)
  
  addEvtListenerCenterOnButton(themeIndividualCenterButton, calculateDifferingPointsTheme, calculateDifferingAttributeCountsTheme, calculateAngleDictAndArcsTheme)
  addEvtListenerCenterOnButton(demographicIndividualCenterButton, calculateDifferingPointsDemographic, calculateDifferingAttributeCountsDemographic, calculateAngleDictAndArcsDemographic)
})

//------- Center on individual functionality ---------//

function addEvtListenerCenterOnButton(button, calculateDifferingPoints, calculateDifferingAttributeCounts, calculateAngleDictAndArcs) {
  button.addEventListener("click", () => {
    if (selector.selectedObjects.length <= 0) {
      return;
    }

    let center = selector.objects[selector.selectedObjects[0]]
    centerInspector.inspect(center)

    removeIndividualCenter(svg)()
    resetSelectionPoints()

    let differingPoints = calculateDifferingPoints(center, points)
    let differingAttributeCounts = calculateDifferingAttributeCounts(center, differingPoints)

    radius = (Math.min(MAX_WIDTH, MAX_HEIGHT) - padding - arcThickness) / ((differingAttributeCounts.length) * 2)
    let angleDictAndArcs = calculateAngleDictAndArcs(differingAttributeCounts, differingPoints)

    let angleDict = angleDictAndArcs[0]
    let arcs = angleDictAndArcs[1]

    let centerCopy = generateCenteredCenterCopy(canvas, center)
    let drawingPoints = calculateDrawingPoints(differingPoints, angleDict, centerCopy)
    drawingPoints.push(centerCopy)

    drawArcs(arcs, centerCopy)
    arcDrawer.drawArcs(arcs, centerCopy)
    drawLegendForAttributes(colorAttributes, attributeColorScale, legendDotSize, legendDotDistance)
    drawPoints(drawingPoints)

    selector.updateSelectableObjects(drawingPoints)
  })
}

// Center on with theme difference

function calculateDifferingPointsTheme(center, points) {
  let themeDifferingPoints = []
  points.forEach(point =>
    {if (point.themes["L3"] instanceof Array && !(center.id == point.id)) {
     let intersection = point.themes["L3"].filter(value => center.themes["L3"].includes(value));
     let size = center.themes["L3"].length - intersection.length
     if (!themeDifferingPoints[size]) themeDifferingPoints[size] = []
     let pointCopy = JSON.parse(JSON.stringify(point))
     themeDifferingPoints[size].push(pointCopy)
     }
    }
  )
  return themeDifferingPoints;
}

function calculateDifferingAttributeCountsTheme(center, differingPoints) {

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

function calculateDifferingAttributes(center, point) {

  let selectedAttributes = getSelectedAttributes(themeAttributeSelect);
  
  let differingAttributes = []
  for (var attr of selectedAttributes) {
      if (center[attr] instanceof Array) {
          let centerValue = center[attr].sort().join(",");
          let pointValue = point[attr].sort().join(",");
          if (centerValue != pointValue) {
            differingAttributes.push(attr)
          }
        } else if (center[attr] != point[attr]) {
          differingAttributes.push(attr)
        }
    }
  return differingAttributes
}

function calculateAngleDictAndArcsTheme(differingAttributeCounts, differingPoints){
  let margins = []
  let arcs = []
  let angleDict = []
  
  for (var i = 0; i < differingAttributeCounts.length; i++) {
    margins[i] = {};
    Object.keys(differingAttributeCounts[i]).forEach(attr => margins[i][attr] = differingAttributeCounts[i][attr] / differingAttributeCounts[i]["totalCount"])
  }

  var padding = Math.PI * padAngle;
  let arcId = 0;
  for (var i = 0; i < margins.length; i++) {
    let count = 0;
    angleDict[i] = {};
    for (var key of Object.keys(margins[i])) {
       if (margins[i][key] == 0 || key == "totalCount") continue;
       
       let attributes = key.split(",");
       
       for (var j = 0; j < attributes.length; j++){
          arcs.push([count, count + margins[i][key], attributes[j], i+1, j, attributes.length, key, arcId]);
          arcId++;
       }
       
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


// Center on with demographic difference

 function calculateDifferingPointsDemographic(center, points) {

    let selectedAttributes = getSelectedAttributes(demographicAttributeSelect);

    let differingPoints = []
    for (var point of points) {
      if (center.id == point.id) continue;
      let count = 0
      let differingAttributes = []
      for (var attr of selectedAttributes) {
        if (center[attr] instanceof Array) {
          let centerValue = center[attr].sort().join(",");
          let pointValue = point[attr].sort().join(",");
          if (centerValue != pointValue) {
            count ++;
            differingAttributes.push(attr)
          }
        } else if (center[attr] != point[attr]) {
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

function calculateDifferingAttributeCountsDemographic(center, differingPoints) {
  let differingAttributeCounts = []
  for (var i = 0; i < differingPoints.length; i++) {
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

function calculateAngleDictAndArcsDemographic(differingAttributeCounts, differingPoints){
  let margins = []
  let arcs = []
  let angleDict = {}
  
  for (var i = 0; i < differingAttributeCounts.length; i++) {
    if (!differingAttributeCounts[i]) continue;
    margins[i] = {};
    Object.keys(differingAttributeCounts[i]).forEach(attr => margins[i][attr] = differingAttributeCounts[i][attr] / differingAttributeCounts[i]["totalCount"])
  }
  
  var padding = Math.PI * padAngle;
  
  for (var i = 0; i < margins.length; i++) {
    if (!margins[i]) {
      if (i == 0) { 
          arcs.push([0, 1, "", i+1, 0, 1, "No individuals with " + i + " differing Attributes"]);
        } else {
          arcs.push([0, 1, "", i+1, 0, 1, "No individuals with " + i + " differing Attributes"]);
      }
      continue
    }
    angleDict[i] = {};
    let count = 0
    let keyCount = Object.keys(margins[i]).length   
    
    for (var key of Object.keys(margins[i])) {
       if (margins[i][key] == 0 || key == "totalCount") continue;
       
       let attributes = key.split(",");
       
       for (var j = 0; j < attributes.length; j++){
          if (i == 0) { 
            arcs.push([count, count + margins[i][key], attributes[j], i+1, j, i+1, key]);
          } else {
            arcs.push([count, count + margins[i][key], attributes[j], i+1, j, i, key]);
          }
       }
       
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
      count += margins[i][key];
      }
       
  }
  return [angleDict, arcs]
  
}

//------- Helpers ---------//

const drawPoints = (inputPoints) => { 
  if (inputPoints == null) inputPoints = points;
  regl.drawPoints({
    points: inputPoints
  });
}


const removeIndividualCenter = (containerElement) => {
  return () => { let conElement = d3.select(containerElement);
                 conElement.selectAll("path").remove()
                 conElement.selectAll("text").remove()
                 conElement.selectAll("rect").remove() }
}

const resetSelectionPoints = () => {selector.updateSelectableObjects(points)}

function getSelectedAttributes(selectElement) {
  let selectedOptions = selectElement.selectedOptions
  let selectedAttributes = Array.from(selectedOptions).map(el => el.value);
  if (selectedAttributes.length == 0) return attributes;
  return selectedAttributes;
}

function generateCenteredCenterCopy(canvas, center) {
  var canvasPositionInfo = canvas.getBoundingClientRect()
  var canvasWidth = canvasPositionInfo.width
  var canvasHeight = canvasPositionInfo.height

  let centerCopy = JSON.parse(JSON.stringify(center))
  centerCopy.drawing.x = canvasWidth / 2
  centerCopy.drawing.y = canvasHeight / 2
  
  return centerCopy
}

function calculateDrawingPoints(differingPoints, angleDict, center) {
  debugger;
  let drawingPoints = []
  for (var i = 0; i < differingPoints.length; i++) {
    if (!differingPoints[i]) continue
    differingPoints[i].forEach(point => 
     {if (angleDict[i][point.differingAttributes]) {
      let randomAngle = randomFromInterval(angleDict[i][point.differingAttributes].startAngle, angleDict[i][point.differingAttributes].endAngle);
      point.drawing.angle = randomAngle
      point.drawing.x = center.drawing.x + radius * (i + 1) * Math.cos(randomAngle)
      point.drawing.y = center.drawing.y - radius * (i + 1) * Math.sin(randomAngle)
      drawingPoints.push(point)
        }
      }
    )
  }
  return drawingPoints
}

function initOrIncrementCount(obj, index) {
  if (obj[index]) {
    obj[index]++
  }
  else {
    obj[index] = 1
  }
}

 

//------- d3 Helpers ---------//

function drawArcs(arcs, center) {
   d3Svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .style("fill", function(d){return d3.rgb(attributeColorScale(d[2]));})
    .style("opacity", 0.4)
    .attr("transform", "translate(" + center.drawing.x + "," + center.drawing.y +")")
    .attr("d", arc)
    .on("mouseover", mouseover)
    .on("mousemove", function(d){return mousemove(d);})
    .on("mouseout", mouseout)
  }

function drawLegendForAttributes(attributes, scale, legendDotSize, legendDotDistance) {

  d3Svg.selectAll("mydots")
    .data(attributes)
    .enter()
    .append("rect")
      .attr("x", function(d,i){return 10 + i * (legendDotSize + legendDotDistance)})
      .attr("y", 0) 
      .attr("width", legendDotSize)
      .attr("height", legendDotSize)
      .style("fill", function(d){ return scale(d)})
      .style("opacity", 0.4)

  d3Svg.selectAll("mylabels")
    .data(attributes)
    .enter()
    .append("text")
      .attr("x", function(d,i){ return 10 + i*(legendDotSize + legendDotDistance) + legendDotSize*1.4} )
      .attr("y", 0 + legendDotSize/2 ) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return scale(d)})
      .text(function(d){return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

}


//------- Tooltip Helpers ---------//

function mouseover() {
  tooltip.show()
}

function mousemove(d) {
  tooltip.setPosition(mp[1] - 5, mp[0] + 15)
  tooltip.setText("<b>Differing Attributes: </b> <br>" + d[6])
}

function mouseout() {
  tooltip.hide()
}

//------- Data Helpers ---------//

function randomFromInterval(min, max) {
  return Math.random() * (max - min) + min
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max))
}


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
      color: d3.rgb(0,0,0),
      defaultColor: d3.rgb(0,0,0),
    };
  }
  
  return result
}

//------- Geometry Helpers ---------//

function toRadians (angle) {
  return angle * (Math.PI / 180)
}
</script>
