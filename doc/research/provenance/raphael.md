# Provenance Exploration with Raphael

ToDo:
- [x] Skala
- [ ] highlight on Focus
- [ ] dragging of bars

<div id="canvas_container_table_provenance"></div> 
<div id="dataTable"></div>

<script>
import {LivelyTable} from "https://lively-kernel.org/lively4/lively4-core/src/components/widgets/lively-table.js" 
import Raphael from "https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.js"

let container = this.parentElement.querySelector("#canvas_container_table_provenance");

var tableProvenance = new Raphael(container , container.offsetWidth, container.offsetHeight);

var tableHeader = [['letter', 'number']]
var data = [
  ['a', 1],
  ['b', 2],
  ['c', 3],
  ['d', 50]
]

var scale = 100
var barWidth = 100

var barChartOrigin = {
  'x' : 0,
  'y' : lively.getExtent(container).y,
};

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

function rerenderVisualization(visualization) {
  updateScale()
  for (let i = 1; i < table.asArray().length; i++) {
    let tableRow = table.rows()[i]
    let visualizationElement = visualization[i-1]
    let value = parseInt(tableRow.lastChild.textContent)
    visualizationElement.attr('height', value*scale)
    visualizationElement.attr('y', barChartOrigin.y - value*scale)
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
        rerenderVisualization(visualization)
      }
    }
    // MutationObserver might also be helpful for this
  }
}

(async () => {
  table = await lively.create("lively-table")
  table.setFromArrayClean(tableHeader.concat(data))
  var div = lively.query(this, '#dataTable')
  div.appendChild(table)
  
  updateScale()
  
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
