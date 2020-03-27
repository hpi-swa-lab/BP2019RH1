<div style="padding-top: 10px; margin-left: 10px; padding-left: 20px;" id="chartContainer"></div>

<style>
.detailedBar {
  fill: #5bf5ac;
  stroke-width:3;

}

.bar {
  fill: #3575ff;

}



</style>

<script>
import d3 from "src/external/d3.v5.js";

var world = this;

var data = [
{
  "name": "andromeda",
  "population": 400,
  "detailed": [
    {
      "name":"kyrill",
      "population": 150
    },
    {
      "name":"herax",
      "population": 160
    },
    {
      "name":"doom",
      "population": 90
    }
  ]
},
{
  "name": "milkyway",
  "population": 100,
  "detailed": [
    {
      "name":"earth",
      "population": 40
    },
    {
      "name":"mars",
      "population": 50
    },
    {
      "name":"sun",
      "population": 10
    }
  ]
}
]

// format the data
data.forEach(function(d) {
  d.population = parseInt(d.population);
});

// --------------------------
// DEFINE DIMENSIONS
// --------------------------

var margin = {top: 30, right: 20, bottom: 30, left: 50};
var width = 860 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;

// -------------------------
// CREATE SVG
// -------------------------

var svg = d3.select(lively.query(this,'#chartContainer'))
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.bottom + margin.top)
              .append("g")
                .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")")

// -------------------------
// PLOT AXIS
// -------------------------          
          
svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + xAxisYPosition() + ")")
svg.append("g")
    .attr("class", "y-axis")

// ------------------------
// INITIAL PLOT
// ------------------------

showBasicData();

// ------------------------
// FUNCTIONS
// ------------------------

function showDetailedData(countryName, population, oldX){
  
  let detailedData = getDetailedDataFromCountryName(countryName);
  
  var detailedX = d3.scaleBand()
  .range([0, width])
  .padding(0.1)
  .domain(detailedData.map(d => { return d.name }));
  
  var detailedY = d3.scaleLinear()
  .range([xAxisYPosition(), 0])
  .domain([0, population]);
  
  
  var detailedxAxis = d3.axisBottom(detailedX);
  var detailedyAxis = d3.axisLeft(detailedY);
  
  svg.selectAll("g .y-axis")
      .transition()
      .duration(750)
      .call(detailedyAxis)

  svg.selectAll("g .x-axis")
      .transition()
      .duration(750)
      .call(detailedxAxis);
  
  let bars = svg.selectAll(".barNotClicked")
        .data(detailedData, d => { return d.name })
  
  let clickedBar = svg.selectAll(".barClicked")
  clickedBar.transition()
    .duration(750)
    .attr("x", 10)
    .attr("y", 0)
    .attr("width", width - 20)
    .attr("height", xAxisYPosition())
  
  bars.enter()
        .append("rect")
          .merge(bars)
          .attr("id", d => { return d.name})
          .attr("class", "detailedBar")
          .attr("x", function(d) { return detailedX(d.name); })
          .attr("width", detailedX.bandwidth())
          .attr("y", xAxisYPosition())
          .attr("height", 0 )
          .on("click", d => {
              showBasicData();
              })
          .transition()
                .duration(750)
                .delay(function (d, i) {
                    return i * 150;
                })
                .attr("height",  d => { return xAxisYPosition() - detailedY(d.population); })
                .attr("y",  d => { return detailedY(d.population); })
  
  let bottomInfoGroup = svg.append('rect')
    
  bottomInfoGroup
    .attr('class', 'bottomInfoBar')
    .attr('id', countryName)
    .attr('fill', '#3575ff')
    .attr('width', oldX.bandwidth() )
    .attr('height',40)
    .attr('y', xAxisYPosition() - 40)
    .attr('x', oldX(countryName))
   
  
  svg.selectAll('.bottomInfoBar')
      .transition()
      .duration(750)
      .attr('x', 10)
      .attr('y', xAxisYPosition() + 30)
      .attr('width', width - 20)

  bars.exit()
    .transition()
    .duration(750)
    .attr("height", 0)
    .attr("y", xAxisYPosition())
    .remove();
}

function showBasicData() {
  // --------------------------
  // DEFINE AXIS INITIAL 
  // --------------------------
  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .domain(data.map(d => { return d.name }));

  var y = d3.scaleLinear()
    .range([xAxisYPosition(), 0])
    .domain([0, d3.max(data, function(d) { return d.population; })]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);


  // ------------------------
  // APPEND INITIAL DATA
  // ------------------------

  var basicBars = svg.selectAll(".barClicked, .detailedBar")
        .data(data, d => { return d.name })

  svg.selectAll(".barClicked")
    .transition()
    .duration(750)
    .attr("height",  d => { return xAxisYPosition() - y(d.population); })
    .attr("y",  d => { return y(d.population); })
    .attr("width", x.bandwidth())
    .attr("x", function(d) { return x(d.name); })
    
  if (lively.query(world, ".barClicked") != undefined) {
    lively.query(world, ".barClicked").classList.add("barNotClicked")
    lively.query(world, ".barClicked").classList.remove("barClicked")
  }

  basicBars.enter()
        .append("rect")
          .attr("id", d => { return getMasterBarIdfromCountryName(d.name)})
          .attr("class", "barNotClicked bar")
          .attr("x", function(d) { return x(d.name); })
          .attr("width", x.bandwidth())
          .attr("y", xAxisYPosition())
          .attr("height", 0)
          .on("click", function(d) { 
              lively.query(world, "#" + getMasterBarIdfromCountryName(d.name)).classList.add("barClicked");
              lively.query(world, "#" + getMasterBarIdfromCountryName(d.name)).classList.remove("barNotClicked")
              showDetailedData(d.name, d.population, x);
              })
          .transition()
                .duration(750)
                .delay(function (d, i) {
                    return i * 150;
                })
                .attr("height",  d => { return xAxisYPosition() - y(d.population); })
                .attr("y",  d => { return y(d.population); })
  
  if (lively.query(world, '.bottomInfoBar') != undefined) {
    svg.selectAll('.bottomInfoBar')
    .transition()
    .duration(750)
    .attr('width', 40)
    .attr('height', 0)
    .attr('x', x(lively.query(world, '.bottomInfoBar').id) + x.bandwidth() / 2)
    .attr('y', xAxisYPosition() - 40)
    .remove()
  }
  
  
  basicBars.exit()
    .transition()
    .duration(750)
    .attr("height", 0)
    .attr("y", xAxisYPosition())
    .remove();
  
  // ------------------------
  // UPDATE AXIS
  // ------------------------
  
  svg.selectAll("g .y-axis")
      .transition()
      .duration(750)
      .call(yAxis)

  svg.selectAll("g .x-axis")
      .transition()
      .duration(750)
      .call(xAxis);
}

// ------------------------
// HELPER FUNCTIONS
// ------------------------

function getDetailedDataFromCountryName(countryName){
  let detailed = null;
  data.forEach((countryObject) => {
    if(countryObject.name == countryName) { 
      detailed = countryObject.detailed;
    }
  });
  
  return detailed;
}

function getMasterBarIdfromCountryName(countryName) {
  return countryName + "MasterBar";
}

function xAxisYPosition(){
  return height - 50;
}



</script>

<d3-hello-world></d3-hello-world>