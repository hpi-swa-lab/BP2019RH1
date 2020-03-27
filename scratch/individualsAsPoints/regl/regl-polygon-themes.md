<svg id="second" width="960" height="500"></svg>
<svg id="first" width="960" height="500"></svg>


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

<script>

import d3 from "src/external/d3.v5.js"

var svg = d3.select(lively.query(this,"#second")),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + 10 + "," + 10 + ")");;

var n = 100,
    nodes = d3.range(n).map(function(i) { return {index: i}; }),
    links = d3.range(n).map(function(i) { return {source: i, target: (i + 3) % n}; });
    
var fixLeft = {x: 400, y: 0},
    fixRight = {x: 700, y: 300},
    fixTop = {x: 100, y: 300}

var forceXLeft = d3.forceX(fixLeft.x).strength(function(d) {return d.value1 / (d.value1 + d.value2 + d.value3 + 0.0) * 0.1}),
    forceYLeft = d3.forceY(fixLeft.y).strength(function(d) {return d.value1 / (d.value1 + d.value2 + d.value3 + 0.0) * 0.1}),
    forceXRight = d3.forceX(fixRight.x).strength(function(d) {return d.value2 / (d.value1 + d.value2 + d.value3 + 0.0) * 0.1}),
    forceYRight = d3.forceY(fixRight.y).strength(function(d) {return d.value2 / (d.value1 + d.value2 + d.value3 + 0.0) * 0.1}),
    forceXTop = d3.forceX(fixTop.x).strength(function(d) {return d.value3 / (d.value1 + d.value2 + d.value3 + 0.0) * 0.1}),
    forceYTop = d3.forceY(fixTop.y).strength(function(d) {return d.value3 / (d.value1 + d.value2 + d.value3 + 0.0) * 0.1})
    
var points = [{value1: 200, value2: 50, value3: 50}, {value1: 20, value2: 50, value3: 25}, {value1: 2500, value2: 50, value3: 1000}]

var simulation = d3.forceSimulation(points)
    .force("xLeft", forceXLeft)
    .force("yLeft", forceYLeft)
    .force("xRight", forceXRight)
    .force("yRight", forceYRight)
    .force("xTop", forceXTop)
    .force("yTop", forceYTop)
    .on('tick', ticked);
    
var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))

g.append("g")
    .attr("stroke", "#0ff")
    .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data([fixLeft, fixRight, fixTop])
  .enter().append("circle")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", 4.5);
    
g.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("id", "circles")
    
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
    .attr("r", 4.5)
    .merge(u)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
  
  u.exit().remove()
}

/*
// Use a timeout to allow the rest of the page to load first.
d3.timeout(function() {
  
  //debugger
  // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
  for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick();
  }

  g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(points)
    .enter().append("circle")
      .attr("id", function(d,i) {return "" + i})
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 4.5);
      

});
*/
</script>