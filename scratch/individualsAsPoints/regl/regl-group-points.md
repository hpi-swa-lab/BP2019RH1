### Intend
This document is to spike and prototype the grouping of points on a webGL canvas with regl.

ATTENTION: You have to click "reset" before applying a new grouping.

<button id="gender-button">Order by Gender</button>
<button id="district-button">Order by District</button>
<button id="age-button">Order by Age</button>
<button id="state-button">Order by State</button>

<button id="reset-button">Reset</button>
<div id="canvas-div">
  <canvas id="drawing-canvas" width="1000" height="800"></canvas>
</div>

<script>

import { ReGL } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/regl-point-wrapper.js"
import d3 from "src/external/d3.v5.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { IndividualsGrouper } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/individual-grouper.js"
import { GroupingLayouter } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/grouping-layouter.js"

// CONSTANTS
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;
const MAX_SPEED = 25;
const POINT_SIZE = 4;
const POINT_PADDING = 3;

// D3 SCALES
var colorScale;
var genderValues;

// SET UP DRAWING SPACE
var divCanvas = lively.query(this, "#canvas-div");
var canvas = lively.query(this, "#drawing-canvas");
var context = canvas.getContext("webgl"); 
var regl = new ReGL(context);
var world = this;
var individualsGrouper;
var nodes;

AVFParser.loadCompressedIndividualsWithKeysFromFile().then((result) => {
  let individuals = result;
  let groupingLayouter = new GroupingLayouter(MAX_WIDTH, MAX_HEIGHT, POINT_PADDING);
  individualsGrouper = new IndividualsGrouper(individuals, groupingLayouter);
    
  nodes = individualsGrouper.getGroupingStructure();
  
  regl.drawPoints({points: nodes});
});

lively.query(this, "#gender-button").addEventListener("click", () => {
  
  individualsGrouper.addGrouping("gender");
  
  nodes = individualsGrouper.getGroupingStructure();
  
  animateReGrouping(nodes);
  
});
  
lively.query(this, "#district-button").addEventListener("click", () => {
  
  individualsGrouper.addGrouping("district");
  
  nodes = individualsGrouper.getGroupingStructure();
  
  animateReGrouping(nodes);
  
});


lively.query(this, "#age-button").addEventListener("click", () => {
  
  individualsGrouper.addGrouping("age");
  
  nodes = individualsGrouper.getGroupingStructure();
  
  animateReGrouping(nodes);
  
});

lively.query(this, "#state-button").addEventListener("click", () => {
  
  individualsGrouper.addGrouping("state");
  
  nodes = individualsGrouper.getGroupingStructure();
  
  animateReGrouping(nodes);
  
});

lively.query(this, "#reset-button").addEventListener("click", () => {
  
  individualsGrouper.initializeRootGrouping();
  
  nodes = individualsGrouper.getGroupingStructure();
  
  regl.drawPoints({points: nodes});
  
});


function animateReGrouping(nodes) {
  const duration = 2000;
  const ease = d3.easeCubic;
  
  let timer = d3.timer((elapsed) => {
      const t = Math.min(1, ease(elapsed / duration))

      regl.animatePointsSizeColorPosition({
        points: nodes,
        tick: t,
      })

      if (t === 1) {
        timer.stop()
      }
    })
}


</script>