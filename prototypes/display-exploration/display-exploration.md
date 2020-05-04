<style>
.canvas {
  width: 1650px;
  height: 900px;
  border: 1px solid black
}
</style>

<button id="help_button">Help</button>

<div class="canvas" id="diagram"></div>

<script>
import { Diagram } from "./diagram.js"

lively.query(this, "#help_button").addEventListener("click", () => lively.openBrowser(bp2019url + "/prototypes/display-exploration/exploring-help.md"))

let diagramDiv = lively.query(this, "#diagram")
let diagram = new Diagram(diagramDiv, 3)

""
</script>