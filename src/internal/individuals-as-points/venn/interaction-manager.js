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
  
  registerToggle(subjects) {
    this.toggleSubjects = subjects
    d3.select(this.canvas)
      .on("click", () => this._clickSubject())
  }
  
  registerDoubleClick(subjects) {
    this.doubleClickSubjects = subjects
    d3.select(this.canvas)
      .on("dblclick", () => this._doubleClickSubject())
  }
  
  setDraggingSubjects(subjects) {
    this.draggableSubjects = subjects
  }
  
  setToggleSubjects(subjects) {
    this.toggleSubjects = subjects
  }
  
  setDoubleClickSubjects(subjects) {
    this.doubleClickSubjects = subjects
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _doubleClickSubject() {
    let doubleClickSubject = this._getSubjectUnderMouse(this.doubleClickSubjects)
    
    if(doubleClickSubject) doubleClickSubject.toggleDoubleClick()
  }
  
  _clickSubject() {
    let toggleSubject = this._getSubjectUnderMouse(this.toggleSubjects)
    
    if(toggleSubject) toggleSubject.toggleSingleClick()
  }
  
  _getSubjectUnderMouse(subjects) {
    let position = d3.mouse(this.canvas)
    let x = position[0]
    let y = position[1]
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
    return this._getSubjectUnderMouse(this.draggableSubjects)
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
    //node.updatePosition(x, y)
    //this.vennDiagram.updateDistribution()
  }
  
}