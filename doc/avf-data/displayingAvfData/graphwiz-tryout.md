# Hello

<style>

#graphvizContainer {
  width: 5000px;
  height: 1000px;
}

</style>


<div id="graphvizContainer"></div>

<script>

async function buildGraphvizComponent(data) {

  var graphviz = await (<graphviz-dot engine={GraphvizEngine} server="true" ></graphviz-dot>);
  
  processDataToDotFile(data);
  var source = `digraph {` + 'rankdir="LR" \n ranksep=3; \n ratio=auto;' + nodesDotString + `\n` + edgesDotString + `\n }`
  
  graphviz.setDotData(source);
  
  lively.query(world, '#graphvizContainer').appendChild(graphviz);
  
}
/* ------------------ */
/* GLOBAL VARAIBLES */
/* ------------------ */

var world = this;
const GraphvizEngine = "dot" // "dot" , "neato", "fdp", "osage"
var nodesDotString = "";
var edgesDotString = "";

/* ------------------ */
/* HELPER METHODS */
/* ------------------ */


function processDataToDotFile(data){
  let idRoot = generateUUID();
  processObjectNode(idRoot, "messages", data);
}

var count = 0;
function processObjectNode(nodeName, nodeLabel, objectValue) {
  
  nodesDotString += getDotNodeStringFromNodeName(nodeName, nodeLabel);

  if (typeof objectValue === 'string') { return; }

  Object.keys(objectValue).forEach((childObjectKey) => {
    
    let childObjectValue = objectValue[childObjectKey];
    
    let childNodeName = generateUUID();
    
    let newEdgeString = getDotEdgeStringFromNodeAndParent(nodeName, childNodeName);
    
    edgesDotString += newEdgeString;
    if(childObjectKey=="1" || childObjectKey=="0"){ debugger; }
    processObjectNode(childNodeName, childObjectKey, childObjectValue);
  });
  return;
} 

function generateUUID() {
  return 'a' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


function getDotNodeStringFromNodeName(nodeName, nodeLabel){
    let dotString = ``;
    
    dotString += nodeName + " ";
    dotString += '[label="' + nodeLabel +  '"]\n';
    
    return dotString;
  }
  
function getDotEdgeStringFromNodeAndParent(node1Label, node2Label){
    let edgeString = ``;
    
    edgeString += node1Label + '->' + node2Label + '\n';
    
    return edgeString;
  }

/* ------------------ */
/* CLIENT CODE */
/* ------------------ */

var data;
(async () => {
  data = await fetch("https://lively-kernel.org/voices2/_vq/messages/1").then( ea => ea.json());
  await buildGraphvizComponent(data);
  console.log(count)
})()

</script>