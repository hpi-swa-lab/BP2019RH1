## Movement Spike

<div id="upperPanel" class="flexRow">
  <div class="slidecontainer" height="30px">
    <div class="float-left">
      Velocity of individuals: 
      <input type="range" min="0" max="10" value="3" step="1" class="slider" id="velocity-slider">
    </div>
    <div id="velocity-text">
      3
    </div>
    <div class="float-left">
      Minimum radius of theme bubbles: 
      <input type="range" min="1" max="200" value="20" step="1" class="slider" id="min-radius-slider">
    </div>
    <div id="min-radius-text">
      20
    </div>
    <div class="float-left">
      Maximum radius of theme bubbles: 
      <input type="range" min="1" max="200" value="60" step="1" class="slider" id="max-radius-slider">
    </div>
    <div id="max-radius-text">
      60
    </div>
    <div class="float-left">
      Fade factor: 
      <input type="range" min="0" max="100" value="50" step="1" class="slider" id="fade-factor-slider">
      </div>
  </div>
  <div id="preferencePanel" class="flexRow"> 
    <div id="themeBubbleSizeSelect">
    <u> Theme Bubble Size </u> <br>
      <input type="radio" id="singleTheme" name="singleTheme" value="singleTheme">
      <label for="singleTheme"> Change theme bubble size accordingly to amount of individuals currently in it</label><br>
      <input type="radio" id="totalCountTheme" name="totalCountTheme" value="totalCountTheme">
      <label for="totalCountTheme"> Change theme bubble size accordingly to total amount of individuals with it</label><br>
      <input type="radio" id="unisize" name="unisize" value="unisize">
      <label for="unisize"> Unisize (Minimum radius)</label><br>
    </div>
    <div id="movementInsideThemeBubble">
    <u> Movement inside Theme Bubble </u> <br>
      <input type="radio" id="randomMovement" name="randomMovement" value="randomMovement">
      <label for="randomMovement"> Give individuals inside theme bubble random positions every frame </label><br>
      <input type="radio" id="smallMovement" name="smallMovement" value="smallMovement">
      <label for="smallMovement"> Let individuals inside theme bubbles move slowly</label><br>
    </div>
  </div>
</div>

<div id="divCanvas">
    <svg id="not-active">
      <text x=10 y=25 style="fill:grey; font-family: Arial; font-size: 24px"> Inactive Themes </text>
    </svg>
 </div>
  <canvas id="my-canvas"></canvas>
  <svg id="svg"></svg>
</div>



<style>
circle, .circle {
	fill: #b36;
	fill-opacity: 0.8;
}

.circleForm {
  opacity: 0.4;
}


.flexColumn {
  display: flex;
  flex-direction: column;
}

.flexRow {
  display: flex;
  flex-direction: row;
}

.float-left {
  float: left;
}

.slidecontainer {
  padding-bottom: 10px;
}

#activate-themes-select option {
    font-size: 16px;
    padding: 5px;
    background: #ffffff;
}
</style>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import ForcesStructure from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/forces-structure.js"
import CenterCoordinatesForGroups from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces_spike/center-coordinates.js"
import d3 from "src/external/d3.v5.js";
import d3Hull from "https://d3js.org/d3-polygon.v1.min.js"
import { ReGL } from "./movement-regl-point-wrapper.js"

// Draw svg constants
const MAX_WIDTH = 1600
const MAX_HEIGHT = 1000
const Z_INDEX = 5

// Point constants
const POINT_SIZE = 7

// Center constants
var CENTER_RADIUS = 50
var MAX_RADIUS = 50
var inactive_radius = 35

// Movement constants
var STEP_SIZE = 4

var divCanvas = lively.query(this, "#divCanvas")
var canvas = lively.query(this, "#my-canvas")
canvas.width = MAX_WIDTH
canvas.height = MAX_HEIGHT
canvas.style.position = "absolute"
//const canvas = this.parentElement.querySelector('canvas')
//const ctx = canvas.getContext('2d')

var svg = lively.query(this, '#svg')
svg.style.position = "absolute"
svg.style.width = MAX_WIDTH
svg.style.height = MAX_HEIGHT
svg.style.zIndex = Z_INDEX

var activeDrawBorders = {min_width: MAX_WIDTH * 0.2, max_width: MAX_WIDTH, min_height: 0, max_height: MAX_HEIGHT }
var inactiveDrawBorders = {min_width: 10, max_width: MAX_WIDTH * 0.2, min_height: 20 + inactive_radius, max_height: MAX_HEIGHT }

var themesDict = {}


var notActiveSvg = lively.query(this, "#not-active")
//notActiveSvg.style.width = "auto"
notActiveSvg.style.position = "absolute"
notActiveSvg.style.float = "left"
notActiveSvg.style.height = MAX_HEIGHT
notActiveSvg.style.width = MAX_WIDTH * 0.2 + "px"
notActiveSvg.margin = "10px"
notActiveSvg.style.border = "1px dashed black"


var velocitySlider = lively.query(this, "#velocity-slider")
var velocityText = lively.query(this, "#velocity-text")

var minRadiusSlider = lively.query(this, "#min-radius-slider")
var minRadiusText = lively.query(this, "#min-radius-text")

var maxRadiusSlider = lively.query(this, "#max-radius-slider")
var maxRadiusText = lively.query(this, "#max-radius-text")

var fadeFactorSlider = lively.query(this, "#fade-factor-slider")


var singleThemeBubbleSize = lively.query(this, '#singleTheme')
var totalCountThemeBubbleSize = lively.query(this, '#totalCountTheme')
var themeBubbleSizeSelect = lively.query(this, '#themeBubbleSizeSelect')
var unisizeThemeBubbleSize = lively.query(this, "#unisize")
unisizeThemeBubbleSize.checked = true

var randomMovementSelect = lively.query(this, "#randomMovement")
randomMovementSelect.checked = true
var smallMovementSelect = lively.query(this, "#smallMovement")

var d3Svg = d3.select(svg)
var width = svg.width
var height = svg.height

var curThemeBubbleSizeStyle = "unisize"
var curInsideThemeBubbleStrategy = "randomMovement"

var fadeFactor = 50
var maximumWaitTime = 1000 // 1 sec - for one aging step 


// initialize context

var world = this
var context = canvas.getContext("webgl") 

// initialize helper objects

var regl = new ReGL(context)

var fbo = regl.regl.framebuffer({
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    colorFormat: 'rgba',
    depth: false,
    stencil: false,
  })
  
var pastFbo = regl.regl.framebuffer({
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    colorFormat: 'rgba',
    depth: false,
    stencil: false,
  })
  
  
const drawFbo = regl.regl({
    framebuffer: fbo,
    frag: `
      precision mediump float;
      varying vec4 fragColor;
      
      void main () {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);

        if (r > 1.0) {
          discard;
         //gl_FragColor = vec4(0.0,0.0,0.0, 0.2);
        //} else if (r > 0.8) {
          //gl_FragColor = vec4(0.0, 0.0, 0.0, 1);
        } else {
          gl_FragColor = vec4(fragColor[0], fragColor[1], fragColor[2], 0.5);
        }
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
        position: function(context, props) {
          return props.points.map(function(point) {
            return [point.drawing.x, point.drawing.y];
          });
        },
        color: function(context, props) {
          return props.points.map(function(point) {
            let c = point.drawing.color
            return [c.r/255.0, c.g/255.0, c.b/255.0, c.opacity];
          });
        },
        pointWidth: function(context, props) {
          return props.points.map(function(point) {
            return point.drawing.size;
          });
        }
      },

      uniforms: {
        stageWidth: regl.regl.context("drawingBufferWidth"),
        stageHeight: regl.regl.context("drawingBufferHeight"),
      },

      count: function(context, props) {
        return props.points.length;
      },
      primitive: "points"
      
  })


const saveToPastBuffer = regl.regl({
    framebuffer: pastFbo,
    frag: `
    precision mediump float;
    uniform sampler2D texture;
    uniform float opacity;
    varying vec2 uv;
    void main () {
    
      gl_FragColor = vec4(floor(255.0 * texture2D(texture,uv) * opacity) / 255.0);
    }`,

    vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = vec2(1.0 - position.x, 1.0 - position.y);
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },
    uniforms: {
      texture: fbo,
      opacity: regl.regl.prop('opacity')
    },
    count: 3    
})
  
const drawBuffer = (sourceBuffer, targetBuffer) => regl.regl({
    framebuffer: targetBuffer,
    frag: `
    precision mediump float;
    uniform sampler2D texture;
    varying vec2 uv;
    void main () {
      gl_FragColor = texture2D(texture, uv);
    }`,

    vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = vec2(1.0 - position.x, 1.0 - position.y);
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      texture: sourceBuffer
    },
    count: 3    
})

const clearBuffer = (buffer) => regl.regl.clear({
        color: [1.0, 1.0, 1.0, 1.0],
        depth: 1,
        stencil: 0,
        framebuffer: buffer
  })

const clearCanvas = clearBuffer(pastFbo)
const drawPastToCurrent = drawBuffer(pastFbo, fbo)
const drawCurrentToScreen = drawBuffer(fbo, null)

var node
var themes
var activeThemeCounts = {}
var d3Centers = [];
var individuals = []

velocitySlider.oninput = function() {
  let value = this.value
  velocityText.innerHTML = value
  STEP_SIZE = +value
};

minRadiusSlider.oninput = function() {
  let value = this.value
  minRadiusText.innerHTML = value
  CENTER_RADIUS = +value
  updateNodes()
};

maxRadiusSlider.oninput = function() {
  let value = this.value
  maxRadiusText.innerHTML = value
  MAX_RADIUS = +value
  updateNodes()
};

fadeFactorSlider.oninput = function() {
  let value = this.value
  fadeFactor = +value
};

singleThemeBubbleSize.onclick = function(){
  if (singleThemeBubbleSize.checked) {
    curThemeBubbleSizeStyle = "singleTheme"
    totalCountThemeBubbleSize.checked = false
    unisizeThemeBubbleSize.checked = false
  } else {
    curThemeBubbleSizeStyle = "unisize"
    unisizeThemeBubbleSize.checked = true
  }
  updateNodes()
};

totalCountThemeBubbleSize.onclick = function(){
  if (totalCountThemeBubbleSize.checked) {
    curThemeBubbleSizeStyle = "totalCountTheme"
    singleThemeBubbleSize.checked = false
    unisizeThemeBubbleSize.checked = false
  } else {
    curThemeBubbleSizeStyle = "unisize"
    unisizeThemeBubbleSize.checked = true
  }
  updateNodes()
};

unisizeThemeBubbleSize.onclick = function(){
  if (unisizeThemeBubbleSize.checked) {
    curThemeBubbleSizeStyle = "unisize"
    singleThemeBubbleSize.checked = false
    totalCountThemeBubbleSize.checked = false
  } else {
    unisizeThemeBubbleSize.checked = true
    lively.notify("To disable unisize Theme Bubble Size select other Theme Bubble Size option.")
  }
  updateNodes()
}

randomMovementSelect.onclick = function(){
  if (randomMovementSelect.checked) {
    curInsideThemeBubbleStrategy = "randomMovement"
    smallMovementSelect.checked = false
  } else {
    curInsideThemeBubbleStrategy = "smallMovement"
    smallMovementSelect.checked = true
  }
};

smallMovementSelect.onclick = function(){
  if (smallMovementSelect.checked) {
    curInsideThemeBubbleStrategy = "smallMovement"
    randomMovementSelect.checked = false
  } else {
    curInsideThemeBubbleStrategy = "randomMovement"
    randomMovementSelect.checked = true
  }
};


 
(async () => {
  let data = await AVFParser.loadCovidData();
  individuals = data
  let points = initData(individuals)
  /*for (var i = 0; i < 20; i++) {
    individuals = individuals.concat(data)
  }*/
  themes = individuals.map( individual => individual.themes['L3'])
  themes = new Set(themes.flat())
  themes = Array.from(themes)
  themes.sort()
  themes.push("no_active_theme")
  


  themes.forEach(theme => {
    themesDict[theme] = getRandomCoords(inactiveDrawBorders.min_width, inactiveDrawBorders.max_width, inactiveDrawBorders.min_height, inactiveDrawBorders.max_height)
    themesDict[theme]["active"] = false
    themesDict[theme]["radius"] = themesDict[theme].active? CENTER_RADIUS : inactive_radius
    themesDict[theme]["grouped"] = false
    themesDict[theme]["group"] = false
    themesDict[theme]["tag"] = ""
  })
  
  Object.keys(themesDict).forEach(theme => {
    let elem = themesDict[theme]
        elem["theme"] = theme
        d3Centers.push(elem)
  })
  
    activeThemeCounts = calculateActiveThemeCounts(themes, individuals)

  
  node = d3Svg
    .append("g")
    .selectAll(".circle")
    .data(d3Centers)
    .enter()
    .append('g')
    .classed('circle', true)
    .attr("transform", function(d) { return 'translate('+ [d.x, d.y] + ')' })
  
  node
    .append("circle")
    .classed("circleForm", true)
    .attr("r", function(d){return d.radius})
    .style("fill", function(d) {return d.active ? "red" : "grey"})
    .style("stroke", function(d) {return d.active ? "darkred" : "black"})
    .style("stroke-width", 2)
    .on("dblclick", function(d) {return d.active? deactivateTheme(d.theme) : activateTheme(d.theme)})
    .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
            groupThemes(getOverlayingThemes(d.theme))
    })
  
  node
    .append("text")
    .classed("circleText", true)
    .attr('dy', function(d){return d.radius})
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .style("fill", function(d) {return d.active ? "red" : "grey"})
    .text(function(d) {return (d.tag != "") ? d.tag : d.theme})
  
  
  node.call(drag)
  
  let newTargetPosBuffer = {}
  let curTargetPosBuffer = {}
  
  let counter = 0;
  var last_time = performance.now()
  var time_now
  var opacity = 1.0

  regl.regl.frame(({time}) => {
    if (!lively.isInBody(divCanvas)) return;
    
    // 1. clear buffers. somehow the points get really jumbled up and disappear when fbo is cleared too quickly (needs some testing, maybe adding depth and stencil resolved it)
    if (counter >= 3) {
      clearBuffer(fbo)
      counter = 0
    }
    counter++
    
    regl.regl.clear({color: [1.0, 1.0, 1.0, 1.0]})

    
    // 2. load pastFbo to fbo
    fbo.use(() => {
      drawPastToCurrent()    
    })
    
    // 3. draw new points to fbo
    drawPointsWithNewCoordinates(points, newTargetPosBuffer, curTargetPosBuffer)


    // 4. draw fbo to screen
    drawCurrentToScreen()
    
    time_now = performance.now()
    if (fadeFactor == 0) {
      opacity = 1.0
    } else if (fadeFactor == 100) {
      opacity = 0.0
    } else if (time_now - last_time > maximumWaitTime - fadeFactor * 100) {
      last_time = time_now
      opacity = 0.99
    } else {
      opacity = 1.0
    }
    
    
    // 5. put fbo to pastFbo and update transparency
    pastFbo.use(() => {
      saveToPastBuffer({
        opacity: opacity
      })    
    })
    
    
  })
})();



function calculateActiveThemeCounts(themes, individuals) {

  let activeThemeCounts = {}
  let activeThemes = themes.filter(isActive)
  activeThemes.forEach( theme => activeThemeCounts[theme] = {})
  individuals.forEach( individual => {
    let individualActiveThemes = individual.themes.L3.filter(isActive)
    individualActiveThemes.forEach( theme => {
      activeThemeCounts[theme].totalCount = (activeThemeCounts[theme].totalCount || 0) + 1
      activeThemeCounts.totalCount = (activeThemeCounts.totalCount || 0) + 1
    })
    if (individualActiveThemes.length == 1) {
      activeThemeCounts[individualActiveThemes[0]].singleCount = (activeThemeCounts[individualActiveThemes[0]].singleCount || 0) + 1
    }
    
  })
  return activeThemeCounts
}

function getOverlayingThemes(ontopTheme) {
  let overlayingThemes = []
  themes.forEach(theme => {
    let d = calculateDistance(theme, ontopTheme)
    if (d <= themesDict[theme].radius + themesDict[ontopTheme].radius) {
      overlayingThemes.push(theme)
    }
  })
  return overlayingThemes
}

function calculateDistance(theme1, theme2) {
  return Math.hypot(themesDict[theme2].x - themesDict[theme1].x, themesDict[theme2].y - themesDict[theme1].y)
}

function groupThemes(groupThemes) {
  groupThemes.forEach(theme => {
    if (themesDict[theme].grouped) deactivateThemeGroup(getGroup(theme))
      themesDict[theme].grouped = true
      themesDict[theme].active = true
  })
  activeThemeCounts = calculateActiveThemeCounts(themes, individuals)
  createJoinedTheme(groupThemes)
  updateGroupedThemeActiveThemeCount(groupThemes)
  updateNodes()
}

function getGroup(theme){
  let group
  Object.keys(themesDict).forEach(themeKey =>{
    if (themesDict[themeKey].group && themeKey.includes(theme)) group = themeKey
  })
  return (group || theme)
}

function createJoinedTheme(themes){
  themes.sort()
  let activeTheme = themes.find(theme => inside({x: themesDict[theme].x, y: themesDict[theme].y}, activeDrawBorders))
  themesDict[themes] = {x: themesDict[activeTheme].x, y: themesDict[activeTheme].y}
  themesDict[themes]["active"] = true
  themesDict[themes]["radius"] = CENTER_RADIUS
  themesDict[themes]["grouped"] = false
  themesDict[themes]["tag"] = ""
  themesDict[themes]["group"] = true
  themes.forEach(theme => {
    themesDict[theme].x = themesDict[themes].x
    themesDict[theme].y = themesDict[themes].y
  })
  let elem = themesDict[themes]
  elem["theme"] = themes.sort().join(",")
  d3Centers.push(elem)
}

function updateGroupedThemeActiveThemeCount(themes) {
  themes.sort()
  activeThemeCounts[themes] = {totalCount: 0, singleCount: 0}
  themes.forEach(theme => {
    activeThemeCounts[themes].totalCount += activeThemeCounts[theme].totalCount
    activeThemeCounts[themes].singleCount += activeThemeCounts[theme].singleCount
  })
}

function activateTheme(theme, updateCoordinates = true) {

  if (updateCoordinates) {
    updateCoordinatesTheme(theme, activeDrawBorders)
  }
  themesDict[theme].active = true
  updateNodes()
}



function deactivateTheme(theme, updateCoordinates = true) { 
  if (!themesDict[theme]) return
  if (themesDict[theme].group) {
    deactivateThemeGroup(theme, updateCoordinates)
    return
  } 
  if (updateCoordinates) {
    updateCoordinatesTheme(theme, inactiveDrawBorders)
  }
  themesDict[theme].active = false
  updateNodes()
}

function deactivateThemeGroup(theme, updateCoordinates) {
  let groupedThemes = theme.split(",")
  groupedThemes.forEach(groupedTheme => {
    themesDict[groupedTheme].grouped = false
    deactivateTheme(groupedTheme, true)
  })
  deleteThemeGroup(theme)
  updateNodes()
}

function deleteThemeGroup(themeGroup) {
  delete themesDict[themeGroup]
  d3Centers.splice(d3Centers.findIndex(center => center.theme === themeGroup), 1)
}

function updateCoordinatesTheme(theme, drawBorders) {
    let newCoords = getRandomCoords(drawBorders.min_width, drawBorders.max_width, drawBorders.min_height, drawBorders.max_height)
    themesDict[theme].x = newCoords.x
    themesDict[theme].y = newCoords.y
}

function updateCoordinatesThemesInCircle(themes) {
  let count = themes.length
  let angle = (2 * Math.PI) / count
  let middlePoint = calculateMiddlePointOfDrawBorders(activeDrawBorders)
  let radius = calculateRadiusOfDrawBorders(activeDrawBorders, 0.5)
  
  for (var i = 0; i < count; i++) {
    let curAngle = i * angle
    let x = middlePoint.x + radius * Math.cos(curAngle)
    let y = middlePoint.y + radius * Math.sin(curAngle)
    themesDict[themes[i]].x = x
    themesDict[themes[i]].y = y
  }
  updateNodes()
}

function calculateMiddlePointOfDrawBorders(drawBorders) {
  return {x: drawBorders.min_width + (drawBorders.max_width - drawBorders.min_width) / 2, y: drawBorders.min_height + (drawBorders.max_height - drawBorders.min_height) / 2}
}

function calculateRadiusOfDrawBorders(drawBorders, factor = 1) {
  let minDist = drawBorders.max_height - drawBorders.min_height < drawBorders.max_width - drawBorders.min_width ? drawBorders.max_height - drawBorders.min_height : drawBorders.max_width - drawBorders.min_height
  return (minDist / 2) * factor
}

function inside(position, drawBorders) {
  return (position.x >= drawBorders.min_width && position.x <= drawBorders.max_width && position.y >= drawBorders.min_height && position.y <= drawBorders.max_height)
}

function updateThemeRadius(sizeStyle = "unisize") {

  activeThemeCounts = calculateActiveThemeCounts(themes, individuals)
  let radiusFunc = unisizeRadius
  if (sizeStyle == "singleTheme") {
    radiusFunc = calculateSingleThemeRadius
  } else if (sizeStyle == "totalCountTheme") {
    radiusFunc = calculateTotalCountThemeRadius
  }
  //debugger
  Object.keys(themesDict).forEach( theme =>
    themesDict[theme]["radius"] = radiusFunc(theme)
  )
  
}

let unisizeRadius = function(theme) {
  if (!isActive(theme)) return inactive_radius
  return CENTER_RADIUS
}

let calculateSingleThemeRadius = function(theme) {
  if (!isActive(theme)) return inactive_radius
  return CENTER_RADIUS + (MAX_RADIUS - CENTER_RADIUS) * (activeThemeCounts[theme].singleCount || 0) / activeThemeCounts.totalCount
}

let calculateTotalCountThemeRadius = function(theme) {
  if (!isActive(theme)) return inactive_radius
  return CENTER_RADIUS + (MAX_RADIUS - CENTER_RADIUS) * activeThemeCounts[theme].totalCount / activeThemeCounts.totalCount
}

function updateNodes(sizeStyle = "unisize") {
  
  updateThemeRadius(curThemeBubbleSizeStyle)
  //debugger
  node = d3Svg
    .selectAll(".circle")
    .data(d3Centers)
    
    
  node.exit().remove()
    
  var enter = node.enter()
    .append("g")
    .classed('circle', true)
    .attr("transform", function(d) { return 'translate('+ [d.x, d.y] + ')' })

  enter
    .append("circle")
    .classed("circleForm", true)
    .style("stroke-width", 2)
    .on("dblclick", function(d) {return d.active? deactivateTheme(d.theme) : activateTheme(d.theme)})
    .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
            groupThemes(getOverlayingThemes(d.theme))
    })
    
  enter
    .append("text")
    .classed("circleText", true)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .text(function(d) {return (d.tag != "") ? d.tag : d.theme})
      
  node = node.merge(enter)
    .attr("transform", function(d) { return 'translate('+ [d.x, d.y] + ')' })
  
  
    
  node
    .selectAll('.circleForm')
    .attr("r", function(d) {return d.radius})
    .style("opacity", function(d) {return d.grouped ? 0.0 : 0.4})
    .style("fill", function(d) {return d.active ? "red" : "grey"}) 
    .style("stroke", function(d) {return d.active ? "darkred" : "black"})
  
  node
    .selectAll('.circleText')
    .style("opacity", function(d) {return d.grouped ? 0.0 : 1.0})
    .attr('dy', function(d){return d.radius})
    .style("fill", function(d) {return d.active ? "red" : "grey"})
    
  node.call(drag)
}


function randomFromInterval(min, max) {
  return Math.random() * (max - min) + min
}

function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max))
}

function getRandomCoords(min_width = 0, max_width = MAX_WIDTH, min_height = 0, max_height = MAX_HEIGHT) {
  return {x: randomIntFromInterval(min_width, max_width), y: randomIntFromInterval(min_height, max_height)}
}

function initData(data) {
  let result = data
  
  for (var i = 0; i < result.length; i++) {
    let x = randomIntFromInterval(2 * CENTER_RADIUS, MAX_WIDTH - 2 * CENTER_RADIUS)
    let y = randomIntFromInterval(2 * CENTER_RADIUS, MAX_HEIGHT - 2 * CENTER_RADIUS)
    let c = d3.rgb(255,0,0)
    c["opacity"] = 1
    result[i]["drawing"] = {
      id: i,
      y: y,
      x: x,
      sy: y,
      sx: x,
      highlighted: false,
      size: POINT_SIZE,
      color: c,
      defaultColor: d3.rgb(255,0,0),
      nextThemePointDestination: 0
    };
  }
  
  return result

}

const drawPointsWithNewCoordinates = (points, newTargetPosBuffer, curTargetPosBuffer) => { 
  
  points.forEach((point) => {
      let newTargetPosition = getTargetPosition(points, point, STEP_SIZE, newTargetPosBuffer, curTargetPosBuffer)
      point.drawing.x = newTargetPosition.x
      point.drawing.y = newTargetPosition.y
  });
  
  fbo.use(() => {
    drawFbo({
      points: points
    })
  })
}

function reachedTargetPos(targetPos, point, stepsize) {
  return Math.abs(targetPos.x - point.drawing.x) <= themesDict[getTargetTheme(point)].radius && Math.abs(targetPos.y - point.drawing.y) <= themesDict[getTargetTheme(point)].radius
}

function getTargetTheme(point) {
  return point.themes.L3[point.drawing.nextThemePointDestination]
}

function getNextThemePointIndex(point) {
  //return randomIntFromInterval(0, point.themes.L3.length - 1)
  return (point.drawing.nextThemePointDestination + 1) % point.themes.L3.length
}

function getTargetPosByTheme(point) {
  return themesDict[point.themes.L3[point.drawing.nextThemePointDestination]]
}

const isActive = (theme) => themesDict[theme].active

function getTargetPosition(points, point, stepsize, newTargetPosBuffer, curTargetPosBuffer) {
  
  // question 2
  let curTargetPos = getTargetPosByTheme(point)
  
  //question 1
  
  let activeThemes = point.themes.L3.filter(isActive)
  
  if (activeThemes.length == 0) {
    newTargetPosBuffer.x = themesDict["no_active_theme"].x
    newTargetPosBuffer.y = themesDict["no_active_theme"].y
    return newTargetPosBuffer
  }
  
  if (activeThemes.length == 1 && reachedTargetPos(curTargetPos, point, stepsize)) {
  return updateTargetPosBufferInsideThemeBubble(newTargetPosBuffer, curTargetPos, point, activeThemes)
  } else if (!isActive(point.themes.L3[point.drawing.nextThemePointDestination]) || reachedTargetPos(curTargetPos, point, stepsize)) {
    point.drawing.nextThemePointDestination = getNextThemePointIndex(point)
  }

  let xDiff = Math.abs(curTargetPos.x - point.drawing.x)
  let yDiff = Math.abs(curTargetPos.y - point.drawing.y)
  let alpha = 5.0
  
  if (xDiff > yDiff) {
    if (curTargetPos.x - point.drawing.x > 0) {
      newTargetPosBuffer.x = point.drawing.x + stepsize;
    } else {
      newTargetPosBuffer.x = point.drawing.x - stepsize;
    }
    if (curTargetPos.y - point.drawing.y > 0) {
      newTargetPosBuffer.y = point.drawing.y + stepsize * (yDiff / xDiff) * Math.random() * alpha;
    } else {
      newTargetPosBuffer.y = point.drawing.y - stepsize * (yDiff / xDiff) * Math.random() * alpha;
    }
  } else {   
    if (curTargetPos.x - point.drawing.x > 0) {
      newTargetPosBuffer.x = point.drawing.x + stepsize * (xDiff / yDiff) * Math.random() * alpha;
    } else {
      newTargetPosBuffer.x = point.drawing.x - stepsize * (xDiff / yDiff) * Math.random() * alpha;
    }
    if (curTargetPos.y - point.drawing.y > 0) {
      newTargetPosBuffer.y = point.drawing.y + stepsize;
    } else {
      newTargetPosBuffer.y = point.drawing.y - stepsize;
    }
  }
  
  return newTargetPosBuffer
}

function updateTargetPosBufferInsideThemeBubble(newTargetPosBuffer, curTargetPosBuffer, point, activeThemes) {
  if (curInsideThemeBubbleStrategy == "randomMovement") {
    return updateTargetPosInsideThemeBubbleRandom(newTargetPosBuffer, curTargetPosBuffer, point, activeThemes)
  } else if (curInsideThemeBubbleStrategy == "smallMovement") {
    return updateTargetPosInsideThemeBubbleSmallMovement(newTargetPosBuffer, curTargetPosBuffer, point, activeThemes)
  } else {
    lively.notify("No known updateTargetPosBufferInsideThemeBubble strategy given, curInsideThemeBubbleStartegy >>>", curInsideThemeBubbleStrategy)
  }
}

function updateTargetPosInsideThemeBubbleSmallMovement(newTargetPosBuffer, curTargetPosBuffer, point, activeThemes) {
    let inner_radius = 1 //CENTER_RADIUS * 0.8
    let r = Math.sqrt(inner_radius * Math.random())
    let theta = Math.random() * Math.PI * 2;
    newTargetPosBuffer.x = point.drawing.x + r * Math.cos(theta)
    newTargetPosBuffer.y = point.drawing.y + r * Math.sin(theta)
    return newTargetPosBuffer
}

function updateTargetPosInsideThemeBubbleRandom(newTargetPosBuffer,curTargetPosBuffer, point, activeThemes) {
    let inner_radius = themesDict[activeThemes.first].radius * 0.7
    let r = inner_radius * Math.random()
    let theta = Math.random() * Math.PI * 2;
    
    newTargetPosBuffer.x = curTargetPosBuffer.x + r * Math.cos(theta)
    newTargetPosBuffer.y = curTargetPosBuffer.y + r * Math.sin(theta)
    return newTargetPosBuffer
}

function updateTargetPosInsideThemeBubbleLeosStrategy(newTargetPosBuffer, curTargetPosBuffer, point, activeThemes) {
    newTargetPosBuffer.x = point.drawing.x + r * Math.cos(theta)
    newTargetPosBuffer.y = point.drawing.y + r * Math.sin(theta)
    curTargetPosBuffer.x = point.drawing.x + CENTER_RADIUS * Math.cos(theta)
    curTargetPosBuffer.y = point.drawing.y + CENTER_RADIUS * Math.sin(theta)
  
}

var drag = d3.drag().on("drag", function(d, i) {
  clearBuffer(pastFbo)
  
  var dx = d3.event.dx, dy = d3.event.dy
  var newPos = {x: d.x + dx, y: d.y + dy}

  if (inside(newPos, activeDrawBorders) && !d.active) {
    activateTheme(d.theme, false)
  } else if (inside(newPos, inactiveDrawBorders) && d.active) {
    deactivateTheme(d.theme, false)
  } else if (!inside(newPos, activeDrawBorders) && !inside(newPos, inactiveDrawBorders)) {
    return;
  } 
  if (!themesDict[d.theme]) return
  
  d.x += dx
  d.y += dy
  themesDict[d.theme].x = d.x
  themesDict[d.theme].y = d.y
  d.theme.split(",").forEach(theme => {
    themesDict[theme].x = d.x
    themesDict[theme].y = d.y
  })
  d3.select(this).attr("transform", "translate(" + [d.x, d.y] + ")" )
})


</script>