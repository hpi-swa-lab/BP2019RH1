import d3Hull from "https://d3js.org/d3-polygon.v1.min.js"

export default class GroupHull {
  constructor() {
    this.individuals = []
  } 
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setIndividualsToInclude(individuals) {
    this.individuals = individuals
  }
  
  getPaddedHullCornerPoints() {
    let points = this.individuals.map(individual => [individual.x, individual.y])
    let cornerPoints = d3Hull.polygonHull(points)
    return this._getPaddedPoints(cornerPoints)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _getPaddedPoints(cornerPoints){
    let paddedHull = [];
    let centroid = d3Hull.polygonCentroid(cornerPoints);
    cornerPoints.forEach(cornerPoint => {
      paddedHull.push(this._padd(cornerPoint, centroid));
    })
    return paddedHull;
  }

  _padd(cornerPoint, center){
    let x = center[0] + ( (cornerPoint[0] - center[0]) * 1.2)
    let y = center[1] + ( (cornerPoint[1] - center[1]) * 1.2)
    return [x,y]
  }

  
}