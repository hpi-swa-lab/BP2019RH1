import { Grouping } from 'https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/groupchaining/node-modules/groupingTryOut.js';
import { GroupingMenu } from './grouping-menu.js';


export class IndividualsGrouper {
  
  constructor(interactiveCanvas, individuals, groupingLayouter, menuContainer, world, keys){
    this.interactiveCanvas = interactiveCanvas;
    
    // Set up groupingLayouter
    this.groupingLayouter = groupingLayouter;
    this.groupingLayouter.setParentIdKey("parentId");
    this.groupingLayouter.setIdKey("id");
    
    this.rawIndividuals = individuals;
    
    this.groupingKeys = "root";
    
    this.headGrouping = new Grouping(
      this.groupingKey, 
      [], 
      [],
      [],
      [],
      this.rawIndividuals.slice(), 
      this.groupingLayouter);
    this.headGrouping.initializeRootGrouping();
    this.groupingMenu = this.initializeGroupingMenu(menuContainer, world, keys);
  }
  
  initializeGroupingMenu(menuContainer, world, keys) {
    let menu = new GroupingMenu(this, keys);
    menu.initGroupingSelectBox(menuContainer, world, this.addGrouping, this.removeGrouping)
    return menu;
  }
  
  getGroupingStructure(){
    return this.headGrouping.getGroupingStructure();
  } 
  
  addGrouping(groupingKey){
    this.headGrouping.addGrouping(groupingKey);
    this.interactiveCanvas.updateNodes(this.getGroupingStructure(), groupingKey)
    this.interactiveCanvas.animateNodes();
  }
  
  removeGrouping(groupingKey){
    this.headGrouping.removeGrouping(groupingKey);
    this.interactiveCanvas.updateNodes(this.getGroupingStructure())
    this.interactiveCanvas.animateNodes();
  }
  
  getUniqueValuesForKey(key){
    return [...new Set(this.rawIndividuals.map((individual) => individual[key]))]
  }
}