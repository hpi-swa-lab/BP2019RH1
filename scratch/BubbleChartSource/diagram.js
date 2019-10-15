export class BubbleDiagramm{
  constructor(dataConfig, parentElement){
    this.dataConfig = dataConfig;
    
    this.parentElement = parentElement;
  }
  
  renderAxis(){
    
    let worldWidth = this.parentElement.offsetWidth;
    let worldHeight = this.parentElement.offsetHeight;
    let xMax = this.dataConfig.getMaxX();
    let yMax = this.dataConfig.getMaxY();
    let yMin = this.dataConfig.getMinY();
    let numberXDashes = this.dataConfig.getNumberOfXTics();
    let numberYDashes = this.dataConfig.getNumberOfYTics();
    
    this.renderXDashesWithTags(worldWidth, worldHeight, xMax, numberXDashes);
    
    this.renderYDashesWithTags(worldWidth, worldHeight, yMax, numberYDashes, yMin);
    
    
  }
  
  renderXDashesWithTags(worldWidth, worldHeight, xMax, numberXDashes){
    for(let i = 0; i <= numberXDashes; i++){
      let xDash = <div class="xDash"></div>;
      this.parentElement.appendChild(xDash);
      
      let xDashHeight = lively.getExtent(xDash).y;
      lively.setPosition(xDash, lively.pt(i * (
      worldWidth / numberXDashes), worldHeight - xDashHeight/2));
      
      let xTag = <div class="xTag"></div>;
      this.parentElement.appendChild(xTag);
      xTag.textContent = parseInt(i * (xMax / numberXDashes));
      
      let xTagWidth = lively.getExtent(xTag).x;
      lively.setPosition(xTag, lively.pt(i * (worldWidth / numberXDashes) - xTagWidth / 2, worldHeight + xDashHeight) )
    }
  }
  
  renderYDashesWithTags(worldWidth, worldHeight, yMax, numberYDashes, yMin){
    for(let i=0; i <= numberYDashes; i++){ 
      
      let yDash = <div class="yDash"></div>;
      this.parentElement.appendChild(yDash);
      let yDashWidth = lively.getExtent(yDash).x;
      lively.setPosition(yDash, lively.pt(0 - yDashWidth/2, i * (worldHeight / numberYDashes)));

      let yTag = <div class="yTag"> </div>;
      this.parentElement.appendChild(yTag);
      yTag.textContent = yMin + i * ((yMax - yMin) / numberYDashes)
      
      let yTagWidth = lively.getExtent(yTag).x;
      let yTagHeight = lively.getExtent(yTag).y;
      lively.setPosition(yTag, lively.pt(-yTagWidth, worldHeight - i * (worldHeight / numberYDashes) - yTagHeight / 2));
      
    }
  }
}