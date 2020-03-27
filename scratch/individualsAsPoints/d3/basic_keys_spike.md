<button id="button">Click Me to order by gender</button>
<div id="individuals_circle">
</div>

<script>
var world = this
import d3 from "src/external/d3.v5.js"

var WIDTH_SVG = 1700
var HEIGHT_SVG = 900

var svgContainer = d3.select(lively.query(world, "#individuals_circle"))
    .append("svg")
      .attr("width", WIDTH_SVG)
      .attr("height", HEIGHT_SVG)

var data = d3.csv("https://lively-kernel.org/voices/voices-replaced/basic_keys.csv")


d3.csv("https://lively-kernel.org/voices/voices-replaced/basic_keys.csv").then(function(data) {
  
  svgContainer.selectAll("circle").data(data).enter().append("circle")
    .attr("fill", function(d) {
      if (d.gender === "male") {
        return "blue"
      } else if (d.gender === "female") {
        return "red"
      } else {
        return "grey"
      }
    })
    .attr("r", 5)
    .attr("cx", function() {return getRndInteger(0, WIDTH_SVG)})
    .attr("cy", function() { return getRndInteger(0, HEIGHT_SVG)})
    .on("click", function(d) {
      lively.openInspector(d)
    })
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

lively.query(world, "#button").addEventListener("click", function() {
  
  d3.csv("https://lively-kernel.org/voices/voices-replaced/basic_keys.csv").then(function(data) {
  
  svgContainer.selectAll("circle").data(data).transition()
    .attr("fill", function(d) {
      if (d.gender === "male") {
        return "blue"
      } else if (d.gender === "female") {
        return "red"
      } else {
        return "grey"
      }
    })
    .attr("r", 5)
    .attr("cx", function(d) { 
      if (d.gender === "male") {
        return getRndInteger(0, WIDTH_SVG/3)
      } else if (d.gender === "female") {
        return getRndInteger(WIDTH_SVG/3, WIDTH_SVG/3 * 2)
      } else {
        return getRndInteger(WIDTH_SVG/3 * 2, WIDTH_SVG)
      }
    })
    .attr("cy", function() { return getRndInteger(0, HEIGHT_SVG)})
});
  
})
                         
""
</script>