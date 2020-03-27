<button id="button0">Click me to have no order of individuals</button>
<button id="button1">Click me to order by gender</button>
<button id="button2">Click me to order by region</button>
<div id="individuals_circle"></div>

<script>

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js";
import d3 from "src/external/d3.v5.js"

let SVG_WIDTH = 1024;
let SVG_HEIGHT = 768;

let svgContainer = d3.select(lively.query(this, "#individuals_circle"))
    .append("svg")
      .attr("width", SVG_WIDTH)
      .attr("height", SVG_HEIGHT)
      
let world = this;
      
test(world);

async function test(world) {
  let data = await AVFParser.loadCompressedIndividualsWithKeysFromFile("BASIC")
  let easement = d3.easeBounceInOut
  
  svgContainer.selectAll("circle")
    .data(data).enter()
      .append("circle")
        .attr("fill", (d) => {return "grey"})
        .attr("r", 5)
        .attr("cx", (d) => {return getRndInteger(0, SVG_WIDTH)})
        .attr("cy", (d) => {return getRndInteger(0, SVG_HEIGHT)})
        .on("click", (d) => lively.openInspector(d))

  lively.query(world, "#button0").addEventListener("click", () => {
    svgContainer.selectAll("circle")
        .transition()
        .ease(easement)           // control the speed of the transition
        .duration(1000)
        .attr("fill", (d) => {return "grey"})
        .attr("cx", (d) => {return getRndInteger(0, SVG_WIDTH)})
        .attr("cy", (d) => {return getRndInteger(0, SVG_HEIGHT)})
  })


  lively.query(world, "#button1").addEventListener("click", () => {
    var colors = {}
    var genders = {}
    data.forEach(d => (genders[d.gender] = true))
    var genderNames = Object.keys(genders)
    svgContainer.selectAll("circle")
        .transition()
        .delay(function(d, i) { return ((i%100) * 2); })
        .ease(easement)           // control the speed of the transition
        .duration(1500)
        .attr("fill", (d) => {return getColorByGender(d, colors)})
        .attr("cx", (d) => {return getXPositionByGender(d, genderNames)})
        .attr("cy", (d) => {return getRndInteger(0, SVG_HEIGHT)})
  })

  lively.query(world, "#button2").addEventListener("click", () => {
    var colors = {}
    var districts = {}
    data.forEach(d => (districts[d.district] = true))
    var districtNames = Object.keys(districts)
    svgContainer.selectAll("circle").transition()
        .attr("fill", (d) => {return getColorByDistrict(d, colors)})
        .attr("cx", (d) => {return getXPositionByDistrict(d, districtNames)})
        .attr("cy", (d) => {return getRndInteger(0, SVG_HEIGHT)})
  });
}


//------------------------------------------------------//

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getColorByGender(individual, colors) {
  if (colors[individual.gender]) {
    return colors[individual.gender]
  }
  return colors[individual.gender] = getRandomColor()
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getColorByDistrict(individual, colors) {
  if (colors[individual.district]) {
    return colors[individual.district]
  }
  return colors[individual.district] = getRandomColor()
}

function getXPositionByGender(individual, genderNames) {
  let start = SVG_WIDTH / genderNames.length * (genderNames.indexOf(individual.gender))
  return getRndInteger(start, start + SVG_WIDTH / genderNames.length)
}

function getXPositionByDistrict(individual, districtNames) {
  let start = SVG_WIDTH / districtNames.length * (districtNames.indexOf(individual.district))
  return getRndInteger(start, start + SVG_WIDTH / districtNames.length)
}

""
</script>