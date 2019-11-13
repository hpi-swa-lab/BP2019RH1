# Provenance Exploration with Raphael

<div id="canvas_container_table_provenance"></div> 
<div id="dataTable"></div>

<script>
import {LivelyTable} from "https://lively-kernel.org/lively4/lively4-core/src/components/widgets/lively-table.js" 
import Raphael from "https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.js"
let container = this.parentElement.querySelector("#canvas_container_table_provenance");

var tableProvenance = new Raphael(container , container.offsetWidth, container.offsetHeight);


var data = [
  ['a', 1],
  ['b', 2],
  ['c', 3],
  ['d', 0.5]
]

var visualization = {'a' : '', 'b' : '', 'c' : '', 'd' : ''}

var barChartOrigin = {
  'x' : 10,
  'y' : 350,
};
var table;

function visualizationDataToTableData(dataTable) {
  var tableData = [[],[]]
  for(var [key, value] of dataTable) {
    tableData[0].push(key)
    tableData[1].push(value)
  }
  return tableData
}

function tableDataToVisualizationData(tableData) {
  var dataTable = []
  for (var i = 0; i < tableData[0].length; i++) {
    dataTable.push([tableData[0][i], tableData[1][i]] )
  }
  return dataTable
  
}

function updateVisualization(table, visualization, barChartOrigin) {
  var dataTable = tableDataToVisualizationData(table)
  for (var [key, value] of dataTable) {
    visualization[key].attr('height', value*100)
    visualization[key].attr('y', barChartOrigin.y - value*100)
  }
}

function highlightBar(bar) {
  bar.attr("fill", "green")
}

function unhighlightBar(bar) {
  bar.attr("fill", "white")
}

function highlightDataSet(key, value) {
  highlightBar(visualization[key])
  
}

/*function highlightCell(cell) {
  use table.cellAt(row, column)
}*/



(async () => {
  table = await lively.create("lively-table")
  table.setFromArrayClean(visualizationDataToTableData(data))
  for (let ea of table.querySelectorAll("td")) {
    // use textContent to access cell content
    debugger
    ea.addEventListener("mouseover", () => {
      ea.style.backgroundColor = "red"
      // highlightBar(visualization[])
      highlightDataSet(data[0][ea.cellIndex], ea.textContent)
      
    })
    ea.addEventListener("mouseout", () => {
      ea.style.backgroundColor = "white"
    })
  }  
  
  var div = lively.query(this, '#dataTable')
  div.appendChild(table)
  var count = 1
    for (var [key, value] of tableDataToVisualizationData(table.asArray())) {
      visualization[key] = tableProvenance.rect(count + barChartOrigin.x, barChartOrigin.y - value*100, 100, value*100).attr({fill: "white"})
      visualization[key].mouseover(function(event) {highlightBar(this)})
      visualization[key].mouseout(function(event) {unhighlightBar(this)})
      visualization[key].mousedown(function(event) {data[0]=['a',1];})
      visualization[key].mouseup(function(event) {data[0]=['a',2];})
      tableProvenance.text(count + barChartOrigin.x + 50, barChartOrigin.y + 20, key)
      count += 100
    }
    // MutationObserver
    while (true) {
      updateVisualization(table.asArray(), visualization, barChartOrigin)
    await lively.sleep(1000)
  }
})();
' '

</script>

<style>
#canvas_container_table_provenance {
  width: 100%;
  height: 500px;
}
</style>
