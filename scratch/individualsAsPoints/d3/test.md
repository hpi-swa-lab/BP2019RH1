<div id="world">
  Color: <select id="color_select"></select>
  <button id="color_button">Apply</button>
  Theme: <select id="theme_select"></select>
  <button id="theme_button">Apply</button>
  <div id="map"></div>
  <div id="polyMap"></div>
</div>

<style>
#polyMap {
  width: 600px;
  height: 600px;
  overflow: hidden;
  border-style: solid;
}
#map {
  width: 600px;
  height: 600px;
  overflow: hidden;
  border-style: solid;
}
#world {
  width: 720px;
  height: 600px;
  float: left;
}
div.tooltip {						
  padding: 5px;		
  background: lightsteelblue;	
  border: 10px;		
  border-radius: 8px;				
}
</style>

<script>

// visibility, display none?

import d3 from "src/external/d3.v5.js"
import {GroupingAction} from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/actions.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

var world = this

var width = 5000
var height = 5000
  
var pointWidth = 3

var polyCanvas = d3.select(lively.query(this, "#polyMap"))
	.append("canvas")
	.attr("width", width)
	.attr("height", height)
	.style("display","none")
  
var individualCanvas = d3.select(lively.query(this, "#map"))
	.append("canvas")
	.attr("width", width)
	.attr("height", height)
	.style("display","none")
  
var projection = d3.geoEquirectangular().center([45,5])
var baseScale = 20000
var baseTranslate = [width / 2, height / 2]
projection.scale(baseScale).translate(baseTranslate)
 

var transform = d3.zoomIdentity.scale(0.1)

var dotCanvas = d3.select(lively.query(this, "#map"))
	.append("canvas")
	.attr("width", width)
	.attr("height", height)
  .on("mousemove", mousemove)
  .on("click", clicked)
  .call(d3.zoom().scaleExtent([1, 50]).on("zoom", zoom))

dotCanvas.append('rect')
  
var tooltip = d3.select(lively.query(this, '#world'))
	.append("div")
  .attr("class", "tooltip")
	.style("visibility", "hidden")
  
var individualTooltip = d3.select(lively.query(this, '#world'))
	.append("div")
  .attr("class", "tooltip")
  .style("background", "lightgreen")
	.style("visibility", "hidden")

var path = d3.geoPath().projection(projection)
var polyContext = polyCanvas.node().getContext("2d")
var dotContext = dotCanvas.node().getContext("2d")
var individualContext = individualCanvas.node().getContext("2d")

var features
var avfData
var featureToAVF = {"Gabiley" : "gebiley", "Galkaacyo" : "gaalkacyo", "Bulo Burti" : "bulo burto", "Laasqoray" : "lasqooray", "El Waq" : "ceel waaq", "Wanle Weyne" : "wanla weyn", "NC" : "NC", "NA" : "NA", "STOP" : "STOP", "CE" : "CE", "NR" : "NR"}
var colorToDistrict = {}
var individualsGroupedByDistrict
var colorToIndividualIndex = {}
var selectedIndividual = null
var missingDataKeys = ["NC", "NA", "STOP", "CE", "question", "showtime_question", "NR", "greeting", "push_back"]
var colorAttributes = ["default", "age", "district", "gender", "themes"]
var colorSelect = lively.query(this, "#color_select")
var themeAttributes
var themeSelect = lively.query(this, "#theme_select")
var lastZoomEvent = Date.now();

(async () => {
  avfData = await prepareAvfData()
  themeAttributes = Object.getOwnPropertyNames(avfData[0].themes)

  features = await getDistricts()
  drawMap(features, polyContext, "unique")
  var imageData = polyContext.getImageData(0,0,width,height) 
  
  var missingGroups = {}
  Object.keys(individualsGroupedByDistrict).forEach(key => {
    missingGroups[key] = 1
  })
  
  var missingFeatureMatches = []
  var usedCoordinates = {}
  
	var i = features.length
	while(i--){
    var districtName = getDistrictLookupName(features[i].properties.DISTRICT)
    var individualsInDistrict = individualsGroupedByDistrict[districtName]
    if (!individualsInDistrict) {
      missingFeatureMatches.push(districtName)
      continue
    }
      
    var population = individualsInDistrict.length
    delete missingGroups[districtName]
    if ( !population ) {
      continue
    }

		var bounds = path.bounds(features[i])
		var x0 = bounds[0][0]
		var y0 = bounds[0][1]
    var w = bounds[1][0] - x0
    var h = bounds[1][1] - y0
    var hits = 0
    var count = 0
    var limit = population //*10
    var x
    var y
    var r = parseInt((i + 1) / 256)
    var g = (i + 1) % 256
		while( hits < population && count < limit){
			x = parseInt(x0 + Math.random()*w)
			y = parseInt(y0 + Math.random()*h)

      //if (!usedCoordinates[x + "," + y]) {
        if (testPixelColor(imageData,x,y,width,r,g) ){          
          drawIndividual(individualsInDistrict[hits], x, y)
          usedCoordinates[x + "," + y] = true
          hits++
          
        }
      //}
      // count++
		}
	}
  
  /*projection.scale(baseScale * transform.k)
    projection.translate([
      (baseTranslate[0] * transform.k) + transform.x,
      (baseTranslate[1] * transform.k) + transform.y
  ])*/
  clearCanvas(polyContext)
  clearCanvas(dotContext)
  clearCanvas(individualContext)
  drawCanvasWithColorSelector("currentColors")
  createDropDownMenu()
})();

function createDropDownMenu() {
  colorAttributes.forEach((attribute) => {
    colorSelect.options[colorSelect.options.length] = new Option(attribute)
  })

  lively.query(world, "#color_button").addEventListener("click", () => {
    let attribute = colorSelect.options[colorSelect.selectedIndex].value
    // if (attribute == "themes") add new button 
    setColorByAttribute(attribute)
  })
  
  themeAttributes.forEach((attribute) => {
    themeSelect.options[themeSelect.options.length] = new Option(attribute)
  })

  lively.query(world, "#theme_button").addEventListener("click", () => {
    setColorByThemeAttribute(themeSelect.options[themeSelect.selectedIndex].value)
  })
}

function drawIndividual(individual, x, y) {
  let currentColor = {"r" : 0, "g" : 0, "b" : 255, "a" : 255}
  let defaultColor = Object.assign({}, currentColor)
  let uniqueColor = individual.drawing.uniqueColor
  // maybe also assign unique colors here
  individual.drawing.defaultColor = defaultColor
  individual.drawing.currentColor = currentColor
  individual.drawing.position = {"x" : x, "y" : y}
}

async function prepareAvfData() {
  let avfData = await AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA")
  let action = new GroupingAction()
  action.setAttribute("district")
  individualsGroupedByDistrict = action.runOn(avfData)
  
  for (const district in individualsGroupedByDistrict) {
    for (const individual in individualsGroupedByDistrict[district]) {
      if (individualsGroupedByDistrict[district][individual]) {
        initializeIndividual(individualsGroupedByDistrict[district][individual], district, individual)
      }
    }
  }
  
  return avfData
}

async function getDistricts() {
  let districts = await d3.json("https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/d3/somalia.geojson")
	let features = districts.features
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

function setColorByThemeAttribute(attribute) {
  avfData.forEach((individual) => {
    if (individual.themes[attribute] == '1') {
      individual.drawing.defaultColor = {"r" : 255, "g" : 0, "b" : 0, "a" : 255}
      individual.drawing.currentColor = individual.drawing.defaultColor        
    } else {
      individual.drawing.defaultColor = {"r" : 0, "g" : 200, "b" : 255, "a" : 0.25}
      individual.drawing.currentColor = individual.drawing.defaultColor
    }
  })
  
  clearCanvas(dotContext)
  clearCanvas(polyContext)
  clearCanvas(individualContext)
  drawCanvasWithColorSelector("currentColors")
  restoreCanvas(dotContext)
  clearCanvas(polyContext)
  clearCanvas(individualContext)
}

function setColorByAttribute(attribute) {
  let domain = getValuesOfAttribute(attribute)
  let colors = []
  domain.forEach(() => {
    colors.push(getUniqueColor(colors))
  })

  let domainColorMap = {}
  for (let i = 0; i < domain.length; i++) {
    domainColorMap[domain[i]] = colors[i] 
  }

  avfData.forEach((individual) => {
    if (attribute == "themes") {
      let counter = 0
      for (let i = 0; i < domain.length; i++) {
        if (individual.themes[domain[i]] == '1') {
          individual.drawing.defaultColor = domainColorMap[domain[i]] 
          individual.drawing.currentColor = individual.drawing.defaultColor
          counter++
          } 
      }
      if (counter == 0){
        individual.drawing.defaultColor = {"r" : 0, "g" : 0, "b" : 255, "a" : 255}
        individual.drawing.currentColor = individual.drawing.defaultColor
      }
    } else {
      individual.drawing.defaultColor = domainColorMap[individual[attribute]]
      individual.drawing.currentColor = individual.drawing.defaultColor
    }
  })
  
  clearCanvas(dotContext)
  clearCanvas(polyContext)
  clearCanvas(individualContext)
  drawCanvasWithColorSelector("currentColors")
  restoreCanvas(dotContext)
  clearCanvas(polyContext)
  clearCanvas(individualContext)
}

function getValuesOfAttribute(attribute) {
  var attributeValues = {}
  avfData.forEach(individual => {
    attributeValues[individual[attribute]] = true
  })
  if (attribute == "themes") {
    return themeAttributes
  }
  return Object.keys(attributeValues)
}

function drawCanvasWithColorSelector(colorSelector) {
  
  drawMap(features, polyContext, "unique")
  drawMap(features, dotContext, "white")
  
  for(const district in individualsGroupedByDistrict) {
    for(const individual in individualsGroupedByDistrict[district]) {
      const drawingInformation = individualsGroupedByDistrict[district][individual].drawing
      
      let fillColor = getFillColor("uniqueColor", drawingInformation)
      let x = drawingInformation.position.x - ((pointWidth + transform.k/3) / transform.k)/4
      let y = drawingInformation.position.y - ((pointWidth + transform.k/3) / transform.k)/4
      let size = (pointWidth + transform.k/3) / transform.k
      drawPixel(individualContext, x, y, fillColor.r, fillColor.g, fillColor.b, fillColor.a, size)
      
      fillColor = getFillColor(colorSelector, drawingInformation)
      x = drawingInformation.position.x
      y = drawingInformation.position.y
      size = pointWidth * 10 / transform.k
      drawPixel(dotContext, x, y, fillColor.r, fillColor.g, fillColor.b, fillColor.a, size)
      // and also put this into a function which gets context and colorSelector
    }
  }
}

function clearCanvas(context) {
  context.save()
  context.clearRect(0, 0, width * 10, height * 10)
  context.scale(transform.k, transform.k)
  context.translate(transform.x, transform.y)
}

function restoreCanvas(context) {
  context.restore()
}

function getFillColor(colorSelector, drawingInformation) {
  if (colorSelector === "currentColors") {
    return drawingInformation.currentColor
  } else if (colorSelector === "uniqueColor") {
    return drawingInformation.uniqueColor
  } else {
    return "grey"
  }
}

function highlightSelectedIndividual() {
  selectedIndividual.drawing.currentColor = {"r" : 255, "g" : 0, "b" : 0, "a" : 255}
  clearCanvas(dotContext)
  drawCanvasWithColorSelector("currentColors")
  restoreCanvas(dotContext)
}

function unhighlightSelectedIndividual() {
  var defaultColor = Object.assign({}, selectedIndividual.drawing.defaultColor)
  selectedIndividual.drawing.currentColor = defaultColor
  clearCanvas(dotContext)
  drawCanvasWithColorSelector("currentColors")
  restoreCanvas(dotContext)
}

function getDistrictLookupName(featureDistrictName) {
  var lookupName = featureToAVF[featureDistrictName]
  if (lookupName) {
    return lookupName
  } else {
    lookupName = featureDistrictName.toLowerCase()
    return lookupName
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

function drawMap(features, context, fillType) {
  let i = features.length
	while(i--){
    let fill
    if (fillType === "white") {
      fill = "#FFFFFF"
    } else if (fillType === "unique") {
      let r = parseInt((i + 1) / 256)
		  let g = (i + 1) % 256
      fill = "rgb(" + r + "," + g + ",0)"
      colorToDistrict["rgb(" + r + "," + g + ",0)"] = features[i] // this is unnecessary to do every time when you draw the map
    }
    drawPolygon(features[i], context, fill)
	}
}

function drawPolygon(feature, context, fill){
  let coordinates = feature.geometry.coordinates
  context.fillStyle = fill
  context.strokeStyle = "black"
  context.lineWidth = 1 * 10
  context.beginPath()

  coordinates.forEach( function(rings) {
    rings.forEach( function(ring) {
      ring.forEach( function(coord, i) {
        let projected = projection( coord );
        if (i == 0) {
          context.moveTo(projected[0], projected[1])
        } else {
          context.lineTo(projected[0], projected[1])
        }
      })
    })
  })
  
  context.stroke()
  context.closePath()
  context.fill()
}

function drawPixel (context, x, y, r, g, b, a, size) {
	context.fillStyle = "rgba("+ r +","+ g +","+ b +","+ a +")"
	context.fillRect(x, y, size, size)
  
  /*context.moveTo(x, y);
  context.arc(x, y, 2.5, 0, 2 * Math.PI);
  context.fill()
  */
}

function zoom() {
debugger
  var thisZoomEvent = Date.now()
  if (thisZoomEvent - lastZoomEvent < 50) {
    return
  } else {
    lastZoomEvent = thisZoomEvent
    transform = d3.event.transform
    // transform.k = transform.k/10
    /*projection.scale(baseScale * transform.k)
    projection.translate([
      (baseTranslate[0] * transform.k) + transform.x,
      (baseTranslate[1] * transform.k) + transform.y
    ])*/
    //console.log("projection:", projection.translate(), projection.scale())
    clearCanvas(polyContext)
    clearCanvas(dotContext)
    clearCanvas(individualContext)
    drawCanvasWithColorSelector("currentColors")
    restoreCanvas(polyContext)
    restoreCanvas(dotContext)
    restoreCanvas(individualContext)
  }
}

function mousemove () {
  let mouseX = d3.event.layerX
	let mouseY = d3.event.layerY
  let color = polyContext.getImageData(mouseX, mouseY, 1, 1).data
  let colorKey = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
	let districtData = colorToDistrict[colorKey]
  
  if (districtData) {
    let districtName = getDistrictLookupName(districtData.properties.DISTRICT)
    let individualsInDistrict = individualsGroupedByDistrict[districtName]
    let amount = 0
    if (individualsInDistrict) {
      amount = individualsInDistrict.length
    }
    tooltip
      .style("visibility", "visible")
      .html("Region: " + districtData.properties.REGION + "<br/>" + "District: " + districtData.properties.DISTRICT + "<br>" + "Individuals: " + amount)

  } else {
    tooltip
      .style("visibility", "hidden")
  }
}

function clicked () {
  let mouseX = d3.event.layerX
	let mouseY = d3.event.layerY
  let color = individualContext.getImageData(mouseX, mouseY, 1, 1).data
  let colorKey = 'r' + color[0] + 'g' + color[1] + 'b' + color[2] 
  let individualLookup = colorToIndividualIndex[colorKey]
  
  if (selectedIndividual) {
    unhighlightSelectedIndividual()
  }
  
  if (individualLookup) {
    let individualsIndex = colorToIndividualIndex[colorKey].index
    let districtName = colorToIndividualIndex[colorKey].districtName
    selectedIndividual = individualsGroupedByDistrict[districtName][individualsIndex]
    highlightSelectedIndividual(selectedIndividual)
    
    let individualThemes = []
    for (var i = 0; i < themeAttributes.length; i++) {
      if (selectedIndividual.themes[themeAttributes[i]]== '1') {
        individualThemes.push(themeAttributes[i])
      } 
    }
    
    individualTooltip
        .style("visibility", "visible")
        .html("<b> Selected individual </b>" + "<br/>" +  
            "<b> age: </b>" + selectedIndividual.age + "<br/>" +  
            "<b> gender: </b>" + selectedIndividual.gender + "<br/>" + 
            "<b> district: </b>" + selectedIndividual.district + "<br/>" + 
            "<b> region: </b>" + selectedIndividual.region + "<br/>" + 
            "<b> state: </b>" + selectedIndividual.state + "<br/>" + 
            "<b> zone: </b>" + selectedIndividual.zone + "<br/>" +
            "<b> themes: </b>" + individualThemes.join(', ') + "<br/>" +
            "<b> message s04e02: </b>" + selectedIndividual.rqa_s04e02_raw + "<br/>" + 
            "<b> message s04e01: </b>" + selectedIndividual.rqa_s04e01_raw
            )
  } else {
    if (selectedIndividual) {
      selectedIndividual = null
    }
    individualTooltip
      .style("visibility", "hidden")
  }
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

function initializeIndividual(individual, districtName, index) {
  individual.drawing = {}
  individual.drawing.uniqueColor = getUniqueColor(colorToIndividualIndex)  
  let color = individual.drawing.uniqueColor
  let colorString = "r" + color.r + "g" + color.g + "b" + color.b
  colorToIndividualIndex[colorString] = {"districtName": districtName, "index": index} 
}

</script>