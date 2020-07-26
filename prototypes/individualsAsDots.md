# Individuals as dots



<style>
.widthOfDiagram{
  width=1000px;
  height: 800px;
}

.toolTip{
    position: absolute;			
    text-align: left;							
    padding: 5px;
    background: lightsteelblue;	
    border: 0px;		
    border-radius: 8px;			
    pointer-events: none;
    
}

#controlPanel{
  padding: 20px;
}
</style>

<div class="widthOfDiagram" id="individualsAsDotsDiagram">

</div>
<div class="widthOfDiagram" id="controlPanel">
  <button id="group_gender">
  Gender
  </button>
</div>


<script>

import { IndividualsAsDots } from "./individualsAsDots.js";
import setup from "../setup.js"

let world = this

setup(this).then(() => {
  let diagramSvgWidth = 1000;
  let diagramSvgHeight = 800;

  let containerDiv = lively.query(world, "#individualsAsDotsDiagram")

  let diagram = new IndividualsAsDots(containerDiv, diagramSvgWidth, diagramSvgHeight)
  diagram.initializeRandom()

  lively.query(world, "#group_gender").addEventListener("click", () => {
    diagram.addGrouping("gender")
  })
})
  
</script>