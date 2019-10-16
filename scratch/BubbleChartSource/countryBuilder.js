import { Country } from './country.js'

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
    let yearMin = yearRange[0];
    let yearMax = yearRange[1];
    
    let countries = {};
    
    this.xDataConfig.getCountryData().forEach((country) => {
      let countryName = country[0];
      let newCountry = this.generateNewCountry(yearMin, yearMax, countryName);
      countries[countryName] = newCountry;
      newCountry.setXValues(country.slice(1, country.length-1));
    })
    
    this.yDataConfig.getCountryData().forEach((country) =>  {
      let countryName = country[0];
      
      if (!Object.keys(countries).includes(countryName)) {
        let newCountry = this.generateNewCountry(yearMin, yearMax, countryName);
        countries[countryName] = newCountry;
        newCountry.setYValues(country.slice(1, country.length-1))
      }
      else {
        countries[countryName].setYValues(country.slice(1, country.length-1))      
      }
    })
      
    this.sizeDataConfig.getCountryData().forEach((country) =>  {
      let countryName = country[0];
      
      if (!Object.keys(countries).includes(countryName)) {
        let newCountry = this.generateNewCountry(yearMin, yearMax, countryName);
        countries[countryName] = newCountry;
        newCountry.setSizeValues(country.slice(1, country.length-1))
      }
      else {
        countries[countryName].setSizeValues(country.slice(1, country.length-1))      
      }
    })
    
    return countries;
  }
  
  generateNewCountry(yearMin, yearMax, countryName) {
    let newCountry = new Country(countryName);
    newCountry.setYearRange(yearMin, yearMax);
    return newCountry;
  }
}