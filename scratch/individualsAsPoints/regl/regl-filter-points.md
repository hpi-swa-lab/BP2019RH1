<link href="style.css" rel="stylesheet" type="text/css" />

<button id="random-button">Animate grouping randomly</button>
<button id="grid-button">Animate grouped by district</button>
<button id="filter-gender-m">Filter out gender m!</button>
<button id="filter-gender-f">Filter out gender f!</button>
<button id="filter-district-banadir">Filter out district banadir!</button>
<button id="restore-original">Restore original!</button>

<button id="toggle-background">Toggle Darkmode</button> 


Gender: <select id="gender-filter-select"></select>
<button id="gender-filter-button">Filter!</button>
District: <select id="district-filter-select"></select>
<button id="district-filter-button">Filter!</button>

<div id="filter-bar"></div>

<div id='my-canvas'>
</div>
<svg width="1000" height="900"></svg>

<script>
import d3 from "src/external/d3.v5.js"
import createREGL from "src/external/regl.js"
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js"
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js" 
import inside from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-point-in-polygon.js"

debugger;
// Some constants to use
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;
const MAX_SPEED = 25;
const POINT_SIZE = 4;
const POINT_COUNT = 100000;

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas width="1000" height="800"></canvas>
var svg = lively.query(this, "svg")
var context = canvas.getContext("webgl") 
var regl = createREGL(context)
var world = this

let backgroundColor = [1, 1, 1, 1]

divCanvas.appendChild(canvas)
divCanvas.appendChild(svg)

var mp = mp2(divCanvas)
var mb = mb2(divCanvas)

let attributes = ["gender", "district"]
let districtNames = ["banadir", "mogadishu", "awdal", "jubbaland", "baki"]
let genderNames = ["f", "m", "NA", "NC"]


// Make scales
let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(genderNames)
let xScale = d3.scaleBand().domain(districtNames).range([0,MAX_WIDTH])
let xAxis = d3.axisBottom(xScale)

// Filter
let currentFilters = {}
attributes.forEach((attribute) => currentFilters[attribute] = [])

let activeFilterExpr = (point) => {
  let currentFilterExpr = true
  for (let [key, value] of Object.entries(currentFilters)) {
    value.forEach(value => currentFilterExpr = currentFilterExpr && point[key] != value )
  }
  return currentFilterExpr
}

// Select
var select = lively.query(this, "#gender-filter-select");
for (let gender of genderNames) {
    select.options[select.options.length] = new Option(gender);
}

var select = lively.query(this, "#district-filter-select");
for (let district of districtNames) {
    select.options[select.options.length] = new Option(district);
}

// Make Shaders

const fragShader = `
  precision mediump float;
  varying vec4 fragColor;
  void main () {
    gl_FragColor = fragColor;
  }`

const drawDots = regl({
  frag: fragShader ,

  vert: `
  precision mediump float;
  attribute vec2 position;
  attribute float pointWidth;
  attribute vec4 color;
  
  varying vec4 fragColor;
  uniform float stageWidth;
  uniform float stageHeight;

  // helper function to transform from pixel space to normalized
  // device coordinates (NDC). In NDC (0,0) is the middle,
  // (-1, 1) is the top left and (1, -1) is the bottom right.
  // Stolen from Peter Beshai's great blog post:
  // http://peterbeshai.com/beautifully-animate-points-with-webgl-and-regl.html
  vec2 normalizeCoords(vec2 position) {
    // read in the positions into x and y vars
    float x = position[0];
    float y = position[1];

    return vec2(
      2.0 * ((x / stageWidth) - 0.5),
      // invert y to treat [0,0] as bottom left in pixel space
      -(2.0 * ((y / stageHeight) - 0.5)));
  }

  void main () {
    gl_PointSize = pointWidth;
    gl_Position = vec4(normalizeCoords(position), 0, 1);
    fragColor = color;
  }`,

  attributes: {
    position: function(context, props) {
      return props.points.map(function(point) {
        return [point.x, point.y];
      });
    },
    color: function(context, props) {
      return props.points.map(function(point) {
        let c = d3.rgb(colorScale(point.gender));
        if (point.highlighted == true) {
          return [1.0, 0, 1.0, 1.0]
        }
        return [c.r/255.0, c.g/255.0, c.b/255.0, 1.0];
      });
    },
    pointWidth: function(context, props) {
      return props.points.map(function(point) {
        return point.size;
      });
    }
  },

  uniforms: {
    stageWidth: regl.context("drawingBufferWidth"),
    stageHeight: regl.context("drawingBufferHeight"),
  },

  count: function(context, props) {
    return props.points.length;
  },
  primitive: "points"
});

const animateDots = regl({
  frag: fragShader,

  vert: `
  precision mediump float;
  attribute vec2 s_position;
  attribute vec2 t_position;
  attribute float pointWidth;
  attribute vec4 color;
  
  varying vec4 fragColor;
  uniform float t;
  uniform float stageWidth;
  uniform float stageHeight;

  vec2 normalizeCoords(vec2 position) {
    // read in the positions into x and y vars
    float x = position[0];
    float y = position[1];

    return vec2(
      2.0 * ((x / stageWidth) - 0.5),
      -(2.0 * ((y / stageHeight) - 0.5)));
  }

  void main () {
    gl_PointSize = pointWidth;
    gl_Position = vec4(mix(normalizeCoords(s_position), normalizeCoords(t_position), t), 0, 1);
    fragColor = color;
  }`,

  attributes: {
    s_position: function(context, props) {
      return props.points.map(function(point) {
        return [point.sx, point.sy];
      });
    },
    t_position: function(context, props) {
      return props.points.map(function(point) {
        return [point.x, point.y];
      });
    },
    color: function(context, props) {
      return props.points.map(function(point) {
        let c = d3.rgb(colorScale(point.gender));
        if (point.highlighted == true) {
          return [1.0, 0, 1.0, 1.0]
        }
        return [c.r/255.0, c.g/255.0, c.b/255.0, 1.0];
      });
    },
    pointWidth: function(context, props) {
      return props.points.map(function(point) {
        return point.size;
      });
    }
  },

  uniforms: {
    color: function(context, props) {
      // just to be a bit strange, oscillate the color a bit.
      return [Math.cos(context.tick / 100), 0.304, 1.0, 1.0];
    },
    t: function(context, props) {
      return props.tick;
    },
    stageWidth: regl.context("drawingBufferWidth"),
    stageHeight: regl.context("drawingBufferHeight")
  },

  count: function(context, props) {
    return props.points.length;
  },
  primitive: "points"
});

let addScale = () => {
  d3.select(svg).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 0 + "," + 800 + ")")
    .call(xAxis)
}

let removeScale = () => {
  d3.select(svg).select("g").remove()
}

let getTargetPositionRandom = (point) => {
  return randomIntFromInterval(0, MAX_WIDTH)
}

let getTargetPositionDistrict = (point) => {
  return xScale(point.district) + randomIntFromInterval(10, xScale.bandwidth() - 10)
}

var points = createData(POINT_COUNT);
var originalPoints = points;

drawPoints({
  pointWidth: POINT_SIZE,
  points: points.filter(activeFilterExpr)
});

addEvtListenerAnimation(lively.query(this, "#random-button"), getTargetPositionRandom, removeScale)
addEvtListenerAnimation(lively.query(this, "#grid-button"), getTargetPositionDistrict, addScale)

mb.on('down', function() {
  let clickedHighlightedPointIndices = calculateClickedPointsIndices()
  
  if (mb.left) {
    unhighlightPoints(clickedHighlightedPointIndices["highlightedPointIndices"])
    markClickedPoint(clickedHighlightedPointIndices["clickedPointIndices"])
    
    drawPoints({
      pointWidth: POINT_SIZE,
      points: points.filter(activeFilterExpr)
    });
    
  } else if (mb.right && clickedHighlightedPointIndices["clickedPointIndices"].length > 0) {
    let clickedPointIndices = clickedHighlightedPointIndices["clickedPointIndices"]
    let oneClickedPointIndex = clickedPointIndices[0]
    lively.openInspector(points[oneClickedPointIndex])
  }
})

lively.query(this, "#filter-district-banadir").addEventListener("click", () => {
  // points = points.filter(point => point.gender != "m")
  let helper = activeFilterExpr
  
  activeFilterExpr = (point) => {
    return point.district != "banadir" && helper(point)
  }
  
  drawPoints({
    pointWidth: POINT_SIZE,
    points: points.filter(activeFilterExpr)
  });
})

lively.query(this, "#restore-original").addEventListener("click", () => {
  //points = originalPoints
  activeFilterExpr = (i) => {return true}
  currentFilters = {"gender": [], "district": []}
  drawPoints({
    pointWidth: POINT_SIZE,
    points: points.filter(activeFilterExpr)
  });
})

lively.query(this, "#toggle-background").addEventListener("click", () => {
  backgroundColor = [1-backgroundColor[0], 1-backgroundColor[1], 1-backgroundColor[2],1]
  
  drawPoints({
    pointWidth: POINT_SIZE,
    points: points.filter(activeFilterExpr)
  });
})

lively.query(this, "#gender-filter-button").addEventListener("click", () => {
  let select = lively.query(this, "#gender-filter-select")
  let filterBar = lively.query(this, "#filter-bar")
  
  let value = select.options[select.selectedIndex].value
  
  if (!currentFilters["gender"].includes(value)) {
    let newFilterName = <button></button>
    
    currentFilters["gender"].push(value);
  
    newFilterName.innerHTML = "Gender: " + value
    newFilterName.setAttribute("value", value)
    newFilterName.addEventListener("click", () => {
      currentFilters["gender"] = currentFilters["gender"].filter(filter => filter != newFilterName.getAttribute("value"))
      drawPoints({
        pointWidth: POINT_SIZE,
        points: points.filter(activeFilterExpr)
      });
      filterBar.removeChild(newFilterName)
    })
    filterBar.appendChild(newFilterName)
  }
  
  drawPoints({
    pointWidth: POINT_SIZE,
    points: points.filter(activeFilterExpr)
  });
})

lively.query(this, "#district-filter-button").addEventListener("click", () => {
  let select = lively.query(this, "#district-filter-select")
  let filterBar = lively.query(this, "#filter-bar")
  
  let value = select.options[select.selectedIndex].value
  
  if (!currentFilters["district"].includes(value)) {
    let newFilterName = <button></button>
    
    currentFilters["district"].push(value);
  
    newFilterName.innerHTML = "District: " + value
    newFilterName.setAttribute("value", value)
    newFilterName.addEventListener("click", () => {
      currentFilters["district"] = currentFilters["district"].filter(filter => filter != newFilterName.getAttribute("value"))
      drawPoints({
        pointWidth: POINT_SIZE,
        points: points.filter(activeFilterExpr)
      });
      filterBar.removeChild(newFilterName)
    })
    filterBar.appendChild(newFilterName)
  }
  
  drawPoints({
    pointWidth: POINT_SIZE,
    points: points.filter(activeFilterExpr)
  });
})

function drawPoints(props) {
  regl.clear({color: backgroundColor})
  drawDots(props)
}

//------- Data Helpers ---------//

function randomFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max));
}

function createData(dataCount) {
  var data = [];
  for (var i = 0; i < dataCount; i++) {
    let x = randomIntFromInterval(POINT_SIZE, MAX_WIDTH)
    let y = randomIntFromInterval(POINT_SIZE, MAX_HEIGHT)
    var datum = {
      id: i,
      speed: randomFromInterval(1, MAX_SPEED),
      y: y,
      x: x,
      sy: y,
      sx: x,
      highlighted: false,
      size: randomIntFromInterval(POINT_SIZE, POINT_SIZE),
      age: randomIntFromInterval(10,99),
      district: districtNames[randomIntFromInterval(0, districtNames.length - 1)],
      gender: genderNames[randomIntFromInterval(0, genderNames.length - 1)],
      themes: {}
    };

    data.push(datum);
  }
  return data;
}

//------- EventListener ---------//

function addEvtListenerAnimation(button, getTargetPosition, beforeAnimation) {
  button.addEventListener("click", () => {
    const duration = 2000
    const ease = d3.easeCubic
    
    beforeAnimation()
    
    points.forEach((point) => {
      point.x = getTargetPosition(point)
    });
    
    var currentPoints = points.filter(activeFilterExpr)
    
    let timer = d3.timer((elapsed) => {
      const t = Math.min(1, ease(elapsed / duration))

      animateDots({
        pointWidth: POINT_SIZE,
        points: currentPoints,
        tick: t,
        getTargetPosition: getTargetPosition
      })

      if (t === 1) {
        timer.stop()
        points.forEach(point => {point.sx = point.x; point.sy = point.y})
      }
    })
  })
}

//------ SELECTION / HIGHLIGHTING -----//

function unhighlightPoints(highlightedPointIndices) {
  highlightedPointIndices.forEach((index) => {
    points[index].highlighted = false
  })
}

function markClickedPoint(clickedPointsIndices) {
  clickedPointsIndices.forEach((index) => {
    points[index].highlighted = true
  })
}

function calculateClickedPointsIndices() {
  let clickedPointIndices = []
  let highlightedPointIndices = []
  
  for (let i = 0; i < points.length; i++) {
    var point = points[i]
    var point_polygon = [
        [point.x - POINT_SIZE/2, point.y - POINT_SIZE/2],
        [point.x + POINT_SIZE/2, point.y - POINT_SIZE/2],
        [point.x + POINT_SIZE/2, point.y + POINT_SIZE/2],
        [point.x - POINT_SIZE/2, point.y + POINT_SIZE/2]
      ]  
    if (inside(mp, point_polygon)) {
      clickedPointIndices.push(i)
    }
    
    if (point.highlighted) {
      highlightedPointIndices.push(i)
    }
  }
  
  return {"clickedPointIndices": clickedPointIndices, "highlightedPointIndices": highlightedPointIndices}
}

//------ FILTERING -----//



""
</script>
