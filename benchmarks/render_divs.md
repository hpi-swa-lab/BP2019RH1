# Rendering plain div Elements

<style>
.dot {
  height: 6px;
  width: 6px;
  background-color: #bbb;
  border-radius: 50%;
  position: absolute;
}

#container {
  width: 800px;
  height: 800px;
  position: relative;
}
</style>

<div id="container"></div>

<script>
import d3 from "src/external/d3.v5.js";
let world = this
let data = d3.range(10000)
let width = 800
let height = 800

let container = lively.query(this, "#container")

/*********************************
PLAIN
*********************************/

data.forEach( point => {
  appendDot()
})

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function appendDot() {
  let newElement =  <span class="dot"></span>;
  newElement.style.top = getRandomFloat(0,800)+"px"
  newElement.style.left = getRandomFloat(0,800)+"px"
  debugger;
  container.appendChild(newElement);
}


</script>