
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
{"country":"JPN"},
{"country":"USA"},
{"country":"MEX"},
{"country":"IND"},
{"country":"BRA"},
{"country":"IND"},
{"country":"CHN"},
{"country":"IND"},
{"country":"USA"},
{"country":"BGD"},
{"country":"ARG"},
{"country":"PAK"},
{"country":"EGY"},
{"country":"BRA"},
{"country":"JPN"},
{"country":"JPN"},
{"country":"USA"},
{"country":"MEX"},
{"country":"IND"},
{"country":"BRA"},
{"country":"IND"},
{"country":"CHN"},
{"country":"IND"},
{"country":"USA"},
{"country":"BGD"},
{"country":"ARG"},
{"country":"PAK"},
{"country":"EGY"},
{"country":"BRA"},
{"country":"JPN"},
{"country":"JPN"},
{"country":"USA"},
{"country":"MEX"},
{"country":"IND"},
{"country":"BRA"},
{"country":"IND"},
{"country":"CHN"},
{"country":"IND"},
{"country":"USA"},
{"country":"BGD"},
{"country":"ARG"},
{"country":"PAK"},
{"country":"EGY"},
{"country":"BRA"},
{"country":"JPN"},
{"country":"JPN"},
{"country":"USA"},
{"country":"MEX"},
{"country":"IND"},
{"country":"BRA"},
{"country":"IND"},
{"country":"CHN"},
{"country":"IND"},
{"country":"USA"},
{"country":"BGD"},
{"country":"ARG"},
{"country":"PAK"},
{"country":"EGY"},
{"country":"BRA"},
{"country":"JPN"},
]

console.log([...new Set(data.map(d => d["country"]))])
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

var dists = [
[0, 1.7033296741881099, 1.7738470785437581, 1.0570723822061874, 2.90903888914622, 0.9163865647137448, 0.2773929035754348, 0.8077985339745055, 1.3804935206326139, 0.7681981687931684, 2.882257841210726, 1.0886177475173484, 1.5017377339728366, 2.9143647512814237, 0.06332124484768023],
[1.7033296741881099, 0, 0.5277979345063097, 1.9684140369582377, 1.2057557786753996, 1.8440713520731284, 1.8622362660588097, 2.001703821132283, 0.620566349500247, 1.9888961854799616, 1.3376554695237617, 1.8335387107363414, 1.4154626158417116, 1.2169940852182406, 1.7428143301983108],
[1.7738470785437581, 0.5277979345063097, 0, 2.456478704679417, 1.166806834840824, 2.2996343181700816, 2.026504452317991, 2.398692098515827, 0.39335731491719095, 2.370920255043297, 1.1602340117233323, 2.333064792685843, 1.9413458192676167, 1.2055490659974846, 1.8329828792870564],
[1.0570723822061874, 1.9684140369582377, 2.456478704679417, 0, 2.161259773891633, 0.18231571587128081, 0.790074888451881, 0.2594887678823599, 2.195567852561665, 0.2966046935946773, 2.34365355256936, 0.13944134272601225, 0.6839828533912173, 2.1056987408897827, 0.9965764284147186],
[2.90903888914622, 1.2057557786753996, 1.166806834840824, 2.161259773891633, 0, 2.265044628248077, 2.9136142715196534, 2.4207483683462234, 1.5576916431827121, 2.457329339256249, 0.2630156586610394, 2.095828667627438, 1.604289927760133, 0.055634288584489426, 2.9437147166216397],
[0.9163865647137448, 1.8440713520731284, 2.299634318170082, 0.18231571587128087, 2.2650446282480767, 0, 0.6656214113601923, 0.20506607285387118, 2.0158017994926496, 0.22353214031486426, 2.479455516283611, 0.17271344573839284, 0.6950772564464721, 2.2098967389446145, 0.8592174786683051],
[0.27739290357543483, 1.8622362660588097, 2.026504452317991, 0.790074888451881, 2.9136142715196534, 0.6656214113601924, 0, 0.5352864375140935, 1.6358762901048882, 0.4961273562431222, 3.0824458040024614, 0.8377641557631321, 1.3107568950785298, 2.8631710250270417, 0.21415599260907311],
[0.8077985339745055, 2.001703821132283, 2.398692098515827, 0.2594887678823599, 2.4207483683462234, 0.2050660728538712, 0.5352864375140935, 0, 2.058500054169806, 0.039729299828935, 2.5926021417552216, 0.3431551546782217, 0.8940251629876037, 2.365184443186644, 0.7458748937841805],
[1.3804935206326139, 0.6205663495002469, 0.3933573149171909, 2.195567852561665, 1.5576916431827121, 2.0158017994926496, 1.6358762901048882, 2.058500054169806, 0, 2.0246989628343055, 1.5486428231644978, 2.108248754024287, 1.9151931724896578, 1.5942405868467815, 1.439768839907924],
[0.7681981687931683, 1.9888961854799616, 2.3709202550432966, 0.2966046935946773, 2.457329339256249, 0.22353214031486426, 0.4961273562431222, 0.039729299828934965, 2.0246989628343055, 0, 2.632273384544143, 0.37261248031746913, 0.9176087062380727, 2.4017152628298386, 0.7063444935005175],
[2.882257841210726, 1.3376554695237617, 1.1602340117233323, 2.34365355256936, 0.2630156586610394, 2.479455516283611, 3.0824458040024614, 2.5926021417552216, 1.5486428231644978, 2.632273384544143, 0, 2.3067449942515497, 1.8545754027745573, 0.3082144775350005, 2.942832196736167],
[1.0886177475173484, 1.8335387107363414, 2.333064792685843, 0.13944134272601225, 2.095828667627438, 0.17271344573839287, 0.8377641557631321, 0.3431551546782217, 2.108248754024287, 0.3726124803174692, 2.3067449942515497, 0, 0.5585550982703583, 2.0404274310447326, 1.0317836378414218],
[1.5017377339728366, 1.4154626158417118, 1.9413458192676167, 0.6839828533912174, 1.604289927760133, 0.695077256446472, 1.3107568950785298, 0.8940251629876037, 1.9151931724896578, 0.9176087062380727, 1.8545754027745573, 0.5585550982703582, 0, 1.5524693988264815, 1.4597252389836404],
[2.9143647512814237, 1.2169940852182406, 1.2055490659974846, 2.1056987408897827, 0.055634288584489426, 2.2098967389446145, 2.8631710250270417, 2.365184443186644, 1.5942405868467815, 2.4017152628298386, 0.3082144775350006, 2.0404274310447326, 1.5524693988264815, 0, 2.9342373007023816],
[0.06332124484768022, 1.7428143301983108, 1.8329828792870564, 0.9965764284147185, 2.9437147166216397, 0.8592174786683051, 0.2141559926090731, 0.7458748937841805, 1.439768839907924, 0.7063444935005175, 2.942832196736167, 1.0317836378414218, 1.4597252389836404, 2.9342373007023816, 0],

];

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
  console.log("solution A")
  console.log(Y)
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
  console.log(isNaN(a), b, range)
  if (isNaN(a) || isNaN(b)) {
    return a === b ? 0 : 1
  } else if (!isNaN(a) && !isNaN(b)) {
    return Math.abs(a - b) / range
  }
}

</script>