const ROOT_ID = "root"
const GROUP_TYPE = "parent";
export const INDIVIDUAL_TYPE = "child"
export const INDIVIDUAL_COLOR = {r: 58, g: 58, b: 61, opacity: 1};
export const INDIVIDUAL_COLOR_SELECTED =  {r: 255, g: 0, b: 246, opacity: 1};
const PARENT_COLOR = {r: 117, g: 119, b: 125, opacity: 0.8};

export class Grouping {
  
  constructor(grouper, groupingKey, prevGrouping, prevNodes, prevNewParents, prevRawParents, prevRawIndividuals, groupingLayouter) {
    this.next = null;
    this.prev = prevGrouping;
    this.positionInChain = 0;
    this.grouper = grouper;
    
    this.prevRawIndividuals = prevRawIndividuals;
    this.prevNodes = prevNodes;
    this.prevRawNewParents = prevNewParents;
    this.prevRawParents = prevRawParents;
    
    this.rawIndividuals = [];
    this.rawParents = [];
    this.rawNewParents = [];
    this.prevNodesLookup = [];
    this.nodes = [];

    this.groupingLayouter = groupingLayouter;
    this.groupingKey = groupingKey;
    
  }    
  
  initializeRootGrouping(){
    this.numberOfParents = 1;
    this.prevRawIndividuals.forEach((individual, index) => {
        individual["parentId"] = ROOT_ID;
        individual["id"] = 'child_' + index.toString(10);
        individual["nodeType"] = INDIVIDUAL_TYPE;
      this.rawIndividuals.push(individual);
    })
    
    this.rawNewParents.push({id: ROOT_ID, parentId: ""});
    this.rawParents.push({id: ROOT_ID, parentId: ""});
    
    this.groupingLayouter.setColorScaleForDomain([]);
    
    this.positionInChain = 1;
  }   
  
  addGrouping(groupingKey) {
    if(this.next != null) {
      this.next.addGrouping(groupingKey);
    } else {
      let newGrouping = new Grouping(
        this.grouper,
        groupingKey, 
        this, 
        [...this.nodes],
        [...this.rawNewParents],
        [...this.rawParents],
        [...this.rawIndividuals],
        this.groupingLayouter
      );
      this.next = newGrouping;
      newGrouping.positionInChain = this.position + 1;
      newGrouping.updateTreeStructure();
    }
  }
  
  removeGrouping(groupingKey){
    if(this.groupingKey == groupingKey){
      this.prev.next = null;
      this.prev = null;      
    } else {
      this.next.removeGrouping(groupingKey);
    }
  }
  
  updateTreeStructure() {
    this.prevNodesLookup = this.createLookUpTableForNodes(this.prevNodes);
    
    //append  new node for each distinct value of new grouping key
    this.prevRawNewParents.forEach( (parentRawNode) => {
      let parentNode = this.prevNodesLookup[parentRawNode.id];
      let individualsDataFromParentNode = parentNode.children.map((item) => item.data)
      let uniqueValuesForAllChildren = 
          this.grouper.getUniqueValues(individualsDataFromParentNode, this.groupingKey);
       
      uniqueValuesForAllChildren.forEach( (uniqueValue) => {
        let newParentNode = {
          id: uniqueValue + parentRawNode.id, 
          parentId: parentRawNode.id,
          nodeType: GROUP_TYPE,
          positionInChain: this.positionInChain,
          uniqueValue: uniqueValue
        };
        this.rawNewParents.push(newParentNode)
      })
    });

    this.prevRawIndividuals.forEach((individual) => {
      let valueForCurrentGroupingKey = this.grouper.getSortedValue(individual[this.groupingKey]);
      
      let newParentId = valueForCurrentGroupingKey.toString() + individual.parentId;
      let newRawIndividual = Object.assign({}, individual)
      newRawIndividual.parentId = newParentId;
      this.rawIndividuals.push(newRawIndividual);
    });
    
    this.rawParents.push(...this.prevRawParents);
    this.rawParents.push(...this.rawNewParents);
  }
  
  createLookUpTableForNodes(nodes){
    let lookUpTable = {}
    nodes.forEach((node) => {
      lookUpTable[node.data.id] = node;
    });
    
    return lookUpTable;
  }
  
  getGroupingStructure(){
    if(this.next == null) {
      let rawNodes = this.getRawNodesOfThisGrouping();
      this.nodes = this.groupingLayouter.createLayout(rawNodes);
      this.enrichNodesWithDrawingInformation();
      let nodesToReturn = [...this.nodes];
      this.removeRootNodeForRendering(nodesToReturn);
      nodesToReturn.reverse();
      return nodesToReturn;
    }
    else {
      return this.next.getGroupingStructure();
    }
  }
  
  getRawNodesOfThisGrouping(){
    
    let rawNodes = [];
    
    rawNodes.push(...this.rawIndividuals);
    rawNodes.push(...this.rawParents);
    
    return rawNodes;
  }
  
  removeRootNodeForRendering(nodes){
    nodes.shift();
  }
  
  enrichNodesWithDrawingInformation() {
    this.nodes.forEach( (node) => {
      let drawingInformation = {};
      
      if(this.nodeIsRoot(node)) {
        this.setColorForRootNode(drawingInformation);
        this.setPositionAndSizeForNewNode(drawingInformation, node);
      }
      
      if(this.nodeIsNewParent(node)) {
        this.setColorForNewParent(drawingInformation, node);
        this.setPositionAndSizeForNewNode(drawingInformation, node);
      }
      
      if(this.nodeIsOldParent(node)) {
        this.setColorForOldParent(drawingInformation, node);
        this.setPositionAndSizeForExistingNode(drawingInformation, node);
      }
      
      if(this.nodeIsIndividual(node)) {
        if(this.nodesHaveBeenRendered()){
          this.setColorForIndividual(drawingInformation, node);
          this.setPositionAndSizeForExistingNode(drawingInformation, node);
        } else {
          this.setColorForIndividual(drawingInformation, node);
          this.setPositionAndSizeForNewNode(drawingInformation, node);
        }
        
      }
      
      node["drawing"] = drawingInformation;
    });
  }
  
  nodeIsRoot(node){
    return node.id ==="root";
  }
  
  setColorForRootNode(drawingInformation){
    let white = {r: 255, g: 255, b: 255, opacity: 1.0};
    drawingInformation["tcolor"] = white;
    drawingInformation["scolor"] = white;
  }
  
  nodeIsNewParent(node) {
    return ((this.prevNodesLookup[node.data.id] === undefined) && (this.prevNodes.length !== 0));
  }
  
  setColorForNewParent(drawingInformation, node){
    drawingInformation["tcolor"] = this.getColorForNewParentNode(node);
    drawingInformation["scolor"] = this.getColorForNewParentNode(node);
  }
  
  setPositionAndSizeForNewNode(drawingInformation, node){
    drawingInformation["tx"] = node.x;
    drawingInformation["ty"] = node.y;
    drawingInformation["sx"] = node.x;
    drawingInformation["sy"] = node.y;
    drawingInformation["tsize"] = node.r * 2;
    drawingInformation["ssize"] = 0;
  }
  
  getColorForNewParentNode(node) {
    let color = this.groupingLayouter.getColorForValue(node.data['uniqueValue']);
    color.opacity = 0.85;
   
    return color;
  }
  
  nodeIsIndividual(node){
    return (node.data.nodeType == INDIVIDUAL_TYPE);
  }
  
  nodesHaveBeenRendered(){
    return this.prevNodes.length !== 0;
  }
  
  setColorForIndividual(drawingInformation, node){
    if(this.nodeIsSelected(node)){
      drawingInformation["tcolor"] = INDIVIDUAL_COLOR_SELECTED;
      drawingInformation["scolor"] = INDIVIDUAL_COLOR_SELECTED;
    } else {
      drawingInformation["tcolor"] = INDIVIDUAL_COLOR;
      drawingInformation["scolor"] = INDIVIDUAL_COLOR;
    }
  }
  
  nodeIsSelected(node){
    if(this.nodesHaveBeenRendered()) {
      let isSelectedIsAvailable = (this.prevNodesLookup[node.data.id].drawing["selected"] !== undefined);
      if (isSelectedIsAvailable) {
        return this.prevNodesLookup[node.data.id].drawing.selected; 
      }
      return false;
    }
    return false;
  }
  
  nodeIsOldParent(node){
    return node.data.nodeType == GROUP_TYPE && this.prevNodesLookup[node.data.id] !== undefined;
  }
    
  setColorForOldParent(drawingInformation, node){
    drawingInformation["tcolor"] = this.getParentColor(node);
    drawingInformation["scolor"] = this.prevNodesLookup[node.data.id].drawing.tcolor;
  }
   
  setPositionAndSizeForExistingNode(drawingInformation, node){
    drawingInformation["tx"] = node.x;
    drawingInformation["ty"] = node.y;
    drawingInformation["sx"] = this.prevNodesLookup[node.data.id].drawing.tx;
    drawingInformation["sy"] = this.prevNodesLookup[node.data.id].drawing.ty;
    drawingInformation["tsize"] = node.r * 2;
    drawingInformation["ssize"] = this.prevNodesLookup[node.data.id].drawing.tsize;
  }
    
  getParentColor(node) {
    let r = PARENT_COLOR.r / (100 / node.data.positionInChain);
    let g = PARENT_COLOR.g / (100 / node.data.positionInChain);
    let b = PARENT_COLOR.b / (100 / node.data.positionInChain);
    let opacity = 1;
    
    return {r: r, g: g, b: b, opacity: opacity};
  }
}