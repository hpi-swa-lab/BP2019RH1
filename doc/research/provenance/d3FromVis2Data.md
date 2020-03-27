 # D3JS Provenance


<div id="dataTable"></div>

<tr><td>Country</td><td>Data Point</td></tr>

</table>

<div id="chartDiv">

</div>

#### TO-DO
- [ ] Constraints? (z.B. die Gesamtsumme aller Einwohner bleibt gleich)


<style> /* set the CSS */

.highlightedTableCell {
  background: lightgreen;
}

.disHighlightedTableCell {
  background: transparent;
}

.selection {
  fill: lightblue;
  fill-opacity: 1;
}

.selection.brush {
  background: lightgreen;
}

.selection.barHighlighted { fill: lightgreen; }
.selection.barNotHighlighted { fill: lightblue; }

.body {
  width: 80%;
  margin:auto;
}


table {
  border-collapse: collapse;
}

table, th, td {
  border: 1px solid black;
  padding: 15px;
}

tr:first-child {
  background: pink;
}
</style>

<script>
import d3 from "src/external/d3.v5.js";

// get the data

var data =  [
  {
    "name":"Germany",
    "population": 345
  },
  {
    "name":"Spain",
    "population": 200
  },
  {
    "name":"Plauen",
    "population": 1000
  },
  {
    "name":"Egenhausen",
    "population": 40
  },
  {
    "name":"USA",
    "population": 568
  },
  {
    "name":"Earth",
    "population": 122
  },
  {
    "name":"Mars",
    "population": 321
  },
  {
    "name":"Sun",
    "population": 10
  },
  {
    "name":"Andromeda",
    "population": 950
  }
]

var margin = {top: 50, right: 30, bottom: 30, left: 50};
var width = 860 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var world = this;
var delim = 8;

// format the data
data.forEach(function(d) {
  d.population = parseInt(d.population);
});



// set the ranges
var x = d3.scaleLinear()
          .domain([0, data.length])
          .rangeRound([0, width])
          
var y = d3.scaleLinear()
          .domain([d3.max(data, function(d) { return d.population; }), 0])
          .rangeRound([30, height]);
          
var xScale = d3.scaleBand()
          .domain(data.map(function(d) { return d.name; }))
          .range([0, width])
          .padding(0.1);
          
          

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(lively.query(this,'#chartDiv'))
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append('g')
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

// add the y Axis
svg.append("g")
    .attr("class", "axisLeft")
    .call(d3.axisLeft(y));

// Moveable barChart
var brushY = d3.brushY()
  .extent(function (d, i) {
       return [[x(i)+ delim/2, 0], 
              [x(i) + x(1) - delim/2, 2*height]];})
  .on("brush", brushmoveY)
  .on("end", brushendY);
  

var svgbrushY = svg
  .selectAll('.brush')
    .data(data)
  .enter()
    .append("g")
      .attr("class", "brush")
      .attr("class", "barNotHighlighted")
      .attr("id", function(d) { return d.name + 'Bar' })
      .call(brushY)
      .call(brushY.move, function (d){return [d.population, 0].map(y);})

svgbrushY
  .select(".selection")
    .on('mouseover', function(d) {
      console.log(this)
      highlightBarAndTableCells(this, d);
    })
    .on('mouseout', function(d) {
      console.log(this)
      dishighlightBarAndTableCells(this, d);
    })
    
          
    
svgbrushY
  .append('text')
    .attr('y', function (d){ return y(d.population) - 10;})
    .attr('x', function (d, i){return x(i) + x(0.5);})
    .attr('dx', '-.60em')
    .attr('dy', -5)
    .style('fill', 'black')
    .text(function (d) { return (d.population);})



function brushendY(){
    if (!d3.event.sourceEvent) return;
    if (d3.event.sourceEvent.type === "brush") return; 
    if (!d3.event.selection) { // just in case of click with no move
      svgbrushY
        .call(brushY.move, function (d){
          return [d.population, 0].map(y);})
    };
    
}

function brushmoveY() { 
    if (!d3.event.sourceEvent) return; 
    if (d3.event.sourceEvent.type === "brush") return;
    if (!d3.event.selection) return; 
    
    
    var d0 = d3.event.selection.map(y.invert);
    var d = d3.select(this).select('.selection');

    d.datum().population = parseInt(d0[0]); // Change the value of the original data
    
    let countryData = d.datum();
    // get correct table entry
    let tableEntry = lively.query(this, "td#" + countryData.name + "Data");
    tableEntry.textContent = countryData.population;
    // update

    update();
}


// generate table with data
(async () => {
  let table = await lively.create("lively-table");
  table.setFromArrayClean(visualizationDataToTableData(data)); 
  let tableContainer = lively.query(this, '#dataTable');
  tableContainer.appendChild(table);
  let th = lively.query(this, 'th')
  
  for (let row of table.querySelectorAll("tr")) {
    
    if (row.contains(th)) { continue; }
    
    let countryName = row.firstChild.textContent;
    row.firstChild.id = countryName;
    row.lastChild.id = countryName + "Data";
    
    row.lastChild.onkeydown = (event) => {
      if (event.keyCode == 13)  { //Enter
        let gPlaceholder = lively.query(world, '#' + countryName + 'Bar');
        let bar = d3.select(lively.query(gPlaceholder, 'rect.selection'))
        
        data.forEach((element) => {
          if (element.name == countryName) {
            element.population = parseInt(row.lastChild.textContent);
            bar.datum().population = element.population;
            update();
          }
        });
      }
    }
    
    row.onmouseover = function(){
      let gPlaceholder = lively.query(world, '#' + countryName + 'Bar');
      let bar = lively.query(gPlaceholder, 'rect.selection')
      bar.classList.remove('barNotHighlighted');
      bar.classList.add('barHighlighted');
      this.classList.remove('disHighlightedTableCell');
      this.classList.add('highlightedTableCell');
    };

    row.onmouseout = function(){
      let gPlaceholder = lively.query(world, '#' + countryName + 'Bar');
      let bar = lively.query(gPlaceholder, 'rect.selection')
      bar.classList.remove('barHighlighted');
      bar.classList.add('barNotHighlighted');
      this.classList.add('#' + countryName + 'Data');
      this.classList.remove('highlightedTableCell');
      this.classList.add('disHighlightedTableCell');
    };
  }
})();


function visualizationDataToTableData(data) {
  let tableData = [];
  tableData.push(["Name", "Population"]);
  for (let element of data) {
    tableData.push([element.name, element.population]);
  }
  return tableData
}

function highlightBarAndTableCells(barElement, d) {
      let nameCell = lively.query(world, '#' + d.name);
      let dataCell = lively.query(world, '#' + d.name + 'Data');
      nameCell.classList.add('highlightedTableCell');
      nameCell.classList.remove('disHighlightedTableCell');
      dataCell.classList.remove('disHighlightedTableCell');
      dataCell.classList.add('highlightedTableCell');
      barElement.classList.remove('barNotHighlighted');
      barElement.classList.add('barHighlighted');
}

function dishighlightBarAndTableCells(barElement, d) {
      let nameCell = lively.query(world, '#' + d.name);
      let dataCell = lively.query(world, '#' + d.name + 'Data');
      nameCell.classList.remove('highlightedTableCell');
      nameCell.classList.add('disHighlightedTableCell');
      dataCell.classList.remove('highlightedTableCell');
      dataCell.classList.add('disHighlightedTableCell');
      barElement.classList.remove('barHighlighted');
      barElement.classList.add('barNotHighlighted');
}

function update() {
    if (d3.max(data, function(d) { return d.population; }) > y.domain().max()) {
      
    }
    
    y = d3.scaleLinear()
          .domain([d3.max(data, function(d) { return d.population; }), 0])
          .rangeRound([30, height]);
      
      svg.select(".axisLeft").remove()
      
      svg.append("g")
        .attr("class", "axisLeft")
        .call(d3.axisLeft(y));

    
    svgbrushY
      .call(brushY.move, function (d){
        return [d.population, 0].map(y);})
      .selectAll('text')
        .attr('y', function (d){return y(d.population)-10;})
        .text(function (d) {return d.population;});
}



""
</script>