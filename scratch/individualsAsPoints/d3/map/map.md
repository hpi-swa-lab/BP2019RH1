<!-- add points as individuals -->
<!-- color region borders differently -->
<script>
  // start every markdown file with scripts, via a call to setup...
  import setup from "../../setup.js"
  setup(this)
</script>

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
</style>

<div id="content">
  <svg id="svg">
    <g class="map"></g>
  </svg>
  <p id="selectedProvince"></p>
  <p id="hoveredProvince"></p>
</div>

<script>
import d3 from "src/external/d3.v5.js"
let world = this
var width = 960
var height = 500
var centered

var projection = d3.geoEquirectangular()
  .scale(1500)
  .center([45, 5]);
  
var geoGenerator = d3.geoPath()
  .projection(projection);
  
var color = d3.scaleLinear()
  .domain([1, 20])
  .clamp(true)
  .range(['#fff', '#409A99']);

var svg = d3.select(lively.query(this, "svg"))
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

var hoveredProvince = d3.select(lively.query(this, "#hoveredProvince"))
  .classed('big-text', true);
  
var selectedProvince = d3.select(lively.query(this, "#selectedProvince"))
  .classed('big-text', true);

function getProvinceName(d){
  if(d && d.properties) {
    var region = d.properties.REGION;
    var district = d.properties.DISTRICT;
    return "Region: " +  region + ", " + "District: " + district;
  }
  return null; 
}

function createPoints(d, i) {
  d3.select(lively.query(world, '.map-layer'))
    .append('circle')
    .attr('r', 3)
    .attr('cy', geoGenerator.centroid(d)[1])
    .attr('cx', geoGenerator.centroid(d)[0])
    .style('fill', 'orange');
}

var geoData
(async () => {
  geoData = await d3.json(bp2019url + "/src/geodata/somalia.geojson")

  var features = geoData.features;
  
  // Draw each province as a path
  mapLayer.selectAll('path')
      .data(features)
    .enter().append('path')
      .attr('d', geoGenerator)
      .attr('vector-effect', 'non-scaling-stroke')
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('click', clicked);
  
  mapLayer.selectAll('path') 
    .each(createPoints)

})();

function clicked(d) {
  var x, y, k;

  // Compute centroid of the selected path
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

  // Highlight the clicked province
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : '#FFFFFF';});
    
  var provinceName = getProvinceName(d);
  if (provinceName) {
    selectedProvince
      .text("Selected: " + getProvinceName(d));
  } else {
    selectedProvince
      .text("");
  }  

  // Zoom
  g.transition()
    .duration(750)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
}

function mouseover(d){
  // Highlight hovered province
  d3.select(this).style('fill', 'orange');
  
  hoveredProvince
    .text(getProvinceName(d))
}

function mouseout(d){
  // Reset province color
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : '#FFFFFF';});
  
  hoveredProvince.text('');
}

</script>
