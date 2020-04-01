const ROOT_PARENT_ID = "asdf"
const GROUP_TYPE = "parent";

export class Grouping {
  
  constructor(groupingKey, individuals, prevGrouping) {
    this.next = null;
    this.prev = prevGrouping;
    this.groupingKey = groupingKey;
    this.individuals = individuals;
    this.groupingNodes = this.createGroupingNodes(individuals, groupingKey);
  }
  
  createGroupingNodes(individuals, groupingKey){
    var groupingNodes = [];
    if(groupingKey == "root"){
      
    } else {
      var appliedGroupingKeys = this.getAppliedGroupingKeys();
      var uniqueValuesForKey = [...new Set(individuals.map(item => item[groupingKey]))];
      uniqueValuesForKey.forEach((groupingValue) => {
        groupingNodes.push({id: groupingValue, parentId: ROOT_PARENT_ID, nodeType: GROUP_TYPE});
      });
    }
    
  }
  
  addGrouping() {
    //check for next Grouping
    //if null, apply group chaining
  }
  
  getGroupingStructure(){
    if(this.next == null){
      
    }
  }
  
  getAppliedGroupingKeys() {
    if(this.prev === null) {
      return [ this.groupingKey ];
    } else {
      return this.prev.getAppliedGroupingKeys().push(this.groupingKey); 
    }
  }
  
  applyGrouping() {
    //get grouping Keys from prevs  
  }
  
  
}