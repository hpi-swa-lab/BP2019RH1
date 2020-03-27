<div id="world">
  <canvas id="drawing-canvas" width="500" height="500"></canvas>
  <canvas id="unique-polygon-canvas" width="500" height="500"></canvas>
  <canvas id="unique-individual-canvas" width="500" height="500"></canvas>
  <div id="tooltip-div"></div>
</div>

- [ ] add Tooltip
- [ ] add interaction buttons
- [ ] implement Zoomer
- [ ] implement updateScale/updateTranslate on individual canvas 
- [ ] implement updateScale/updateTranslate on map canvas
- [ ] implement updatePointSize on individual canvas

<style>
#world {
  width: 720px;
  height: 600px;
  float: left;
}

#unique-individual-canvas{
  //visibility: hidden;
}

#unique-polygon-canvas{
  //visibility: hidden;
}

#tooltip-div {						
  padding: 5px;		
  background: lightsteelblue;	
  border: 10px;		
  border-radius: 8px;				
}
</style>

<script>
import { DefaultColoredCanvas, UniqueColoredCanvas } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/map/canvas.js"
import { DefaultColoredMap, UniqueColoredMap } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/map/mapCanvas.js"
import { DistrictTooltip, IndividualTooltip } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/map/tooltip.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { GroupingAction } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/actions.js"
import d3 from "src/external/d3.v5.js"

// TODO: change width and height to 5000 to scale down later
const WIDTH = 500
const HEIGHT = 500

var drawingCanvas = lively.query(this, "#drawing-canvas")
var uniquePolygonCanvas = lively.query(this, "#unique-polygon-canvas")
var uniqueIndividualCanvas = lively.query(this, "#unique-individual-canvas")
// QUESTION: put both shown canvases on one html canvas or two?
var drawingContext = drawingCanvas.getContext("2d")
var uniquePolygonContext = uniquePolygonCanvas.getContext("2d")
var uniqueIndividualContext = uniqueIndividualCanvas.getContext("2d")

var tooltipDiv = lively.query(this, "#tooltip-div")
// TODO: set scale to 20000 to scale down later
var projection = d3.geoEquirectangular().center([45,5]).scale(2000).translate([WIDTH / 2, HEIGHT / 2])
var path = d3.geoPath().projection(projection)
var world = this
var visibleMapCanvas = null
var visibleIndividualCanvas = null
var mapCanvas = null
var individualCanvas = null
var tooltip = null

//dotCanvas.append('rect')

var featureToAVF = {"Gabiley" : "gebiley", "Galkaacyo" : "gaalkacyo", "Bulo Burti" : "bulo burto", "Laasqoray" : "lasqooray", "El Waq" : "ceel waaq", "Wanle Weyne" : "wanla weyn", "NC" : "NC", "NA" : "NA", "STOP" : "STOP", "CE" : "CE", "NR" : "NR"}
var missingDataKeys = ["NC", "NA", "STOP", "CE", "question", "showtime_question", "NR", "greeting", "push_back"]
var colorToIndividualIndex = {}

AVFParser.loadCompressedIndividualsAnsweredThemes("OCHA").then((result) => {
  let individuals = result
  
  d3.json("https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/d3/somalia.geojson").then((result) => {
    let features = result.features
    features = addDistrictsForMissingData(features)
    
    mapCanvas = new UniqueColoredMap(world, uniquePolygonCanvas, features, projection)
    //mapCanvas.registerZoom()
    mapCanvas.start()
    mapCanvas.drawMap()
    
    visibleMapCanvas = new DefaultColoredMap(world, drawingCanvas, features, projection)
    visibleMapCanvas.drawMap()
    
    initializeIndividuals(individuals)
    let individualsGroupedByDistrict = groupIndividualsByDistrict(individuals)
    calculateIndividualsPosition(features, individualsGroupedByDistrict)
    
    individualCanvas = new UniqueColoredCanvas(world, uniqueIndividualCanvas, individuals)
    individualCanvas.registerZoom()
    individualCanvas.drawIndividuals()
    
    visibleIndividualCanvas = new DefaultColoredCanvas(world, drawingCanvas, individuals)
    visibleIndividualCanvas.drawIndividuals()
    
    tooltip = new IndividualTooltip(tooltipDiv)
    tooltip.showIndividualInformation(individuals[0])
  })
})
  
function initializeIndividuals(individuals) {
  individuals.forEach((individual, index) => {
    individual.drawing = {}
    individual.drawing.defaultColor = {"r" : 0, "g" : 0, "b" : 255, "a" : 255}
    individual.drawing.uniqueColor = getUniqueColor(colorToIndividualIndex)  
    let color = individual.drawing.uniqueColor
    let colorString = "r" + color.r + "g" + color.g + "b" + color.b
    colorToIndividualIndex[colorString] = {"index": index} 
    individual.drawing.position = {}
  })
}

function getUniqueColor(colors) {
  let color = getRandomColor()
  let colorString = "r" + color.r + "g" + color.g + "b" + color.b
  while (colors[colorString]) {
    color = getRandomColor()
    colorString = "r" + color.r + "g" + color.g + "b" + color.b
  }
  return color
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min
}

function getRandomColor() {
  return {"r": getRndInteger(1, 254), "g" : getRndInteger(1, 254), "b" : getRndInteger(1, 254), "a" : 255}
}

function calculateIndividualsPosition(features, individualsGroupedByDistrict) {
  let missingGroups = {}
  Object.keys(individualsGroupedByDistrict).forEach(key => {
    missingGroups[key] = 1
  })
  let missingFeatureMatches = []
  
  let imageData = uniquePolygonContext.getImageData(0,0,WIDTH,HEIGHT) 
  
  let i = features.length
  while(i--){
    let districtName = getDistrictLookupName(features[i].properties.DISTRICT)
    let individualsInDistrict = individualsGroupedByDistrict[districtName]
    
    if (!individualsInDistrict) {
      missingFeatureMatches.push(districtName)
      continue
    }
      
    let population = individualsInDistrict.length
    delete missingGroups[districtName]
    if ( !population ) {
      continue
    }
    
    let bounds = path.bounds(features[i])
		let x0 = bounds[0][0]
		let y0 = bounds[0][1]
    let w = bounds[1][0] - x0
    let h = bounds[1][1] - y0
    let hits = 0
    let count = 0
    let limit = population //*10
    let x
    let y
    let r = parseInt((i + 1) / 256)
    let g = (i + 1) % 256
    
    while( hits < population && count < limit){
			x = parseInt(x0 + Math.random()*w)
			y = parseInt(y0 + Math.random()*h)

      // TODO: make sure that no two pixels have the same position
      //if (!usedCoordinates[x + "," + y]) {
        if (testPixelColor(imageData,x,y,WIDTH,r,g) ){
          // usedCoordinates[x + "," + y] = true
          setIndividualPosition(individualsInDistrict[hits], x, y)
          hits++
        }
      //}
      // count++
		}
  }
}

function testPixelColor(imageData,x,y,w,r,g){
  if (y < 0 || x < 0) {
    debugger
    return true
  }
	let index = (x + y * w) * 4
	return imageData.data[index] == r && imageData.data[index + 1] == g
  // return true
}

function setIndividualPosition(individual, x, y) {
  individual.drawing.position.x = x
  individual.drawing.position.y = y
}

function groupIndividualsByDistrict(individuals) {
  let action = new GroupingAction()
  action.setAttribute("district")
  let individualsGroupedByDistrict = action.runOn(individuals)
  return individualsGroupedByDistrict
}

function getDistrictLookupName(featureDistrictName) {
  let lookupName = featureToAVF[featureDistrictName]
  if (lookupName) {
    return lookupName
  } else {
    lookupName = featureDistrictName.toLowerCase()
    return lookupName
  }
}

function addDistrictsForMissingData(features) {
  let j = 1
  missingDataKeys.forEach(key => {
    features.push({"type" : "Feature", "properties" : {"DISTRICT" : key}, "geometry" : {"type" : "MultiPolygon", "coordinates" : 
      [[[[40.5,-1.5+j],
      [40.5,-2.5+j],
      [38,-2.5+j],
      [38,-1.5+j],
      [40.5,-1.5+j]]]]}
    })
    j += 1.5
  })
  return features
}

</script>