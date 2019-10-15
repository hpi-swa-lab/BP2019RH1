## This File is just for testing



### Testing the CSVAdapter
<script>

import {CSVAdapter} from "./csvAdapter.js";
var url = 'https://lively-kernel.org/lively4/BP2019RH1/scratch/Data-Table1.csv'
let csvAdapter = new CSVAdapter();


// testFetching();
testParsing();

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

  let gapminderDH = new GapminderDataHandler();
  
  testFetchGDP()
  
  async function testFetchGDP(){
    let value = await gapminderDH.fetchGDP(url);
    console.log(JSON.stringify(value));
  }
  
</script>
