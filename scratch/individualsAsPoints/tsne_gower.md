
<div id="container" height="1400">
<canvas id="canvas"></canvas>
<svg id="legends"></svg>
</div>
<svg id="mysvg" width="960" height="600"></svg>


<script>
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
var attributes = ["country"]
var ranges = {}

var data = [
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"USA", "themes": ["babba", "labba", "chuck"]},
{"country":"MEX", "themes": ["chacka", "babba", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"BRA", "themes": ["chacka", "tacka", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"CHN", "themes": ["chacka", "tacka", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka"]},
{"country":"USA", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"BGD", "themes": [ "tacka", "labba", "chuck"]},
{"country":"ARG", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"PAK", "themes": ["chacka","labba", "chuck"]},
{"country":"EGY", "themes": ["chacka", "tacka", "lacka", "babba", "chuck"]},
{"country":"BRA", "themes": ["chacka","babba", "labba", "chuck"]},
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", "babba", "chuck"]},
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"USA", "themes": [ "lacka", "babba", "labba", "chuck"]},
{"country":"MEX", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka", "lacka", "babba", "labba", "chuck"]},
{"country":"BRA", "themes": ["chacka", "tacka", "lacka", "babba", "labba", ]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"CHN", "themes": ["chacka", "tacka","babba", "labba", "chuck"]},
{"country":"IND", "themes": ["tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"USA", "themes": ["chacka", "labba", "chuck"]},
{"country":"BGD", "themes": ["chacka", "tacka", "lacka",]},
{"country":"ARG", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"PAK", "themes": ["chacka", "babba", "labba", "chuck"]},
{"country":"EGY", "themes": ["chacka","lacka", "babba", "labba", "chuck"]},
{"country":"BRA", "themes": ["chacka", "tacka", "lacka", "babba", "chuck"]},
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", ]},
{"country":"USA", "themes": ["tacka", "lacka", "labba", "chuck"]},
{"country":"MEX", "themes": ["chacka", "babba", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"BRA", "themes": ["chacka", "babba", ]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"CHN", "themes": ["chacka",  "babba", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"USA", "themes": [ "babba", ]},
{"country":"BGD", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"ARG", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"PAK", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"EGY", "themes": ["chacka", ]},
{"country":"BRA", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"JPN", "themes": ["tacka", "chuck"]},
{"country":"USA", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"MEX", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"IND", "themes": [ "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"BRA", "themes": ["chacka", "tacka", "lacka",]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"CHN", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"IND", "themes": ["chacka", "tacka", "lacka",]},
{"country":"USA", "themes": ["tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"BGD", "themes": ["chacka", "tacka", "lacka",]},
{"country":"ARG", "themes": ["chacka", "lacka", "babba", "chuck"]},
{"country":"PAK", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"EGY", "themes": ["tacka", "lacka", "labba", "chuck"]},
{"country":"BRA", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
{"country":"JPN", "themes": ["chacka", "tacka", "lacka", "babba", "labba", "chuck"]},
]

data.forEach(d => {
  d["age"] = Math.floor(Math.random() * 90)
})

scalecountry.domain([...new Set(data.map(d => d["country"]))])

attributes.forEach(attribute => {
  ranges[attribute] = new Set()
})

data.forEach(d => {
  attributes.forEach(k => {
    if (!isNaN(d[k])) {
      ranges[k].add(d[k])
    }
  })
})

attributes.forEach(a => {
  ranges[a] = Math.max(...ranges[a]) - Math.min(...ranges[a])
})

var dists
dists = data.map(d => data.map(e => gower_dist(d, e)))
console.log(dists)

tsne.initDataDist(dists);
var Y
var value;

for (let i = 0; i < scalecountry.domain().length; i++) {
  let g= d3.select(svg).append("g")
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

(async () => {
  for (var k = 0; k < 50000; k++) {
    tsne.step(); // every time you call this, solution gets better
    Y = tsne.getSolution();
    scaleX.domain(d3.extent(Y.map(d => d[0])));
    scaleY.domain(d3.extent(Y.map(d => d[1])));
    draw();
    await new Promise(r => setTimeout(r, 10));
  }

  Y = tsne.getSolution();
  draw()
})();

function draw() {
  d3.select(svg)
    .selectAll("circle").data(Y)
      .attr("cx", function(d) {return scaleX(d[0])})
      .attr("cy", function(d) {return scaleY(d[1])})
      .attr("r", 4.5)
      .attr("fill", function(d,i) {return scalecountry(data[i]["country"])})
    .enter()
      .append("circle")
      .attr("cx", function(d) {return scaleX(d[0])})
      .attr("cy", function(d) {return scaleY(d[1])})
      .attr("r", 4.5)
      .attr("fill", function(d,i) {return scalecountry(data[i]["country"])})
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
    if (a.length < b.length) {
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