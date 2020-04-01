## Individuals on a Map

Please note: individuals that stated a constituency but not a county are not yet mapped to a county and will appear in the "missing" box.

This visualization shows individuals displayed as dots on a map.

You can: 
- hover over a county to display some information on the right.
- select an individual to show its attribute values on the right. 
- select an attribute in the menu on the right to color the individuals corresponding to their values of this attribute.
- select "themes" as an attribute and then select one or multiple themes with "Shift" + Click or "Strg" + Click. This will highlight all individuals that talked about all of those themes.
- select a country on the right to display a different data set.
- zoom.
  
<script>
  // start every markdown file with scripts, via a call to setup...
  import setup from "../../setup.js"
  setup(this)
</script>

<div id="world">
  <div id="menu">
    Data set: <select id="data-select"></select>
    <button id="data-apply-button">Apply</button><br>
    Color: <select id="color-select"></select>
    <select id="theme-select" multiple ></select>
    <button id="apply-button">Apply</button>
  </div>
  <div id="window">
    <canvas id="drawing-canvas" width="5000" height="5000"></canvas>
  </div>
  <div id="tooltip">
    <div id="district-tooltip-div" class="tooltip-div"></div>
    <div id="individual-tooltip-div" class="tooltip-div"></div>
  </div>
  <canvas id="unique-polygon-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
  <canvas id="unique-individual-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
</div>

<style>
#world {
  width: 1400px;
  height: 1000px;
}

#window {
  width: 1000px;
  height: 1000px;
  overflow: hidden;
  border-style: solid;
  border-width: thin;
  float: left;
}

#menu {
  width: 360px;
  height: 480px;
  float: right;
  border-style: solid;
  border-width: thin;
  padding: 10px;
}

#tooltip {
  width: 360px;
  height: 480px;
  float: right;
  border-style: solid;
  border-width: thin;
  padding: 10px;
}

.invisible-canvas{
  visibility: hidden;
}

.tooltip-div {
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

#theme-select {
  display: none;
}
</style>

<script>
import { KenyaMap, SomaliaMap } from "./map-modules/map.js"

const WIDTH = 5000
const HEIGHT = 5000

var dataSelect = lively.query(this, "#data-select")
var dataApplyButton = lively.query(this, "#data-apply-button")
var dataOptions = ["Kenya", "Somalia"]
var currentMap

dataOptions.forEach((option) => {
  dataSelect.options[dataSelect.options.length] = new Option(option)
})

dataApplyButton.addEventListener("click", () => {
  let selectedOption = dataSelect.options[dataSelect.selectedIndex].value
  currentMap.clear()
  if (selectedOption === "Somalia") {
    currentMap = new SomaliaMap(this, WIDTH, HEIGHT)
  } else if (selectedOption === "Kenya") {
    currentMap = new KenyaMap(this, WIDTH, HEIGHT)
  }
  currentMap.load()
})

currentMap = new KenyaMap(this, WIDTH, HEIGHT)
currentMap.load()

</script>
