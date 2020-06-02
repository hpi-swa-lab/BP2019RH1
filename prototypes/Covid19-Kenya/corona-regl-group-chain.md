### Group Chaining 
#### How to use it
- Select a grouping key from the dropdown beneath and click group.
- Scroll and drag to navigate through the displayed points.
- Select another grouping key and chain the two groupings.
- Click on the last grouping in the arrow list to remove the grouping.
- Click on single points to get the individuals information the point represents displayed on the right side of the screen.

<link href="../../scratch/individualsAsPoints/regl/style.css" rel="stylesheet" type="text/css" />

<style>
.control-panel {
  width: 400px;
  height: 800px;
  border: 1px solid black;
  overflow: hidden;
}

.right {
  float: right;
}

.wrapper {
  width: 1400px;
  height: 800px;
}
</style>

<div id="menu-container"></div>
<div class="wrapper">
  <div id="canvas-div">
    <canvas id="drawing-canvas" width="1000" height="800"></canvas>
  </div>
  <div class="control-panel right">
    <lively-inspector class="inspector" id="inspector"></lively-inspector>
  </div>
</div>

<script>
import { ReGL } from "../../scratch/individualsAsPoints/regl/npm-modules/regl-point-wrapper.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { GroupingLayouter } from "../../scratch/individualsAsPoints/regl/groupchaining/node-modules/grouping-layouter.js"
import { InteractiveCanvas } from "../../scratch/individualsAsPoints/regl/groupchaining/node-modules/interactive-canvas.js";
import d3 from "src/external/d3.v5.js";


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
var inspectorPanel = lively.query(this, "#control-panel");
var inspector = lively.query(this, "#inspector")
var context = canvas.getContext("webgl"); 
var regl = new ReGL(context);
var world = this;
var individualsGrouper;
var nodes = [];

//SET UP INTERACTIVE CANVAS
var interactiveCanvas = null;

//SET UP MENU
var menuContainer = lively.query(this, "#menu-container");

var keys = ["age", "constituency", "county", "gender", "languages"];

AVFParser.loadCovidData().then((result) => {
  let individuals = result;
  let groupingLayouter = new GroupingLayouter(MAX_WIDTH, MAX_HEIGHT, POINT_PADDING);
  interactiveCanvas = new InteractiveCanvas(world, canvas, regl, inspector, individuals);
  interactiveCanvas.registerSelection();
  interactiveCanvas.registerZoom();
  interactiveCanvas.registerGrouping(groupingLayouter, menuContainer, keys);
  
  interactiveCanvas.start();
});


</script>

