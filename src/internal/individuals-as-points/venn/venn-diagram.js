import { FORCE_CENTER_SIZE, FORCE_CENTER_COLOR, ForceCenterManager } from "./force-center-manager.js"
import IndividualsDistributor from "./individuals-distributor.js"
import ForceSimulation from "./force-simulation.js"
import ColorStore from "../common/color-store.js"
import InteractionManager from "./interaction-manager.js"

const INDIVIDUALS_DOT_SIZE = 3
export const THEME_GROUP_COLOR_TRANSPARENCY = "88"

export default class VennDiagram {
  
  constructor(canvas) {
    this.canvas = canvas
    this.canvasContext = canvas.getContext("2d")
    this.forceCenterManager = new ForceCenterManager(canvas)
    this.individualsDistributor = new IndividualsDistributor()
    this.interactionManager = new InteractionManager(canvas, this)
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  initializeWithData(individuals) {
    this.individuals = individuals
    this.initialIndividuals = individuals
    this._preprocessIndividuals()
    this._setupVisualization()
  }
  
  addThemeGroup(uuid, name, themes, color) {
    this.forceCenterManager.addThemeGroup(uuid, name, themes, color)
    this._updateInteractionSubjects()
    this._registerForceCenterAnnotations()
    this.updateDistribution()
  }
  
  updateThemeGroup(uuid, name, themes, color) {
    this.forceCenterManager.updateThemeGroup(uuid, name, themes, color);
    this.updateDistribution()
  }
  
  removeThemeGroup(uuid) {
    this.forceCenterManager.removeThemeGroup(uuid)
    this._updateInteractionSubjects()
    this.updateDistribution()
  }
  
  recolorIndividuals(colorAction) {
    colorAction.runOn(this.individuals)
    colorAction.runOn(this.initialIndividuals)
  }
  
  filterIndividuals(filterAction) {
    this.individuals = filterAction.runOn(this.initialIndividuals)
  }
  
  draw() {
    this._clearCanvas()
    this._drawHulls()
    this._drawForceCenters()
    this._drawIndividuals()
    
  }
  
  updateDistribution() {
    this.individualsDistributor.setDistribution(
      this.individuals, this.forceCenterManager.getForceCenters())
    this.simulation.updateForces()
  }
  
  stopSimulation() {
    if(this.simulation) this.simulation.stop()
  }
    
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _preprocessIndividuals(){
    this.individuals.forEach(individual => {
      individual.drawing.currentSize = INDIVIDUALS_DOT_SIZE
    })
  }
  
  _setupVisualization(){
    this.forceCenterManager.setInitialForceCenter()
    this.individualsDistributor.setDistribution(
      this.individuals, this.forceCenterManager.getForceCenters())
    this._setupSimulation(this.individuals)
    this._setupInteraction()
    this._registerForceCenterAnnotations()
  }
 
  _setupSimulation(individuals) {
    this.simulation = new ForceSimulation(this, individuals)
    this.simulation.start()
  }
  
  _setupInteraction() {
    this.interactionManager.registerDragging(this.forceCenterManager.getForceCenters())
    this.interactionManager.registerToggle(this.forceCenterManager.getForceCenters())
  }
  
  _registerForceCenterAnnotations() {
    let annotations = this.forceCenterManager.getForceCenterAnnotations()
    annotations.forEach( annotation => {
      this.canvas.parentElement.appendChild(annotation)
    })
  }
  
  _updateInteractionSubjects() {
    this.interactionManager.setDraggingSubjects(this.forceCenterManager.getForceCenters())
    this.interactionManager.setToggleSubjects(this.forceCenterManager.getForceCenters())
  }
  
  _clearCanvas() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  _drawIndividuals() {
    this.individuals.forEach(individual => {
      let color = ColorStore.current().convertRGBAColorObjectToRGBAString(
        individual.drawing.currentColor)
      this._drawPoint(
        individual.x, 
        individual.y, 
        individual.drawing.currentSize, 
        color
      )
    })
  }
  
  _drawForceCenters() {
    this.forceCenterManager.getForceCenters().forEach(forceCenter => {
      this._drawPoint(
        forceCenter.x,
        forceCenter.y,
        FORCE_CENTER_SIZE,
        FORCE_CENTER_COLOR
      )
    })
  }
  
  _drawHulls() {
    this.forceCenterManager.getThemeGroups().forEach(themeGroup => {
      let groupHull = themeGroup.getGroupHull()
      this._drawPolygon(groupHull.getPaddedHullCornerPoints(), themeGroup.getColor())
    })
  }
  
  _drawPoint(x, y, size, color) {
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, size, 0, Math.PI * 2, true);
    this.canvasContext.fill();
  }
  
  _drawPolygon(cornerPoints, color) {
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(cornerPoints[0][0], cornerPoints[0][1]);
    cornerPoints.shift()
    cornerPoints.forEach((point) => {
      this.canvasContext.lineTo(point[0], point[1]);
    })
    this.canvasContext.closePath();
    this.canvasContext.fill();
  }
  
  
}