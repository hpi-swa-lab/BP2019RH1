## Timeslider Bubble Chart

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

.sliderContainer {
  margin-top: 5%;
  width: 100%;
  
}

.slider {
    -webkit-appearance: none;  /* Override default CSS styles */
  appearance: none;
  width: 50%; /* Full-width */
  height: 25px; /* Specified height */
  background: #d3d3d3; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
  -webkit-transition: .2s; /* 0.2 seconds transition on hover */
  transition: opacity .2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
  background: #4CAF50; /* Green background */
  cursor: pointer; /* Cursor on hover */
}

.slider::-moz-range-thumb {
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
  background: #4CAF50; /* Green background */
  cursor: pointer; /* Cursor on hover */
}

</style>

<div class="superWorld"> 
  <div class="world" id="world"></div>
  <div class="sliderContainer">
    <button id="timeButton" class="playPauseButton" onclick="toggleTime()">
      Toggle Time
    </button>
    <input type="range" min="1960" max="2011" value="1960" class="slider" id="timeSlider">
  </div>
</div>

## Legend
- Left: Life Expectancy
- Bottom: gdpPerCapita
- Size: Population

<script>
(async () => {


const X_MAX = 50000;
const X_MIN = 0;
const Y_MAX = 90;
const Y_MIN = 35;
const NUMBER_DASHES = 10;

let world = lively.query(this, "#world");
let worldWidth = lively.getExtent(world).x;
let worldHeight = lively.getExtent(world).y;
let slider = lively.query(this, "#timeSlider");
let button = lively.query(this, "#timeButton");

let url = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/Data-Table1.csv';

let bubbles;

let timeTravelStop = true;


  let rawData = await fetchData(url);
  let preprocessedData = processData(rawData);
  bubbles = createCountryObjects(preprocessedData[0], preprocessedData[1]);




initiallyCreateBubbleDivForCountries(bubbles);


function initiallyCreateBubbleDivForCountries(countryObjects) {
  
   Object.keys(countryObjects).forEach( (key) => {
    let country = countryObjects[key];
    let x;
    let y;
    if(country[1960] != ""){
      x = parseFloat(country[1960])
      y = parseFloat(60)
      
      if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
        return;
      }
      
      createBubbleDivForCountry(x,y, 30, "Green", key)
      
    }
    else {
      return;
    }
  });
}


function createBubbleDivForCountry(x, y, extend, color, id){
    let bubble = <div class="bubble" id="bubble"></div>;
    let bubble_pop_count = parseInt(30)
    lively.setExtent(bubble, {"x": extend, "y": extend});
    world.appendChild(bubble);
    let new_pt = toCorrectCoords(lively.pt(x, y), lively.getExtent(bubble))
    lively.setPosition(bubble, new_pt);  
    //bubble.style.backgroundColor = color
    bubble.id = id;
}


function updateBubbleDivsToYear(year) {
  Object.keys(bubbles).forEach( (key) => {
    let bubble = world.querySelector('#' + key);
    let country = bubbles[key];
    let x;
    let y;
    
    if(country[year] != ""){
      x = parseFloat(country[year])
      y = parseFloat(60)
      
      if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
        return;
      }
      
      if (bubble !== null) {
        updateBubbleDivForCountry(x, y, 30, key);
      }
      else {
        createBubbleDivForCountry(x, y, 30, "Green", key)
      }
      
    }
    else {
      if (bubble !== null) {
        bubble.remove()
      } 
      return;
    }
  });
}

function updateBubbleDivForCountry(newX, newY, newExtend, id){
  let bubble = world.querySelector('#' + id);
  lively.setExtent(bubble, {"x": newExtend, "y": newExtend});
  world.appendChild(bubble);
  let new_pt = toCorrectCoords(lively.pt(newX, newY), lively.getExtent(bubble))
  lively.setPosition(bubble, new_pt);
}




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
  xTag.textContent =  i * (X_MAX / NUMBER_DASHES);
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

/*
(async () => {
  let bubbles = await fetchData('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv');
  
  bubbles.forEach(function(country) {
    let x = parseFloat(country.gdpPercap)
    let y = parseFloat(country.lifeExp)
    
    if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
      return;
      console.log(x, y)
    }
    
    let bubble = <div class="bubble" id="bubble"></div>;
    let bubble_pop_count = parseInt(parseInt(country.population) * 0.0000001)
    lively.setExtent(bubble, {"x": bubble_pop_count, "y": bubble_pop_count});
    world.appendChild(bubble);
    let new_pt = toCorrectCoords(lively.pt(x, y), lively.getExtent(bubble))
    lively.setPosition(bubble, new_pt);
    console.log(bubble.style.backgroundColor)  
    bubble.style.backgroundColor = continent_color[country["continent"]]
    
  });
})()

*/
//little helpers

slider.oninput = () => {
  updateBubbleDivsToYear(slider.value)
}

function plotYear(year) {
  updateBubbleDivsToYear(year);
}

function toCorrectCoords(point, extent) {

  //invert y-coords
  point.y = worldHeight - (point.y - Y_MIN) * (worldHeight / (Y_MAX - Y_MIN));
  point.x = point.x / X_MAX * worldWidth
  
  //set center of bubble on point
  
  point.x -= extent.x / 2;
  point.y -= extent.y / 2;
  return point;
}


button.onclick = function() {
  for(let i = 1960; i <= 2011; i++) {
    plotYear(i);
  }
}

function plotYear(year){
  updateBubbleDivsToYear(year)
}


async function fetchData(url) {
  const response = await fetch(url);
  const myCSV = await response.text();
  return myCSV;
}

/*
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
*/

function processData(allText) {
  var countries = allText.split(/\r\n|\n/);
  var years = countries[0].split(";");
  countries.shift();
  years.shift();

  return [years, countries]

}


function createCountryObjects(years, countries) {
  let countryObjects = {};
  countries.forEach(function(country) {
    
    country = country.split(";");
    
    let countryName = country[0];
    countryName = countryName.replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/'/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\"/g, '')
    
    if (countryName == '') {
      return;
    }
    
    country.shift();
    let countryYears = country
    let countryObject = {};
    countryObject.population = "30000000"
    
    years.forEach(function(year, index) {
      
      countryObject[year] = countryYears[index];
      })
    countryObjects[countryName] = countryObject;
  
    })
  return countryObjects;
}


})()
</script>
 

## Todos

- [ ] Hover over bubble gives name and information
- [ ] logarithmic scales / correct area values
- [ ] user adjustable max and min values in diagram
- [ ] time slider
- [ ] REEFAACTOOOR!