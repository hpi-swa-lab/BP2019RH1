<!-- add points as individuals -->
<!-- color region borders differently -->

<style>
#content .map path {
  fill: #ddd;
  stroke: #aaa;
}

.background {
  fill: #eee;
  pointer-events: all;
}

.map-layer {
  fill: #fff;
  stroke: #aaa;
}

text.big-text{
  font-size: 30px;
  font-weight: 400;
}

div.tooltip {	
    position: absolute;					
    padding: 5px;		
    background: lightsteelblue;	
    border: 10px;		
    border-radius: 8px;				
}
</style>

<div id="content">
  <svg id="svg">
    <g class="map"></g>
  </svg>
</div>

<script>
import d3 from "src/external/d3.v5.js"
import setup from "../../../../setup.js"

let world = this
var width = 960
var height = 900
var centered

setup(this).then(() => {
  var projection = d3.geoEquirectangular()
    .scale(3500)
    .center([46, 8.5]);

  var geoGenerator = d3.geoPath()
    .projection(projection);

  var svg = d3.select(lively.query(world, "svg"))
    .attr('width', width)
    .attr('height', height);

  svg.append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height)
    .on('click', clicked);

  var g = svg.append('g');

  var mapLayer = g.append('g')
    .classed('map-layer', true);

  var tooltip = d3.select(lively.query(world, '#content'))
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

  var geoData
  (async () => {
    geoData = await d3.json(bp2019url + "/src/geodata/somalia.geojson")

    var features = geoData.features;

    mapLayer.selectAll('path')
        .data(features)
      .enter().append('path')
        .attr('d', geoGenerator)
        .attr('vector-effect', 'non-scaling-stroke')
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('mousemove', mousemove)
        .on('click', clicked);

    mapLayer.selectAll('path') 
      .each(createPoints)

  })();
})


function createPoints(d, i) {
  d3.select(lively.query(world, '.map-layer'))
    .append('circle')
    .attr('r', 3)
    .attr('cy', geoGenerator.centroid(d)[1])
    .attr('cx', geoGenerator.centroid(d)[0])
    .style('fill', 'orange')
    .on("mouseover", function(){
      tooltip
        .style("visibility", "visible")
        .html(getProvinceName(d) + "<br/>" + "Theme: water")})
	  .on("mousemove", function(){
      tooltip
        .style("top", (d3.event.layerY-10)+"px")
        .style("left",(d3.event.layerX+10)+"px")})
	  .on("mouseout", function(){
      tooltip
        .style("visibility", "hidden")});
}

function getProvinceName(d){
  if(d && d.properties) {
    var region = d.properties.REGION;
    var district = d.properties.DISTRICT;
    return "Region: " +  region + ", " + "District: " + district;
  }
  return null; 
}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = geoGenerator.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : '#FFFFFF';});
 
  g.transition()
    .duration(750)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
}


function mouseover(d){
  d3.select(world).style('fill', 'orange');    
  tooltip
    .style("visibility", "visible")
    .text(getProvinceName(d));
}

function mouseout(d){    
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : '#FFFFFF';});
  tooltip
    .style("visibility", "hidden");
}

function mousemove(d) {
  tooltip
    .style("top", (d3.event.layerY-10)+"px")
    .style("left",(d3.event.layerX+10)+"px");
}
</script>
