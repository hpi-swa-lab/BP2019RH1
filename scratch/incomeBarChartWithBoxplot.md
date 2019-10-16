# Income distribution

Data comes from the [gapminder](https://www.gapminder.org/data/) page where at *Select an indicator* I chose *Income per person (GDP/capita, PPP$ inflation-adjusted)*.

<script>
import {pt} from "src/client/graphics.js";
import {CSVAdapter} from "./BubbleChartSource/csvAdapter.js";

let csvAdapter = new CSVAdapter();

async function readData() {
  let rawData = await csvAdapter.fetchData("https://lively-kernel.org/lively4/BP2019RH1/scratch/income_per_person_gdppercapita_ppp_inflation_adjusted.csv");
  let data = csvAdapter.parseData(",", rawData);
}
</script>