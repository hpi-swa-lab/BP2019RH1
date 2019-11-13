# d3js

<link href="style.css" rel="stylesheet" type="text/css" />

#### the low level library

Gallery of project using d3.js can be found [here](https://github.com/d3/d3/wiki/Gallery).

- context:
  - Who uses it? Which other projects use this library? Use cases?
  
    - a lot of people and a lot of projects. A list of libraries using d3 can be found [here](https://github.com/wbkd/awesome-d3).
  - is it maintained?
  yes
  - Who wrote it?
  
    - Mike Bostock, Jason Davies, Jeffrey Heer, Vadim Ogievetsky, and community
  - how old is it?
  it is from 2012
  - is it open source? [yes.](github.com/d3/d3)
  - what is produced as a visualization? a picture, a svg, a html canvas, or different divs or other html elements, something else?
  
  >_D3’s emphasis on web standards gives you the full capabilities of modern browsers without tying yourself to a proprietary framework, combining powerful visualization components and a data-driven approach to DOM manipulation. "In contrast to many other libraries, D3.js allows great control over the final visual result."_
  - produces DOM elements e.g. svgs
     
- 2 or 3 examples (code snippets & screenshots)
  
### Example 1: Three Little Circles


d3js can work with svg elements. Look here - plain svg elements.

<svg width="720" height="120" id="basicCircles">
<circle cx="40" cy="60" r="10"></circle>
<circle cx="80" cy="60" r="10"></circle>
<circle cx="120" cy="60" r="10"></circle>
</svg>

```javascript
<svg width="720" height="120">
<circle cx="40" cy="60" r="10"></circle>
<circle cx="80" cy="60" r="10"></circle>
<circle cx="120" cy="60" r="10"></circle>
</svg>
```

<svg width="720" height="120" id="d3Circles">
<circle cx="40" cy="60" r="10"></circle>
<circle cx="80" cy="60" r="10"></circle>
<circle cx="120" cy="60" r="10"></circle>
</svg>

Using d3 we can manipulate these elements. 

<script id="threeLittleCircles">

import d3 from "src/external/d3.v5.js"

var svg = d3.select(lively.query(this,"#d3Circles"));

var circle = svg.selectAll("circle").style("fill", "steelblue");

//selectAll(this.parentElement.querySelectorAll("circle"))

</script>

<script>
var s = lively.query(this, "#threeLittleCircles");
(<pre>{s.textContent}</pre>)
</script>

Due to lively's document object handling, lively.query() is needed to help d3 find our elements.

Now we want to see d3's selection and data binding in action with our circles. So we create 3 circles as above and bind them with a four element array. In the enter() selection we add a circle and define its position and radius.

```javascript
<svg width="720" height="120" id="circles1">
<circle cx="40" cy="60" r="10"></circle>
<circle cx="80" cy="60" r="10"></circle>
<circle cx="120" cy="60" r="10"></circle>
</svg>
```
<svg width="720" height="120" id="circles1">
<circle cx="40" cy="60" r="10"></circle>
<circle cx="80" cy="60" r="10"></circle>
<circle cx="120" cy="60" r="10"></circle>
</svg>

<script id="enterExitExample">
import d3 from "src/external/d3.v5.js"

var svg = d3.select(lively.query(this,"#circles1"));

var circle = svg.selectAll("circle")
    .data([32, 57, 293, 529], function(d) { return d; });

circle.enter().append("circle")
    .attr("cy", 60)
    .attr("cx", function(d, i) { return i * 100 + 30; })
    .attr("r", function(d) { return Math.sqrt(d); });

circle.exit().remove();

""
</script>

<script>
var s = lively.query(this, "#enterExitExample");
(<pre>{s.textContent}</pre>)
</script>


## Example 2: A Simple Bar Chart with Data Binding

#### Try 1: Make a Bar-Chart with html
First, a bar chart only using html and css:

<style>

.chart div {
  font: 10px sans-serif;
  background-color: steelblue;
  text-align: right;
  padding: 3px;
  margin: 1px;
  color: white;
}

</style>

<div class="chart" id="firstChartDiv"></div>


<script id="divBarChart">
import d3 from "src/external/d3.v5.js"

var dataset1 = [4, 8, 15, 16, 23, 42];

var xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset1)])
    .range([0, 420]);

var chartClasses = d3.select(lively.query(this, "#firstChartDiv"));

chartClasses.selectAll("div")
    .data(dataset1)
  .enter().append("div")
    .style("width", function(d) { return xScale(d) + "px"; })
    .text(function(d) { return d; });

""
</script>

Here we see how you can dynamically create a bar chart with the data binding and also use a linear scale.

```javascript
<div class="chart" id="firstChartDiv"></div>
```

<script>
var s = lively.query(this, "#divBarChart");
(<pre>{s.textContent}</pre>)
</script>

#### Try 2: Make a Bar-Chart with svgs

<div class="someclass">
    <h2>Create A Bar Chart With D3 JavaScript</h2>
    <div id="secondChartDiv"/>
</div>

<svg id="aSVG"></svg>
<script>
var chartdata = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
    135, 150, 165, 180, 200, 220, 240, 300, 330, 370, 410, 1000];

var margin = {top: 30, right: 10, bottom: 30, left: 50}

var height = 400 - margin.top - margin.bottom,
    width = 720 - margin.left - margin.right,
    barWidth = 40,
    barOffset = 20;

var dynamicColor;

var yScale = d3.scaleLinear()
    .domain([0, d3.max(chartdata)])
    .range([0, height])

var xScale = d3.scaleBand()
    .domain(d3.range(0, chartdata.length))
    .range([0, width])
    .paddingInner(0.2)

var colors = d3.scaleLinear()
    .domain([0, chartdata.length * .33, chartdata.length * .66, chartdata.length])
    .range(['#d6e9c6', '#bce8f1', '#faebcc', '#ebccd1'])

var awesome = d3.select(lively.query(this,'#secondChartDiv')).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', '#bce8f1')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
    .selectAll('rect').data(chartdata)
    .enter().append('rect')
    .attr('height', 0)
    .attr('width', xScale.bandwidth())
    .attr('x', (data, i) => {
        return xScale(i);
    })
    .attr('y', height)
    .on('mouseover', function (data) {
        dynamicColor = this.style.fill;
        d3.select(this)
            .style('fill', '#3c763d')
    })
    .on('mouseout', function (data) {
        d3.select(this)
            .style('fill', dynamicColor)
    })
    .on('mousedown', function (data) {
        d3.select(this)
            .attr('width', this.width.baseVal.value / 2 )
    })
    
  
    
awesome.transition()
    .attr('height', function (data) {
        return yScale(data);
    })
    .attr('y', function (data) {
        return height - yScale(data);
    })
    .duration(2000)
    .delay(function (data, i) {
        return i * 20;
    })
    .style(
        'fill', function (data, i) {
            return colors(i);
        })
    .style('stroke', '#31708f')
    .style('stroke-width', '5')
    .ease()

    

var verticalGuideScale = d3.scaleLinear()
    .domain([0, d3.max(chartdata)])
    .range([height, 0])


var vAxis = d3.axisLeft()
    .scale(verticalGuideScale)
    .ticks(10)


var verticalGuide = d3.select(lively.query(this,'svg')).append('g')
vAxis(verticalGuide)
verticalGuide.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
verticalGuide.selectAll('path')
    .style("fill", 'none')
    .style("stroke", "#3c763d")
verticalGuide.selectAll('line')
    .style("stroke", "#3c763d")

var hAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(chartdata.size)

var horizontalGuide = d3.select(lively.query(this,'svg')).append('g')
hAxis(horizontalGuide)
horizontalGuide.attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
horizontalGuide.selectAll('path')
    .style("fill", 'none')
    .style("stroke", "#3c763d")
horizontalGuide.selectAll('line')
    .style("stroke", "#3c763d");
    
""
</script>


- experiment with examples: what can you add as interaction?

  - goal when clicked on bar it splits up into three parts according to data
<style>

.chart div {
  font: 10px sans-serif;
  background-color: steelblue;
  text-align: right;
  padding: 3px;
  margin: 1px;
  color: white;
}

</style>

<div>
<div class="chart" id="firstChartDiv"></div>
</div>

<script id="divBarChart">
import d3 from "src/external/d3.v5.js"

var dataset1 = [10];

var dataset2 = [2,3,5];

var xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset1)])
    .range([0, 420]);

var chartClasses = d3.select(lively.query(this, "#firstChartDiv"));

chartClasses.selectAll("div")
    .data(dataset1)
  .enter().append("div")
    .style("width", function(d) { return xScale(d) + "px"; })
    .text(function(d) { return d; })
    .on('mousedown', function (d) {
        let parent = this.parentElement;
        console.log(parent.pos)
        d3.select(this).remove()
        
        d3.select(parent).selectAll("div")
            .data(dataset2)
          .enter().append("div")
            .style("width", function(d) { return xScale(d) + "px";})
    })

""
</script>

- categorization
  - customizability: options in the library, can you add things to the result, can you add code to change the creation process of plot
  - what applies more as a use case: develop own visualizations or visualize your data fast and easy?
  
- Experience
  - writing text
  - customize to needs 
  - how mature is environment?