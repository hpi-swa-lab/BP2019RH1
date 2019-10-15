export class DataConfigurationGDP {
  constructor(dataArray){
    this.years = dataArray[0];
    this.countrysWithGDP = dataArray[1];
  }
  
  getMaxX(){
    let maxX = 0;
    for(let countryArray of this.countrysWithGDP){
      for(let i=1;i<countryArray.length;i++){
        let currentMax = Math.parseToInt(countryArray[i], 10);
        if(currentMax > maxX){
          maxX = currentMax
        }
      }
    }
    
    return maxX;
  }
  
  getMinX(){
    return 0;
  }
  
  getMaxY(){
    return 60;
  }
  
  getMinY(){
    return 50;
  }
  
  getNumberOfXTics(){
    return 10;
  }
  
  getNumberOfYTics(){
    return 2;
  }
  
}