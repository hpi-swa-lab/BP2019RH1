export class DataConfigurationGDP {
  constructor(dataArray){
    this.years = dataArray[0];
    this.countrysWithGDP = dataArray[1];
  }
  
  getYears() {
    return this.years;
  }
  
  getCountryData() {
    return this.countrysWithGDP;
  }
  
  getMax(){
    let maxX = 0;
    for(let countryArray of this.countrysWithGDP) {
      for(let i = 1; i < countryArray.length; i++) {
        let currentMax = parseInt(countryArray[i]);
        if(currentMax > maxX){
          maxX = currentMax
        }
      }
    }
    
    return maxX;
  }
  
  getMin(){
    return 0;
  }
  
  getNumberOfTics(){
    return 10;
  }
  
}

export class DataConfigurationBMI {
  constructor(dataArray){
    this.years = dataArray[0];
    this.countrysWithBMI = dataArray[1];
  }
  
  getYears() {
    return this.years;
  }
  
  getCountryData() {
    return this.countrysWithBMI;
  }
  
  getMax(){
    let maxX = 0;
    for(let countryArray of this.countrysWithBMI) {
      for(let i = 1; i < countryArray.length; i++) {
        let currentMax = parseInt(countryArray[i]);
        if(currentMax > maxX){
          maxX = currentMax
        }
      }
    }
    
    return maxX;
  }
  
  getMin(){
    return 0;
  }
  
  getNumberOfTics(){
    return 10;
  }
  
}

export class DataConfigurationBirths {
  constructor(dataArray){
    this.years = dataArray[0];
    this.countrysWithBirth = dataArray[1];
  }
  
  getYears() {
    return this.years;
  }
  
  getCountryData() {
    return this.countrysWithBirth;
  }
  
  getMax(){
    let maxX = 0;
    for(let countryArray of this.countrysWithBirth) {
      for(let i = 1; i < countryArray.length; i++) {
        let currentMax = parseInt(countryArray[i]);
        if(currentMax > maxX){
          maxX = currentMax
        }
      }
    }
    
    return maxX;
  }
  
  getMin(){
    return 0;
  }
  
  getNumberOfTics(){
    return 10;
  }
  
}