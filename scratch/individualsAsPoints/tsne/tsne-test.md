
<div id="container" height="1400">
<canvas id="canvas"></canvas>
<svg id="legends"></svg>
</div>
<svg id="mysvg" width="960" height="800"></svg>


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

var data = [
"JPN",
"USA",
"MEX",
"IND",
"BRA",
"IND",
"CHN",
"IND",
"USA",
"BGD",
"ARG",
"PAK",
"EGY",
"BRA",
"JPN",
]

scalecountry.domain([...new Set(data)])

// initialize data. Here we have 3 points and some example pairwise dissimilarities
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
    await new Promise(r => setTimeout(r, 1));
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
      .attr("fill", function(d,i) {return scalecountry(data[i])})
    .enter()
      .append("circle")
      .attr("cx", function(d) {return scaleX(d[0])})
      .attr("cy", function(d) {return scaleY(d[1])})
      .attr("r", 4.5)
      .attr("fill", function(d,i) {return scalecountry(data[i])})
    .exit()
      .remove()
}
  
function toSVGCoord(coords) {
  let x = coords[0]
  let y = coords[1]
  
  return [x + width / 2, y + height / 2]
}

</script>


<script>
import tsnejs from "https://lively-kernel.org/lively4/BP2019RH1/src/external/tsne.js"
import d3 from "src/external/d3.v5.js"

let canvasElem = lively.query(this, "#canvas")
let legends = lively.query(this, "#legends")

const width = 960,
      height = 500,
      margin = 40

let colorValues = d3.schemeSpectral[11]

colorValues.push(...d3.schemeSet3)
colorValues.push(...d3.schemeDark2)

let   scalepop = d3.scaleSqrt().domain([0, 100000]).range([0.2, 24]),
      scalecountry = d3.scaleOrdinal(colorValues),
      centerx = d3.scaleLinear()
                  .range([width / 2 - height / 2 + margin, width / 2 + height / 2 - margin]),
      centery = d3.scaleLinear()
                  .range([margin, height - margin]);
     
const canvas = d3.select(canvasElem)
    .attr("width", width)
    .attr("height", height);

d3.csv('https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/cities.csv').then(function (cities) {
    console.log("Start")
    console.log(cities)
    const data = cities
        .map((d, i) => [+d.lng, +d.lat, +d['population'], d['iso3']])
        
    let countries = [...new Set(data.map(d => d[3]))]
    scalecountry.domain(countries)
    console.log(scalecountry.range())

    const model = new tsnejs.tSNE({
        dim: 2,
        perplexity: 30,
    });

    // initialize data with pairwise distances
    const dists = data.map(d => data.map(e => d3.geoDistance(d, e)));
    console.log(dists)
    model.initDataDist(dists);
    //debugger
    let cur_sim = 0, end_sim = 500
    let solution
    
    let finalData = data.map(d => (d.x = width / 2, d.y = height / 2, d))
    const forcetsne = d3.forceSimulation(
      data.map(d => (d.x = width / 2, d.y = height / 2, d))
    )
        .force('tsne', function (alpha) {
            // every time you call this, solution gets better
            model.step();

            // Y is an array of 2-D points that you can plot
            let pos = model.getSolution();
            solution = pos

            centerx.domain(d3.extent(pos.map(d => d[0])));
            centery.domain(d3.extent(pos.map(d => d[1])));

            data.forEach((d, i) => {
                d.x += alpha * (centerx(pos[i][0]) - d.x);
                d.y += alpha * (centery(pos[i][1]) - d.y);
            });
        })
        .force('collide', d3.forceCollide().radius(d => 7))
        .on('tick', function () {
            if (cur_sim > end_sim) {
             // forcetsne.stop()
            }
            
            cur_sim++
            let nodes = data.map((d, i) => {
                return {
                    x: d.x,
                    y: d.y,
                    r: 7,
                    color: scalecountry(d[3]),
                };
            });

            draw(canvas, nodes);

        })
        .on('end', function () {
          console.log(data)
          console.log("solution B")
          console.log(solution)
          
          for (let i = 0; i < scalecountry.range().length; i++) {
            let g= d3.select(legends).append("g")
              .attr("transform", "translate(" + 0 + "," + i * 10 + ")")
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
        })
        .alphaDecay(0.005)
        .alpha(0.1);

    function draw(canvas, nodes) {
        let context = canvas.node().getContext("2d");
        context.clearRect(0, 0, width, height);

        for (var i = 0, n = nodes.length; i < n; ++i) {
            var node = nodes[i];
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
            context.lineWidth = 0.5;
            context.fillStyle = node.color;
            context.fill();
        }
    }

});

</script>