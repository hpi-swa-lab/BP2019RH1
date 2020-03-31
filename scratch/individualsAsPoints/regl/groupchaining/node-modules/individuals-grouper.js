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
      this,
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
    return this.getUniqueValues(this.rawIndividuals, key);
  }
  
  getUniqueValues(individuals, key){
    if(Array.isArray(individuals[0][key])){
      return this.getUniqueValuesForArrayGrouping(individuals, key)
    } else {
      return [...new Set(this.rawIndividuals.map((individual) => individual[key]))]
    }
    
  }
   
  getUniqueValuesForArrayGrouping(individuals, key){
    let values = new Set();
    individuals.forEach((individual) => {
      let individualValues = this.getSortedValue(individual[key]);
      
      if(individualValues !== "missing"){
        individualValues.forEach((value) => {
          values.add(value);
        })
      }
    });
    
    let permutations = this.getPermutationsForValues(Array.from(values));
    permutations.push("missing");
    return permutations;
        
  }
  
  getSortedValue(value){
    if(Array.isArray(value)) return value.sort();
    return value;
  }
  
  getPermutationsForValues(array){
    let permutations = [];
    let intermediate = [];
    array.forEach((entry) => {
      intermediate.push(entry);
      if(intermediate.length > 1) {
        permutations.push([entry])
      }
      permutations.push([...intermediate]);
    })
    
    return permutations.map(permutation => permutation.toString());

  }

}