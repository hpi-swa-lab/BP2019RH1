import { Country } from './country.js';

export class CountryBuilder {
  constructor(xDataConfig, yDataConfig, sizeDataConfig) {
    this.xDataConfig = xDataConfig;
    this.yDataConfig = yDataConfig;
    this.sizeDataConfig = sizeDataConfig;
  }
  
  getYearRange() {
    
    let xYears = this.xDataConfig.getYears();
    let xYearsMin = parseInt(xYears[0]);
    let xYearsMax = parseInt(xYears[xYears.length-1]);
    
    let yYears = this.yDataConfig.getYears();
    let yYearsMin = parseInt(yYears[0]);
    let yYearsMax = parseInt(yYears[yYears.length-1]);
    
    let sizeYears = this.sizeDataConfig.getYears();
    let sizeYearsMin = parseInt(sizeYears[0]);
    let sizeYearsMax = parseInt(sizeYears[sizeYears.length-1]);
    
    let maxYear = Math.max(xYearsMax, yYearsMax, sizeYearsMax);
    let minYear = Math.min(xYearsMin, yYearsMin, sizeYearsMin);
    
    return [minYear, maxYear];
    }
  
  build() {
    
    let yearRange = this.getYearRange();
    
    let countries = {};
    
    
    
    let xCountrieNames = this.xDataConfig.countries;
    let yCountrieNames = this.yDataConfig.countries;
    let zCountrieNames = this.sizeDataConfig.countries;
    
    let allCountrieNames = [...new Set([...zCountrieNames, ...yCountrieNames, ...xCountrieNames])];
    
    allCountrieNames.forEach((countryName) => {
      if(countryName != "\"" && countryName != "\"\""){
          let newCountry = this.generateNewCountry(yearRange[0], yearRange[1], countryName);
          countries[countryName] = newCountry;
      }
    })
    
    let countryPrototype = Country.prototype;
    
    this.setDataPointsForDimension(countries, this.xDataConfig, countryPrototype.setXValues);
    this.setDataPointsForDimension(countries, this.yDataConfig, countryPrototype.setYValues);
    this.setDataPointsForDimension(countries, this.sizeDataConfig, countryPrototype.setSizeValues)
    
    return countries;
  }
  
  
  setDataPointsForDimension(countries, dataConfig, setDataFunction){
  
    let configCountryData = dataConfig.getCountryData();
    
    Object.keys(configCountryData).forEach((countryName) =>  {
      if(countryName != "\"" && countryName != "\"\""){
        setDataFunction.call(countries[countryName], configCountryData[countryName]);
      }
    })
  }
  
  
  generateNewCountry(yearMin, yearMax, countryName) {
    let newCountry = new Country(countryName);
    newCountry.setYearRange(yearMin, yearMax);
    return newCountry;
  }
}