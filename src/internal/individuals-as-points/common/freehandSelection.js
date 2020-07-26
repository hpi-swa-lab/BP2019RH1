export default class FreehandSelection {
  constructor(color, linePoints){
    this.color = color
    this.linePoints = linePoints
  }
  
  getColor() {
    return this.color
  }
  
  getLinePoints() {
    return this.linePoints
  }
}