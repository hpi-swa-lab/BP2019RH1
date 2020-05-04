<script>
  // start every markdown file with scripts, via a call to setup...
  import setup from "../../setup.js"
  setup(this)
</script>

<button id="fullscreen-button" title="toggle fullscreen"><i class="fa fa-arrows-alt"></i></button>
<button id="help-button" title="show help">help</button>
<h1>Individuals on a map</h1>
<div id="world">
  <div id="missing-data-window">
    <canvas id="missing-data-canvas"></canvas>
  </div>
  
  <div id="window">
    <canvas id="drawing-canvas" width="5000" height="5000"></canvas>
    <canvas id="unique-polygon-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
    <canvas id="unique-individual-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
  </div>
  
  <div id="menu">
    <div id="selection">
      Data set: <select id="data-select"></select>
      <button id="data-apply-button">Apply</button><br>
      Color: <select id="color-select"></select>
      <select id="theme-select" class="select" multiple ></select>
      <select id="age-select" class="select" multiple ></select>
      <select id="gender-select" class="select" multiple ></select>
      <button id="apply-button">Apply</button>
      <div id="legend-div">
        <svg id="legend"></svg>
      </div>
    </div>
    <div id="tooltip-div">
      <div id="district-tooltip-div" class="tooltip"></div>
      <div id="individual-tooltip-div" class="tooltip"></div>
    </div>
  </div>
</div>

<style>
#missing-data-window {
  width: 300px;
  height: 100%;
  border-style: solid;
  border-width: thin;
  float: left;
}

#window {
  width: calc(100% - 700px);
  height: 100%;
  overflow: hidden;
  border-style: solid;
  border-width: thin;
  float: left;
}

.invisible-canvas{
  visibility: hidden;
}

#menu {
  width: 350px;
  height: 100%;
  float: right;
  border-style: solid;
  border-width: thin;
  margin-left: 20px;
  margin-right: 10px;
}

.select {
  display: none;
}

#selection {
  width: calc(100% - 20px);
  height: calc(50% - 20px);
  margin: 10px;
}

#legend-div {
  width: inherit;
  height: 70%;
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


</style>

<script>
  var container = lively.query(this, "lively-container")
  var parents = lively.allParents(this, [], true)
  var markdown = lively.query(this, "lively-markdown")
  
  markdown.get("#content").addEventListener("scroll", evt => {
    lively.notify("scroll")
    evt.stopPropagation()
    evt.preventDefault()
  })
  
  async function toggleFullscreen() {
    if (container && !container.isFullscreen()) {   
        document.body.querySelectorAll("lively-window").forEach(ea => {
        if (!parents.includes(ea))  {
          ea.style.display = "none"
        }
      })
      container.onFullscreen()
      
      // hacky...
      // markdown.get("#content").style.width = window.innerWidth + "px" 
    } else {
      document.body.querySelectorAll("lively-window").forEach(ea => {
        ea.style.display = ""
      })
      
      document.webkitCancelFullScreen()
      if (container && container.isFullscreen()) {
        container.onFullscreen()
      }
      if (container) {
        container.parentElement.focus() 
      }
    }
  };
  
  lively.query(this, "#fullscreen-button").addEventListener("click", () => toggleFullscreen() )
  lively.query(this, "#help-button").addEventListener("click", () => lively.openBrowser(bp2019url + "/prototypes/Covid19-Kenya/map-help.md"))
  lively.setPosition(lively.query(this, "#world"), lively.pt(0,0), "relative")
  lively.setExtent(lively.query(this, "#world"), lively.pt(window.innerWidth, window.innerHeight - 130))
</script>

<script>
import { KenyaMap, SomaliaMap } from "./map-modules/map.js"

const WIDTH = 5000
const HEIGHT = 5000
const initialPointSize = 5

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
    currentMap = new SomaliaMap(this, WIDTH, HEIGHT, initialPointSize)
  } else if (selectedOption === "Kenya") {
    currentMap = new KenyaMap(this, WIDTH, HEIGHT, initialPointSize)
  }
  currentMap.load()
})

currentMap = new KenyaMap(this, WIDTH, HEIGHT, initialPointSize)
currentMap.load()

</script>
