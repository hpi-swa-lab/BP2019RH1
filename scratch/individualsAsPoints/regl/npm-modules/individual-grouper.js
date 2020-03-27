
export class IndividualsGrouper {
  
  constructor(individuals, groupingLayouter){
    this.rawIndividuals = individuals;
    this.flatTreeStructure = [];
    this.groupingKey = "root";
    
    // Declare constants
    this.PARENT_ID_KEY = "parentId";
    this.ID_KEY = "id";
    this.GROUP_TYPE = "parent";
    this.INDIVIDUAL_TYPE = "individual";
    this.ROOT_PARENT_ID = "123456789";
    
    // Set up groupingLayouter
    this.groupingLayouter = groupingLayouter;
    this.groupingLayouter.setParentIdKey(this.PARENT_ID_KEY);
    this.groupingLayouter.setIdKey(this.ID_KEY);
    
    // Build initial Root Tree Structure
    this.initializeRootGrouping();

  }
  
  initializeRootGrouping(){
    this.flatTreeStructure = [];
    this.flatTreeStructure.push({id: this.ROOT_PARENT_ID, parentId: ""});
    this.rawIndividuals.forEach((individual, index) => {
        individual[this.PARENT_ID_KEY] = this.ROOT_PARENT_ID;
        individual[this.ID_KEY] = index.toString(10) + 'a'; // we need to add a because the raw index conflicts with grouping by age
        individual['nodeType'] = this.INDIVIDUAL_TYPE;
    })
    
    this.flatTreeStructure.push(...this.rawIndividuals)
    this.groupingLayouter.setColorScaleForDomain(this.groupingKey);
  }
  
  addGrouping(groupingKey){
    this.oldNodes = this.createLookUpTableForNodes(this.currentNodes);
    this.groupingKey = groupingKey;
    
    var uniqueValuesForKey = [...new Set(this.rawIndividuals.map(item => item[groupingKey]))];
    this.groupingLayouter.setColorScaleForDomain(uniqueValuesForKey);
    this.addParentNodes(uniqueValuesForKey);
    
    this.addParentIdsToIndividuals(groupingKey);
    
  }
  
  createLookUpTableForNodes(nodes){
    let lookUpTable = {}
    nodes.forEach((node) => {
      lookUpTable[node.data.id] = node;
    });
  
    return lookUpTable;
  }
  
  addParentNodes(groups){
    groups.forEach((group) => {
      this.flatTreeStructure.push({id: group, parentId: this.ROOT_PARENT_ID, nodeType: this.GROUP_TYPE});
    })
  }
  
  addParentIdsToIndividuals(groupingKey){
    this.rawIndividuals.forEach((node) => {
      let groupValue = node[groupingKey]
      node[this.PARENT_ID_KEY] = groupValue;
    })
  }
  
  getGroupingStructure(){
    this.currentNodes = this.groupingLayouter.createLayout(this.flatTreeStructure);
    this.enrichNodesWithDrawingInformation();
    this.currentNodes.reverse();
    return this.currentNodes;
  }
  
  enrichNodesWithDrawingInformation() {
    this.currentNodes.forEach( (node) => {
      let drawingInformation = {};
    
      drawingInformation["x"] = node.x;
      drawingInformation["y"] = node.y;
      drawingInformation["size"] = node.r * 2;
      drawingInformation["color"] = this.getColorForNode(node);
      
      if(this.oldNodes !== undefined ){
        if(this.nodeIsNotANewNode(node)){
          drawingInformation["tx"] = node.x;
          drawingInformation["ty"] = node.y;
          drawingInformation["sx"] = this.oldNodes[node.data.id].drawing.x;
          drawingInformation["sy"] = this.oldNodes[node.data.id].drawing.y;
          drawingInformation["tsize"] = node.r * 2;
          drawingInformation["ssize"] = this.oldNodes[node.data.id].drawing.size;
          drawingInformation["tcolor"] = this.getColorForNode(node);
          drawingInformation["scolor"] = this.oldNodes[node.data.id].drawing.color;
        }else {
          drawingInformation["tx"] = node.x;
          drawingInformation["ty"] = node.y;
          drawingInformation["sx"] = node.x;
          drawingInformation["sy"] = node.y;
          drawingInformation["tsize"] = node.r * 2;
          drawingInformation["ssize"] = 0
          drawingInformation["tcolor"] = this.getColorForNode(node);
          drawingInformation["scolor"] = this.getColorForNode(node);
        }
        
      }

      node["drawing"] = drawingInformation;
    });
    
  }
  
  nodeIsNotANewNode(node){
      return this.oldNodes[node.data.id] !== undefined
  }
  
  getColorForNode(node) {
    let color;
    let nodeType = node.data['nodeType'];
    if(nodeType == this.GROUP_TYPE) {
      color = this.groupingLayouter.getColorForValue(node['id']);
      color.opacity = 0.85;
    } else {
      color = this.groupingLayouter.getColorForValue(node.data[this.groupingKey]);
    }
    return color;
  }
  
  
}