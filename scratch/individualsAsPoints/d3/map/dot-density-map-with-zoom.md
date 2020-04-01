<script>
  // start every markdown file with scripts, via a call to setup...
  import setup from "../../setup.js"
  setup(this)
</script>

<!-- from http://bl.ocks.org/awoodruff/94dc6fc7038eba690f43 -->
<!-- working at 20.03. 18:38 (Lively timestamp 04:17)-->
- [ ] merge Wandas missing data and color coding
- [ ] display missing matches (Kurtunwaarey, Saakow, Rab Dhuure, Ceel Barde, Lughaye)
- [x] display all data points (mogadishu currently has only 2), enlarge canvas size
- [x] click on individual (second hidden canvas with unique colors)
- [x] enlarge hitboxes for individual highlighting
- [x] forbid two points on same coordinate and then check mogadishu scale again
- [x] research a way to reduce canvas size, or just show section of it (canvas clipping?)
- [ ] set initial state of canvas correctly so that first view is correct
- [ ] use translateExtent
<div id="world">
  <div id="map"></div>
  <!--<div id="polyMap"></div>-->
  
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
  height: 720px;
}
div.tooltip {						
    padding: 5px;		
    background: lightsteelblue;	
    border: 10px;		
    border-radius: 8px;				
}
</style>

<script>
import d3 from "src/external/d3.v5.js"
import {GroupingAction} from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/actions.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

var width = 5000
var height = 5000
  
var pointWidth = 2.5

var polyCanvas = d3.select(lively.query(this, "#map"))
	.append("canvas")
	.attr("width", width)
	.attr("height", height)
  //.attr("transform","scale(0.1,0.1)")
	.style("display","none")
  
var individualCanvas = d3.select(lively.query(this, "#map"))
	.append("canvas")
	.attr("width", width)
	.attr("height", height)
  //.attr("transform","scale(0.1,0.1)")
	.style("display","none")

var projection = d3.geoEquirectangular().center([45,5])
var baseScale = 20000
var baseTranslate = [width / 2, height / 2]
projection.scale(baseScale).translate(baseTranslate)
 
var transform = d3.zoomIdentity.scale(0.1);

var dotCanvas = d3.select(lively.query(this, "#map"))
	.append("canvas")
	.attr("width", width)
	.attr("height", height)
  //.attr("transform","scale(0.1,0.1)") 
  .on("mousemove", mousemove)
  .on("click", clicked)
  .call(d3.zoom().scaleExtent([1, 50]).on("zoom", zoom))
  //.call(d3.drag().subject(dragsubject).on("drag", drag))
  
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
var dotContext = dotCanvas.node().getContext("2d")
var polyContext = polyCanvas.node().getContext("2d")
var individualContext = individualCanvas.node().getContext("2d")

var avfData
var features
var featureToAVF = {"Gabiley" : "gebiley", "Galkaacyo" : "gaalkacyo", "Bulo Burti" : "bulo burto", "Laasqoray" : "lasqooray", "El Waq" : "ceel waaq", "Wanle Weyne" : "wanla weyn"}
var colorToDistrict = {}
var individualsGroupedByDistrict
var colorToIndividualIndex = {}
var selectedIndividual = null
var lastZoomEvent = Date.now();

(async () => {
  var districts = await d3.json(bp2019url + "/src/geodata/somalia-simplified.geojson")
	features = districts.features
  
	drawMap()

	var imageData = polyContext.getImageData(0,0,width,height) 
  avfData = await AVFParser.loadCompressedIndividualsWithKeysFromFile()
  var action = new GroupingAction()
  action.setAttribute("district")
  individualsGroupedByDistrict = action.runOn(avfData)
  
  var keysToDelete = ["NC", "NA", "STOP", "CE", "question", "showtime_question", "NR", "greeting", "push_back"]
  keysToDelete.forEach(key => {
    delete individualsGroupedByDistrict[key]
  })
  
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
  var usedCoordinates = {}
  
	var i=features.length
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
    var limit = population*10
    var x
    var y
    var r = parseInt((i + 1) / 256)
    var g = (i + 1) % 256
    
		while( hits < population && count < limit){
			x = parseInt(x0 + Math.random()*w)
			y = parseInt(y0 + Math.random()*h)
      if (!usedCoordinates[x + "," + y]) {
			  if (testPixelColor(imageData,x,y,width,r,g) ){
          var currentColor = {"r" : 256/(i*3), "g" : (i*3)%256, "b" : 204, "a" : 255}
          var defaultColor = Object.assign({}, currentColor)
          var uniqueColor = individualsInDistrict[hits].drawing.uniqueColor
          // maybe also assign unique colors here
          individualsInDistrict[hits].drawing.defaultColor = defaultColor
          individualsInDistrict[hits].drawing.currentColor = currentColor
          individualsInDistrict[hits].drawing.position = {"x" : x, "y" : y}
          usedCoordinates[x + "," + y] = true

          drawPixel(individualContext, x, y, uniqueColor.r, uniqueColor.g, uniqueColor.b, uniqueColor.a)
          hits++
          count++
        }
			}
		}  
	}
  if (count > limit) {
    console.log("Count: ", count, "limit: ", limit)
  }
  
  projection.scale(baseScale * transform.k)
    projection.translate([
      (baseTranslate[0] * transform.k) + transform.x,
      (baseTranslate[1] * transform.k) + transform.y
  ])
  drawCanvasWithColorSelector("currentColors")
  
  console.log("Missing Feature Matches:", missingFeatureMatches)
  console.log("Missing AVF Groups:", missingGroups)
})();

function drawCanvasWithColorSelector(colorSelector) {
  dotContext.save()
  dotContext.clearRect(0, 0, width, height)
  drawMap()
  dotContext.translate(transform.x, transform.y)
  dotContext.scale(transform.k, transform.k)
  // this screams for moving this section into a function which gets the context
  individualContext.save()
  individualContext.clearRect(0, 0, width, height)
  individualContext.translate(transform.x, transform.y)
  individualContext.scale(transform.k, transform.k)
  
  for(const district in individualsGroupedByDistrict) {
    for(const individual in individualsGroupedByDistrict[district]) {
      const drawingInformation = individualsGroupedByDistrict[district][individual].drawing
      
      var fillColor = getFillColor("uniqueColor", drawingInformation)
      individualContext.fillStyle = "rgb(" + fillColor.r  + "," + fillColor.g + "," + fillColor.b + ")" 
      individualContext.fillRect(
        drawingInformation.position.x - ((pointWidth + transform.k/3) / transform.k)/4,
        drawingInformation.position.y - ((pointWidth + transform.k/3) / transform.k)/4, 
        (pointWidth + transform.k/3) / transform.k, 
        (pointWidth + transform.k/3) / transform.k
      )
      
      fillColor = getFillColor(colorSelector, drawingInformation)
      dotContext.fillStyle = "rgb(" + fillColor.r + "," + fillColor.g + "," + fillColor.b + ")" 
      dotContext.fillRect(
        drawingInformation.position.x,
        drawingInformation.position.y, 
        pointWidth / transform.k, 
        pointWidth / transform.k
      )
      // use drawPixel here
      // and also put this into a function which gets context and colorSelector
      
    }
  }
  dotContext.restore()
  individualContext.restore()
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

function drawMap() {
  // console.log("transform in drawMap:", transform)
  polyContext.clearRect(0,0,width, height)
  var i=features.length
	while(i--){
		var r = parseInt((i + 1) / 256)
		var g = (i + 1) % 256
    colorToDistrict["rgb(" + r + "," + g + ",0)"] = features[i]
    drawPolygon( features[i], polyContext, "rgb(" + r + "," + g + ",0)" )
    drawPolygon( features[i], dotContext, "#FFFFFF")
	}
}

function drawPolygon(feature, context, fill){
	var coordinates = feature.geometry.coordinates
	context.fillStyle = fill
  context.strokeStyle = "grey"
	context.beginPath()
	coordinates.forEach( function(ring) {
    // rings.forEach( function(ring) {
      ring.forEach( function(coord, i) {
        var projected = projection( coord );
        //console.log("Coordinates:", coord)
        //console.log("projected:", projected )
        if (i == 0) {
          context.moveTo(projected[0], projected[1])
          //context.moveTo(coord[0], -1 * coord[1])
        } else {
          context.lineTo(projected[0], projected[1])
          //context.lineTo(coord[0], -1 * coord[1])
          
        }
      //})
    })
  })
  context.stroke()
	context.closePath()
	context.fill()
}

function drawPixel (context, x, y, r, g, b, a) {
	context.fillStyle = "rgba("+ r +","+ g +","+ b +","+(1)+")"
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

function zoom() {
  var thisZoomEvent = Date.now()
  if (thisZoomEvent - lastZoomEvent < 50) {
    return
  } else {
    lastZoomEvent = thisZoomEvent
    console.log(d3.event.transform)
    transform = d3.event.transform.scale(0.1)
    // transform.k = transform.k/10
    projection.scale(baseScale * transform.k)
    projection.translate([
      (baseTranslate[0] * transform.k) + transform.x,
      (baseTranslate[1] * transform.k) + transform.y
    ])
    //console.log("projection:", projection.translate(), projection.scale())
    drawCanvasWithColorSelector("currentColors")
  }
}

function dragsubject() {
  var i
  var x = transform.invertX(d3.event.x)
  var y = transform.invertY(d3.event.y)
  var dx
  var dy
}

function drag() {
  d3.event.subject[0] = transform.invertX(d3.event.x)
  d3.event.subject[1] = transform.invertY(d3.event.y)
  drawCanvasWithColorSelector("currentColors")
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
  
  if(individualLookup) {
    var individualsIndex = colorToIndividualIndex[colorKey].index
    var districtName = colorToIndividualIndex[colorKey].districtName
    selectedIndividual = individualsGroupedByDistrict[districtName][individualsIndex]
    highlightSelectedIndividual()
    individualTooltip
        .style("visibility", "visible")
        .html("<b> Individual: </b>" + "<br/>" +  
            "age: " + selectedIndividual.age + "<br/>" +  
            "gender: " + selectedIndividual.gender + "<br/>" + 
            "district: " + selectedIndividual.district + "<br/>" + 
            "region: " + selectedIndividual.region + "<br/>" + 
            "state: " + selectedIndividual.state + "<br/>" + 
            "zone: " + selectedIndividual.zone
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