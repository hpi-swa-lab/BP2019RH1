<style>
#wrapper {
  width: 1700px;
  height: 720px;
}
.canvas {
  width: 1280px;
  height: 720px;
  border: 1px solid black;
}
.controlPanel {
  width: 400px;
  height: 720px;
  border: 1px solid black;
  overflow: hidden;
}
.left {
  float: left
}
.right {
  float: right
}
.svg-plot, .canvas-plot {
    position: absolute;
}
</style>

<button id="help_button">Help</button>

<div id="wrapper">
  <div class="left canvas" id="canvas"></div>
  <div class="right controlPanel">
    X-Axis: <select id="x_axis_grouping_select"></select><br>
    Y-Axis: <select id="y_axis_grouping_select"></select><br>
    scale mode for amount: <select id="scale_mode_select"></select>
    <button id="axes_grouping_button">Group</button><br>
    Color: <select id="color_select"></select>
    <button id="color_button">Change color</button><br>
    <lively-inspector id="inspector"></lively-inspector>
  </div>
</div>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { Diagram } from "./diagram.js"

let world = this

let diagram = {}

let div = lively.query(world, "#canvas")
let inspector = lively.query(world, "#inspector")

lively.query(world, "#help_button").addEventListener("click", () => lively.openBrowser(bp2019url + "/prototypes/activate-y-axis/y-axis-help.md"))

AVFParser.loadCompressedIndividualsWithKeysFromFile().then(data => {
  diagram = new Diagram(div, inspector, data, 4, 2000)
    
  let groupingAttributes = ["random", "amount", "age", "district", "gender"]
  let colorAttributes = ["index", "age", "district", "gender"]
  let scaleModes = ["maximum amount", "total amount"]

  let xAxisSelect = lively.query(this, "#x_axis_grouping_select")
  let yAxisSelect = lively.query(this, "#y_axis_grouping_select")
  let colorSelect = lively.query(this, "#color_select")
  let scaleModeSelect = lively.query(this, "#scale_mode_select")

  groupingAttributes.forEach((attribute) => {
    xAxisSelect.options[xAxisSelect.options.length] = new Option(attribute)
    yAxisSelect.options[yAxisSelect.options.length] = new Option(attribute)
  })

  colorAttributes.forEach((attribute) => {
    colorSelect.options[colorSelect.options.length] = new Option(attribute)
  })

  scaleModes.forEach(mode => {
    scaleModeSelect.options[scaleModeSelect.options.length] = new Option(mode)
  })

  lively.query(this, "#axes_grouping_button").addEventListener("click", () => {
    let yAxisAttribute = yAxisSelect.options[yAxisSelect.selectedIndex].value
    let xAxisAttribute = xAxisSelect.options[xAxisSelect.selectedIndex].value
    
    if (xAxisAttribute === "amount") {
      if (yAxisAttribute === "random" || yAxisAttribute === "amount") {
        return
      }
      diagram.setNewAttributeToAxis("y", yAxisAttribute)
      diagram.setNewAttributeToAxis("x", xAxisAttribute, scaleModeSelect.options[scaleModeSelect.selectedIndex].value)
    } else if (yAxisAttribute === "amount") {
      if (xAxisAttribute === "random" || xAxisAttribute === "amount") {
        return
      }
      diagram.setNewAttributeToAxis("x", xAxisAttribute)
      diagram.setNewAttributeToAxis("y", yAxisAttribute, scaleModeSelect.options[scaleModeSelect.selectedIndex].value)
    } else {
      diagram.setNewAttributeToAxis("x", xAxisAttribute)
      diagram.setNewAttributeToAxis("y", yAxisAttribute)
    }
    
    diagram.animate()
  })

  lively.query(this, "#color_button").addEventListener("click", () => {
    diagram.setColorByAttribute(colorSelect.options[colorSelect.selectedIndex].value)
  })

  diagram.div.addEventListener("click", (event) => {highlightClickedIndividual(event)})
  
})

function highlightClickedIndividual(event) {
  let individual = diagram.getClickedIndividual(event)
  if ((typeof individual) === "undefined") {
    diagram.resetHighlighting()
  } else {
    diagram.highlightIndividual(individual)
  }
}

""
</script>