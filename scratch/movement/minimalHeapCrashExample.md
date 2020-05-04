## Heap Crash!!!!

<canvas id="canvas"></canvas>


<script>
import { ReGL } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/Covid19-Kenya/npm-modules/regl-point-wrapper.js"
let divCanvas = lively.query(this, "#canvas")
var context = divCanvas.getContext("webgl") 
var regl = new ReGL(context)

let dummyPoints = []

for (var i = 0; i < 2700; i++) {
  dummyPoints.push({themes: ["a", "b", "c", "d", "u", "Dugehoerstdochmitdazu"]})
}

regl.regl.frame(({time}) => {
  if (!lively.isInBody(divCanvas)) return 
  drawPointsWithNewCoordinates(dummyPoints)
})
  

const drawPointsWithNewCoordinates = (points) => {
  
    points.forEach(point => {
      for (var i = 0; i < point.themes.length; i++) {
        
      }
      
    })
  
}


</script>