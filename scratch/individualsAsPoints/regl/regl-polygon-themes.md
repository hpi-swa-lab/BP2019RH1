<button id="start_stop">Start / Stop</button>

<div class="slidecontainer">
  <input type="range" min="1" max="100" value="50" class="slider" id="myRange">
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

var simulation


var sizeScale = d3.scaleLinear().range([4.5, 20]),
    forceScale = d3.scalePow().exponent(1).nice()

var n,
    i = 0,
    points

var data 
var attribute = "county"

output.innerHTML = slider.value; 

AVFParser.loadCovidDataFlatThemes().then((result) => {
  data = result
  console.log(new Set(data.map(d => Object.keys(d)).flat()))
  
  let attributes = [...new Set(data.map(d => Object.keys(d)).flat())]
  
  buildDiagram(data, attribute, g)
  i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))
  
  button.addEventListener("click", () => {
    i = 0;
    simulation = simulation.alpha(1)
    simulation.tick()
  })

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    let value = this.value / 100 * 2
    let distinctObj = getDistinctAttributeValuesAndThemes(data, attribute)
    let distinctThemes = distinctObj["distinctThemes"]
    let distinctAttributeValues = distinctObj["distinctAttributeValues"]
    let fixPoints = calculateFixPoints(Array.from(distinctAttributeValues.values()), width, height)
    let forces = calculateForces(distinctAttributeValues, fixPoints)
    
    output.innerHTML = value;
    forceScale = forceScale.exponent(value)
    simulation = initSimulation(forces, points)
  }
  
  for (let value of attributes) {
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
  
  let fixPoints = calculateFixPoints(Array.from(distinctAttributeValues.values()), width, height)
  let links = calculateLinks(fixPoints)
  
  let forces = calculateForces(distinctAttributeValues, fixPoints)
  let totalMax = calculateTotalMax(pointsByTheme)
  sizeScale = sizeScale.domain([0, totalMax])
  
  points = Object.values(pointsByTheme)
  i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))

  simulation = initSimulation(forces, points)
  
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
      .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"; });


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

function getDistinctAttributeValuesAndThemes(data, attribute) {
  let distinctAttributeValues = new Set()
  let distinctThemes = new Set()
  
  data.forEach((d) => {
    distinctAttributeValues.add(d[attribute])

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

<script>

import d3 from "src/external/d3.v5.js"

var svg = d3.select(lively.query(this,"#first")),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var n = 100,
    nodes = d3.range(n).map(function(i) { return {index: i}; }),
    links = d3.range(n).map(function(i) { return {source: i, target: (i + 3) % n}; });

var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-80))
    .force("link", d3.forceLink(links).distance(20).strength(1).iterations(10))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .stop();

var loading = svg.append("text")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .text("Simulating. One moment please…");

// Use a timeout to allow the rest of the page to load first.
d3.timeout(function() {
  loading.remove();
  
  // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
  for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick();
  }

  g.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 4.5);
});

</script>