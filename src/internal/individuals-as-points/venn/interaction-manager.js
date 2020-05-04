import d3 from "src/external/d3.v5.js";

export default class InteractionManager {
  constructor(canvas, vennDiagram) {
    this.canvas = canvas
    this.vennDiagram = vennDiagram
    this.transform = d3.zoomIdentity;
    this.radius = 35
    this.draggableSubjects = []
    this.toggleSubjects = []
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  registerDragging(subjects) {
    this.draggableSubjects = subjects
    
    d3.select(this.canvas)
      .call(d3.drag()
            .subject(() => this._dragSubject())
            .on("drag", () => this._dragged())
            .on("end", () => this._dragended()))
  }
  
  setDraggingSubjects(subjects) {
    this.draggableSubjects = subjects
  }
  
  setToggleSubjects(subjects) {
    this.toggleSubjects = subjects
  }
  
  registerToggle(subjects) {
    this.toggleSubjects = subjects
    d3.select(this.canvas)
      .on("click", () => this._clickSubject())
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _clickSubject() {
    let position = d3.mouse(this.canvas)
    let toggleSubject = this._getSubjectUnderMouse(
      position[0], 
      position[1], 
      this.toggleSubjects)
    
    if(toggleSubject) toggleSubject.toggle()
  }
  
  _getSubjectUnderMouse(x, y, subjects) {
    var i,
    dx,
    dy;
    for (i = subjects.length - 1; i >= 0; --i) {
      let node = subjects[i];
      dx = x - node.x;
      dy = y - node.y;

      if (dx * dx + dy * dy < this.radius * this.radius) { 
        return node;
      }
    }
  }
  
  _dragSubject() {
    let x = this.transform.invertX(d3.event.x)
    let y = this.transform.invertY(d3.event.y)
    return this._getSubjectUnderMouse(x, y, this.draggableSubjects)
  }
  
  _dragged() {
    let node = d3.event.subject;
    node.fx = this.transform.invertX(d3.event.x)
    node.fy = this.transform.invertY(d3.event.y)
    node.updatePosition(d3.event.x, d3.event.y)
    this.vennDiagram.updateDistribution()
  }

  _dragended() {
    let node = d3.event.subject;
    node.fx = null;
    node.fy = null;
    let x = this.transform.invertX(d3.event.x)
    let y = this.transform.invertY(d3.event.y)
    node.updatePosition(x, y)
    this.vennDiagram.updateDistribution()
  }
  
}