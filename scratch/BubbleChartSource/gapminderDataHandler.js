
import {CSVAdapter} from "./csvAdapter.js";

export class GapminderDataHandler {
  constructor(){
    this.csvAdapter = new CSVAdapter();
    this.data = null;
  }
  
  async fetchGDP(url){
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