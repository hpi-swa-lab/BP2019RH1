<div id="ourDiv">
  <canvas id="canvas"> </canvas>
</div>



<script>
import FreehandDrawer from './drawFreehand.js'

var div = lively.query(this, "#ourDiv")
var canvas = lively.query(this, "#canvas")

var drawer = new FreehandDrawer(div, canvas)

let listener = {
  drawFinished: (pointList) => {
    console.log(pointList)
  }
}

drawer.addListener(listener)

drawer.start()

setTimeout(stop, 3000)

function stop() {
  drawer.stop()
}




/*// create canvas element and append it to document body
var div = lively.query(this, "#ourDiv")
var canvas = lively.query(this, "#canvas")

// some hotfixes... ( ≖_≖)
//document.body.style.margin = 0;
canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;

// get canvas 2D context and set him correct size
var ctx = canvas.getContext('2d');
resize();

// last known position
var pos = { x: 0, y: 0 };

window.addEventListener('resize', resize);
div.setAttribute("tabindex", 0)
div.addEventListener('mousemove', draw);
div.addEventListener('mousedown', setPosition);
div.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  debugger
  pos.x = e.offsetX;
  pos.y = e.offsetY;
}

// resize canvas
function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c0392b';

  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to

  ctx.stroke(); // draw it!
}*/
</script>