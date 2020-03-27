# Income distribution

Data comes from the [gapminder](https://www.gapminder.org/data/) page where at *Select an indicator* I chose *Income per person (GDP/capita, PPP$ inflation-adjusted)*.

<style>
.bar {
  width: 600px;
  height: 10px;
  background-color: blue;
}

.world {
  position: relative;
  width: 600px;
  height: 1000px;
  background-color: lightgray;
}
</style>

<div class="world" id="world"></div>div>

<script>
import {pt} from "src/client/graphics.js";
import {CSVAdapter} from "../BubbleChartSource/csvAdapter.js";

let csvAdapter = new CSVAdapter();

async function readData() {
  let rawData = await csvAdapter.fetchData("https://lively-kernel.org/lively4/BP2019RH1/scratch/income_per_person_gdppercapita_ppp_inflation_adjusted.csv");
  let data = csvAdapter.parseData(",", rawData);
  return data;
}

async function getDataOfYear(year) {
  let data = await readData();
  let dataOfCurrentYear = [];
  for (let i = 1; i < data.length; i++) {
    dataOfCurrentYear.push(parseInt(data[i][year], 10));
  }
  return dataOfCurrentYear;
}

(async () => {
  let dataOfYear = await getDataOfYear(1);
  let world = lively.query(this, "#world");
  world.style.height = (dataOfYear.length * 10).toString() + "px";
  let maxWidth = lively.getExtent(world).x;
  let max = dataOfYear.max();
  let bars = [];
  for (let i = 0; i < dataOfYear.length; i++) {
    let bar = <div class = "bar"></div>;
    bar.style.width = Math.floor((maxWidth / max) * dataOfYear[i]).toString() + "px";
    bars.push(bar);
  }
  for (let i = 0; i < bars.length; i++) {
    let bar = bars[i];
    world.appendChild(bar);
    lively.setPosition(bar, pt(0, i * 10));
  }
  debugger
})();
""
</script>