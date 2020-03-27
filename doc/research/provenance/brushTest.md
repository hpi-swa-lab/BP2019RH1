### Brush Test

<div id="chartDivX">
<div id="chartDivY">

<style>


.selection {
  fill: steelblue;
  fill-opacity: 1;
}

.body {
  width: 80%;
  margin:auto;
}


</style>


<script>
import d3 from "src/external/d3.v5.js";

var data = [{index: 0, value: 3},
            {index: 1, value: 5},
            {index: 2, value: 12}, 
            {index: 3, value: 8},
            {index: 4, value: 20},
            {index: 5, value: 7},
            {index: 6, value: 2},
            {index: 7, value: 15}            
            ];


//--------------- HORIZONTAL --------------------

var widthX = 300,
    heightX = 250,
    delim = 4;

var scaleX = d3.scaleLinear()
    .domain([0, 21])
    .rangeRound([0, widthX]);

var y = d3.scaleLinear()
    .domain([0, data.length])
    .rangeRound([0, heightX]);

var svgX = d3.select(lively.query(this,'#chartDivX'))
  .append("svg")
    .attr("width", widthX)
    .attr("height", heightX)
  .append('g');

svgX
  .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .style('stroke', 'black')
    .style('fill', 'lightyellow')
    .attr('width', widthX)
    .attr('height', heightX);

// Moveable barChart

var brushX = d3.brushX()
  .extent(function (d, i) {
       return [[0,y(i)+delim/2 ], 
              [widthX, y(i)+ heightX/data.length -delim/2]];})
  .on("brush", brushmoveX)
  .on("end", brushendX);

  
  
var svgbrushX = svgX
  .selectAll('.brush')
    .data(data)
  .enter()
    .append('g')
      .attr('class', 'brush')
    .append('g')
      .call(brushX)
      .call(brushX.move, function (d){return [0, d.value].map(scaleX);});

svgbrushX
  .append('text')
    .attr('x', function (d){return scaleX(d.value)-10;})
    .attr('y', function (d, i){return y(i) + y(0.5);})
    .attr('dy', '.35em')
    .attr('dx', -15)
    .style('fill', 'white')
    .text(function (d) {return d3.format('.2')(d.value);})

function brushendX(){ 
    if (!d3.event.sourceEvent) return;
    if (d3.event.sourceEvent.type === "brush") return; 
    if (!d3.event.selection) { // just in case of click with no move
      svgbrushX
        .call(brushX.move, function (d){
        return [0, d.value].map(scaleX);});}
}

function brushmoveX() { 
    console.log(d3.event.sourceEvent)
    if (!d3.event.sourceEvent) return;
    if (d3.event.sourceEvent.type === "brush") return; 
    if (!d3.event.selection) return;

    var d0 = d3.event.selection.map(scaleX.invert);
    var d = d3.select(this).select('.selection');

    d.datum().value= d0[1]; // Change the value of the original data

    update();
}



//--------------- VERTICAL --------------------

var widthY = 250,
    heightY = 300;

var scaleY = d3.scaleLinear()
    .domain([0, 21])
    .rangeRound([heightY, 0]);

var x = d3.scaleLinear()
    .domain([0, data.length])
    .rangeRound([0, widthY]);

var svgY = d3.select(lively.query(this,'#chartDivY'))
  .append("svg")
    .attr("width", widthY)
    .attr("height", heightY)
  .append('g');

svgY
  .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .style('stroke', 'black')
    .style('fill', 'lightyellow')
    .attr('width', widthY)
    .attr('height', heightY);

// Moveable barChart

var brushY = d3.brushY()
  .extent(function (d, i) {
       return [[x(i)+ delim/2, 0], 
              [x(i) + x(1) - delim/2, heightY]];})
  .on("brush", brushmoveY)
  .on("end", brushendY);  
  
var svgbrushY = svgY
  .selectAll('.brush')
    .data(data)
  .enter()
    .append('g')
      .attr('class', 'brush')
    .append('g')
      .call(brushY)
      .call(brushY.move, function (d){return [d.value, 0].map(scaleY);});

svgbrushY
  .append('text')
    .attr('y', function (d){return scaleY(d.value) + 25;})
    .attr('x', function (d, i){return x(i) + x(0.5);})
    .attr('dx', '-.60em')
    .attr('dy', -5)
    .style('fill', 'white')
    .text(function (d) {return d3.format('.2')(d.value);});

function brushendY(){
    if (!d3.event.sourceEvent) return;
    if (d3.event.sourceEvent.type === "brush") return; 
    if (!d3.event.selection) { // just in case of click with no move
      svgbrushY
        .call(brushY.move, function (d){
          return [d.value, 0].map(scaleY);})
    };
}

function brushmoveY() { 
    if (!d3.event.sourceEvent) return; 
    if (d3.event.sourceEvent.type === "brush") return;
    if (!d3.event.selection) return; 

    var d0 = d3.event.selection.map(scaleY.invert);
    var d = d3.select(this).select('.selection');

    d.datum().value= d0[0]; // Change the value of the original data

    update();
  }

  //---------UPDATE VERTICAL and HORIZONTAL

function update(){
    svgbrushX
      .call(brushX.move, function (d){
        return [0, d.value].map(scaleX);})
      .selectAll('text')
        .attr('x', function (d){return scaleX(d.value)-10;})
        .text(function (d) {return d3.format('.2')(d.value);});
    svgbrushY
      .call(brushY.move, function (d){
        return [d.value, 0].map(scaleY);})
      .selectAll('text')
        .attr('y', function (d){return scaleY(d.value) + 25;})
        .text(function (d) {return d3.format('.2')(d.value);});
  }

</script>