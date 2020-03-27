<div class="opinionTextField" id="currentElement"></div>
<div class="spacer"></div>
<div id="chartDiv"></div>

<style>

#chartDiv {
  position: relative;
  height: 200px;
  width: 500px;
  background-color: white;
}

.dataPoint {

}

.opinionTextField {
  height: 20px;
  background-color: white;
}

.spacer {
  height: 20px;
  width:20px;
  background-color: white;
}

</style>

<script>
import d3 from "src/external/d3.v5.js";

let data = [
  {"name": "Steve", "age": 25, "gender": "m", "theme": "water", "opinion": "a"}, 
  {"name": "Steve", "age": 22, "gender": "m", "theme": "disease", "opinion": "b"}, 
  {"name": "Steve", "age": 23, "gender": "m", "theme": "hygiene", "opinion": "c"}, 
  {"name": "Steve", "age": 25, "gender": "m", "theme": "hygiene", "opinion": "d"}, 
  {"name": "Steve", "age": 24, "gender": "m", "theme": "water", "opinion": "e"},
  {"name": "Steven", "age": 25, "gender": "f", "theme": "hygiene", "opinion": "f"}, 
  {"name": "Steven", "age": 25, "gender": "f", "theme": "disease", "opinion": "g"}, 
  {"name": "Steven", "age": 35, "gender": "f", "theme": "water", "opinion": "h"}, 
  {"name": "Steven", "age": 45, "gender": "f", "theme": "water", "opinion": "i"}, 
  {"name": "Steven", "age": 55, "gender": "f", "theme": "disease", "opinion": "j"}, 
  {"name": "Steven", "age": 65, "gender": "f", "theme": "hygiene", "opinion": "k"}, 
  {"name": "Steven", "age": 15, "gender": "f", "theme": "water", "opinion": "l"}, 
  {"name": "Steven", "age": 25, "gender": "f", "theme": "disease", "opinion": "m"}
];

//get the containers
let chartContainer = lively.query(this,"#chartDiv");
let currentElementContainer = lively.query(this, "#currentElement");

//get dimensions
let width = lively.getExtent(chartContainer).x;
let height = lively.getExtent(chartContainer).y;
let margin = {
  left: 9,
  right: 20,
  top: 20,
  bottom: 20,
};

//define a scale
let scaleX = d3.scaleBand()
  .domain(data.map((d) => d.theme))
  .range([0, width])
  .padding(0.1);

let scaleY = d3.scaleBand()
  .domain(data.map((d) => getIdFromDataPoint(d)))
  .range([height, 0])
  .padding(0.1);

//create the graph
let svg = d3.select(chartContainer)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
svg.selectAll(".bar")
  .data(data)
  .enter().append("g").append("rect")
    .attr("class", "dataPoint")
    .attr("id", (d) => getIdFromDataPoint(d))
    .attr("x", (d) => scaleX(d.theme))
    .attr("y", (d) => scaleY(getIdFromDataPoint(d)))
    .attr("height", scaleY.bandwidth())
    .attr("width", scaleX.bandwidth())
    .style("fill", (d) => getColorFromTheme(d.theme))
    .on("mouseover", function(d) {
      currentElementContainer.innerHTML = "Opinion of the current selected entry: " + d.opinion;
    })
    .on("mouseout", function(d) {
      currentElementContainer.innerHTML = "Opinion of the current selected entry: ";
    });
    
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class", "x-axis")
  .call(d3.axisBottom(scaleX));
  
svg.append("g")
  .attr("class", "y-axis")
  .call(d3.axisLeft(scaleY));

//---------------------//

function getIdFromDataPoint(dataPoint) {
  let id = dataPoint.name + "; " + dataPoint.age + "; " + dataPoint.gender + "; " + dataPoint.theme;
  debugger
  return id;
}

function getColorFromTheme(theme) {
  let color = "";
  switch(theme) {
    case "water":
      color = "#0000ff";
      break;
    case "disease":
      color = "#ff0000";
      break;
    case "hygiene":
      color = "#00ffff";
      break;
    default:
      color = "#000000";
      break;
  }
  return color;
}

</script>