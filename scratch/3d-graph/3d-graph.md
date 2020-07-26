<div id="root-div"></div>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import d3 from "src/external/d3.v5.js";
import ForceGraph3D from 'https://unpkg.com/3d-force-graph'
import GraphStructurer from "./graph-structurer.js"

var rootDiv = lively.query(this, '#root-div')
var individuals


AVFParser.loadCovidData().then( (data) => {
  individuals = data
  
  let graphStructurer = new GraphStructurer(individuals)
  let graph = graphStructurer.getGraph()
  var myGraph = ForceGraph3D();
  myGraph(rootDiv)
    .graphData(graph);

})
  
</script>