## This File is just for testing



### Testing the CSVAdapter
<script>

import {CSVAdapter} from "./csvAdapter.js";
var url = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/Data-Table1.csv'
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
#diagramm {
  position: relative;
  width: 600px;
  height: 400px;
  background-color: white;
  border-left: 2px solid black;
  border-bottom: 2px solid black;
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

<div id="diagramm"></div>

<script>
import {DataConfigurationGDP} from "./dataConfiguration.js";
import {BubbleDiagramm} from "./diagram.js";
import {GapminderDataHandler} from "./gapminderDataHandler.js";


(async () => {
  
  let gapminderDH = new GapminderDataHandler();
  let gdpData = await gapminderDH.fetchGDP(url);
  
  debugger;

  let dataConfigGDP = new DataConfigurationGDP(gdpData);
  let diagrammContainer = lively.query(this, "#diagramm");
  
  


  let bubbleDiagramm = new BubbleDiagramm(dataConfigGDP, diagrammContainer);  
  bubbleDiagramm.renderAxis();
})();
</script>









