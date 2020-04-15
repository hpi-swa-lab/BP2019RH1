## TODO

- [ ] normalize forces according to attribute values
- [x] don't show illogical groupings in drop down
- [ ] color something
- [x] make fix points draggable
- [ ] age groups
- [x] fix languages bug

<button id="start_stop">Start / Stop</button>

<div class="slidecontainer">
  <input type="range" min="0" max="2" value="1" step="0.01" class="slider" id="myRange">
  <div id="slider-text"></div>
</div>

<select id="selection"></select>
<button id="selection-button">Select This!</button>


<svg id="second" width="1000" height="500"></svg>
<svg id="first" width="960" height="500"></svg>


<script>
import d3 from "src/external/d3.v5.js"

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

var svg = d3.select(lively.query(this,"#second")),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + 10 + "," + 0 + ")")

let button = lively.query(this, "#start_stop")
let slider = lively.query(this, "#myRange");
let output = lively.query(this, "#slider-text");
let selection = lively.query(this, "#selection")
let selectionButton = lively.query(this, "#selection-button")
let excludeFromSelection = ["id", "start_date", "end_date"]

var simulation


var sizeScale = d3.scaleLinear().range([4.5, 20]),
    forceScale = d3.scalePow().exponent(1).nice()

var n,
    i = 0,
    points

var data,
    fixPoints
var attribute = "languages"

output.innerHTML = slider.value; 

AVFParser.loadCovidDataFlatThemes().then((result) => {
  data = result
  console.log(new Set(data.map(d => Object.keys(d)).flat()))
  
  let attributes = [...new Set(data.map(d => Object.keys(d)).flat())]
  
  buildDiagram(data, attribute, g)
  //i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))
  
  button.addEventListener("click", () => {
    i = 0;
    simulation = simulation.alpha(1)
    simulation.tick()
  })

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    let value = this.value
    let distinctObj = getDistinctAttributeValuesAndThemes(data, attribute)
    let distinctThemes = distinctObj["distinctThemes"]
    let distinctAttributeValues = distinctObj["distinctAttributeValues"]
    //let fixPoints = calculateFixPoints(Array.from(distinctAttributeValues.values()), width, height)
    let forces = calculateForces(distinctAttributeValues, fixPoints)
    
    output.innerHTML = value;
    forceScale = forceScale.exponent(value)
    simulation = initSimulation(forces, points)
  }
  
  for (let value of attributes) {
    if (excludeFromSelection.includes(value)) continue
    
    selection.options[selection.options.length] = new Option(value)
  }
  
  selectionButton.addEventListener("click", () => {
    attribute = selection.options[selection.selectedIndex].value
    
    buildDiagram(data, attribute, g)
  })
})

  
function ticked() {
  if (i > n) {
    simulation.stop()
  }
  i++;
  
  var u = g.select("#circles")
    .selectAll('circle')
    .data(points)
    
  u.enter().append("circle")
    .attr("id", function(d,i) {return "" + i})
    .attr("r", function(d) {return sizeScale(d["total"])})
    .merge(u)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .on('click', function(d) {lively.openInspector(d)})
  
  u.exit().remove()
}

function buildDiagram(data, attribute, container) {
  let distinctObj = getDistinctAttributeValuesAndThemes(data, attribute)
  let distinctThemes = distinctObj["distinctThemes"]
  let distinctAttributeValues = distinctObj["distinctAttributeValues"]

  let pointsByTheme = initPointsByTheme(distinctThemes, distinctAttributeValues)
  pointsByTheme = calculateAmountByTheme(data, pointsByTheme, attribute)
  
  fixPoints = calculateFixPoints(Array.from(distinctAttributeValues.values()), width, height)
  let links = calculateLinks(fixPoints)
  
  let forces = calculateForces(distinctAttributeValues, fixPoints)
  let totalMax = calculateTotalMax(pointsByTheme)
  sizeScale = sizeScale.domain([0, totalMax])
  
  points = Object.values(pointsByTheme)
  
  simulation = initSimulation(forces, points)
  i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))

  container.selectAll("*").remove()
  drawVertices(container, fixPoints)
  drawLines(container, links)

  container.append("g")
      .attr("stroke", "#0ff")
      .attr("stroke-width", 1.5)
      .attr("id", "circles")
      .attr("fill", d3.color("rgba(25, 25, 25, 0.4)"))
}

function drawVertices(container, fixPoints) {
  let vertices = container.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("g")
    .data(fixPoints)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )


  vertices.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4.5)

  vertices.append("text")
      .attr("x", 0)
      .attr("y", 10)
      .attr("dy", ".35em")
      .attr("stroke", "#f80")
      .text(function(d) { console.log(d); return d["value"]; });
}

function drawLines(container, links) {
  container.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(links)
      .enter().append("line")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
}

function dragstarted(d) {
  d3.select(this).raise().classed("active", true)
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y)
}

function dragended(d) {
  d3.select(this).classed("active", false)
  let distinctObj = getDistinctAttributeValuesAndThemes(data, attribute)
  let distinctThemes = distinctObj["distinctThemes"]
  let distinctAttributeValues = distinctObj["distinctAttributeValues"]
  let newForces = calculateForces(distinctAttributeValues, fixPoints)
  
  simulation = initSimulation(newForces, points)
  g.selectAll("*").remove()
  drawVertices(g, fixPoints)
  drawLines(g, calculateLinks(fixPoints))
  
  g.append("g")
      .attr("stroke", "#0ff")
      .attr("stroke-width", 1.5)
      .attr("id", "circles")
      .attr("fill", d3.color("rgba(25, 25, 25, 0.4)"))
}

function getDistinctAttributeValuesAndThemes(data, attribute) {
  let distinctAttributeValues = new Set()
  let distinctThemes = new Set()
  
  data.forEach((d) => {
    if (Array.isArray(d[attribute])) {
      d[attribute].forEach((e) => {distinctAttributeValues.add(e)})
    } else {
      distinctAttributeValues.add(d[attribute])
    }
    
    d["themes"].forEach((t) => {
      distinctThemes.add(t)
    })
  })

  return {"distinctAttributeValues":distinctAttributeValues, "distinctThemes": distinctThemes}
}

function initPointsByTheme(distinctThemes, distinctAttributeValues) {
  let pointsByTheme = {}
  

  for (let theme of distinctThemes) {
    pointsByTheme[theme] = {"theme" : theme}

    for (let attributeValue of distinctAttributeValues) {
      pointsByTheme[theme][attributeValue] = 0
    }
    pointsByTheme[theme]["total"] = 0
  } 
  
  return pointsByTheme
}

function calculateAmountByTheme(data, pointsByTheme, attribute) {
  data.forEach((d) => {
    d["themes"].forEach((theme) => {
        pointsByTheme[theme][d[attribute]] += 1
        pointsByTheme[theme]["total"] += 1
    })
  })
  
  return pointsByTheme
}

function calculateForces(distinctAttributeValues, fixPoints) {
  let forces = []
  
  for (let i = 0; i < distinctAttributeValues.size; i++) {
    let attributeValue = Array.from(distinctAttributeValues.values())[i]
    let fixPoint = fixPoints[i]
    let alpha = 1
    let forceX = d3.forceX(fixPoint.x).strength(function(d) {return forceScale(d[attributeValue] / d["total"]) * alpha})
    let forceY = d3.forceY(fixPoint.y).strength(function(d) {return forceScale(d[attributeValue] / d["total"]) * alpha})
    
    forces.push(forceX)
    forces.push(forceY)
  }
  
  return forces
}

function initSimulation(forces, points) {
  let sim = d3.forceSimulation(points)
    .on('tick', ticked)

  for (let i = 0; i < forces.length; i++) {
    sim = sim.force("f" + i, forces[i])
  }
  return sim
}

function calculateTotalMax(pointsByTheme) {
  let totalMax = 0
  let pointsByThemeValues = Object.values(pointsByTheme)
  
  pointsByThemeValues.forEach((point) => {
    totalMax = Math.max(totalMax, point["total"])
  })
  
  return totalMax
}

function calculateFixPoints(distinctAttributeValues, width, height) {
  let fixedPoints = [] 
  let center = {"x": width/2, "y": height/2}
  let radius = Math.min(width/2, height/2) - 20
  let numberValues = distinctAttributeValues.length
  
  for (let i = 0; i < numberValues; i++) {
    let x = center.x + radius * Math.sin(i * 2 * Math.PI / numberValues)
    let y = center.y + radius * Math.cos(i * 2 * Math.PI / numberValues)
    fixedPoints.push({"x": x, "y": y, "value": distinctAttributeValues[i]})
  }
  return fixedPoints
}

function calculateLinks(fixPoints) {
  return d3.range(fixPoints.length).map((index) => {
    return {
      source: fixPoints[index], 
      target: fixPoints[(index + 1) % fixPoints.length]}
  })
}
</script>