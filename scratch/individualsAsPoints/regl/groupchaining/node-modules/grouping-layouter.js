
import d3 from "src/external/d3.v5.js"

export class GroupingLayouter {
  
  constructor(canvasWidth, canvasHeight, pointPadding){
    this.layout = d3.pack().size([canvasWidth, canvasHeight]).padding(pointPadding);
  }
  
  setParentIdKey(key){
    this.parentIdKey = key;
  }
  
  setIdKey(key){
    this.idKey = key;
  }
  
  setColorScaleForDomain(uniqueKeyValues) {
    this.colorScale = d3.scaleOrdinal(d3.schemePaired).domain(uniqueKeyValues);
  }
  
  getColorForValue(value) {
    return d3.rgb(this.colorScale(value));
  }
  
  createLayout(flatTreeStructure){
    
    var root = d3.stratify().id(d => d[this.idKey]).parentId(d => d[this.parentIdKey])(flatTreeStructure)
    root.sum(d => { return 1 });
    this.layout(root);
    var nodes = root.descendants();
    return nodes;
  }
  
}