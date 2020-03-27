<button id="grid-button">Animate grid!</button>
<button id="random-button">Animate random!</button>
<div id="individuals-circle"></div>

<script>

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js";
import d3 from "src/external/d3.v5.js"

lively.query(this, "#grid-button").addEventListener("click", () => { animate_grid(gridLayout); });
lively.query(this, "#random-button").addEventListener("click", () => { animate_random(); });

let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 800;

var canvas = d3.select(lively.query(this, '#individuals-circle')).append('canvas')
                .attr('width', CANVAS_WIDTH)
                .attr('height', CANVAS_HEIGHT);

const numPoints = 25000;
const colorScale = d3.scaleSequential(d3.interpolateViridis)
  .domain([numPoints - 1, 0]);

// generate the array of points with a unique ID and color
const points = d3.range(numPoints).map(index => ({
  id: index,
  color: colorScale(index),
}));


const pointWidth = 2;
const pointMargin = 3;
points.forEach(point => {
  point.x = getRndInteger(0, CANVAS_WIDTH);
  point.y = getRndInteger(0, CANVAS_HEIGHT);
});
draw();

// -------------------------------------------------

function animate_random() {
  // store the source position
  points.forEach(point => {
    point.sx = point.x;
    point.sy = point.y;
  });

  points.forEach(point => {
    point.x = getRndInteger(0, CANVAS_WIDTH);
    point.y = getRndInteger(0, CANVAS_HEIGHT);
  });

  points.forEach(point => {
    point.tx = point.x;
    point.ty = point.y;
  });

  const duration = 1000;
  const ease = d3.easeSinIn;

  var timer = d3.timer((elapsed) => {
    // compute how far through the animation we are (0 to 1)
    const t = Math.min(1, ease(elapsed / duration));

    // update point positions (interpolate between source and target)
    points.forEach(point => {
      point.x = point.sx * (1 - t) + point.tx * t;
      point.y = point.sy * (1 - t) + point.ty * t;
    });

    // update what is drawn on screen
    draw();

    // if this animation is over
    if (t === 1) {
      // stop this timer since we are done animating.
      timer.stop();
    }
  });
}

function animate_grid(task) {
  
  // store the source position
  points.forEach(point => {
    point.sx = point.x;
    point.sy = point.y;
  });

  task(points, pointWidth + pointMargin, CANVAS_WIDTH);

  points.forEach(point => {
    point.tx = point.x;
    point.ty = point.y;
  });

  const duration = 1000;
  const ease = d3.easeCubic;

  var timer = d3.timer((elapsed) => {
    // compute how far through the animation we are (0 to 1)
    const t = Math.min(1, ease(elapsed / duration));

    // update point positions (interpolate between source and target)
    points.forEach(point => {
      point.x = point.sx * (1 - t) + point.tx * t;
      point.y = point.sy * (1 - t) + point.ty * t;
    });

    // update what is drawn on screen
    draw();

    // if this animation is over
    if (t === 1) {
      // stop this timer since we are done animating.
      timer.stop();
    }
  });
}

function gridLayout(points, pointWidth, gridWidth) {
  const pointHeight = pointWidth;
  const pointsPerRow = Math.floor(gridWidth / pointWidth);
  const numRows = points.length / pointsPerRow;

  points.forEach((point, i) => {
    point.x = pointWidth * (i % pointsPerRow);
    point.y = pointHeight * Math.floor(i / pointsPerRow);
  });

  return points;
}

function phyllotaxisLayout(points,pointWidth,xOffset,yOffset,iOffset) {
  if(xOffset===void 0)
    xOffset=0;
  if(yOffset===void 0)yOffset=0;if(iOffset===void 0)iOffset=0;var theta=Math.PI*(3-Math.sqrt(5));var pointRadius=pointWidth/2;points.forEach(function(point,i){var index=(i+iOffset)%points.length;var phylloX=pointRadius*Math.sqrt(index)*Math.cos(index*theta);var phylloY=pointRadius*Math.sqrt(index)*Math.sin(index*theta);point.x=xOffset+phylloX-pointRadius;point.y=yOffset+phylloY-pointRadius});return points}

function sineLayout(points,pointWidth,width,height){var amplitude=.3*(height/2);var yOffset=height/2;var periods=3;var yScale=d3.scaleLinear().domain([0,points.length-1]).range([0,periods*2*Math.PI]);points.forEach(function(point,i){point.x=i/points.length*(width-pointWidth);point.y=amplitude*Math.sin(yScale(i))+yOffset});return points}

function spiralLayout(points,pointWidth,width,height){var amplitude=.3*(height/2);var xOffset=width/2;var yOffset=height/2;var periods=20;var rScale=d3.scaleLinear().domain([0,points.length-1]).range([0,Math.min(width/2,height/2)-pointWidth]);var thetaScale=d3.scaleLinear().domain([0,points.length-1]).range([0,periods*2*Math.PI]);points.forEach(function(point,i){point.x=rScale(i)*Math.cos(thetaScale(i))+xOffset;point.y=rScale(i)*Math.sin(thetaScale(i))+yOffset});return points}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function draw() {
  const canvas_node = canvas.node();
  //debugger;
  const ctx = canvas.node().getContext('2d');
  ctx.save();

  // erase what is on the canvas currently
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // draw each point as a rectangle
  for (let i = 0; i < points.length; ++i) {
    const point = points[i];
    ctx.fillStyle = point.color;
    ctx.fillRect(point.x, point.y, pointWidth, pointWidth);
  }

  ctx.restore();
}
""
</script>