<button id="random-button">Animate grouping randomly</button>
<button id="grid-button">Animate grouping as grid</button>
<div id="canvas"></div>

<script>

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import d3 from "src/external/d3.v5.js"

let canvasWidth = 1024 
let canvasHeight = 768

let canvasDiv = lively.query(this, "#canvas")
canvasDiv.addEventListener("click", (event) => {openInspectorOfClickedIndividual(canvasDiv, event)})
let canvas = d3.select(canvasDiv).append("canvas")
                .attr('width', canvasWidth)
                .attr('height', canvasHeight)

lively.query(this, "#random-button").addEventListener("click", () => {animateRandom()})
lively.query(this, "#grid-button").addEventListener("click", () => {animateGrid()})

const pointWidth = 5
const pointMargin = 5

let data
let recognitionColors = {}
let colorScale
let pixelMatrix

AVFParser.loadCompressedIndividualsWithKeysFromFile().then(result => {
  data = result
  colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([data.length - 1, 0])
  for (let index = 0; index < data.length; index++) {
    let individual = data[index]
    individual.displayInformation = {}
    individual.displayInformation.x = getRndInteger(0, canvasWidth)
    individual.displayInformation.y = getRndInteger(0, canvasHeight)
    individual.displayInformation.uniqueColor = getUniqueColor(recognitionColors)
    individual.displayInformation.color = colorScale(index)
    recognitionColors[individual.displayInformation.uniqueColor] = index
  }
  
  buildIdentifyingPixelMatrix()
  
  drawWithColorSelector("color")

})

//------------//

function animateGrid() {
  
  setStartPositionsFromCurrent()

  const pointHeight = pointWidth;
  const pointsPerRow = Math.floor(canvasWidth / (pointWidth + pointMargin));
  const numRows = data.length / pointsPerRow;

  data.forEach((point, i) => {
    point.displayInformation.x = (pointWidth + pointMargin) * (i % pointsPerRow);
    point.displayInformation.y = (pointHeight + pointMargin) * Math.floor(i / pointsPerRow);
  });

  setTargetPositionsFromCurrent()
  buildIdentifyingPixelMatrix()
    
  animate()
}

function animateRandom() {
  
  setStartPositionsFromCurrent()
  
  data.forEach(point => {
    point.displayInformation.x = getRndInteger(0, canvasWidth)
    point.displayInformation.y = getRndInteger(0, canvasHeight)
  })
  
  setTargetPositionsFromCurrent()
  buildIdentifyingPixelMatrix()
    
  animate()
  
}

function openInspectorOfClickedIndividual(clickedCanvas, event) {
  let position = getCursorPosition(clickedCanvas, event)
  let color = pixelMatrix[position.y][position.x]
  let index = recognitionColors[color]
  let individual = data[index]
  if (!((typeof individual) === "undefined")) {
    lively.openInspector(individual)
  }
}

//------------//

function buildIdentifyingPixelMatrix() {
  drawWithColorSelector("uniqueColor")
  pixelMatrix = buildPixelMatrix(getImageData().data)
  drawWithColorSelector("color")
}

function setStartPositionsFromCurrent() {
  data.forEach(point => {
    point.displayInformation.sx = point.displayInformation.x
    point.displayInformation.sy = point.displayInformation.y
  })
}

function setTargetPositionsFromCurrent() {
  data.forEach(point => {
    point.displayInformation.tx = point.displayInformation.x
    point.displayInformation.ty = point.displayInformation.y
  })
}

function animate() {
  const duration = 2000
  const ease = d3.easeSinIn

  let timer = d3.timer((elapsed) => {
    const t = Math.min(1, ease(elapsed / duration))
    data.forEach(point => {
      point.displayInformation.x = point.displayInformation.sx * (1 - t) + point.displayInformation.tx * t
      point.displayInformation.y = point.displayInformation.sy * (1 - t) + point.displayInformation.ty * t
    })
    drawWithColorSelector("color")
    if (t === 1) {
      timer.stop()
    }
  })
}

function getUniqueColor(colors) {
  let color = getRandomColor()
  while (colors[color] || color === "FFFFFF") {
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

function getImageData() {
  const canvasNode = canvas.node()
  const context = canvasNode.getContext("2d")
  return context.getImageData(0, 0, canvasWidth, canvasHeight)
}

function drawWithColorSelector(colorSelector) {
  const canvasNode = canvas.node()
  const context = canvasNode.getContext("2d")
  context.save()
  context.clearRect(0, 0, canvasWidth, canvasHeight)
  for (let i = 0; i < data.length; i++) {
    const point = data[i].displayInformation
    context.fillStyle = point[colorSelector]
    context.fillRect(point.x, point.y, pointWidth, pointWidth)
  }  
  context.restore()
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

function argbToRGB(color) {
  return '#'+ ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);
}

function getCursorPosition(clickedCanvas, event) {
  const rect = clickedCanvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {"x": Math.floor(x), "y": Math.floor(y)}
}

""
</script>