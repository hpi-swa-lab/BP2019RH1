<style>
.canvas {
  width: 1650px;
  height: 900px;
  border: 1px solid black
}
</style>

<div class="canvas" id="diagram"></div>

<script>
import { Diagram } from "../display-exploration/diagram.js"

let diagramDiv = lively.query(this, "#diagram")

let diagram = new Diagram(diagramDiv, 3)

""
</script>
