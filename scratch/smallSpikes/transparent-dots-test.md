<style>

#canvas {
  border: 1px solid black;
  width: 500px;
  height: 500px;
}

</style>

<button id="redraw">Redraw</button>
<canvas id="canvas"></canvas>

<script>

import { getRandomInteger } from "../../src/internal/individuals-as-points/common/utils.js"

let background = lively.query(this, "#canvas")

let drawingPoints = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

drawingPoints.forEach(point => {
  point.color = "#00ff00ff"
  point.size = 5
})

lively.query(this, "#redraw").addEventListener("click", () => {
  randomizePositions(drawingPoints)
  draw(drawingPoints)
})

randomizePosition(drawingPoints)
draw(drawingPoints)

function randomizePositions(points) {
  points.forEach(point => {
    point.x = getRandomInteger(0, 500)
    point.y = getRandomInteger(0, 500)
  })
}

function draw(points) {
  let context = background.getContext("2d")
  context.save()
  
  context.clearRect(0, 0, 500, 500)
  
  points.forEach(point => {
    context.fillRect(
      point.x, 
      point.y, 
      point.size, 
      point.size
    )
    context.strokeRect(
      point.x - 1, 
      point.y - 1, 
      point.size + 2, 
      point.size + 2
    )
    context.fillStyle = point.color
    context.fill()
  })
  
  context.restore()
}

</script>