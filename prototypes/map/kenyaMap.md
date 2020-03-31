- [ ] Some individuals have given a constituency but no county, data parsing should add corresponding county when constituency is known
- [ ] Color legend
- [x] themes 
- (Many individuals did not submit a county nor constituency, therefore we are not going to put individuals in their corresponding constituency on the map, so that menu option has to be removed)
<div id="world">
  Color: <select id="color-select"></select>
  <select id="theme-select"></select>
  <button id="apply-button">Apply</button>
  <div id="window">
    <canvas id="drawing-canvas" width="5000" height="5000"></canvas>
  </div>
  <div id="district-tooltip-div" class="tooltip-div"></div>
  <div id="individual-tooltip-div" class="tooltip-div"></div>
  <canvas id="unique-polygon-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
  <canvas id="unique-individual-canvas" class="invisible-canvas" width="5000" height="5000"></canvas>
</div>

<style>
#world {
  width: 720px;
  height: 600px;
  float: left;
}

#window {
  width: 1000px;
  height: 1000px;
  overflow: hidden;
  border-style: solid;
  border-width: thin;
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
import { DefaultColoredCanvas, UniqueColoredCanvas } from "./helper-modules/individualCanvas.js"
import { DefaultColoredMap, UniqueColoredMap } from "./helper-modules/mapCanvas.js"
import { InteractiveMapCanvas } from "./helper-modules/interactiveMapCanvas.js"
import { KenyaDistrictTooltip, KenyaIndividualTooltip } from "./helper-modules/tooltip.js"
import { MapHoverer } from "./helper-modules/mapHoverer.js"
import { IndividualClicker } from "./helper-modules/individualClicker.js"
import { KenyaDataHandler } from "./helper-modules/dataHandler.js"
import { Zoomer } from "./helper-modules/zoomer.js"
import { Menu } from "./helper-modules/menu.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import d3 from "src/external/d3.v5.js"

const WIDTH = 5000
const HEIGHT = 5000

var drawingCanvas = lively.query(this, "#drawing-canvas")
var uniquePolygonCanvas = lively.query(this, "#unique-polygon-canvas")
var uniqueIndividualCanvas = lively.query(this, "#unique-individual-canvas")

var districtTooltipDiv = lively.query(this, "#district-tooltip-div")
var individualTooltipDiv = lively.query(this, "#individual-tooltip-div")

var colorSelect = lively.query(this, "#color-select")
var themeSelect = lively.query(this, "#theme-select")
var applyButton = lively.query(this, "#apply-button")

var projection = d3.geoEquirectangular().center([37, 0]).scale(22000).translate([WIDTH / 2, HEIGHT / 2])
var path = d3.geoPath().projection(projection)
var world = this

var locationLookupKey = "COUNTY_NAM"
var locationGroupingAttribute = "county"
var featureToAVF = {"TRANS NZOIA" : "trans_nzoia", "HOMA BAY" : "homa_bay", "ELEGEYO-MARAKWET" : "elgeyo_marakwet", "UASIN GISHU" : "uasin_gishu", "WEST POKOT" : "west_pokot", "MURANG'A" : "muranga", "THARAKA - NITHI": "tharaka_nithi", "TAITA TAVETA": "taita_taveta", "TANA RIVER":"tana_river"}
var missingDataKeys = ["missing"]
var colorAttributes = ["default", "age", "county", "constituency", "gender", "themes"]
var themeAttributes = ["escalate", "question", "answer", "knowledge", "attitude", "behaviour", "about_coronavirus", "symptoms", "how_to_prevent", "how_to_treat", "what_is_govt_policy", "kenya_update", "rumour_stigma_misinfo", "opinion_on_govt_policy", "collective_hope", "anxiety_panic", "how_spread_transmitted", "other_theme", "push_back", "showtime_question", "greeting", "opt_in", "similar_content", "participation_incentive", "exclusion_complaint", "gratitude", "other"]

AVFParser.loadCovidData().then((result) => {
  let individuals = result
  
  d3.json("https://lively-kernel.org/lively4/BP2019RH1/src/geodata/kenya.geojson").then((result) => {
    let geoData = result.features
    
    let dataHandler = new KenyaDataHandler(geoData, individuals, WIDTH, HEIGHT, featureToAVF, missingDataKeys, locationGroupingAttribute, locationLookupKey)
    dataHandler.addDistrictsForMissingData()
    dataHandler.createDistrictColorCoding()
    
    let uniqueColoredMap = new UniqueColoredMap(world, uniquePolygonCanvas, dataHandler.geoData, projection, dataHandler)
    uniqueColoredMap.drawMap()
    
    let defaultColoredMap = new DefaultColoredMap(world, drawingCanvas, dataHandler.geoData, projection, dataHandler)
    defaultColoredMap.drawMap()
    
    let imageData = uniquePolygonCanvas.getContext("2d").getImageData(0,0,WIDTH,HEIGHT) 
    
    dataHandler.initializeIndividuals()
    dataHandler.calculateIndividualsPosition(imageData, path)
    
    let uniqueColoredCanvas = new UniqueColoredCanvas(world, uniqueIndividualCanvas, dataHandler.individuals)
    uniqueColoredCanvas.drawIndividuals()
    
    let visibleIndividualCanvas = new DefaultColoredCanvas(world, drawingCanvas, individuals)
    visibleIndividualCanvas.drawIndividuals()
    
    let interactiveMapCanvas = new InteractiveMapCanvas(defaultColoredMap, visibleIndividualCanvas, drawingCanvas)
    
    let individualTooltip = new KenyaIndividualTooltip(individualTooltipDiv)
    let districtTooltip = new KenyaDistrictTooltip(districtTooltipDiv)
    
    let mapHoverer = new MapHoverer(uniqueColoredMap, interactiveMapCanvas, districtTooltip, dataHandler)
    mapHoverer.addHover()
    
    let individualClicker = new IndividualClicker(uniqueColoredCanvas, interactiveMapCanvas, individualTooltip, dataHandler)
    individualClicker.addClick()
    
    let zoomer = new Zoomer(interactiveMapCanvas, [uniqueColoredMap, uniqueColoredCanvas])
    
    let menu = new Menu(colorSelect, colorAttributes, themeSelect, themeAttributes, applyButton, dataHandler, interactiveMapCanvas)
    menu.create()
  })
})
</script>

</script>