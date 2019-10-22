class DataConfiguration {
  constructor(dataArray){
    this.years = dataArray[0];
    this.countrysWithGDP = dataArray[1];
    this.countryDataWithYearMapping = this.buildYearDatapointMapping();
    this.countries = Object.keys(this.countryDataWithYearMapping);
  }
  
  getYears() {
    return this.years;
  }
  
  getCountryData() {
    return this.countryDataWithYearMapping;
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
  
  buildYearDatapointMapping() {
    let countryWithYearsData = {};
    this.countrysWithGDP.forEach((country) => {
      if(country.length == this.years.length + 1){
        let countryYears = {};
        this.years.slice(0, this.years.length-1).forEach((year, index) => {
          countryYears[year] = country[index+1];
        })
        let countryName = country[0];
        countryWithYearsData[countryName] = countryYears;
      }
    })
    return countryWithYearsData;
  }
}

export class DataConfigurationGDP extends DataConfiguration {
  
}

export class DataConfigurationBMI extends DataConfiguration {
  
}

export class DataConfigurationBirths extends DataConfiguration {
  
}