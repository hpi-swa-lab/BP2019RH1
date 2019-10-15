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

</style>

<div class="superWorld"> <div class="world" id="world"></div> </div>

## Legend
- Left: Life Expectancy
- Bottom: gdpPerCapita
- Size: Population

<script>

let world = lively.query(this, "#world");
let worldWidth = lively.getExtent(world).x;
let worldHeight = lively.getExtent(world).y;

const X_MAX = 50000;
const X_MIN = 0;
const Y_MAX = 90;
const Y_MIN = 35;
const NUMBER_DASHES = 8;

let continent_color = {
  "Asia": "red",
  "Europe": "yellow",
  "Americas": "green",
  "Africa": "blue",
  "Oceania": "gray",
}

for (let i = 0; i < NUMBER_DASHES + 1; i++) {
  let xDash = <div class="xDash"></div>;
  world.appendChild(xDash);
  let xDashHeight = lively.getExtent(xDash).y;
  lively.setPosition(xDash, lively.pt(i * (worldWidth / NUMBER_DASHES),worldHeight - xDashHeight/2 ));
  
  let xTag = <div class="xTag"> </div>;
  xTag.textContent =  calculateValueX(i * (worldWidth / NUMBER_DASHES), X_MAX, worldWidth, NUMBER_DASHES);
  world.appendChild(xTag);
  let xTagWidth = lively.getExtent(xTag).x;
  lively.setPosition(xTag, lively.pt(i * (worldWidth / NUMBER_DASHES) - xTagWidth / 2,worldHeight + xDashHeight ));
  
  let yDash = <div class="yDash"></div>;
  world.appendChild(yDash);
  let yDashWidth = lively.getExtent(yDash).x;
  lively.setPosition(yDash, lively.pt(0 - yDashWidth/2, i * (worldHeight / NUMBER_DASHES)));
  
  let yTag = <div class="yTag"> </div>;
  yTag.textContent =  Y_MIN + i * ((Y_MAX - Y_MIN) / NUMBER_DASHES);
  world.appendChild(yTag);
  let yTagWidth = lively.getExtent(yTag).x;
  let yTagHeight = lively.getExtent(yTag).y;
  lively.setPosition(yTag, lively.pt(0 - yDashWidth - yTagWidth, worldHeight - i * (worldHeight / NUMBER_DASHES) - yTagHeight / 2));
  
}


(async () => {
  let bubbles = await fetchData('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv');
  
  console.log(bubbles.length)
  
  /*for (let country of bubbles) {
    debugger 
    let x = parseFloat(country.gdpPercap)
    let y = parseFloat(country.lifeExp)
    
    if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
      return;
    }
    
    let tooltip = <span class="tooltiptext"></span>;
    let bubble = <div class="bubble" id="bubble"></div>;
    
    let bubblePopCount = calculateRadius(parseInt(country.population), 0.005)
    let bubbleExtent = {"x": bubblePopCount, "y": bubblePopCount}
    
    let new_pt = toCorrectCoords(lively.pt(x, y), bubbleExtent);
    
    tooltip.innerHTML = generateTooltipText(country);
    bubble.appendChild(tooltip);
    
    lively.setPosition(bubble, new_pt);
    lively.setExtent(bubble, bubbleExtent);
    bubble.style.backgroundColor = continent_color[country["continent"]]
    world.appendChild(bubble); 
  } */
  
  bubbles.forEach(function(country) {
    let x = parseFloat(country.gdpPercap)
    let y = parseFloat(country.lifeExp)
    
    if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
      return;
    }
    
    let tooltip = <span class="tooltiptext"></span>;
    let bubble = <div class="bubble" id="bubble"></div>;
    
    let bubblePopCount = calculateRadius(parseInt(country.population), 0.005)
    let bubbleExtent = {"x": bubblePopCount, "y": bubblePopCount}
    
    let new_pt = toCorrectCoords(lively.pt(x, y), bubbleExtent);
    
    tooltip.innerHTML = generateTooltipText(country);
    bubble.appendChild(tooltip);
    
    lively.setPosition(bubble, new_pt);
    lively.setExtent(bubble, bubbleExtent);
    bubble.style.backgroundColor = continent_color[country["continent"]]
    world.appendChild(bubble); 
  });
})()


//little helpers

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


//so we tried "pure" logarithm

function calculateLogValueX(worldX, xMax, worldWidth) {
  let valueX = Math.pow(2, worldX / worldWidth * Math.log2(xMax));
  return parseInt(valueX);
}

function calculateLogWorldX(valueX, xMax, worldWidth) {
  let worldX = Math.log2(valueX) / Math.log2(xMax) * worldWidth;
  return worldX;
} 


// then we worked with recurrences

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

