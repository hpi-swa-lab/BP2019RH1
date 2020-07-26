export const GeoDataType = "geoData"

export default class GeoData {
  constructor(data=[]) {
    this.data = data
  }
  
  setData(data) {
    this.data = data
  }
  
  getData() {
    return this.data
  }
  
  getType() {
    return GeoDataType
  }
}