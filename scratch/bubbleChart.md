## Simple Bubble-Chart 

<script>
import {pt} from "src/client/graphics.js"

</script>

<style>

.world {
  position: relative;
  width: 600px;
  height: 400px;
  background-color: white;
  border-left: 2px solid black;
  border-bottom: 2px solid black;
}

.bubble {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: Red;
  border: 1px solid black;
  opacity: 0.7;
}

.bubble .tooltiptext {
  visibility: hidden;
  width: 180px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  display:block;

  /* Position the tooltip */
  position: relative;
  top: -25px;
  left: 30px;
  z-index: -5;
  
  /* Style the tooltip */
  font-size: 12px;
  
}

.bubble:hover .tooltiptext {
  visibility: visible;
}

.world:hover .bubble {
  opacity: 0.1;
}

.world .bubble:hover {
  opacity: 0.6;
}

.xDash {
  width: 2px;
  height: 10px;
  background-color: black;
}

.yDash {
  width: 10px;
  height: 2px;
  background-color: black;
}

.xTag {
  width: 30px;
  text-align: center;
}

.yTag {
  width: 50px;
  text-align: center;
}

.superWorld {
  width: 100vh;
  margin: 5%;
}

.input {
  width: 100%;
}

</style>

<script>
function updateXMax(ele) {
  if(event.key === 'Enter') {
    X_MAX = ele.value;
    console.log("Hallo Leo");
  }
}
</script>

<div class="superWorld"> <div class="world" id="world"></div> </div>
<div id="input"> <input type="number" onkeydown="updateXMax(this)"> </div>


## Legend
- Left: Life Expectancy
- Bottom: gdpPerCapita
- Size: Population

<script>

let world = lively.query(this, "#world");
let worldWidth = lively.getExtent(world).x;
let worldHeight = lively.getExtent(world).y;


let X_MAX = 50000;
const X_MIN = 0;
const Y_MAX = 90;
const Y_MIN = 35;
const NUMBER_DASHES = 8;

let inputXMax = lively.query(this, "#input");



let continent_color = {
  "Asia": "red",
  "Europe": "yellow",
  "Americas": "green",
  "Africa": "blue",
  "Oceania": "gray",
}

for (let i = 0; i < NUMBER_DASHES + 1; i++) {
  createXDash(world, i);
  createXTag(world, i);
  createYDash(world, i);
  createYTag(world, i);
  
}


(async () => {
  let bubbles = await fetchData('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv');
  
  for (let country of bubbles) {
    let x = parseFloat(country.gdpPercap);
    let y = parseFloat(country.lifeExp);
    
    if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
      continue;
    }
    
    let tooltip = <span class="tooltiptext"></span>;
    let bubble = <div class="bubble" id="bubble"></div>;
    
    let bubblePopCount = calculateRadius(parseInt(country.population), 0.005);
    let bubbleExtent = {"x": bubblePopCount, "y": bubblePopCount};
    
    let new_pt = toCorrectCoords(lively.pt(x, y), bubbleExtent);
    
    tooltip.innerHTML = generateTooltipText(country);
    bubble.appendChild(tooltip);
    
    lively.setPosition(bubble, new_pt);
    lively.setExtent(bubble, bubbleExtent);
    bubble.style.backgroundColor = continent_color[country["continent"]]
    world.appendChild(bubble); 
  }
})()


/*MD 
World creation
MD*/
function createXDash(world, i) {
  let xDash = <div class="xDash"></div>;
  world.appendChild(xDash);
  
  let xPos = i * (worldWidth / NUMBER_DASHES);
  let yPos = worldHeight - lively.getExtent(xDash).y / 2;
  
  lively.setPosition(xDash, lively.pt(xPos, yPos));
}

function createYDash(world, i) {
  let yDash = <div class="yDash"></div>;
  world.appendChild(yDash);
  
  let xPos = 0 - lively.getExtent(yDash).x / 2;
  let yPos = i * worldHeight / NUMBER_DASHES;
  
  lively.setPosition(yDash, lively.pt(xPos, yPos));
  
}

function createXTag(world, i) {
  let xTag = <div class="xTag"> </div>;
  xTag.textContent =  calculateValueX(i * (worldWidth / NUMBER_DASHES), X_MAX, worldWidth, NUMBER_DASHES);
  world.appendChild(xTag);
  
  let xPos = i * worldWidth / NUMBER_DASHES - lively.getExtent(xTag).x / 2;
  let yPos = worldHeight + lively.getExtent(xTag).y / 2;
  
  lively.setPosition(xTag, lively.pt(xPos, yPos));
}

function createYTag(world, i) {
  let yTag = <div class="yTag"> </div>;
  yTag.textContent =  Y_MIN + i * ((Y_MAX - Y_MIN) / NUMBER_DASHES);
  world.appendChild(yTag);
  
  let xPos = 0 - 1.25 * lively.getExtent(yTag).x;
  let yPos = worldHeight - i * worldHeight / NUMBER_DASHES - lively.getExtent(yTag).y / 2;
  
  lively.setPosition(yTag, lively.pt(xPos, yPos));
}


/*MD
More Helpers
MD*/
function generateTooltipText(country) {
  let tooltipText = "";
  
  tooltipText += "<b>" + country.country + "</b> <br>";
  tooltipText += "GDP p capita $: " + parseFloat(country.gdpPercap).toFixed(3) + "<br>";
  tooltipText += "Life Exp in years: " + parseFloat(country.lifeExp).toFixed(1) + "<br>";
  tooltipText += "Population in Mio: " + (parseInt(country.population) / 1000000).toFixed(2);
  
  return tooltipText;
}

function toCorrectCoords(point, extent) {

  //invert y-coords
  point.y = worldHeight - (point.y - Y_MIN) * worldHeight / (Y_MAX - Y_MIN);
  //point.x = (point.x - X_MIN) * worldWidth / (X_MAX - X_MIN);
  point.x = calculateWorldX(point.x, X_MAX, worldWidth, NUMBER_DASHES);
  //point.x = calculateLogWorldX(point.x, X_MAX, worldWidth);
  
  //set center of bubble on point
  
  point.x -= extent.x / 2;
  point.y -= extent.y / 2;
  return point;
}

function calculateRadius(population, factor) {
  return Math.sqrt(population / Math.PI) * factor
}


function calculateLogValueX(worldX, xMax, worldWidth) {
  let valueX = Math.pow(2, worldX / worldWidth * Math.log2(xMax));
  return parseInt(valueX);
}


function calculateLogWorldX(valueX, xMax, worldWidth) {
  let worldX = Math.log2(valueX) / Math.log2(xMax) * worldWidth;
  return worldX;
} 


function calculateValueX(worldX, xMax, worldWidth, numberDashes) {
  let stepSize = worldWidth / numberDashes;
  let valueX = 125 * Math.pow(2, worldX/ stepSize + 1);
  return parseInt(valueX);
}


function calculateWorldX(valueX, xMax, worldWidth, numberDashes) {
  let worldX = (worldWidth / numberDashes) * Math.log2(valueX / 250);
  return parseInt(worldX);
}


async function fetchData(url) {
  const response = await fetch(url);
  const myCSV = await response.text();
  return processData(myCSV);
}


function processData(allText) {
    allText = allText.replace(/['"]+/g, '');
    var record_num = 5;  // or however many elements there are in each row
    var allTextLines = allText.split(/\r\n|\n/);
    var entries = allTextLines[0].split(',');
    
    var lines = [];

    var headings = entries.splice(0,record_num);
    headings[3] = "population";
    allTextLines.shift();
    
    while (allTextLines.length > 1) {
        var cur = allTextLines.shift().split(',');
        var curObject = {};
        for (var j=0; j<record_num; j++) {
            curObject[headings[j]] = cur.shift();
        }
        lines.push(curObject);
    }
    return lines;
}

</script>
 

## Todos

- [X] Hover over bubble gives name and information
- [X] Fade out other bubbles when hovering over one bubble
- [ ] When hovering dotted lines indicated y and x value on the respective axes
- [X] logarithmic scales / correct area values
- [ ] move different scale calculations to functions
- [ ] user adjustable max and min values in diagram
- [ ] time slider


## Documentation

#### Different scales lead to vastly different visualizations

- Linear Scale:


![](pictures/linearScaleBubbleChart.png)

- Purely Logarithmic Scale:

![](pictures/purelyLogarithmicScale.png)


## Legend
- Left: Life Expectancy
- Bottom: gdpPerCapita
- Size: Population <br><br>


- Gapminder Logarithmic Scale:

![](pictures/gapminderLogarithmicScale.png)

