<div id="canvas_container_table_provenance"></div> 
<div id="dataTable"></div>

<script>
import {LivelyTable} from "https://lively-kernel.org/lively4/lively4-core/src/components/widgets/lively-table.js" 
import Raphael from "https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.js"

let container = this.parentElement.querySelector("#canvas_container_table_provenance");

var tableProvenance = new Raphael(container, container.offsetWidth, container.offsetHeight);

var tableHeader = [['letter', 'number']]
var data = [
  ['a', 1],
  ['b', 2],
  ['c', 3],
  ['d', 50],
  ['e', 7],
  ['f', 1],
  ['g', 2],
  ['h', 3],
  ['i', 50],
  ['j', 7],
]

var scale
var barWidth

var barChartOrigin = {
  'x' : 0,
  'y' : lively.getExtent(container).y,
};

var scopeStart = 0
var scopeEnd = 0

let table

function maxOfArray(array) {
  var max = Number.NEGATIVE_INFINITY
  for (var element of array) {
  element = parseInt(element)
    if (element > max) {max = element}
  }
  return max
}

function highlightDataPoint(tableRow, visualizationBar) {
  visualizationBar.attr("fill", "green")
  tableRow.style.background = "red"
}

function unhighlightDataPoint(tableRow, visualizationBar) {
  visualizationBar.attr("fill", "white")
  tableRow.style.background = "white"
}

function updateScale() {
  var column = []
  for (var i = 1; i < table.asArray().length; i++) {
    let row = table.asArray()[i]
    column.push(row[1])
  }
  var maxValue = maxOfArray(column)
  scale = lively.getExtent(container).y / maxValue
}

function updateBarWidth() {
  barWidth = lively.getExtent(container).x / (table.asArray().length - 1)
}

function adaptingVisualizationToScale(visualization) {
  updateScale()
  for (let i = 1; i < table.asArray().length; i++) {
    let tableRow = table.rows()[i]
    let visualizationElement = visualization[i-1]
    let value = parseInt(tableRow.lastChild.textContent)
    visualizationElement.attr('height', value*scale)
    visualizationElement.attr('y', barChartOrigin.y - value*scale)
  }
}

function adaptingVisualizationToScope(visualization) {
  updateBarWidth()
  for (let i = 0; i < table.asArray().length - 1; i++) {
    if (scopeStart > i || scopeEnd < i) {
      visualization[i].hide()
    } 
  }
}

function link(table, visualization) {
  for (let i = 1; i < table.asArray().length; i++) {
    let tableRow = table.rows()[i]
    let visualizationElement = visualization[i-1]
    
    tableRow.addEventListener("mouseover", () => {highlightDataPoint(tableRow, visualizationElement)})
    tableRow.addEventListener("mouseout", () => {unhighlightDataPoint(tableRow, visualizationElement)})
    visualizationElement.mouseover(function(event) {highlightDataPoint(tableRow, visualizationElement)})
    visualizationElement.mouseout(function(event) {unhighlightDataPoint(tableRow, visualizationElement)})
    
    tableRow.lastChild.onkeydown = (event) => {
      if (event.keyCode == 13)  { //Enter
        adaptingVisualizationToScale(visualization)
      }
    }
    // MutationObserver might also be helpful for this
  }
}

function calculateScopeStart(mouseX) {
  scopeStart = Math.round(mouseX / barWidth)
  if (scopeStart < 0) {
    scopeStart = 0
  }
}

function calculateScopeEnd(mouseX) {
  scopeEnd = Math.round(mouseX / barWidth)
  if (scopeEnd > table.asArray().length - 1) {
    scopeEnd = table.asArray().length - 1
  }
}

function checkScopeOrder() {
  if (scopeStart > scopeEnd) {
    let tmp = scopeStart
    scopeStart = scopeEnd
    scopeEnd = tmp
  }
}

(async () => {
  table = await lively.create("lively-table")
  table.setFromArrayClean(tableHeader.concat(data))
  var div = lively.query(this, '#dataTable')
  div.appendChild(table)
  
  updateScale()
  updateBarWidth()
  
  var visualization = []
  var barXCoordinate = 0
  var skipTableHeader = true
  for (var [key, value] of table.asArray()) {
    if (skipTableHeader) {
      skipTableHeader = false
      continue
    }
    visualization.push(tableProvenance.rect(
      barXCoordinate + barChartOrigin.x, 
      barChartOrigin.y - value*scale, 
      barWidth, 
      value*scale
    ).attr({fill: "white"}))
    // tableProvenance.text(barXCoordinate + barChartOrigin.x + 50, barChartOrigin.y + 20, key)
    barXCoordinate += barWidth
  }
  link(table, visualization)
  container.addEventListener("mousedown", function(event) {calculateScopeStart(event.layerX)})
  container.addEventListener("mouseup", function(event) {calculateScopeEnd(event.layerX); checkScopeOrder(); adaptingVisualizationToScope(visualization); lively.notify(scopeStart, scopeEnd)})
  container.addEventListener("dblclick", function(event) {scopeStart = 0; scopeEnd = table.asArray().length - 1; adaptingVisualizationToScope(visualization)})
})();
' '

</script>

<style>
#canvas_container_table_provenance {
  width: 100%;
  height: 500px;
  margin-bottom: 10px; 
}
</style>