<div id="canvas-div">
  <canvas id="drawing-canvas" width="1000" height="800"></canvas>
</div>

<script>

import d3 from "src/external/d3.v5.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;

AVFParser.loadCompressedIndividualsWithKeysFromFile().then((result) => {
  let individuals = result;
  let links = []
  individuals = enrichIndividualsWithParendIDAndID(individuals)
  
  links.push({id: "123456789", parentId:""})
  links.push(...individuals)
  
  
});

function enrichIndividualsWithParendIDAndID(individuals){
  individuals.forEach((individual, i) => {
    individual["parentId"] = "123456789";
    individual["id"] = i.toString(10);
  })

  return individuals;
}


function createNodesLayoutForHierarchy(links){
  links = d3.stratify().id(d => d["id"]).parentId(d => d["parentId"])(links)
  
  var layout = d3.pack().size([MAX_WIDTH, MAX_HEIGHT])
  
  var root = d3.hierarchy(links).sum(function(d) { return 1 })
  var nodes = root.descendants();
  
  layout(root);
  
  return nodes;
}



</script>