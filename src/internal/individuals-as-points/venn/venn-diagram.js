import { FORCE_CENTER_SIZE, FORCE_CENTER_COLOR, ForceCenterManager } from "./force-center-manager.js"
import IndividualsDistributor from "./individuals-distributor.js"
import IndividualsSimulation from "./individuals-simulation.js"
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
  
  async addThemeGroup(uuid, name, themes, color) {
    this.individualsSimulation.stop()
    this.forceCenterManager.addThemeGroup(uuid, name, themes, color)
    await this._loadNewLayout()
    this._updateInteractionSubjects()
    this._registerForceCenterAnnotations()
    this.updateDistribution()
  }
  
  updateThemeGroup(uuid, name, themes, color) {
    this.forceCenterManager.updateThemeGroup(uuid, name, themes, color);
    this.updateDistribution()
  }
  
  async removeThemeGroup(uuid) {
    this.individualsSimulation.stop()
    this.forceCenterManager.removeThemeGroup(uuid)
    await this._loadNewLayout()
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
  
  selectIndividuals(selectAction) {
    selectAction.runOn(this.individuals)
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
    this.individualsSimulation.updateForces()
  }
  
  stopSimulation() {
    if(this.individualsSimulation) this.individualsSimulation.stop()
  }
    
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  async _loadNewLayout() {
    this._startLoadingAnimation()
    await this.forceCenterManager.updateLayout()
    this._endLoadingAnimation()
  }
  
  _startLoadingAnimation() {
    this.loaderDiv = <div class="loader"></div>;
    Object.assign(this.loaderDiv.style, this._getLoaderDivCSS())
    this.canvas.parentElement.appendChild(this.loaderDiv)
  }
  
  _getLoaderDivCSS() {
    let canvasRootElement = this.canvas.parentElement
    let positionX = canvasRootElement.offsetLeft + canvasRootElement.offsetWidth / 2;
    let positionY = canvasRootElement.offsetTop + canvasRootElement.offsetHeight / 2;
    return {
      border: "16px solid #f3f3f3",
      borderTop: "16px solid #3498db",
      borderRadius: "50%",
      width: "80px",
      height: "80px",
      animation: "spin 2s linear infinite",
      position: "absolute",
      left: positionX + "px",
      top: positionY + "px"
    }
  }
  
  _endLoadingAnimation() {
    this.canvas.parentElement.removeChild(this.loaderDiv)
  }
  
  _preprocessIndividuals(){
    this.individuals.forEach(individual => {
      individual.drawing.currentSize = INDIVIDUALS_DOT_SIZE
    })
  }
  
  async _setupVisualization(){
    this.forceCenterManager.setInitialForceCenter()
    await this.forceCenterManager.updateLayout()
    this.individualsDistributor.setDistribution(
      this.individuals, 
      this.forceCenterManager.getForceCenters()
    )
    this._setupIndividualsSimulation(this.individuals)
    this._setupInteraction()
    this._registerForceCenterAnnotations()
  }
 
  _setupIndividualsSimulation(individuals) {
    this.individualsSimulation = new IndividualsSimulation(this, individuals)
    this.individualsSimulation.start()
  }
  
  _setupInteraction() {
    this.interactionManager.registerDragging(this.forceCenterManager.getForceCenters())
    this.interactionManager.registerToggle(this.forceCenterManager.getForceCenters())
    this.interactionManager.registerDoubleClick(this.forceCenterManager.getForceCenters())
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
      let color = ColorStore.current().convertColorObjectToRGBAValue(
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