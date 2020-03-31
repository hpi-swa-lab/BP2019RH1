<style>

.canvas {
  width: 1920px;
  height: 1080px;
  border: 1px solid black;
}

</style>

<div class="canvas" id="diagram"></div>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { Diagram } from "../display-exploration/diagram.js"

let diagramDiv = lively.query(this, "#diagram")

AVFParser.loadCovidData().then(data => {
  debugger;
  AVFParser.getCoronaColorMap().then(colorMap => {
    prepareData(data)
    let diagram = new Diagram(diagramDiv, 3, data, colorMap)
  })
})

function prepareData(data) {
  let arrayAttributes = ["themes", "languages"]
  
  data.forEach(element => {
    element["themes"] = element["themes"]["L3"]
    
    arrayAttributes.forEach(attribute => {
      if (element[attribute] === "missing") {
        element[attribute] = ["missing"]
      }
      element[attribute].sort()
    })
  })
}

""
</script>
