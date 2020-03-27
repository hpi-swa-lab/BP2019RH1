# ChartJS

## Context
### Information

ChartJs is a lightweight visualization library for diagrams. It allows you to create different types of charts from data sets such as bar charts, pie, line, donut, scatters, and [many more](https://www.chartjs.org/samples/latest/).

### Who uses it?
- Bosch Software Innovations / Bosch BCI


### Is it maintained?
Yes, released frequently, last release was march 2019. MIT Licenced.
![](Screenshot%202019-10-22%20at%2017.14.27.png)

### What is produced as a visualisation?
The charts are drawn on a canvas.

### Others
It can be installed via a CDN, as seen below. One does not have to pay for usage. 
## Examples
### Simple test plot

```javascript {.chartExample}
import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js"

var ctx = this.parentElement.querySelector('#demoChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [10, 10, 5, 2, 20, 200, 45]
        }]
    },

    // Configuration options go here
    options: {}
});
```

Which will produce this...

<script>
import boundEval from "src/client/bound-eval.js";
var source = lively.query(this, ".chartExample").textContent
boundEval(source, this).then(r => r.value)
</script>
<canvas id="demoChart"></canvas>


### Plot real data with multiple datasets




</script>

```javascript {.chartExampleOwnData}
import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js";
import { CSVAdapter } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/BubbleChartSource/csvAdapter.js";

var csvAdapter = new CSVAdapter();
var url = "https://lively-kernel.org/lively4/BP2019RH1/scratch/data_births.csv";

var data;
(async () => {

  data = await csvAdapter.fetchData(url);
  var lines = csvAdapter.parseData(';', data);
  var years = lines[0];
  var oneCountry = lines[2];
  var secondCountry = lines[15];
  var ctx = this.parentElement.querySelector('#ownDataChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: years.slice(1, years.length-1),
        datasets: [{
            label: oneCountry[0],
            backgroundColor: 'rgb(255, 255, 255, 00)',
            borderColor: 'rgb(255, 99, 132)',
            data: oneCountry.slice(1, oneCountry.length - 1)
        },
        {
            label: secondCountry[0],
            backgroundColor: 'rgb(255, 255, 255, 00)',
            borderColor: '2D3EFF',
            data: secondCountry.slice(1, secondCountry.length - 1)
        }]
    },

    // Configuration options go here
    options: {}
});
})()
```

<script>
import boundEval from "src/client/bound-eval.js";
var source = lively.query(this, ".chartExampleOwnData").textContent
boundEval(source, this).then(r => r.value)
</script>
<canvas id="ownDataChart"></canvas>


### Plot live data update

</script>

```javascript {.chartExampleLiveData}
import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js";


var ctx = this.parentElement.querySelector('#liveUpdateData').getContext('2d');
var chart = new Chart(ctx, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
      labels: [0,1,2,3,4,5,6,7,8,9],
      datasets: [{
          label: "Random Data",
          backgroundColor: 'rgb(255, 255, 255, 00)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0,1,2,3,4,5,6,7,8,9]
      }]
  },

  // Configuration options go here
  options: {}
});


function randomizeDataOnChart(){
  let newData = generateRandomData();
  updateChartWithNewData(chart, newData);
}

function generateRandomData(){
  let randArray = [];
  
  for(let i = 0; i<10; i++){
    let randomNumber = Math.random() * 10;
    randArray.push(randomNumber);
  }
  
  return randArray;
}

function updateChartWithNewData(chart, newData){

  chart.data.datasets.forEach((dataset) => {
      dataset.data = newData;
  });
  chart.update();
  
}

let button = this.parentElement.querySelector('#randomizeButton');
button.addEventListener("click", randomizeDataOnChart);
```

<script>
import boundEval from "src/client/bound-eval.js";
var source = lively.query(this, ".chartExampleLiveData").textContent
boundEval(source, this).then(r => r.value)
</script>
<canvas id="liveUpdateData"></canvas>
<button id="randomizeButton">Randomizee meee</button>  

Some Examples can also be found [here](https://tobiasahlin.com/blog/chartjs-charts-to-get-you-started/)

## Experience
- Very easy to learn, very easy to include

### Ecosystem
The documentation / ecosystem on the internet is quite useful and mature. Every problem we had during testing this library could be solved within minutes with the documentation and stack overflow. 
Very need animations.
On top of that many [plugins](https://www.chartjs.org/docs/2.7.2/notes/extensions.html) can be found online, written by the community
### Customizable to needs?
It is not very customizable. It is just a library for plotting data that you provide. It is very versatile in displaying the data, though. Once plotted the data can be updated or extended, but not changed radically like we would like to have it. 
