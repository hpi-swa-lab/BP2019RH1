# D3JS Provenance


<table id="table">

<tr><td>Country</td><td>Data Point</td></tr>

</table>

<div id="chartDiv">

</div>


<style> /* set the CSS */

.barHighlighted { fill: lightgreen; }
.barNotHighlighted { fill: blue; }

.detailedBarNotHighlighted { fill: red; }

.highlightedTableCell {
  background: lightgreen;
}

.disHighlightedTableCell {
  background: transparent;
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

.innerRect {
  background: black;
  width: 10px;
  height: 10px;
}
</style>

<script>
import d3 from "src/external/d3.v5.js";

var data =  [
  {
    "name":"Germany",
    "population": 345,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Spain",
    "population": 200,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Plauen",
    "population": 1000,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Egenhausen",
    "population": 40,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"USA",
    "population": 568,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Earth",
    "population": 122,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Mars",
    "population": 321,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Sun",
    "population": 10,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
  {
    "name":"Andromeda",
    "population": 950,
    "detailed": [
      {
        "name":"bayern",
        "population": 120
      },
      {
        "name":"berlin",
        "population": 120
      },
      {
        "name":"sachsen",
        "population": 105
      }
    ]
  },
]


var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = 860 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var world = this;

var scopeStart = 0
var scopeEnd = 0

// set the ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(lively.query(this,'#chartDiv'))
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");



// format the data
data.forEach(function(d) {
  d.population = parseInt(d.population);
});

// Scale the range of the data in the domains
x.domain(data.map(function(d) { return d.name; }));
y.domain([0, d3.max(data, function(d) { return d.population; })]);

// append the rectangles for the bar chart



svg.selectAll(".bar")
    .data(data)
  .enter().append("g").append("rect")
    .attr("class", "barNotHighlighted")
    .attr("id", function(d) { return getBarIdFromCountryName(d.name) })
    .attr("x", function(d) { return x(d.name); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.population); })
    .attr("height", function(d) { return height - y(d.population); })
    .on('mouseover', function(d) {
      highlightTableRow(d.name);
      highlightBar(d.name);
    })
    .on('mouseout', function(d) {
      lowlightTableRow(d.name);
      lowlightBar(d.name);
    })
    .on('mousedown', function(d) {
      calculateScopeStart(d.name);
      lively.notify("start: " + scopeStart);
    })
    .on('mouseup', function(d) {
      debugger;
      calculateScopeEnd(d.name); 
      checkScopeOrder(); 
      lively.notify("end: " + scopeEnd);
      lively.notify(getBarIdFromCountryName(d.name))
    });

// add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x-axis")
    .call(d3.axisBottom(x));

// add the y Axis
svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
    

// generate table with data 

var tableHTML = lively.query(this, "#table");
//var hoverTableHoverSound = new sound('https://lively-kernel.org/lively4/BP2019RH1/doc/research-provenance/data/cartoon_cowbell.mp3');
//var barHoverSound = new sound('https://lively-kernel.org/lively4/BP2019RH1/doc/research-provenance/data/bugle_tune_1.mp3');


generateTableFromData(tableHTML, data);

function generateTableFromData(tableHTML, tableData) {

  tableData.forEach((country)=>{
    let rowHTML = document.createElement("tr");

    let countryNameHTML = document.createElement("td");

    countryNameHTML.id = country.name;
    countryNameHTML.appendChild(document.createTextNode(country.name));

    let countryDataHTML = document.createElement("td");
    countryDataHTML.id = getDataCellIdFromCountryName(country.name);
    countryDataHTML.appendChild(document.createTextNode(country.population));

    rowHTML.appendChild(countryNameHTML);
    rowHTML.appendChild(countryDataHTML);

    tableHTML.appendChild(rowHTML);

    rowHTML.onmouseover = function(){
      highlightBar(country.name);
      highlightTableRow(country.name);
    };

    rowHTML.onmouseout = function(){
      lowlightBar(country.name);
      lowlightTableRow(country.name);
    };

  });
}

function calculateScopeEnd(barIdentifier) {
  var scopeEnd = getBarIdFromCountryName(barIdentifier)
}

function checkScopeOrder() {
  if (scopeStart > scopeEnd) {
    let tmp = scopeStart
    scopeStart = scopeEnd
    scopeEnd = tmp
  }
}

function calculateScopeStart(barIdentifier) {
  var scopeStart = getBarIdFromCountryName(barIdentifier)
}

function highlightBar(barIdentifier) {
  let bar = lively.query(world, "#" + getBarIdFromCountryName(barIdentifier));
  bar.classList.remove('barNotHighlighted');
  bar.classList.add('barHighlighted');
  
}

function highlightTableRow(tableRowIdentifier) {
  highlightCell("#" + tableRowIdentifier);
  highlightCell("#" + getDataCellIdFromCountryName(tableRowIdentifier));
}

function highlightCell(tableCellId){
  let cell = lively.query(world, tableCellId);
  cell.classList.remove('disHighlightedTableCell');
  cell.classList.add('highlightedTableCell');
  
}

function lowlightBar(barIdentifier){
  let bar = lively.query(world, "#" + getBarIdFromCountryName(barIdentifier));
  bar.classList.remove('barHighlighted');
  bar.classList.add('barNotHighlighted');
}

function lowlightTableRow(tableRowIdentifier){
  lowlightTableCell("#" + tableRowIdentifier);
  lowlightTableCell("#" + getDataCellIdFromCountryName(tableRowIdentifier));
}

function lowlightTableCell(tableCellId){
  let cell = lively.query(world, tableCellId);
  cell.classList.remove('highlightedTableCell');
  cell.classList.add('disHighlightedTableCell');
}

function getBarIdFromCountryName(countryName){
  return countryName + "Bar";
}

function getDataCellIdFromCountryName(countryName){
  return countryName + "Data";
}


""
</script>