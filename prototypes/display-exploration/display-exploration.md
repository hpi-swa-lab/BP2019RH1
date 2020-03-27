<style>

.canvas {
  width: 1280px;
  height: 720px;
  border: 1px solid black;
}

</style>

<div class="canvas" id="diagram"></div>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { Diagram } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/diagram.js"

let diagramDiv = lively.query(this, "#diagram")

AVFParser.loadCompressedIndividualsWithKeysFromFile().then(data => {
  let diagram = new Diagram(diagramDiv, 3, data)
})

""
</script>
