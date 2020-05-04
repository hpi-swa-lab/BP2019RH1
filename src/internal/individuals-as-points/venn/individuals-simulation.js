import d3 from "src/external/d3.v5.js";

export default class IndividualsSimulation {
  constructor(vennDiagram, individuals) {
    this.vennDiagram = vennDiagram
    this.simulation = this._createSimulation(individuals)
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  start() {
    setTimeout(() => this.simulation.alpha(0.5).restart(), 250);
  }
  
  stop() {
    this.simulation.stop()
  }
  
  updateForces() {
    this.simulation
      .force("x", d3.forceX(individual => individual.center.x).strength(0.1))
      .force("y", d3.forceY(individual => individual.center.y).strength(0.1))
    
    this.start()
  }
    
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _createSimulation(individuals) {
    return d3.forceSimulation()
       .force("collision", d3.forceCollide(4).iterations(1))
       .force("x", d3.forceX(individual => individual.center.x).strength(0.1))
       .force("y", d3.forceY(individual => individual.center.y).strength(0.1))
       .alphaDecay(0.007)
       .alpha(0.5)
        .nodes(individuals)
        .on("tick", () => this._tick(this.vennDiagram))
  }
  
  _tick(vennDiagram) {
    vennDiagram.draw()
  }
}