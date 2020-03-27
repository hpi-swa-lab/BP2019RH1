<link href="style.css" rel="stylesheet" type="text/css" />

<button id="random-button">Animate grouping randomly</button>
<button id="grid-button">Animate grouped by district</button>


<button id="toggle-background">Toggle Darkmode</button>

<div id="filter-container">
</div>

<div id='my-canvas'>
</div>
<svg width="1000" height="900"></svg>

<script>
import d3 from "src/external/d3.v5.js"
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js"
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js" 

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { ReGL } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/regl-point-wrapper.js"
import { addSelectionEventListener } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/point-selection.js"
import { Selector } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/point-selection2.js"
import { Filterer } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/point-filter.js"

console.log("Hello" + lively.queryAll(this, ".hi"))


// Some constants to use
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;
const MAX_SPEED = 25;
const POINT_SIZE = 7;
const POINT_COUNT = 50000;

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas width="1000" height="800"></canvas>
var svg = lively.query(this, "svg")
var context = canvas.getContext("webgl") 
var regl = new ReGL(context)
var world = this

let attributes = ["gender", "district", "age"]

var selectPreferences = {"multipleSelect": false};

let backgroundColor = [255, 255, 255, 1]

divCanvas.appendChild(canvas)
divCanvas.appendChild(svg)

var mp = mp2(divCanvas)
var mb = mb2(divCanvas)


var filterer = new Filterer(attributes)
var selector = new Selector(this.parentElement, mb, mp, selectPreferences)

// Make scales
let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(["male", "female"])
let xScale
let xAxis

let queries = lively.queryAll(this, "svg")
console.log("Queries:", queries)

// Filter

const drawPoints = () => { 
  xScale = initDistrictScale(filterer.getFilteredData(points))
  colorScale = initColorScale(filterer.getFilteredData(points))
  xAxis = d3.axisBottom(xScale)
  
  regl.drawPoints({
    points: filterer.getFilteredData(points)
}); }


let removeScale = (containerElement) => {
  return () => { d3.select(containerElement).select("g").remove() }
}

let addScale = () => {
  d3.select(svg).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 0 + "," + 800 + ")")
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
    .attr("transform", "translate(" + 0 + "," + 800 + ")")
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


AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA").then(result => {
  let data = result
  
  points = initData(data)
  
  xScale = initDistrictScale(points)
  colorScale = initColorScale(points)
  xAxis = d3.axisBottom(xScale)

  filterer.initFilterSelectBoxes(lively.query(world, "#filter-container"), points, world, drawPoints)
  //addSelectionEventListener(points, drawPoints, mb, mp, this.parentElement, selectPreferences)
  selector.init(points, drawPoints)
  selector.start()
  
  drawPoints()
})

addEvtListenerAnimation(lively.query(this, "#random-button"), getTargetPositionRandom, removeScale(svg))
addEvtListenerAnimation(lively.query(this, "#grid-button"), getTargetPositionDistrict, removeAndAddScale(svg))


lively.query(this, "#toggle-background").addEventListener("click", () => {
  backgroundColor = [255-backgroundColor[0], 255-backgroundColor[1], 255-backgroundColor[2],1]
  regl.setBackgroundColor({r: backgroundColor[0], g: backgroundColor[1], b: backgroundColor[2]})
  
  drawPoints()
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
  return Math.random() * (max - min + 1) + min;
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
    
    beforeAnimation()
    
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


//------ SELECTION / HIGHLIGHTING -----//



// ------ MULTIPLE SELECT ------ //




  

//// Lasso
// draw a line -> every point of the line forms a new point in outline of polygon, every point whose middle is in the polygon gets selected



//------ FILTERING -----//




""
</script>
