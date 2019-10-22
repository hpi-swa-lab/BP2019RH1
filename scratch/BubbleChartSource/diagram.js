import { CountryBuilder } from './countryBuilder.js'

export class BubbleDiagramm{
  constructor(xDataConfig, yDataConfig, sizeDataConfig, parentElement){
    this.xDataConfig = xDataConfig;
    this.yDataConfig = yDataConfig;
    this.sizeDataConfig = sizeDataConfig;
    this.parentElement = parentElement;
    this.countryBuilder = new CountryBuilder(xDataConfig, yDataConfig, sizeDataConfig);
    this.yearRange = null;
  }
  
  renderAxis(){
    
    let worldWidth = this.parentElement.offsetWidth;
    let worldHeight = this.parentElement.offsetHeight;
    let xMax = this.xDataConfig.getMax();
    let yMax = this.yDataConfig.getMax();
    let yMin = this.yDataConfig.getMin();
    let numberXDashes = this.xDataConfig.getNumberOfTics();
    let numberYDashes = this.yDataConfig.getNumberOfTics();
    
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
      yTag.textContent = parseInt(yMin + i * ((yMax - yMin) / numberYDashes))
      
      let yTagWidth = lively.getExtent(yTag).x;
      let yTagHeight = lively.getExtent(yTag).y;
      lively.setPosition(yTag, lively.pt(-yTagWidth, worldHeight - i * (worldHeight / numberYDashes) - yTagHeight / 2));
      
    }
  }
  
  renderData() {
    this.countries = this.countryBuilder.build();
    this.renderDataFromYear("1999");
  }
  
  renderDataFromYear(year){
    
    Object.keys(this.countries).forEach((countryKey)=>{
      let country = this.countries[countryKey];
      let countryDiv = country.getBubbleDivForYear(year);
      
      if(countryDiv == null){
        let potentiallyExistingDiv = lively.query(this.parentElement, '#' + country.countryName);
        if(potentiallyExistingDiv != undefined){
          this.parentElement.remove(potentiallyExistingDiv);
        }
      } else {
        this.renderDivForCountryAndYear(year, countryDiv, country);
      }
    })
    
  }
      
  renderDivForCountryAndYear(year, countryDiv, country){
    
    let extent = country.getSizeValueForYear(year)*0.00001;
    
    let divExtent = {"x": extent, "y": extent};
    
    lively.setExtent(countryDiv, divExtent);
    
    let position = this.getScaledCoordsFromData(country.getXValuesForYear(year), country.getYValuesForYear(year), divExtent);
    
    lively.setPosition(countryDiv, position);
    
    this.parentElement.appendChild(countryDiv);
    
  }
  
  getScaledCoordsFromData(dataPointX, dataPointY, extent) {
    
    let worldWidth = this.parentElement.offsetWidth;
    let worldHeight = this.parentElement.offsetHeight;

    let xMax = this.xDataConfig.getMax();
    let yMax = this.yDataConfig.getMax();
    let yMin = this.yDataConfig.getMin();

    //invert y-coords
    dataPointY = worldHeight - (dataPointY - yMin) * (worldHeight / (yMax - yMin));
    dataPointX = dataPointX / xMax * worldWidth

    //set center of bubble on point

    dataPointX -= extent.x / 2;
    dataPointY -= extent.y / 2;
    
    return {"x": dataPointX, "y": dataPointY}; 
  }
}