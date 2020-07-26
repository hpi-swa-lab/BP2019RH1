<!-- zooming from https://bl.ocks.org/mbostock/3680958 -->
<!-- dragging from https://bl.ocks.org/mbostock/2b534b091d80a8de39219dd076b316cd -->
<!-- scaling axes from https://www.d3-graph-gallery.com/graph/interactivity_zoom.html -->
<!-- also interesting example with d3fc on https://bl.ocks.org/ColinEberhardt/de9c652b7e820bd7b51d2b966e796ff5 -->

- [x] add real data
- [x] check data drawing function call (not drawing circles)
- [ ] add boundaries for panning
- [ ] stop scrolling of page after scrolling out of diagram is finished
- [ ] on click zoom in on individual

<style>
.svg-plot, .canvas-plot {
    position: absolute;
}
</style>

<div class="scatter-container"></div>

<script>
import d3 from "src/external/d3.v5.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

const pointColor = '#3585ff'
const margin = {top: 20, right: 15, bottom: 60, left: 70};
const outerWidth = 800;
const outerHeight = 600;
const width = outerWidth - margin.left - margin.right;
const height = outerHeight - margin.top - margin.bottom;
let pointWidth = 4
let worldData = []

var randomX = d3.randomNormal(width / 2, 80),
    randomY = d3.randomNormal(height / 2, 80),
    transform = d3.zoomIdentity
    

const container = d3.select(lively.query(this, ".scatter-container"));

// Init SVG
const svgChart = container.append('svg')
   .attr('width', outerWidth)
   .attr('height', outerHeight)
   .attr('class', 'svg-plot')
   .append('g')
   .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Init Canvas
const canvasChart = container.append('canvas')
   .attr('width', width)
   .attr('height', height)
   .style('margin-left', margin.left + 'px')
   .style('margin-top', margin.top + 'px')
   .attr('class', 'canvas-plot')
   .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom))
   .call(d3.drag().subject(dragsubject).on("drag", drag))

const context = canvasChart.node().getContext('2d');


AVFParser.loadCompressedIndividualsWithKeysFromFile().then(data => {
  for (let i = 0; i < data.length; i++) {
    initializeIndividual(data[i], i)
  }
  worldData = data
  canvasChart.call(render)
  x.domain([0, width])
  y.domain([0, height])
  gxAxis.call(xAxis)
  gyAxis.call(yAxis)
})


// Init Scales
const x = d3.scaleLinear()
  .range([0, width])
  .nice();
const y = d3.scaleLinear()
  .range([height, 0])
  .nice();

// Init Axis
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// Add Axis
const gxAxis = svgChart.append('g')
   .attr('transform', `translate(0, ${height})`)
   .call(xAxis);

const gyAxis = svgChart.append('g')
   .call(yAxis);

// Add labels
svgChart.append('text')
   .attr('x', `-${height/2}`)
   .attr('dy', '-3.5em')
   .attr('transform', 'rotate(-90)')
   .text('Axis Y');
svgChart.append('text')
   .attr('x', `${width/2}`)
   .attr('y', `${height + 40}`)
   .text('Axis X');

function zoom() {
  transform = d3.event.transform
  updateAxes()
  render()
}

function dragsubject() {
  var i,
      x = transform.invertX(d3.event.x),
      y = transform.invertY(d3.event.y),
      dx,
      dy;
}

function drag() {
  d3.event.subject[0] = transform.invertX(d3.event.x);
  d3.event.subject[1] = transform.invertY(d3.event.y);
  render();
}

function render() {
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);
  draw(transform.k)
  context.restore();
}

function updateAxes() {
  var newXAxis = transform.rescaleX(x);
  var newYAxis = transform.rescaleY(y);
  
  gxAxis.call(d3.axisBottom(newXAxis))
  gyAxis.call(d3.axisLeft(newYAxis))
}

function draw(zoomLevel) {
  var i = -1, n = worldData.length, d;
  context.beginPath();
  
  worldData.forEach(element => {
      context.fillStyle = element.drawing.currentColor
      context.moveTo(element.drawing.currentPosition.x, element.drawing.currentPosition.y);
      // circles
      context.arc(element.drawing.currentPosition.x, element.drawing.currentPosition.y, 2.5/zoomLevel, 0, 2 * Math.PI);
      // rectangles
      //context.fillRect(
      //  element.drawing.currentPosition.x,
       // element.drawing.currentPosition.y, 
      //  pointWidth / zoomLevel, 
      //  pointWidth / zoomLevel
      //) 
    })
  context.fill();
}

function initializeIndividual(individual, index) {
  individual.index = index
  individual.drawing = {}
  individual.drawing.defaultColor = "blue"
  individual.drawing.currentColor = individual.drawing.defaultColor
  individual.drawing.currentPosition = {
    "x": getRandomInteger(0, width), 
    "y": getRandomInteger(0, height)
  }
}

function  getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min
}

</script>