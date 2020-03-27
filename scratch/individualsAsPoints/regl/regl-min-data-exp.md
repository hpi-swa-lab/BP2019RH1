<link href="style.css" rel="stylesheet" type="text/css" />

<div id='my-canvas'>
</div>
<svg width="1000" height="900"></svg>

<script>
import d3 from "src/external/d3.v5.js"
import createREGL from "src/external/regl.js"
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js"
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js" 
import inside from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-point-in-polygon.js"
import { ReGL } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/regl-point-wrapper.js"


console.log(ReGL)

// Some constants to use
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;
const MAX_SPEED = 25;
const POINT_SIZE = 4;
const POINT_COUNT = 100000;

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas width="1000" height="800"></canvas>
var svg = lively.query(this, "svg")
var context = canvas.getContext("webgl") 
// var regl = createREGL(context)
var regl = new ReGL(context)
var world = this

let backgroundColor = [1, 1, 1, 1]

divCanvas.appendChild(canvas)
divCanvas.appendChild(svg)

var mp = mp2(divCanvas)
var mb = mb2(divCanvas)

let attributes = ["gender", "district"]
let districtNames = ["banadir", "mogadishu", "awdal", "jubbaland", "baki"]
let genderNames = ["f", "m", "NA", "NC"]


// Make scales
let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(genderNames)
let xScale = d3.scaleBand().domain(districtNames).range([0,MAX_WIDTH])
let xAxis = d3.axisBottom(xScale)

var points = createData(POINT_COUNT);

regl.drawPoints({
  pointWidth: POINT_SIZE,
  points: points
});
//------- Data Helpers ---------//

function randomFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max));
}

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
      }
    };

    data.push(datum);
  }
  return data;
}


""
</script>
