<button id="random-button">Animate grouping randomly</button>
<button id="grid-button">Animate grouped by district</button>
<div id='my-canvas'>
</div>
<svg width="1000" height="900"></svg>

<style>
canvas, svg {
  position: absolute;
  top: 0;
  left: 0;
}

div {
  position: relative;
}
</style>

<script>
// Calling the regl module with no arguments creates a full screen canvas and
// WebGL context, and then uses this context to initialize a new REGL instance

// var regl = require("src/external/regl")()
import d3 from "src/external/d3.v5.js"
import createREGL from "src/external/regl.js"

// Some constants to use
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;
const MAX_SPEED = 25;
const POINT_SIZE = 3;
const POINT_COUNT = 50000;

var divCanvas = lively.query(this, "#my-canvas")
var canvas = <canvas width="1000" height="800"></canvas>
divCanvas.appendChild(canvas)
var svg = lively.query(this, "svg")
divCanvas.appendChild(svg)
var context = canvas.getContext("webgl") 
var regl = createREGL(context)

// Helper function to create a random float between
// some defined range. This is used to create some
// fake data. In a real setting, you would probably
// use D3 to map data to display coordinates.
function randomFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

// Helper function to create a random integer between
// some defined range. Again, you would want to use
// D3 for mapping real data to display coordinates.
function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max));
}



let districtNames = ["banadir", "mogadishu", "awdal", "jubbaland", "baki"]
let genderNames = ["f", "m", "NA", "NC"]

// Helper function to generate some fake data.
// Each data point has an x and y and a 'speed'
// value that indicates how fast it travels
function createData(dataCount) {
  var data = [];
  for (var i = 0; i < dataCount; i++) {
    let x = randomIntFromInterval(POINT_SIZE, MAX_HEIGHT)
    let y = randomIntFromInterval(POINT_SIZE, MAX_WIDTH)
    var datum = {
      id: i,
      speed: randomFromInterval(1, MAX_SPEED),
      y: y,
      x: x,
      sy: y,
      sx: x,
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

// Helper function, goes through each
// element in the fake data and updates
// its x position.
function updateData(data) {
  data.forEach(function(datum) {
    datum.x += datum.speed;
    // reset x if its gone past max width
    datum.x = datum.x > MAX_WIDTH ? 0 : datum.x;
  });
}

// MAKE SCALES
let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(genderNames)
let xScale = d3.scaleBand().domain(districtNames).range([0,MAX_WIDTH])
let xAxis = d3.axisBottom(xScale)

// MAKE SHADERS
const drawDots = regl({
  frag: `
  precision mediump float;
  varying vec4 fragColor;
  void main () {
    gl_FragColor = fragColor;
  }`,

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
    // There will be a position value for each point
    // we pass in
    position: function(context, props) {
      return props.points.map(function(point) {
        return [point.x, point.y];
      });
    },
    color: function(context, props) {
      return props.points.map(function(point) {
        let c = d3.rgb(colorScale(point.gender));
        return [c.r/255.0, c.g/255.0, c.b/255.0, 1.0];
      });
    },
    // Now pointWidth is an attribute, as each
    // point will have a different size.
    pointWidth: function(context, props) {
      return props.points.map(function(point) {
        return point.size;
      });
    }
  },

  uniforms: {
    /*color: function(context, props) {
      // just to be a bit strange, oscillate the color a bit.
      return [Math.cos(context.tick / 100), 0.304, 1.0, 1.0];
    },*/
    // FYI: there is a helper method for grabbing
    // values out of the context as well.
    // These uniforms are used in our fragment shader to
    // convert our x / y values to WebGL coordinate space.
    stageWidth: regl.context("drawingBufferWidth"),
    stageHeight: regl.context("drawingBufferHeight"),
  },

  count: function(context, props) {
    // set the count based on the number of points we have
    return props.points.length;
  },
  primitive: "points"
});

const animateDots = regl({
  frag: `
  precision mediump float;
  varying vec4 fragColor;
  void main () {
    gl_FragColor = fragColor;
  }`,

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
    // There will be a position value for each point
    // we pass in
    s_position: function(context, props) {
      return props.points.map(function(point) {
        return [point.sx, point.sy];
      });
    },
    t_position: function(context, props) {
      return props.points.map(function(point) {
        point.x = props.getTargetPosition(point)
        return [point.x, point.y];
      });
    },
    color: function(context, props) {
      return props.points.map(function(point) {
        let c = d3.rgb(colorScale(point.gender));
        return [c.r/255.0, c.g/255.0, c.b/255.0, 1.0];
        // return [1.0, 1.0, 0, 1.0]
      });
    },
    // Now pointWidth is an attribute, as each
    // point will have a different size.
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
    // set the count based on the number of points we have
    return props.points.length;
  },
  primitive: "points"
});

var points = createData(POINT_COUNT);



drawDots({
  pointWidth: POINT_SIZE,
  points: points
});

lively.query(this, "#grid-button").addEventListener("click", () => {
  const duration = 2000
  const ease = d3.easeCubic

  d3.select(svg).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 0 + "," + 800 + ")")
    .call(xAxis)
      
  let timer = d3.timer((elapsed) => {
    const t = Math.min(1, ease(elapsed / duration))

    let getTargetPosition = (point) => {
      return xScale(point.district) + randomIntFromInterval(10, xScale.bandwidth() - 10)
    }

    animateDots({
      pointWidth: POINT_SIZE,
      points: points,
      tick: t,
      getTargetPosition: getTargetPosition
    })

    if (t === 1) {
      timer.stop()
      points.forEach(point => {point.sx = point.x; point.sy = point.y})
    }
  })
})

lively.query(this, "#random-button").addEventListener("click", () => {
  const duration = 2000
  const ease = d3.easeCubic
  
  d3.select(svg).select("g").remove()

  let timer = d3.timer((elapsed) => {
    const t = Math.min(1, ease(elapsed / duration))

    let getTargetPosition = (point) => {
      return randomIntFromInterval(0, MAX_WIDTH)
    }

    animateDots({
      pointWidth: POINT_SIZE,
      points: points,
      tick: t,
      getTargetPosition: getTargetPosition
    })

    if (t === 1) {
      timer.stop()
      points.forEach(point => {point.sx = point.x; point.sy = point.y})
    }
  })
})

""
</script>
