export class Country {
  
  constructor(countryName) {
    this.countryName = this.cleanCountryName(countryName);
    this.xValues = null;
    this.yValues = null;
    this.sizeValues = null;
    this.bubbleDiv = null;
  }
  
  cleanCountryName(countryName){
    return countryName.replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/'/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/"/g, '');
  }
  
  setYearRange(minYear, maxYear) {
    this.minYear = minYear;
    this.maxYear = maxYear;
  }
  
  getBubbleDivForYear(year){
    if(this.bubbleDiv == null){
      if(this.allDimensionsAvailableForYear(year) == true){
        this.bubbleDiv = <div class="bubble" id="bubble"></div>;
        this.bubbleDiv.id = this.countryName;
      }
    } else {
      if(!this.allDimensionsAvailableForYear(year) == true){
        this.bubbleDiv = null;
      }
    }
    
    return this.bubbleDiv;
    
  }
  
  allDimensionsAvailableForYear(year) {
    if(this.getXValuesForYear(year) == undefined || 
      this.getYValuesForYear(year) == undefined ||
      this.getSizeValueForYear(year) == undefined ){
      return false;
    } else {
      return true;
    }
  }
  
  setXValues(values) {
    this.xValues = values;
  }
  
  setYValues(values) {
    this.yValues = values;
  }
  
  setSizeValues(values) {
    this.sizeValues = values;
  }
  
  getXValuesForYear(year){
    if(this.xValues != null){
      return this.xValues[year];
    } else {
      return undefined;
    }
    
  }
  
  getYValuesForYear(year){
    if(this.yValues != null){
      return this.yValues[year];
    } else {
      return undefined;
    }
    
  }
  
  getSizeValueForYear(year){
    if(this.sizeValues != null){
      return this.sizeValues[year];
    } else {
      return undefined;
    }
    
  }
}