import inside from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-point-in-polygon.js";
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js";
import mb2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-pressed.js"; 
import { vec3 } from "https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix.js";
import { INDIVIDUAL_COLOR_SELECTED, INDIVIDUAL_COLOR, INDIVIDUAL_TYPE } from "./groupingTryOut.js" 
import SelectAction from '../common/actions/select-action.js'


export class Selector {
  constructor(interactiveCanvas) {
    this.applyGlobal = true;
    this.interactiveCanvas = interactiveCanvas;
    
    this.selectedNodes = {};
    this.selectedNodesPreviousColor = {};

    this.mousePressed = mb2(this.interactiveCanvas.canvas);
    this.mousePosition = mp2(this.interactiveCanvas.canvas);
    
    this._registerClickedDownHandler(this);
  }

  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  

  // ------------------------------------------
  // Private Methods
  // ------------------------------------------

  _registerClickedDownHandler(that) {
    that.mousePressed.on('down', function() {
      if (that.mousePressed.left) {
        let clickedNodesIndices = that._calculateNodeIndicesUnderMousePointer();
        let nodeUnderMouse = that._getSelectedNode(clickedNodesIndices);
        that._handleNodeSelection(nodeUnderMouse);
      }   
    })
  }

  _handleNodeSelection(node) {
    if(node){
      this._selectOrDeselectNode(node);
      this.interactiveCanvas.applyAction(new SelectAction(node.data, this.applyGlobal));
    }
  }
  
  _selectOrDeselectNode(node) {
    if(this._nodeAlreadySelected(node)) {
      this._deselectNode(node)
    } else {
      this._selectNode(node);
    }
  }

  _nodeAlreadySelected(node) {
    return node.drawing["selected"];
  }

  _deselectNode(node) {
    node.drawing["selected"] = false;
    node.drawing.tcolor = INDIVIDUAL_COLOR;
  }

  _selectNode(node) {
    node.drawing["selected"] = true;
    node.drawing.tcolor = INDIVIDUAL_COLOR_SELECTED;
  }

   _calculateNodeIndicesUnderMousePointer() {
     let transform = this.interactiveCanvas.transform
     let scale = this.interactiveCanvas.scale
               
     let clickedNodesIndices = [];
     this.interactiveCanvas.nodes.forEach((node, index) => {
       let polygonForNode = this._getPolygonForZoomedNode(node, transform, scale);
       if (inside(this.mousePosition, polygonForNode)) {
         clickedNodesIndices.push(index)
       }
     })
     return clickedNodesIndices;
  }

  _getPolygonForZoomedNode(node, transform, scale) {
    let drawingInformation = this._getZoomedDrawingInformation(node.drawing, transform, scale);
    let polygon = this._getPolygoneForNode(drawingInformation);
    return polygon;
  }
  
  _getPolygoneForNode(drawingInformation) {
    return [
      [drawingInformation.x - drawingInformation.size/2, drawingInformation.y - drawingInformation.size/2],
      [drawingInformation.x + drawingInformation.size/2, drawingInformation.y - drawingInformation.size/2],
      [drawingInformation.x + drawingInformation.size/2, drawingInformation.y + drawingInformation.size/2],
      [drawingInformation.x - drawingInformation.size/2, drawingInformation.y + drawingInformation.size/2]
    ]
  }

  _getSelectedNode(clickedPointsIndices){
    let selectedNode;
    clickedPointsIndices.forEach( (index) => {
      if (this.interactiveCanvas.nodes[index].data.nodeType == INDIVIDUAL_TYPE) {
        selectedNode = this.interactiveCanvas.nodes[index];  
      }
    })
    return selectedNode;
  }
  
  _getZoomedDrawingInformation(drawingInformation, transform, scale){
    let canvasWidth = this._getCanvasWidth();
    let canvasHeight = this._getCanvasHeight();

    let normalizedPosition = this._calculateNormalizedCords(drawingInformation.tx, drawingInformation.ty, canvasWidth, canvasHeight);
    let normalizedPositionWithAppliedTransform = this._applyTransformOnNormalizedPosition(normalizedPosition, transform);
    let denormalizedPositionWithAppliedTransform = this._calculateDenormalizedCords(normalizedPositionWithAppliedTransform[0], normalizedPositionWithAppliedTransform[1], canvasWidth, canvasHeight);
    
    let zoomedDrawingInformation = {};
    zoomedDrawingInformation["size"] = scale * drawingInformation.tsize;
    zoomedDrawingInformation["x"] = denormalizedPositionWithAppliedTransform.x;
    zoomedDrawingInformation["y"] = denormalizedPositionWithAppliedTransform.y;
    
    return zoomedDrawingInformation;
  }

  _applyTransformOnNormalizedPosition(normalizedPosition, transform) {
    let oldPositionNormalized = vec3.fromValues(normalizedPosition.x, normalizedPosition.y, 1);
    let zoomedOldPositionNormalized = vec3.create();
    vec3.transformMat3(zoomedOldPositionNormalized, oldPositionNormalized, transform);
    return zoomedOldPositionNormalized;
  }

  _getCanvasWidth() {
    return this.interactiveCanvas.canvas.width;
  }

  _getCanvasHeight() {
    return this.interactiveCanvas.canvas.height;
  }
  
  _calculateNormalizedCords(x, y, width, height){
    let xNorm = 2.0 * ((x / width) - 0.5);
    let yNorm = -1.0 * (2.0 * ((y / height) - 0.5));
    
    return {x: xNorm, y: yNorm}
  }  
  
  _calculateDenormalizedCords(xNorm, yNorm, width, height){
    let x = ((xNorm / 2.0) + 0.5) * width;
    let y = (-0.5 * yNorm + 0.5) * height;

    
    return {x: x, y: y};
  }

}