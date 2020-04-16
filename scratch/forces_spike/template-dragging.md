<html>
<meta charset="utf-8">
<script src="https://d3js.org/d3-force.v1.min.js"></script>
<script src="https://d3js.org/d3.v4.min.js"></script>
<style>
.edge{
  stroke: white;
  stroke-width: 1;
}
.graphSVG{
  background-color: black;
}

div.container {
  width: 100%;
  border: 1px solid gray;
}
div.tooltip {
  position: absolute;
  text-align: center;
  width: 180px;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>

<body>
  <div id="graphDiv"></div>

<script>

var radius = 5;

var defaultNodeCol = "white",
    highlightCol = "yellow";

var height = window.innerHeight;
var graphWidth =  window.innerWidth;

var graphCanvas = d3.select('#graphDiv').append('canvas')
.attr('width', graphWidth + 'px')
.attr('height', height + 'px')
.node();

var context = graphCanvas.getContext('2d');

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var simulation = d3.forceSimulation()
              .force("center", d3.forceCenter(graphWidth / 2, height / 2))
              .force("x", d3.forceX(graphWidth / 2).strength(0.1))
              .force("y", d3.forceY(height / 2).strength(0.1))
              .force("charge", d3.forceManyBody().strength(-50))
              .force("link", d3.forceLink().strength(1).id(function(d) { return d.id; }))
              .alphaTarget(0)
              .alphaDecay(0.05)

var transform = d3.zoomIdentity;


d3.json("data.json",function(error,data){

  initGraph(data)

  function initGraph(tempData){

    d3.select(graphCanvas)
        .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end",dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))

    function zoomed() {
      console.log("zooming")
      transform = d3.event.transform;
      simulationUpdate();
    }


    function dragsubject() {

      console.log("dragsubject start")
      var i,
      x = transform.invertX(d3.event.x),
      y = transform.invertY(d3.event.y),
      dx,
      dy;
      for (i = tempData.nodes.length - 1; i >= 0; --i) {
        node = tempData.nodes[i];
        dx = x - node.x;
        dy = y - node.y;

        if (dx * dx + dy * dy < radius * radius) {

          node.x =  transform.applyX(node.x);
          node.y = transform.applyY(node.y);

          console.log(node)

          return node;
        }
      }

        console.log("dragsubject start +")
    }


    function dragstarted() {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
    }

    function dragged() {
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);

    }

    function dragended() {
      if (!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }

    simulation.nodes(tempData.nodes)
              .on("tick",simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);

    function simulationUpdate(){
      context.save();

      context.clearRect(0, 0, graphWidth, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {
            context.beginPath();
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
            context.stroke();
        });

        // Draw the nodes
        tempData.nodes.forEach(function(d, i) {

            context.beginPath();
            context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
            context.fillStyle = d.col ? "red":"black"
            context.fill();
        });

        context.restore();
    }
  }
})


</script>
</body>
