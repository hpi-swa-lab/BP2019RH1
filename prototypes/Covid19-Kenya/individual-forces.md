<div class="slidecontainer">
  Number of Links per point: 
  <input type="range" min="1" max="200" value="10" step="1" class="slider" id="numberLinksPerPoint">
  <div id="numberLinksPerPoint-text"></div>
</div>
<div class="slidecontainer">
  Strength of repulsion (between all points): 
  <input type="range" min="-1000" max="0" value="-300" step="1" class="slider" id="repellStrength">
  <div id="repellStrength-text"></div>
</div>
<div class="slidecontainer">
  Maximal distance of repulsion force (between all points):
  <input type="range" min="1" max="300" value="160" step="1" class="slider" id="repellDistance">
  <div id="repellDistance-text"></div>
</div>
<div class="slidecontainer">
  Desired distance between links: 
  <input type="range" min="1" max="200" value="5" step="1" class="slider" id="linkDistance">
  <div id="linkDistance-text"></div>
</div>
<div class="slidecontainer">
  Link Strength: 
  <input type="range" min="0" max="2" value="1" step="0.1" class="slider" id="linkStrength">
  <div id="linkStrength-text"></div>
</div>

<button id="start-stop">Start simulation with these parameters</button>


<svg id="second" width="1000" height="800"></svg>




<script>
import d3 from "src/external/d3.v5.js"

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

var svg = d3.select(lively.query(this,"#second")),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + 10 + "," + 0 + ")")

var simulation
var n,
    i = 0,
    points
    
var numberLinksPerPoint = 10,
    repellStrength = -300,
    repellDistance = 160,
    linkDistance = 5,
    linkStrength = 1,
    radius = 4.5

var data
var usedThemes = ["question", "answer", "escalate"]

// {"theme1": [1,3,5], "theme2": [2,5,6]}
var indicesByTheme = {}
// [{source: 1, target: 3}, {source: 3, target: 1}, {source: 1, target: 5}...]
var links = []

let container = lively.query(this, "#second")

let numberLinksPerPointSlider = lively.query(this, "#numberLinksPerPoint"),
    repellStrengthSlider = lively.query(this, "#repellStrength"),
    repellDistanceSlider = lively.query(this, "#repellDistance"),
    linkDistanceSlider = lively.query(this, "#linkDistance"),
    linkStrengthSlider = lively.query(this, "#linkStrength")
    
let numberLinksPerPointText = lively.query(this, "#numberLinksPerPoint-text"),
    repellStrengthText = lively.query(this, "#repellStrength-text"),
    repellDistanceText = lively.query(this, "#repellDistance-text"),
    linkDistanceText = lively.query(this, "#linkDistance-text"),
    linkStrengthText = lively.query(this, "#linkStrength-text")
    
let startButton = lively.query(this, "#start-stop")
    

var themeColor = d3.scaleOrdinal(d3.schemeSet2).domain(usedThemes)

/////////////////////////////
// HTML ELEMENTS SETUP
/////////////////////////

g.append("g")
    .attr("stroke", "#0ff")
    .attr("stroke-width", 1.5)
    .attr("id", "circles")
    .attr("fill", d3.color("rgba(25, 25, 25, 0.4)"))

numberLinksPerPointText.innerHTML = numberLinksPerPointSlider.value
repellStrengthText.innerHTML = repellStrengthSlider.value
repellDistanceText.innerHTML = repellDistanceSlider.value
linkDistanceText.innerHTML = linkDistanceSlider.value
linkStrengthText.innerHTML = linkStrengthSlider.value
    
//////////////////////////
// DATA LOAD + MAIN PROGRAM
//////////////////////////

AVFParser.loadCovidDataFlatThemes().then((result) => {
  data = result

  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    let themes = new Set(d["themes"])
    
    themes.forEach(t => {
      if (!usedThemes.includes(t)) return
      
      if (!indicesByTheme[t]) {
        indicesByTheme[t] = [i]
      } else {
        /*indicesByTheme[t].forEach(index => {
          links.push({"source": index, "target": i})
          links.push({"source": i, "target": index})
        })*/
        
        indicesByTheme[t].push(i)
      }
    })
  }
  
  cleanup()
  buildLinks()
  buildSimulation()
  
  
})

////////////////////////
// Event Listeners
///////////////////////
numberLinksPerPointSlider.oninput = function() {
  numberLinksPerPointText.innerHTML = numberLinksPerPointSlider.value
  numberLinksPerPoint = numberLinksPerPointSlider.value
}

repellStrengthSlider.oninput = function() {
  repellStrengthText.innerHTML = repellStrengthSlider.value
  repellStrength = repellStrengthSlider.value
}

repellDistanceSlider.oninput = function() {
  repellDistanceText.innerHTML = repellDistanceSlider.value
  repellDistance = repellDistanceSlider.value
}

linkDistanceSlider.oninput = function() {
  linkDistanceText.innerHTML = linkDistanceSlider.value
  linkDistance = linkDistanceSlider.value
}

linkStrengthSlider.oninput = function() {
  linkStrengthText.innerHTML = linkStrengthSlider.value
  linkStrength = linkStrengthSlider.value
}

startButton.addEventListener("click", () => {
  cleanup()
  buildLinks()
  buildSimulation()
})



///////////////////
// HELPERS
//////////////////
function cleanup() {
  if (simulation) {
    simulation.stop()
  }
  
  g.select("#circles").selectAll("*").remove()
  links = []
}

function buildLinks() {
  Object.keys(indicesByTheme).forEach(key => {
    indicesByTheme[key].forEach(index => {
      
      for (i = 0; i < numberLinksPerPoint; i++) {
        if (index  + i >= indicesByTheme[key].length - 1) {
          links.push({"source": index, "target": (index + i) % indicesByTheme[key].length})
          links.push({"source": (index + i) % indicesByTheme[key].length, "target": index})
        } else {
          links.push({"source": index, "target": index + i})
          links.push({"source": index + i, "target": index})
        }
      }
      
    })
  })
}

function buildSimulation() {
  simulation = d3.forceSimulation(data)
    .force("charge", d3.forceManyBody().strength(repellStrength).distanceMax(repellDistance))
    .force("link", d3.forceLink(links).distance(linkDistance).strength(linkStrength))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collide", d3.forceCollide(radius))
    .on('tick', ticked)
  
  i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))
}

  
function ticked() {
  if (i > n) {
    simulation.stop()
  }
  i++;
  
  var u = g.select("#circles")
    .selectAll('circle')
    .data(data)
    
  u.enter().append("circle")
    .attr("id", function(d,i) {return "" + i})
    .attr("r", function(d) {return radius})
    .merge(u)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("fill", function(d) {return themeColor(getTheme(d))})
    .on('click', function(d) {lively.openInspector(d)})
  
  u.exit().remove()
}

function getTheme(d) {
  let intersection = d.themes.filter(x => usedThemes.includes(x));
  if (intersection.length == 0) {
    return "";
  } else {
    return intersection[0];
  }
}

</script>