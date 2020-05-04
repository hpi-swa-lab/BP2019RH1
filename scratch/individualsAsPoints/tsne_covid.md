
<div id="container" height="1400">
<canvas id="canvas"></canvas>
<svg id="legends"></svg>
</div>
<svg id="mysvg" width="960" height="600"></svg>


<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import tsnejs from "https://lively-kernel.org/lively4/BP2019RH1/src/external/tsne.js"
import d3 from "src/external/d3.v5.js"
let svg = lively.query(this, "#mysvg")

const width = 960,
      height = 600,
      margin = 40
      
let colorValues = []
colorValues.push(...d3.schemeSet3)
colorValues.push(...d3.schemeDark2)

let scaleX = d3.scaleLinear().range([width / 2 - height / 2 + margin, width / 2 + height / 2 - margin])
let scaleY = d3.scaleLinear().range([margin, height - margin])
let scalecountry = d3.scaleOrdinal(colorValues)

var opt = {}
opt.epsilon = 5; // epsilon is learning rate (10 = default)
opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
opt.dim = 2; // dimensionality of the embedding (2 = default)

var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
//var attributes = ["themes", "age"]
var attributes = ["themes"]
var ranges = {}

var data = [],
    dists = [];

var Y;
    

var value;

let colorAttribute = "county";

(async () => {
  data = await AVFParser.loadCovidDataFlatThemes()
  //data = data.slice(0, 1000)
  

  scalecountry.domain([...new Set(data.map(d => d["county"]))])

  
  
  //console.log(ranges)

  //dists = data.map(d => data.map(e => gower_dist(d, e)))
  dists = Array(data.length)
  
  /*
  for (let i = 0; i < data.length; i++) {
    dists[i] = Array(data.length)
  }
  

  for (let i = 0; i < data.length; i++) {
    for (let e = 0; e < i; e++) {
      let dist = gower_dist(data[i], data[e])
      dists[i][e] = dist
      dists[e][i] = dist
    }
  }*/
  dists = await AVFParser.loadDistanceMatrix()
  console.log(dists)

  tsne.initDataDist(dists);

  for (let i = 0; i < scalecountry.domain().length; i++) {
    let g = d3.select(svg).append("g")
      .attr("transform", "translate(" + 0 + "," + (i * 10 + 5) + ")")
    g.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", 0)
      .attr("y", i * 11)
      .attr("fill", scalecountry.range()[i])

    g.append("text")
      .attr("x", 10)
      .attr("y", i * 11 + 5)
      .text(scalecountry.domain()[i])
  }
  
  var limit = 2500, k = 0;
  
  var lastTime = performance.now()
  const draw = () => {
    if (!lively.isInBody(svg)) return
    if (k >= limit) return
    k++
    
    var time = performance.now()
    var deltaT = (time - lastTime) / 1000
    lastTime = time
    
    tsne.step()
    Y = tsne.getSolution()
    scaleX.domain(d3.extent(Y.map(d => d[0])))
    scaleY.domain(d3.extent(Y.map(d => d[1])))
    drawPoints()
    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
})();

function drawPoints() {
  d3.select(svg)
    .selectAll("circle").data(Y)
      .attr("cx", function(d) {return scaleX(d[0])})
      .attr("cy", function(d) {return scaleY(d[1])})
      .attr("r", 4.5)
      .attr("fill", function(d,i) {return scalecountry(data[i]["county"])})
      .on("click", function(d, i) {lively.openInspector(data[i])})
    .enter()
      .append("circle")
      .attr("cx", function(d) {return scaleX(d[0])})
      .attr("cy", function(d) {return scaleY(d[1])})
      .attr("r", 4.5)
      .attr("fill", function(d,i) {return scalecountry(data[i]["county"])})
      .on("click", function(d, i) {lively.openInspector(data[i])})
    .exit()
      .remove()
}
  
function toSVGCoord(coords) {
  let x = coords[0]
  let y = coords[1]
  
  return [x + width / 2, y + height / 2]
}

function gower_dist(a, b) {
  let sum = 0
  for (let attribute of attributes) {
    sum += gower_dist_attr(a[attribute], b[attribute], ranges[attribute])
  }
  
  return sum / attributes.length
}

function gower_dist_attr(a, b, range) {
  if (Array.isArray(a) && Array.isArray(b)) {
    // haha you lose
    let sum = 1
    let outer = a
    let inner = b
    if (a.length > b.length) {
      outer = b
      inner = a
    }
    
    outer.forEach(elem => {
      if (inner.includes(elem)) {
        
        sum -= 1 / outer.length
      }
    })
    
    return sum
    
  } else if (isNaN(a) || isNaN(b)) {
    return a === b ? 0 : 1
    
  } else if (!isNaN(a) && !isNaN(b)) {
    return Math.abs(a - b) / range
    
  }
}

</script>