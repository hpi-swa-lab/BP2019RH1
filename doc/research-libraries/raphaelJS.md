# RaphaelJS

## Context
### Who uses it?

### Is it maintained?
[Latest release](https://github.com/DmitryBaranovskiy/raphael/releases) 14. August
### What is produced as a visualisation?
A SVG Element.
### Start using it?
Look at the examples. Can be imported via CDN.

## Examples
### Simple test example
```javascript {.raphaelSimpleExample}
import Raphael from "https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.js"
let container = this.parentElement.querySelector("#canvas_container");
var paperSimple = new Raphael(container , 800, 500);
var rectangle = paperSimple.rect(200, 200, 250, 100);
```

Which will produce this...

<script>
import boundEval from "src/client/bound-eval.js";
var source = lively.query(this, ".raphaelSimpleExample").textContent
boundEval(source, this).then(r => r.value)
</script>
<style>
#canvas_container {
  width: 100%;
  height: 400px;
}</style>
<div id="canvas_container"></div>

### Interaction example
```javascript {.raphaelInteractionExample}
import Raphael from "https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.js"
let container = this.parentElement.querySelector("#canvas_container_interaction");



var paperInteraction = new Raphael(container , 800, 500);
var circle = paperInteraction.circle(250, 250, 40);
circle.node.id = "circle";

circle.attr({fill: '#000', stroke: 'none'});

var mousePos = null;

circle.node.onmousedown = function(e) {
    mousePos = {"x": e.clientX, "y": e.clientY}
    this.style.cursor = 'pointer';
};

container.onmouseup = function (e) {

  let newMousePos = {"x": e.clientX, "y": e.clientY}
  
  let mousediff = Math.sqrt(Math.pow(mousePos.x - newMousePos.x, 2) + Math.pow(mousePos.y - newMousePos.y, 2));
  
  this.querySelector("#circle").style.cursor = "auto";
  this.querySelector("#circle").style.r = mousediff * 0.5;

}
""

```

Which will produce this...

<script>
import boundEval from "src/client/bound-eval.js";
var source = lively.query(this, ".raphaelInteractionExample").textContent
boundEval(source, this).then(r => r.value)
</script>
<style>

#canvas_container_interaction {
  width: 100%;
  height: 400px;
}

</style>
<div id="canvas_container_interaction"></div>


### Complex interaction example

```javascript {.raphaelComplexInteractionExample}

import Raphael from "https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.js"
let container = this.parentElement.querySelector("#canvas_container_complex_interaction");

var complexInteraction = new Raphael(container , container.offsetWidth, container.offsetHeight);

var data = {
  'london': {
   'type' : 'rect',
   'x' : 20,
   'y' : 80,
   'width' : 30,
   'height' : 220,
   'fill' : '#bffeaf',
   'stroke' : 'none',
   'stroke-width' : 10
  },
  'plauen': {
   'type' : 'rect',
   'x' : 60,
   'y' : 100,
   'width' : 30,
   'height' : 200,
   'fill' : '#ff45e6',
   'stroke' : 'none',
   'stroke-width' : 5
  },
  'berlin': {
   'type' : 'rect',
   'x' : 100,
   'y' : 140,
   'width' : 30,
   'height' : 160,
   'fill' : '#ff5f13',
   'stroke' : 'none',
   'stroke-width' : 10
  },
  'egenhausen': {
   'type' : 'rect',
   'x' : 140,
   'y' : 135,
   'width' : 30,
   'height' : 165,
   'fill' : '#00e6ff',
   'stroke' : 'none',
   'stroke-width' : 10
  },
  'dubai': {
   'type' : 'rect',
   'x' : 180,
   'y' : 110,
   'width' : 30,
   'height' : 190,
   'fill' : '#e8980c',
   'stroke' : 'none',
   'stroke-width' : 10
  }
  }

let bars = [];
var animationForeground = Raphael.animation({
  'width': complexInteraction.width,
  'height': complexInteraction.height,
  'x': 0,
  'y': 0
}, 500);

var focusedBarAttributes = null;

function drawBars(data) {
  
  Object.keys(data).forEach((city) => {
    var bar = complexInteraction.add([data[city]]);
    bar = bar[0];
    bar.node.id = city;
    bar.node.focus = false;
    bars.push(bar);
  })
}

function focusBar(bar) {
  bar.toFront();
  focusedBarAttributes = {
    'width': bar.attrs.width,
    'height': bar.attrs.height,
    'x': bar.attrs.x,
    'y': bar.attrs.y
  };
  bar.animate(animationForeground)
  var text = complexInteraction.text(300, 20, bar.node.id + JSON.stringify(data[bar.node.id]));
  text.node.id = bar.node.id + '_text';
}

function unfocusBar(bar) {
  
  var animationBackground = Raphael.animation(focusedBarAttributes, 500);
  
  bar.animate(animationBackground);
  
  let text = lively.querySelector('#' + bar.node.id + '_text');
  text.remove();
}

drawBars(data);

bars.forEach((bar) => {
  bar.node.onmousedown = function (e) {
    if(bar.node.focus == true) {
      unfocusBar(bar);
      bar.node.focus=false;
    } else {
      focusBar(bar);
      bar.node.focus = true;
    }
    }
})


""
```

Which will produce this...

<script>
import boundEval from "src/client/bound-eval.js";
var source = lively.query(this, ".raphaelComplexInteractionExample").textContent
boundEval(source, this).then(r => r.value)
</script>

<div id="canvas_container_complex_interaction"></div>

<style>
#canvas_container_complex_interaction {
  width: 100%;
  height: 400px;
}
</style>

## Experience

### Writing text
As text is an svg Element, its easy to display and position text / customize text appearance.
### Customize to needs?
Every element can be adjusted after creation. Animations are possible.
### Ecosystem
Quite useful stack overflow answers and other documentations. Every problem we encountered could be solved with googling.