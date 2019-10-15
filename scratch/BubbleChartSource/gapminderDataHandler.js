
import {CSVAdapter} from "./csvAdapter.js";

export class GapminderDataHandler {
  constructor(){
    this.csvAdapter = new CSVAdapter();
  }
  
  async fetchGDP(url){
    let data = await this.csvAdapter.fetchData(url);
    let parsedData = this.csvAdapter.parseData(";", data);
    
    return this.extractYearsAndCountries(parsedData);
  }
  
  async fetchBMI(url){
    let data = await this.csvAdapter.fetchData(url);
    let parsedData = this.csvAdapter.parseData(";", data);
    
    return this.extractYearsAndCountries(parsedData);
  }
  
  async fetchBirth(url){
    let data = await this.csvAdapter.fetchData(url);
    let parsedData = this.csvAdapter.parseData(";", data);
    
    return this.extractYearsAndCountries(parsedData);
  }

  extractYearsAndCountries(parsedDataRows){
    let firstRow = parsedDataRows[0];
    parsedDataRows.shift();
    firstRow.shift();
    this.data = [firstRow, parsedDataRows];
    return this.data;
  }
}