<!-- ideas 

- color coding per attribute (differs from grouping)
- inspector of highlighted individual -> have one inspector that loads new individual / becomes empty
- highlight multiple individuals per rectangle
- highlighted individual get to front/bigger

-->

<style>

#wrapper {
    width: 1300px;
    height: 480px;
}
.canvas {
    width: 640px;
    height: 480px;
    border: 1px solid black;
}

.left {
  float: left
}

.right {
  float: right
}

</style>

<div id="wrapper">
  <div class="left">
    <button id="group_random_0">group random</button>
    <button id="group_gender_0">group by gender</button>
    <button id="group_district_0">group by district</button>
    <button id="group_age_0">group by age</button>
    <div class="canvas" id="canvas_0"></div>
  </div>
  <div class="right">
    <button id="group_random_1">group random</button>
    <button id="group_gender_1">group by gender</button>
    <button id="group_district_1">group by district</button>
    <button id="group_age_1">group by age</button>
    <div class="canvas" id="canvas_1"></div>
  </div>
</div>

<script>

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import d3 from "src/external/d3.v5.js"

//------visuals declaration------//

let canvasWidth = 640 
let canvasHeight = 480

let world = this

const pointWidth = 4
const animationDuration = 2000 //in milliseconds

let data = []
let uniqueColors = []

let diagrams = []
diagrams.push({"div": lively.query(world, "#canvas_0")})
diagrams.push({"div": lively.query(world, "#canvas_1")})

diagrams.forEach((diagram) => {
  diagram["canvas"] = d3.select(diagram.div).append("canvas").attr('width', canvasWidth).attr('height', canvasHeight)
  diagram["pixelMatrix"] = []
})

for (let i = 0; i < diagrams.length; i++) {
  (function () {
    diagrams[i].div.addEventListener("click", (event) => {highlightClickedIndividual(diagrams[i].div, i, event)})
    lively.query(world, "#group_random_" + i.toString()).addEventListener("click", (event) => {groupRandom(diagrams[i].canvas, i)})
    lively.query(world, "#group_gender_" + i.toString()).addEventListener("click", (event) => {groupByAttribute(diagrams[i].canvas, i, "gender")})
    lively.query(world, "#group_district_" + i.toString()).addEventListener("click", (event) => {groupByAttribute(diagrams[i].canvas, i, "district")})
    lively.query(world, "#group_age_" + i.toString()).addEventListener("click", (event) => {groupByAttribute(diagrams[i].canvas, i, "age")})
  }());
}

//------init diagram------//

AVFParser.loadCompressedIndividualsWithKeysFromFile().then(result => {
  data = result
  
  diagrams.forEach((diagram) => {
    diagram["colorScale"] = d3.scaleSequential(d3.interpolateViridis).domain([data.length - 1, 0])
  })

  for (let index = 0; index < data.length; index++) {
    initializeIndividual(data[index], index)
  }
  
  generatePixelMatrices()
  drawAllCanvasesWithColorSelector("currentColors")
})

//------Interaction functions------//

function groupByAttribute(canvas, canvasIndex, attribute) {
  copyDrawingInformation("currentPositions", "startPositions", canvasIndex)
  
  let attributeValues = {}
  data.forEach(individual => {
    attributeValues[individual[attribute]] = true
  })
  
  data.forEach(individual => {
    individual.drawing.targetPositions[canvasIndex].x = getXPositionByAttribute(individual, attribute, Object.keys(attributeValues))
  })
  
  diagrams[canvasIndex].pixelMatrix = generatePixelMatrix(canvas, canvasIndex)
  animate(canvas, canvasIndex)
}

function groupRandom(canvas, canvasIndex) {
  copyDrawingInformation("currentPositions", "startPositions", canvasIndex)
  
  data.forEach(individual => {
    individual.drawing.targetPositions[canvasIndex].x = getRndInteger(0,canvasWidth)
    individual.drawing.targetPositions[canvasIndex].y = getRndInteger(0,canvasHeight)
  })
  
  diagrams[canvasIndex].pixelMatrix = generatePixelMatrix(canvas, canvasIndex)
  animate(canvas, canvasIndex)
}

function highlightClickedIndividual(clickedCanvas, index, event) {
  let position = getCursorPosition(clickedCanvas, event)
  let color = diagrams[index].pixelMatrix[position.y][position.x]
  let individualIndex = uniqueColors[color]
  let individual = data[individualIndex]
  if ((typeof individual) === "undefined") {
    copyDrawingInformation("defaultColors", "currentColors")

  } else {
    setAllCurrentColorsTo("lightgrey")
    setCurrentColorsOfIndividual(individual, "red")
  }
  
  drawAllCanvasesWithColorSelector("currentColors")
}

//------Animation functions------//

function animate(canvas, canvasIndex) {
  const ease = d3.easeSinIn

  let timer = d3.timer((elapsed) => {
    const t = Math.min(1, ease(elapsed / animationDuration))
    data.forEach(individual => {
      individual.drawing.currentPositions[canvasIndex].x = individual.drawing.startPositions[canvasIndex].x * (1 - t) + individual.drawing.targetPositions[canvasIndex].x * t
      individual.drawing.currentPositions[canvasIndex].y = individual.drawing.startPositions[canvasIndex].y * (1 - t) + individual.drawing.targetPositions[canvasIndex].y * t
    })
    drawCanvasWithColorSelector(canvas, canvasIndex, "currentColors")
    if (t === 1) {
      timer.stop()
    }
  })
}

//------Color in water helpers------//

function generatePixelMatrices() {
  for (let i = 0; i < diagrams.length; i++) {
    diagrams[i].pixelMatrix = generatePixelMatrix(diagrams[i].canvas, i)
  }
}

function generatePixelMatrix(canvas, canvasIndex) {
  copyDrawingInformation("targetPositions", "currentPositions", canvasIndex)
  drawCanvasWithColorSelector(canvas, canvasIndex, "uniqueColor")

  let imageData = getImageData(canvas)

  copyDrawingInformation("startPositions", "currentPositions", canvasIndex)
  drawCanvasWithColorSelector(canvas, canvasIndex, "currentColors")
  
  return buildPixelMatrix(imageData)
}

function getImageData(canvas) {
  const canvasNode = canvas.node()
  const context = canvasNode.getContext("2d")
  return context.getImageData(0, 0, canvasWidth, canvasHeight).data
}

function buildPixelMatrix(imageData) {
  let colorMatrix = []
  for (let i = 0; i < imageData.length; i += 4) {
    if ((i / 4) % canvasWidth == 0) {
      colorMatrix.push([])
    }
    let r = imageData[i]
    let g = imageData[i+1]
    let b = imageData[i+2]
    let a = imageData[i+3]
    let color = (a << 24) + (r << 16) + (g << 8) + b
    colorMatrix[colorMatrix.length -1].push(argbToRGB(color))
  }
  return colorMatrix
}

//------Drawing functions------//

function setAllCurrentColorsTo(color) {
  data.forEach((individual) => {
    setCurrentColorsOfIndividual(individual, color)
  })
}

function setCurrentColorsOfIndividual(individual, color) {
  for (let i = 0; i < individual.drawing.currentColors.length; i++) {
    individual.drawing.currentColors[i] = color
  }
}

function drawAllCanvasesWithColorSelector(colorSelector) {
  for (let i = 0; i < diagrams.length; i++) {
    drawCanvasWithColorSelector(diagrams[i].canvas, i, colorSelector)
  }
}

function drawCanvasWithColorSelector(canvas, canvasIndex, colorSelector) {
  const canvasNode = canvas.node()
  const context = canvasNode.getContext("2d")
  context.save()
  context.clearRect(0, 0, canvasWidth, canvasHeight)
  for (let i = 0; i < data.length; i++) {
    const drawingInformation = data[i].drawing
    context.fillStyle = getFillColor(colorSelector, i, canvasIndex)
    context.fillRect(
      drawingInformation.currentPositions[canvasIndex].x,
      drawingInformation.currentPositions[canvasIndex].y, 
      pointWidth, 
      pointWidth
    )
  }  
  context.restore()
}

function getFillColor(colorSelector, individualIndex, canvasIndex) {
  if (colorSelector === "currentColors") {
    return data[individualIndex].drawing.currentColors[canvasIndex]
  } else if (colorSelector === "uniqueColor") {
    return data[individualIndex].drawing.uniqueColor
  } else {
    return "grey"
  }
}

//------Helper functions------//

function initializeIndividual(individual, index) {
  individual.drawing = {}
  individual.drawing.uniqueColor = getUniqueColor(uniqueColors)
  uniqueColors[individual.drawing.uniqueColor] = index
  individual.drawing.defaultColors = []
  diagrams.forEach((diagram) => {individual.drawing.defaultColors.push(diagram.colorScale(index))})
  individual.drawing.currentColors = individual.drawing.defaultColors.slice()
  individual.drawing.currentPositions = []
  individual.drawing.targetPositions = []
  individual.drawing.startPositions = []
  for (let i = 0; i < diagrams.length; i++) {
    individual.drawing.currentPositions.push({"x": getRndInteger(0,canvasWidth), "y": getRndInteger(0,canvasHeight)})
    individual.drawing.targetPositions.push({"x": individual.drawing.currentPositions[i].x, "y": individual.drawing.currentPositions[i].y})
    individual.drawing.startPositions.push({"x": individual.drawing.currentPositions[i].x, "y": individual.drawing.currentPositions[i].y})
  }
}

function getXPositionByAttribute(individual, attribute, attributeNames) {
  let start = canvasWidth / attributeNames.length * (attributeNames.indexOf(individual[attribute]))
  return getRndInteger(start, start + canvasWidth / attributeNames.length)
}

function getCursorPosition(clickedCanvas, event) {
  const rect = clickedCanvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {"x": Math.floor(x), "y": Math.floor(y)}
}

function copyDrawingInformation(sourceSelector, destinationSelector, canvasIndex=null) {
  if (canvasIndex) {
    data.forEach(individual => {
      individual.drawing[destinationSelector][canvasIndex] = individual.drawing[sourceSelector][canvasIndex]
    })
  } else {
    data.forEach(individual => {
      individual.drawing[destinationSelector] = individual.drawing[sourceSelector].slice()
    })
  }
}

function getUniqueColor(colors) {
  let color = getRandomColor()
  while (colors[color] || color === "ffffff" || color === "000000") {
    color = getRandomColor()
  }
  return color
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min
}

function getRandomColor() {
  var letters = '0123456789abcdef'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[getRndInteger(0, 16)]
  }
  return color
}

function argbToRGB(color) {
  return '#'+ ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);
}

</script>