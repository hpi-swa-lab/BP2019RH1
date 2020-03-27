import inside from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-point-in-polygon.js";
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js";
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js"; 
import { vec3} from "https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix.js";
import { INDIVIDUAL_COLOR_SELECTED, INDIVIDUAL_COLOR, INDIVIDUAL_TYPE } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/groupchaining/node-modules/groupingTryOut.js" 



export class Selector {
  constructor(interactiveCanvas) {
    this.interactiveCanvas = interactiveCanvas;
    this.selectedNodes = {};
    this.highlightColor = {r: 0, g: 0, b: 0, opacity: 1}
    this.history = [];
    this.mousePressed = mb2(this.interactiveCanvas.canvas);
    this.mousePosition = mp2(this.interactiveCanvas.canvas);
    this.registerClickedDownHandler();
    this.selectedNodesPreviousColor = {};
  }
  
  registerClickedDownHandler() {
    let selector = this;
    
    this.mousePressed.on('down', function() {
      if (selector.mousePressed.left) {
        var clickedNodesIndices = selector.calculateNodeIndicesUnderMousePointer(selector,
          selector.mousePosition, 
          selector.interactiveCanvas.nodes,
          selector.interactiveCanvas.transform,
          selector.interactiveCanvas.scale
        );
        let selectedNode = selector.getSelectedIndividual(clickedNodesIndices);
        // selector.updateSelectedObjects(selector.nodes, selector.mousePosition);
        if(selectedNode.length > 0){
          //Check if Node is alreadySelected
          selectedNode = selectedNode[0];
          if(selectedNode.drawing["selected"]) {
            selectedNode.drawing["selected"] = false;
            selectedNode.drawing.tcolor = INDIVIDUAL_COLOR;
          } else {
            selectedNode.drawing["selected"] = true;
            selector.interactiveCanvas.inspectNode(selectedNode);
            selectedNode.drawing.tcolor = INDIVIDUAL_COLOR_SELECTED;

          }
          selector.interactiveCanvas.drawNodes();
        }
        
      } 
    })
  }
  
   calculateNodeIndicesUnderMousePointer(selector, mousePosition, nodes, transform, scale) {
               
     let clickedNodesIndices = [];
     nodes.forEach((node, index) => {
       
       let drawingInfo = selector.getZoomedDrawingInformation(
         node.drawing,
         transform,
         scale);
       
       var point_polygon = [
           [drawingInfo.x - drawingInfo.size/2, drawingInfo.y - drawingInfo.size/2],
           [drawingInfo.x + drawingInfo.size/2, drawingInfo.y - drawingInfo.size/2],
           [drawingInfo.x + drawingInfo.size/2, drawingInfo.y + drawingInfo.size/2],
           [drawingInfo.x - drawingInfo.size/2, drawingInfo.y + drawingInfo.size/2]
         ]
       
       if (inside(mousePosition, point_polygon)) {
         clickedNodesIndices.push(index)
       }
     })
     return clickedNodesIndices;
  }
  
  getSelectedIndividual(clickedPointsIndices){
    let selectedIndividual = []
    clickedPointsIndices.forEach( (index) => {
      if (this.interactiveCanvas.nodes[index].data.nodeType == INDIVIDUAL_TYPE) {
        selectedIndividual.push(this.interactiveCanvas.nodes[index]);  
      }
    })
    return selectedIndividual;
  }
  
  getZoomedDrawingInformation(drawingInformation, transform, scale){
    let zoomedDrawingInformation = {};
    let normalizedPosition = this.getNormalizedCords(
      drawingInformation.tx, 
      drawingInformation.ty,
      this.interactiveCanvas.canvas.width,
      this.interactiveCanvas.canvas.height)
    
    let vec3oldPosition = vec3.fromValues(normalizedPosition.x, normalizedPosition.y, 1);
    let vec3zoomedPosition = vec3.create();
    vec3.transformMat3(vec3zoomedPosition, vec3oldPosition, transform);
    
    let zoomedPosition = this.getDenormalizedCords(
      vec3zoomedPosition[0],
      vec3zoomedPosition[1],
      this.interactiveCanvas.canvas.width,
      this.interactiveCanvas.canvas.height
      )
    zoomedDrawingInformation["size"] = scale * drawingInformation.tsize;
    zoomedDrawingInformation["x"] = zoomedPosition.x;
    zoomedDrawingInformation["y"] = zoomedPosition.y;
    
    return zoomedDrawingInformation;
  }
  
  getNormalizedCords(x, y, width, height){
    let xNorm = 2.0 * ((x / width) - 0.5);
    let yNorm = -1.0 * (2.0 * ((y / height) - 0.5));
    
    return {x: xNorm, y: yNorm}
  }  
  
  getDenormalizedCords(xNorm, yNorm, width, height){
    let x = ((xNorm / 2.0) + 0.5) * width;
    let y = (-0.5 * yNorm + 0.5) * height;

    
    return {x: x, y: y};
  }

}