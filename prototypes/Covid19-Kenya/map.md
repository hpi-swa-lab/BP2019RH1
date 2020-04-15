<script>
  // start every markdown file with scripts, via a call to setup...
  import setup from "../../setup.js"
  setup(this)
</script>

<bp2019-fullscreen-button></bp2019-fullscreen-button>
<button id="helpButton" title="show help">help</button>
<h1>Individuals on a map</h1>
<div id="world">
  <div id="menu">
    <div id="selection">
      Data set: <select id="data-select"></select>
      <button id="data-apply-button">Apply</button><br>
      <div id="legend-div">
        <svg id="legend"></svg>
      </div>
    </div>
    <div id="tooltip-div">
      <div id="district-tooltip-div" class="tooltip"></div>
      <div id="individual-tooltip-div" class="tooltip"></div>
    </div>
  </div>
  <div id="canvas-window">
    <canvas id="drawing-canvas" width="5000" height="5000"></canvas>
    <canvas id="unique-polygon-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
    <canvas id="unique-individual-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
  </div>
</div>

<style>
#menu {
  width: 350px;
  height: 100%;
  float: left;
  border-style: solid;
  border-width: thin;
  margin-right: 10px;
}


#selection {
  width: calc(100% - 20px);
  height: calc(50% - 20px);
  margin: 10px;
  overflow: auto;
}

#legend-div {
  width: inherit;
  height: 50%;
  overflow-y: auto;
}

#tooltip-div {
  width: calc(100% - 20px);
  height: calc(50% - 20px);
  float: inherit;
  margin: 10px;
}

.tooltip {
  padding: 5px;	
  border: 10px;		
  border-radius: 8px;
}

#district-tooltip-div {						
  background: lightsteelblue;	
}

#individual-tooltip-div {	
  background: lightgreen;					
}

#canvas-window {
  width: calc(100% - 380px);
  height: 100%;
  overflow: hidden;
  border-style: solid;
  border-width: thin;
  float: right;
}

.invisible-canvas{
  visibility: hidden;
}
</style>

<script>
  var world = lively.query(this, "#world")
  
  var containerContent = lively.query(this, "#container-content")
  
  var container = lively.query(this, "lively-container")
  
  lively.removeEventListener("bpmap", container, "extent-changed")
 
  function updateExtent() {
    lively.setExtent(world, lively.getExtent(containerContent).subPt(lively.getGlobalPosition(world).subPt(lively.getGlobalPosition(containerContent))).subPt(lively.pt(20,20)))
  }
  
  lively.addEventListener("bpmap", container, "extent-changed", updateExtent)
  updateExtent()
  
  
  //var markdown = lively.query(this, "lively-markdown")
  //markdown.get("#content").style.width = window.innerWidth + "px" 
  lively.query(this, "bp2019-fullscreen-button").addEventListener("fullscreen-enabled", () => {
    lively.setPosition(world, lively.pt(0,0), "relative")
    lively.setExtent(world, lively.pt(window.innerWidth - 50, window.innerHeight - 150))
  })

  lively.query(this, "bp2019-fullscreen-button").addEventListener("fullscreen-disabled", () => {
      updateExtent()
  })
    
  lively.query(this, "#helpButton").addEventListener("click", () => lively.openBrowser(bp2019url + "/prototypes/Covid19-Kenya/map-help.md"))
</script>

<script>
import { KenyaMap, SomaliaMap } from "./map-modules/map.js"

const WIDTH = 5000
const HEIGHT = 5000
const initialPointSize = 5


var dataOptions = ["Kenya", "Somalia"]
var currentMap
var dataSelect = lively.query(this, "#data-select")
var dataApplyButton = lively.query(this, "#data-apply-button")

var drawingCanvas = lively.query(this, "#drawing-canvas")
var uniquePolygonCanvas = lively.query(this, "#unique-polygon-canvas")
var uniqueIndividualCanvas = lively.query(this, "#unique-individual-canvas")

var districtTooltipDiv = lively.query(this, "#district-tooltip-div")
var individualTooltipDiv = lively.query(this, "#individual-tooltip-div")

var menu = lively.query(this, "#menu")
var legend = lively.query(this, "#legend")
var canvasWindow = lively.query(this, "#canvas-window")
var container = lively.query(this, "lively-container")

dataOptions.forEach((option) => {
  dataSelect.options[dataSelect.options.length] = new Option(option)
})

dataApplyButton.addEventListener("click", () => {
  let selectedOption = dataSelect.options[dataSelect.selectedIndex].value
  currentMap.clear()
  if (selectedOption === "Somalia") {
    currentMap = new SomaliaMap(canvasWindow, container, WIDTH, HEIGHT, initialPointSize, drawingCanvas, uniquePolygonCanvas, uniqueIndividualCanvas, districtTooltipDiv, individualTooltipDiv, legend, menu)
  } else if (selectedOption === "Kenya") {
    currentMap = new KenyaMap(canvasWindow, container, WIDTH, HEIGHT, initialPointSize, drawingCanvas, uniquePolygonCanvas, uniqueIndividualCanvas, districtTooltipDiv, individualTooltipDiv, legend, menu)
  }
  currentMap.load()
})

currentMap = new KenyaMap(canvasWindow, container, WIDTH, HEIGHT, initialPointSize, drawingCanvas, uniquePolygonCanvas, uniqueIndividualCanvas, districtTooltipDiv, individualTooltipDiv, legend, menu)
currentMap.load()

</script>
