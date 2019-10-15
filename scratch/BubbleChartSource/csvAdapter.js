export class CSVAdapter {
  
  constructor() {
    this.data = null;
  }
  
  
  async fetchData(url) {
    let response = await fetch(url)
    this.data = response.text();
    return this.data;
  }
  
  parseData(delimiter, data) {
    var lines = data;
    lines = lines.split(/\r\n|\n/);
    let newLines = [];
    lines.forEach((line) => {
      line = line.split(delimiter);
      newLines.push(line);
    });
    this.data = newLines;
    return newLines
  }
  
}