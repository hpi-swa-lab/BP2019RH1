export class Country {
  
  constructor(countryName) {
    this.countryName = countryName;
  }
  
  setYearRange(minYear, maxYear) {
    this.minYear = minYear;
    this.maxYear = maxYear;
  }
  
  createBubbleForYear(year) {
    // return Bubble-Div
  }
  
  allDimensionsAvailableForYear(year) {
    // check if all dimension are there for plotting 
  }
  
  setXValues(values) {
    this.xValues = values;
  }
  
  setYValues(values) {
    this.yValues = values;
  }
  
  setSizeValues(values) {
    this.sizeValues;
  }
}