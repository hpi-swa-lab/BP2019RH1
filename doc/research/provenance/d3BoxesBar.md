<style>
  svg {
    font: 10px sans-serif;
    shape-rendering: crispEdges;
  }
  
  .tooltiptext {
  visibility: visible;
  width: 180px;
  background-color: black;
  color: #F6F7F6;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  display:block;

  /* Position the tooltip */
  position: relative;
  top: -25px;
  left: 30px;
  z-index: -5;
  
  /* Style the tooltip */
  font-size: 12px;
  
}

</style>

<select>
  <option value="gender">Gender</option>
  <option value="idpStatus">idpStatus</option>
</select>

<div class="d3content">
</div>

<script>
import d3 from "src/external/d3.v5.js";

var margin = {"left": 50, "right": 10, "top": 50, "bottom": 50}

var width = 800 - margin.left - margin.right,
    height = 700 - margin.bottom - margin.top,
    blockSizeMargin = 5,
    blocksPerRow = 2;
    
let filter = "idpStatus"
    
var dataOrigin = [
  {"name": "Steve", "age": 25, "gender": "m", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steve", "age": 22, "gender": "m", "idpStatus": "0", "theme": "disease"}, 
  {"name": "Steve", "age": 23, "gender": "m", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steve", "age": 25, "gender": "m", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steve", "age": 24, "gender": "m", "idpStatus": "0", "theme": "water"},
  {"name": "Steven", "age": 25, "gender": "f", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steven", "age": 25, "gender": "f", "idpStatus": "0", "theme": "disease"}, 
  {"name": "Steven", "age": 35, "gender": "f", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steven", "age": 45, "gender": "f", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steven", "age": 55, "gender": "f", "idpStatus": "1", "theme": "disease"}, 
  {"name": "Steven", "age": 65, "gender": "f", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steven", "age": 15, "gender": "f", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steven", "age": 25, "gender": "f", "idpStatus": "0", "theme": "disease"}
];


var data = [
  [
  {"name": "Steve", "age": 25, "gender": "m", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steve", "age": 22, "gender": "m", "idpStatus": "0", "theme": "disease"}, 
  {"name": "Steve", "age": 23, "gender": "m", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steve", "age": 25, "gender": "m", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steve", "age": 24, "gender": "m", "idpStatus": "0", "theme": "water"},
  ],
  [
  {"name": "Steven", "age": 25, "gender": "f", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steven", "age": 25, "gender": "f", "idpStatus": "0", "theme": "disease"}, 
  {"name": "Steven", "age": 35, "gender": "f", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steven", "age": 45, "gender": "f", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steven", "age": 55, "gender": "f", "idpStatus": "0", "theme": "disease"}, 
  {"name": "Steven", "age": 65, "gender": "f", "idpStatus": "0", "theme": "hygiene"}, 
  {"name": "Steven", "age": 15, "gender": "f", "idpStatus": "0", "theme": "water"}, 
  {"name": "Steven", "age": 25, "gender": "f", "idpStatus": "0", "theme": "disease"}
  ],
];

let dataThemeKeys = [...new Set(dataOrigin.map(v => v.theme))]
let dataFilterKeys = [...new Set(dataOrigin.map(v => v[filter]))]

let dataMapped = [dataFilterKeys.length]

for (let i = 0; i < dataFilterKeys.length; i++) {
  dataMapped[i] = dataOrigin.filter(item => item[filter] == dataFilterKeys[i])
}

console.log(dataMapped)

var maxLengthData = d3.max(dataMapped, function(d) { return d.length; });
var blockSize = height / maxLengthData * blocksPerRow  - 2 * blockSizeMargin;

var y = d3.scaleLinear()
          .domain([Math.ceil(maxLengthData / blocksPerRow), 0])
          .rangeRound([0, (blockSize + blockSizeMargin) * maxLengthData / blocksPerRow]);
          
var x = d3.scaleBand()
          .domain(dataFilterKeys)
          .range([0, (blockSize + 4*blockSizeMargin) * dataMapped.length * blocksPerRow])
          .padding(0.1);
          
var xInside = d3.scaleLinear()
          .domain([0, blocksPerRow - 1])
          .range([0, x.bandwidth()/2 + blockSizeMargin]);
          
var colour = d3.scaleOrdinal()
              .domain(dataThemeKeys)
              .range(d3.schemeDark2)


var svg = d3.select(lively.query(this,'.d3content'))
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
      "translate(" + margin.left + "," + margin.top + ")")
      
var svgColourLegend = d3.select(lively.query(this, '.d3content'))
  .append("svg")
    .attr("id", "legend-svg")

svg.selectAll("g").data(dataMapped)
  .enter()
    .append("g")
    .attr("class", "bar");

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x-axis")
    .call(d3.axisBottom(x));
    
svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

svg.selectAll(".bar").selectAll("rect").data(function(d) { return d; })
  .enter()
      .append("rect")
      .attr("width", blockSize)
      .attr("height", blockSize)
      .attr("x", function(d, i) {
        return x(d[filter]) + xInside(i % blocksPerRow);
      })
      .attr("y", function(d, i) {
        if (i % 2 == 0) {
          return y(i / 2 +1);
        } else {
          return y(Math.floor(i / 2) + 1);
        } 
      })
      .style("fill", function(d) {
        return colour(d.theme);
      })
      .style("padding", "1px")
      .on("mouseover", function(d) {
        svg.append("text")
          .attr("x", d3.mouse(this)[0])
          .attr("y", d3.mouse(this)[1])
          .attr("class", d.name + "info")
          .style("fill", "red")
          .style("font-size", "20px")
          .text("name: " + d.name)
      })
      .on("mouseout", function(d) {
        svg.selectAll("." + d.name + "info").remove()
      })


      
// Colour legend
var size = 20
svgColourLegend.selectAll("legend")
  .data(dataThemeKeys)
  .enter()
  .append("rect")
    .attr("x", 10)
    .attr("y", function(d,i) { return 0 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d) { console.log(d); return colour(d)})

// Add one dot in the legend for each name.
svgColourLegend.selectAll("legend")
  .data(dataThemeKeys)
  .enter()
  .append("text")
    .attr("x", 10 + size*1.2)
    .attr("y", function(d,i){ return 0 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d) { return colour(d)})
    .text(function(d){ return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

</script>