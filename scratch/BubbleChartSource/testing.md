## This File is just for testing



### Testing the CSVAdapter
<script>

import {CSVAdapter} from "./csvAdapter.js";
var url = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/data_gdp.csv'
var csvAdapter = new CSVAdapter();


// testFetching();
// testParsing();

function testParsing(){
  
  (async () => {
    let data = await csvAdapter.fetchData(url);
    data = csvAdapter.parseData(";", data);
    debugger
  })()
  
  
}

async function testFetching(){
  
  var value;
  value = await csvAdapter.fetchData(url);
  console.log(value);
  
}

</script>

### Testing the GapminderDataHandler
<script>
  import {GapminderDataHandler} from "./gapminderDataHandler.js";

  var gapminderDH = new GapminderDataHandler();
  
  //testFetchGDP()
  
  async function testFetchGDP(){
    let value = await gapminderDH.fetchGDP(url);
    console.log(JSON.stringify(value));
  }
  
</script>


### Testing the BubbleChart and DataConfiguration

<style>
#world1 {
  width: 100vh;
  margin-bottom: 50px;
}

#diagramm1 {
  position: relative;
  width: 600px;
  height: 400px;
  background-color: white;
  border-left: 2px solid black;
  border-bottom: 2px solid black;
  margin-left: 20px;
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



</style>

<div id="world1">
  <div id="diagramm1"></div>
</div>

<script>
import {DataConfigurationGDP} from "./dataConfiguration.js";
import {BubbleDiagramm} from "./diagram.js";
import {GapminderDataHandler} from "./gapminderDataHandler.js";

/*
(async () => {
  
  let gapminderDH = new GapminderDataHandler();
  let gdpData = await gapminderDH.fetchGDP(url);
  
  let dataConfigGDP = new DataConfigurationGDP(gdpData);
  let diagrammContainer = lively.query(this, "#diagramm1");
  
  let bubbleDiagramm = new BubbleDiagramm(dataConfigGDP, diagrammContainer);  
  bubbleDiagramm.renderAxis();
})();
*/
</script>

### Testing Bubbles

<style>

#world2 {
  width: 100vh;
  margin-bottom: 50px;
}

#diagramm2 {
  position: relative;
  width: 600px;
  height: 400px;
  background-color: white;
  border-left: 2px solid black;
  border-bottom: 2px solid black;
  margin-left: 20px;
}
</style>

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

<div id="world2">
  <div id="diagramm2"></div>
</div>

<script>

import {DataConfigurationGDP, DataConfigurationBMI, DataConfigurationBirths} from "./dataConfiguration.js";
import {BubbleDiagramm} from "./diagram.js";
import {GapminderDataHandler} from "./gapminderDataHandler.js";


(async () => {
  
  let urlBirth = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/data_births.csv';
  let urlBMI = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/data_bmi.csv';
  let urlGDP = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/data_gdp.csv';
  
  let gapminderDH = new GapminderDataHandler();
  
  let dataGDP = await gapminderDH.fetchGDP(urlGDP);
  let dataBirth = await gapminderDH.fetchBirth(urlBirth);
  let dataBMI = await gapminderDH.fetchBMI(urlBMI);
  
  let dataConfigGDP = new DataConfigurationGDP(dataGDP);
  let dataConfigBMI = new DataConfigurationBMI(dataBMI);
  let dataConfigBirth = new DataConfigurationBirths(dataBirth);
  
  let diagrammContainer = lively.query(this, "#diagramm2");
  
  let bubbleDiagramm = new BubbleDiagramm(dataConfigGDP,  dataConfigBMI, dataConfigBirth, diagrammContainer);
  
  bubbleDiagramm.renderAxis();
  
  console.log(JSON.stringify(bubbleDiagramm.renderData()));
})();

</script>








