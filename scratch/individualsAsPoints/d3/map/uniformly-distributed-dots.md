<canvas id="drawing-canvas" width="500" height="500"></canvas>

<script>
import { UniqueColoredMap } from "../../../../prototypes/Covid19-Kenya/map-modules/mapCanvas.js"
import { Zoomer } from "../../../../prototypes/Covid19-Kenya/map-modules/zoomer.js"

import d3 from "src/external/d3.v5.js"

let width = 500, height = 500
let drawingCanvas = lively.query(this, "#drawing-canvas")
let context = drawingCanvas.getContext("2d")
let geoDataUrl = "/src/geodata/kenya.geojson"

let projection = d3.geoEquirectangular().center([37,0]).scale(2000).translate([width / 2, height / 2])
let path = d3.geoPath().projection(this.projection)

d3.json("https://lively-kernel.org/lively4/BP2019RH1" + geoDataUrl).then((result) => {
  //setup
  let geoData = result.features
  let districtToColor = createDistrictColorCoding(geoData)
  let map = new UniqueColoredMap(this, drawingCanvas, geoData, projection, {"locationLookupKey": "COUNTY_NAM", "districtToColor" : districtToColor})
  map.drawMap()
  
  // calculating
  let i = geoData.length
  let imageData = context.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
  while(i--){
    let population = 100
    let count = 0
    let gridDensity = 1
    let points = []
    while (count < population) {
      count = 0
      points = []
       
      let bounds = path.bounds(geoData[i])
      let area = path.area(geoData[i])
      let squareArea = area / population
      let edgeLength = Math.sqrt(squareArea) / gridDensity
      
      let x0 = bounds[0][0], y0 = bounds[0][1], width = bounds[1][0] - x0, height = bounds[1][1] - y0
      let x, y, r = parseInt((i + 1) / 256), g = (i + 1) % 256
      for (let j = bounds[0][1]; j < bounds[1][1]; j += edgeLength) {
        for (let i = bounds[0][0]; i < bounds[1][0]; i += edgeLength) {
          let projected = projection([i, j])
          if (testPixelColor(imageData, projected[0], projected[1], drawingCanvas.width, r, g)) {
            points.push([projected[0], projected[1]])
            count++
          }
        }
      }
      gridDensity += 0.001
    }
    console.log(points.length)
    draw(context, points.slice(0, population))
  }
  
})

function draw (context, data) {
  data.forEach(datum => {
    context.fillStyle = "rgba(255, 0, 0, 255)"
    context.fillRect(datum[0], datum[1], 1, 1)
  })
}

function testPixelColor(imageData,x,y,w,r,g){
  if (y < 0 || x < 0) {
    debugger
    return true
  }
  let index = (Math.round(x) + Math.round(y) * w) * 4
  return imageData.data[index] == r && imageData.data[index + 1] == g
}

function createDistrictColorCoding(geoData) {
  let districtToColor = {}
  let i = geoData.length
  while(i--){
    let r = parseInt((i + 1) / 256)
    let g = (i + 1) % 256
    districtToColor[geoData[i].properties.COUNTY_NAM] = "rgb(" + r + "," + g + ",0)"
  }
  return districtToColor
}

</script>