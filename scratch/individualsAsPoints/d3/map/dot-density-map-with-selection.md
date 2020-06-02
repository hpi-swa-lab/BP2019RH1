<div id="world">
  Color: <select id="color_select"></select>
  <button id="color_button">Apply</button>
  Theme: <select id="theme_select"></select>
  <button id="theme_button">Apply</button>
</div>

<style>
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
import setup from "../../setup.js"

let root = this

setup(this).then(() => {
  var width = 720
  var height = 600

  var pointWidth = 3

  var polyCanvas = d3.select(lively.query(root, "#world"))
    .append("canvas")
    .attr("width", width)
    .attr("height", height)
    .style("display","none")

  var individualCanvas = d3.select(lively.query(root, "#world"))
    .append("canvas")
    .attr("width", width)
    .attr("height", height)
    .style("display","none")

  var dotCanvas = d3.select(lively.query(root, "#world"))
    .append("canvas")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("click", clicked)

  dotCanvas.append('rect')

  var tooltip = d3.select(lively.query(root, '#world'))
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden")

  var individualTooltip = d3.select(lively.query(root, '#world'))
    .append("div")
    .attr("class", "tooltip")
    .style("background", "lightgreen")
    .style("visibility", "hidden")

  var projection = d3.geoEquirectangular()
    .center([45,5])
    .scale(1500)
    .translate([width / 2, height / 2])

  var path = d3.geoPath().projection(projection)
  var polyContext = polyCanvas.node().getContext("2d")
  var dotContext = dotCanvas.node().getContext("2d")
  var individualContext = individualCanvas.node().getContext("2d")

  var avfData
  var features
  var featureToAVF = {"Gabiley" : "gebiley", "Galkaacyo" : "gaalkacyo", "Bulo Burti" : "bulo burto", "Laasqoray" : "lasqooray", "El Waq" : "ceel waaq", "Wanle Weyne" : "wanla weyn", "NC" : "NC", "NA" : "NA", "STOP" : "STOP", "CE" : "CE", "NR" : "NR"}
  var colorToDistrict = {}
  var individualsGroupedByDistrict
  var colorToIndividualIndex = {}
  var selectedIndividual = null
  var missingDataKeys = ["NC", "NA", "STOP", "CE", "question", "showtime_question", "NR", "greeting", "push_back"]
  var colorAttributes = ["default", "age", "district", "gender", "themes"]
  var colorSelect = lively.query(root, "#color_select")
  var themeAttributes
  var themeSelect = lively.query(root, "#theme_select");

  d3.json(bp2019url + "/src/geodata/simplified-somalia.geojson").then(async districts => {
    var features = districts.features
    var j = 1
    missingDataKeys.forEach(key => {
      features.push({"type" : "Feature", "properties" : {"DISTRICT" : key}, "geometry" : {"type" : "MultiPolygon", "coordinates" : 
        [[[[40,-3+j],
        [40,-4.5+j],
        [33,-4.5+j],
        [33,-3+j],
        [40,-3+j]]]]}})
        j += 2
    })

    var i=features.length
    while(i--){
      var r = parseInt((i + 1) / 256)
      var g = (i + 1) % 256
      colorToDistrict["rgb(" + r + "," + g + ",0)"] = features[i]
      drawPolygon( features[i], polyContext, "rgb(" + r + "," + g + ",0)")
      drawPolygon( features[i], dotContext, "#FFFFFF")
    }

    var imageData = polyContext.getImageData(0,0,width,height) 
    avfData = await AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA")
    themeAttributes = Object.getOwnPropertyNames(avfData[0].themes)
    var action = new GroupingAction()
    action.setAttribute("district")
    individualsGroupedByDistrict = action.runOn(avfData)

    for (const district in individualsGroupedByDistrict) {
      for (const individual in individualsGroupedByDistrict[district]) {
        if (individualsGroupedByDistrict[district][individual]) {
          initializeIndividual(individualsGroupedByDistrict[district][individual], district, individual)
        }
      }
    }
    var missingGroups = {}
    Object.keys(individualsGroupedByDistrict).forEach(key => {
      missingGroups[key] = 1
    })
    var missingFeatureMatches = []

    i=features.length
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
      var limit = population*10
      var x
      var y
      var r = parseInt((i + 1) / 256)
      var g = (i + 1) % 256

      while( hits < population){
        x = parseInt(x0 + Math.random()*w)
        y = parseInt(y0 + Math.random()*h)

        if (testPixelColor(imageData,x,y,width,r,g) ){
          var currentColor = {"r" : 0, "g" : 0, "b" : 204, "a" : 255}
          var defaultColor = Object.assign({}, currentColor)
          individualsInDistrict[hits].drawing.defaultColor = defaultColor
          var uniqueColor = individualsInDistrict[hits].drawing.uniqueColor
          individualsInDistrict[hits].drawing.currentColor = currentColor

          individualsInDistrict[hits].drawing.position = {"x" : x, "y" : y}
          drawPixel(individualContext, x, y, uniqueColor.r, uniqueColor.g, uniqueColor.b, uniqueColor.a)
          hits++
        }
      }
    }
    drawCanvasWithColorSelector("currentColors")

    console.log("Missing Feature Matches:", missingFeatureMatches)
    console.log("Missing AVF Groups:", missingGroups)

    colorAttributes.forEach((attribute) => {
      colorSelect.options[colorSelect.options.length] = new Option(attribute)
    })

    lively.query(root, "#color_button").addEventListener("click", () => {
      var attribute = colorSelect.options[colorSelect.selectedIndex].value
      // if (attribute == "themes") add new button 
      setColorByAttribute(attribute)
    })

    themeAttributes.forEach((attribute) => {
      themeSelect.options[themeSelect.options.length] = new Option(attribute)
    })

    lively.query(root, "#theme_button").addEventListener("click", () => {
      setColorByThemeAttribute(themeSelect.options[themeSelect.selectedIndex].value)
    })
  })
})

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
    drawCanvasWithColorSelector("currentColors")
}

function setColorByAttribute(attribute) {
    var domain = getValuesOfAttribute(attribute)
    var colors = []
    domain.forEach(() => {
      colors.push(getUniqueColor(colors))
    })
    
    var domainColorMap = {}
    for (var i = 0; i < domain.length; i++) {
      domainColorMap[domain[i]] = colors[i] 
    }
    
    avfData.forEach((individual) => {
      if (attribute == "themes") {
        var counter = 0
        for (var i = 0; i < domain.length; i++) {
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
    drawCanvasWithColorSelector("currentColors")
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
  dotContext.save()
  dotContext.clearRect(0, 0, width, height)
  for(const district in individualsGroupedByDistrict) {
    for(const individual in individualsGroupedByDistrict[district]) {
      const drawingInformation = individualsGroupedByDistrict[district][individual].drawing
      var fillColor = getFillColor(colorSelector, drawingInformation)
      dotContext.fillStyle = "rgba(" + fillColor.r + "," + fillColor.g + "," + fillColor.b + "," + fillColor.a + ")" 
      dotContext.fillRect(
        drawingInformation.position.x,
        drawingInformation.position.y, 
        pointWidth, 
        pointWidth
      )
    }
  }
  dotContext.restore()
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

function highlightSelectedIndividual(individual) {
  individual.drawing.currentColor = {"r" : 255, "g" : 0, "b" : 0, "a" : 255}
  drawCanvasWithColorSelector("currentColors")
}

function unhighlightSelectedIndividual() {
  var defaultColor = Object.assign({}, selectedIndividual.drawing.defaultColor)
  selectedIndividual.drawing.currentColor = defaultColor
  drawCanvasWithColorSelector("currentColors")
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
	var index = (x + y * w) * 4
	return imageData.data[index] == r && imageData.data[index + 1] == g
}

function drawPolygon(feature, context, fill){
  var coordinates = feature.geometry.coordinates
  context.fillStyle = fill
  context.strokeStyle = "grey"
  context.beginPath()

  coordinates.forEach( function(rings) {
    rings.forEach( function(ring) {
      ring.forEach( function(coord, i) {
        var projected = projection( coord );
        if (i == 0) {
          context.moveTo(projected[0], projected[1])
        } else {
          context.lineTo(projected[0], projected[1])
          context.stroke()
        }
      })
    })
  })
  
  context.closePath()
  context.fill()
}

function drawPixel (context, x, y, r, g, b, a) {
	context.fillStyle = "rgba("+ r +","+ g +","+ b +","+ a +")"
	context.fillRect( x, y, pointWidth, pointWidth)
  
  /*context.moveTo(x, y);
  context.arc(x, y, 2.5, 0, 2 * Math.PI);
  context.fill()
  */
}

function mousemove () {
  var mouseX = d3.event.layerX
	var mouseY = d3.event.layerY
  var color = polyContext.getImageData(mouseX, mouseY, 1, 1).data
  var colorKey = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
	var districtData = colorToDistrict[colorKey]
  
  if (districtData) {
    var districtName = getDistrictLookupName(districtData.properties.DISTRICT)
    var individualsInDistrict = individualsGroupedByDistrict[districtName]
    var amount = 0
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
  var mouseX = d3.event.layerX
	var mouseY = d3.event.layerY
  var color = individualContext.getImageData(mouseX, mouseY, 1, 1).data
  var colorKey = 'r' + color[0] + 'g' + color[1] + 'b' + color[2] 
  var individualLookup = colorToIndividualIndex[colorKey]
  
  if (selectedIndividual) {
    unhighlightSelectedIndividual()
  }
  
  if (individualLookup) {
    var individualsIndex = colorToIndividualIndex[colorKey].index
    var districtName = colorToIndividualIndex[colorKey].districtName
    selectedIndividual = individualsGroupedByDistrict[districtName][individualsIndex]
    highlightSelectedIndividual(selectedIndividual)
    
    var individualThemes = []
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