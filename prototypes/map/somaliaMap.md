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
import { SomaliaDistrictTooltip, SomaliaIndividualTooltip } from "./helper-modules/tooltip.js"
import { MapHoverer } from "./helper-modules/mapHoverer.js"
import { IndividualClicker } from "./helper-modules/individualClicker.js"
import { SomaliaDataHandler } from "./helper-modules/dataHandler.js"
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

var projection = d3.geoEquirectangular().center([45,5]).scale(20000).translate([WIDTH / 2, HEIGHT / 2])
var path = d3.geoPath().projection(projection)
var world = this

var locationLookupKey = "DISTRICT"
var locationGroupingAttribute = "district"
var featureToAVF = {"Gabiley" : "gebiley", "Galkaacyo" : "gaalkacyo", "Bulo Burti" : "bulo burto", "Laasqoray" : "lasqooray", "El Waq" : "ceel waaq", "Wanle Weyne" : "wanla weyn", "NC" : "NC", "NA" : "NA", "STOP" : "STOP", "CE" : "CE", "NR" : "NR"}
var missingDataKeys = ["NC", "NA", "STOP", "CE", "question", "showtime_question", "NR", "greeting", "push_back"]
var colorAttributes = ["default", "age", "district", "gender", "themes"]
var themeAttributes = ["rqa_s04e01_food_nutrition", "rqa_s04e01_health_services", "rqa_s04e01_access_to_water", "rqa_s04e01_hygiene", "rqa_s04e01_education", "rqa_s04e01_shelter", "rqa_s04e01_peace_and_security", "rqa_s04e01_good_governance", "rqa_s04e01_protection_of_rights", "rqa_s04e01_cooperation_between_government_and_people", "rqa_s04e01_cooperation_between_government_and_NGOs", "rqa_s04e01_NGOs_to_be_accountable_participatory", "rqa_s04e01_community_organisation", "rqa_s04e01_job_creation", "rqa_s04e01_build_resilience_to_drought", "rqa_s04e01_support_for_IDPs", "rqa_s04e01_information", "rqa_s04e01_religion", "rqa_s04e01_support_to_the_poor", "rqa_s04e01_return_and_resettlement_of_IDPs", "rqa_s04e01_stop_aid_dependency", "rqa_s04e01_farming_support", "rqa_s04e01_stop_clannism", "rqa_s04e01_economic_development", "rqa_s04e01_other", "rqa_s04e01_NA", "rqa_s04e01_NS", "rqa_s04e01_NC", "rqa_s04e01_NR", "rqa_s04e01_NIC", "rqa_s04e01_STOP", "rqa_s04e01_WS", "rqa_s04e01_CE", "rqa_s04e01_push_back", "rqa_s04e01_showtime_question", "rqa_s04e01_question", "rqa_s04e01_greeting", "rqa_s04e01_opt_in", "rqa_s04e02_health_service", "rqa_s04e02_government_stability", "rqa_s04e02_job_creation", "rqa_s04e02_economic_development", "rqa_s04e02_peace_and_security", "rqa_s04e02_education", "rqa_s04e02_shelter", "rqa_s04e02_NGOs_to_be_accountable_and_transparent", "rqa_s04e02_access_to_water", "rqa_s04e02_food_nutrition", "rqa_s04e02_resettlement_and_return_for_IDPs", "rqa_s04e02_support_for_agriculture", "rqa_s04e02_cooperation_between_NGOs_people_government", "rqa_s04e02_stop_aid_dependency", "rqa_s04e02_support_the_poor_IDPs", "rqa_s04e02_information", "rqa_s04e02_other", "rqa_s04e02_NA", "rqa_s04e02_NS", "rqa_s04e02_NC", "rqa_s04e02_NR", "rqa_s04e02_NIC", "rqa_s04e02_STOP", "rqa_s04e02_WS", "rqa_s04e02_CE", "rqa_s04e02_push_back", "rqa_s04e02_showtime_question", "rqa_s04e02_question", "rqa_s04e02_greeting", "rqa_s04e02_opt_in"]

AVFParser.loadCompressedIndividualsAnsweredThemes("OCHA").then((result) => {
  let individuals = result
  
  d3.json("https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/d3/somalia.geojson").then((result) => {
    let geoData = result.features
    
    let dataHandler = new SomaliaDataHandler(geoData, individuals, WIDTH, HEIGHT, featureToAVF, missingDataKeys, locationGroupingAttribute, locationLookupKey)
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
    
    let individualTooltip = new SomaliaIndividualTooltip(individualTooltipDiv)
    let districtTooltip = new SomaliaDistrictTooltip(districtTooltipDiv)
    
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