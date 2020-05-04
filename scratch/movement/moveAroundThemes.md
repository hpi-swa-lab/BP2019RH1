## Movement Spike

- each individual moves circular between its L3 themes
- **DblClick** active and deactive themes

<div id="my-canvas"></div>
<svg id="svg"></svg>
<canvas width="800" height="800"></canvas>



<style>
circle, .circle {
	fill: #b36;
	fill-opacity: 0.8;
}
</style>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import ForcesStructure from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/forces-structure.js"
import CenterCoordinatesForGroups from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/center-coordinates.js"
import d3 from "src/external/d3.v5.js";
import d3Hull from "https://d3js.org/d3-polygon.v1.min.js"
import { ReGL } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/Covid19-Kenya/npm-modules/regl-point-wrapper.js"

// Canvas constants
const MAX_WIDTH = 1000
const MAX_HEIGHT = 800

// Point constants
const POINT_SIZE = 7

// Center constants
const CENTER_RADIUS = 20

// Movement constants
const STEP_SIZE = 4

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas></canvas>;
canvas.width = MAX_WIDTH
canvas.height = MAX_HEIGHT
canvas.style.position = "absolute"
//const canvas = this.parentElement.querySelector('canvas')
//const ctx = canvas.getContext('2d')



var themesDict = {}
var svg = lively.query(this, '#svg')
svg.style.position = "absolute"
svg.style.width = MAX_WIDTH
svg.style.height = MAX_HEIGHT
svg.style.zIndex = 5

divCanvas.appendChild(canvas)
divCanvas.appendChild(svg)


var d3Svg = d3.select(svg)
var width = svg.width
var height = svg.height

// initialize context

var world = this
var context = canvas.getContext("webgl") 

// initialize helper objects

var regl = new ReGL(context)

var node
var d3Centers = []


AVFParser.loadCovidData().then( (data) => {
  let individuals = data
  /*for (var i = 0; i < 20; i++) {
    individuals = individuals.concat(data)
  }*/
  let themes = individuals.map( individual => individual.themes['L3'])
  themes = new Set(themes.flat())
  themes = Array.from(themes)
  themes.push("no_active_theme")


  themes.forEach(theme => {
    themesDict[theme] = getRandomCoords()
    themesDict[theme]["active"] = true
  })
  
  
  
  
  //themesDict["other"]["active"] = false
  
  Object.keys(themesDict).forEach(theme =>
    {
    let elem = themesDict[theme]
        elem["theme"] = theme
        if(elem["active"]) {
          elem["color"] = "red"
        } else {
          elem["color"] = "gray"
        }
        d3Centers.push(elem)
  })
  
  let points = initData(individuals)
  
  drawPoints(points)
  
  node = d3Svg
    .append("g")
    .selectAll(".circle")
    .data(d3Centers)
    .enter()
    .append('g')
    .classed('circle', true)
    .attr("transform", function(d) { return 'translate('+ [d.x, d.y] + ')' })
  
  node
    .append("circle")
    .classed("circleForm", true)
    .attr("r", CENTER_RADIUS)
    .on("dblclick", function(d) {return updateCenterNode(d)})
    .style("fill", function(d) {return d.color})
  
  node
    .append("text")
    .classed("circleText", true)
    .attr('dy', CENTER_RADIUS)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .text(d => d.theme)
  

  
  var drag = d3.drag().on("drag", function(d, i) {
		var dx = d3.event.dx, dy = d3.event.dy
		d.x += dx
		d.y += dy
    themesDict[d.theme].x = d.x
    themesDict[d.theme].y = d.y
		d3.select(this).attr("transform", "translate(" + [d.x, d.y] + ")" )
    
	})
  
  node.call(drag);
  
  let newTargetPos = {}
  let curTargetPos = {}
  regl.regl.frame(({time}) => {
    if (!lively.isInBody(divCanvas)) return 
    drawPointsWithNewCoordinates(points, newTargetPos, curTargetPos)
  })
  

})

function updateCenterNode (d){
   themesDict[d.theme].active = !themesDict[d.theme].active
   doUpdate(d)
  
};

function doUpdate (d) {
  d3Centers.forEach(center => {
    if (center.theme == d.theme){
      center.color = center.color == "grey" ? "red" : "grey"
    }
  })
  
  node
    .data(d3Centers)
    .enter()
    .merge(node)
  
  node
    .selectAll('.circleText')
    .style("fill", function(d) {return d.color})
    
  node
  .selectAll('.circleForm')
  .style("fill", function(d) {return d.color})

  
}

var toggleColor = (function(){
   var currentColor = "red";
    
    return function(){
        currentColor = currentColor == "red" ? "grey" : "red";
        d3.select(this).style("fill", currentColor);
    }
})();

function randomFromInterval(min, max) {
  return Math.random() * (max - min) + min
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max))
}

function getRandomCoords() {
  return {x: randomIntFromInterval(0,MAX_WIDTH), y: randomIntFromInterval(0,MAX_HEIGHT)}
  }
  
const drawPoints = (inputPoints) => { 
  if (inputPoints == null) inputPoints = points;
  regl.drawPoints({
    points: inputPoints
  });
}
function initData(data) {
  let result = data
  
  for (var i = 0; i < result.length; i++) {
    let x = randomIntFromInterval(2 * CENTER_RADIUS, MAX_WIDTH - 2 * CENTER_RADIUS)
    let y = randomIntFromInterval(2 * CENTER_RADIUS, MAX_HEIGHT - 2 * CENTER_RADIUS)
    
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
      nextThemePointDestination: 0
    };
  }
  
  return result

}
const drawPointsWithNewCoordinates = (points, newTargetPos, curTargetPos) => { 
  
  points.forEach((point) => {
      newTargetPos = getTargetPosition(points, point, STEP_SIZE, newTargetPos, curTargetPos)
      point.drawing.x = newTargetPos.x
      point.drawing.y = newTargetPos.y
  });
  
  regl.drawPoints({
    points: points
  });
  
}

function reachedTargetPos(targetPos, point, stepsize) {
  return Math.abs(targetPos.x - point.drawing.x) <= stepsize && Math.abs(targetPos.y - point.drawing.y) <= stepsize
}

function getNextThemePointIndex(point) {
  return (point.drawing.nextThemePointDestination + 1) % point.themes.L3.length
}

function isActive(theme) {
  return themesDict[theme].active
}

function getTargetPosByTheme(point) {
  if (point.drawing.nextThemePointDestination == -1) {
    return themesDict["no_active_theme"]
  } else {
    return themesDict[point.themes.L3[point.drawing.nextThemePointDestination]]
  }
}

const notActive = (theme) => !themesDict[theme].active

function getTargetPosition(points, point, stepsize, newTargetPos, curTargetPos1) {
  
  // question 2
  let curTargetPos = getTargetPosByTheme(point)
  
  //question 1
  
  if (point.themes.L3.every(notActive)) {
    return themesDict["no_active_theme"]
  }
  
  /*
  let notActive = true;
  for (var i = 0; i < point.themes.L3.length; i++) {
    if (isActive(point.themes.L3[i])) notActive = false
  }
  
  if (notActive) return themesDict["no_active_theme"] */
  
  if (!isActive(point.themes.L3[point.drawing.nextThemePointDestination]) || reachedTargetPos(curTargetPos, point, stepsize) ) {
    point.drawing.nextThemePointDestination = getNextThemePointIndex(point)
  }

  let xDiff = Math.abs(curTargetPos.x - point.drawing.x)
  let yDiff = Math.abs(curTargetPos.y - point.drawing.y)

  if (xDiff > yDiff) {
    if (curTargetPos.x - point.drawing.x > 0) {
      newTargetPos.x = point.drawing.x + stepsize;
    } else {
      newTargetPos.x = point.drawing.x - stepsize;
    }
    if (curTargetPos.y - point.drawing.y > 0) {
      newTargetPos.y = point.drawing.y + stepsize * (yDiff / xDiff) * Math.random();
    } else {
      newTargetPos.y = point.drawing.y - stepsize * (yDiff / xDiff) * Math.random();
    }
  } else {   
    if (curTargetPos.x - point.drawing.x > 0) {
      newTargetPos.x = point.drawing.x + stepsize * (xDiff / yDiff) * Math.random();
    } else {
      newTargetPos.x = point.drawing.x - stepsize * (xDiff / yDiff) * Math.random();
    }
    if (curTargetPos.y - point.drawing.y > 0) {
      newTargetPos.y = point.drawing.y + stepsize;
    } else {
      newTargetPos.y = point.drawing.y - stepsize;
    }
  }
  
  return newTargetPos
}



</script>