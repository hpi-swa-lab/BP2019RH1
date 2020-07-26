import { FORCE_CENTER_SIZE, FORCE_CENTER_COLOR, ForceCenterManager } from "./force-center-manager.js"
import IndividualsDistributor from "./individuals-distributor.js"
import IndividualsSimulation from "./individuals-simulation.js"
import InteractionManager from "./interaction-manager.js"
import { InspectAction } from '../common/actions.js'
import FreehandDrawer from '../common/drawFreehand.js'
import inside from "../common/npm-point-in-polygon.js"

const INDIVIDUALS_DOT_SIZE = 3
export const THEME_GROUP_COLOR_TRANSPARENCY = "88"

export default class VennDiagram {
  constructor(owner, canvas, freehandSVGLayer, freehandCanvas) {
    this.owner = owner
    this.canvas = canvas
    this.freehandLayer = freehandSVGLayer
    this.freehandCanvas = freehandCanvas
    this.freehandCanvasContext = freehandCanvas.getContext('2d')
    this.canvasContext = canvas.getContext("2d")
    this.forceCenterManager = new ForceCenterManager(canvas, this)
    this.individualsDistributor = new IndividualsDistributor()
    this.interactionManager = new InteractionManager(freehandCanvas, this)
    this.strokeStyle = false
  
    this.drawer = new FreehandDrawer(this.canvas.parentElement, this.freehandCanvas, this.freehandLayer)
    this.drawer.addListener(this)
    this.drawer.start()
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor  
    this._propagateDataProcessor()
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
    this._propagateColorStore()
  }
  
  setCanvasExtent(newCanvasWidth, newCanvasHeight) {
    this.forceCenterManager.setCanvasExtent(newCanvasWidth, newCanvasHeight)
  }
  
  setStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
  }
  
  updateStrokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle
    this.draw()
  }
  
  async initializeWithData(individuals) {
    this.drawer.deleteSelections()
    this._stopSimulation()
    this.individuals = individuals
    this.initialIndividuals = individuals
    this._preprocessIndividuals()
    await this._setupVisualization()
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
    this._stopSimulation()
    colorAction.runOn(this.individuals)
    colorAction.runOn(this.initialIndividuals)
    this.updateDistribution()
  }
  
  filterIndividuals(filterAction) {
    this._stopSimulation()
    this.individuals = filterAction.runOn(this.initialIndividuals)
    this.individualsSimulation.updateIndividuals(this.individuals)
    if(this._individualsNotEmpty()) {
      this.updateDistribution()
    }
  }
  
  selectIndividuals(selectAction) {
    this._stopSimulation()
    selectAction.runOn(this.individuals)
    this.updateDistribution()
  }
  
  inspectIndividual(inspectAction) {
    this.stopSimulation()
    inspectAction.runOn(this.individuals)
    inspectAction.runOn(this.initialIndividuals)
    this.updateDistribution()
  }
  
  draw() {
    this._clearCanvas(this.canvasContext)
    this._drawHulls()
    this._drawIndividuals()
    this._drawForceCenters()
    this.drawer.drawSelections()
  }
  
  updateDistribution() {
    this.individualsDistributor.setDistribution(
      this.individuals, this.forceCenterManager.getForceCenters())
    this.individualsSimulation.updateForces()
  }
  
  stopSimulation() {
    if(this.individualsSimulation) this.individualsSimulation.stop()
  }
  
  inspect(individual) {
    let inspectAction = new InspectAction(individual, true, this.dataProcessor, this.colorStore)
    this.owner.dispatchEvent(new CustomEvent("individual-inspected", {
      detail: {
        action: inspectAction
      },
      bubbles: true
    }))
  }
  
  freehandSelectionCreated() {
    this.draw()
  }
  
  freehandSelectionDeleted(selection) {
    this._clearCanvas(this.freehandCanvasContext)
    this.drawer.drawSelections()

    this.owner.dispatchEvent(new CustomEvent("freehand-selection-deleted", {
      detail: {
        selection: selection
      },
      bubbles: true
    }))
  }
  
  freehandSelectionOnContextMenu(evt, selection, selectionSVG) {
    let linePointsArray = selection.linePoints.map(point => [point.x, point.y])
    let selectedIndividuals = this.individuals.filter(point => inside(
      [point.x, point.y], 
      linePointsArray))
    this.owner.dispatchEvent(new CustomEvent("freehand-selection-contextmenu", {
      detail: {
        freehandSelectionSVGElement: selectionSVG,
        clientX: evt.clientX,
        clientY: evt.clientY,
        individualsSelection: {selectedIndividuals: selectedIndividuals, selectionColor: selection.color}
      },
      bubbles: true
    }))
}
    
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _individualsNotEmpty() {
    return this.individuals.length
  }
  
  _stopSimulation() {
   if(this.individualsSimulation) {
     this.individualsSimulation.stop()
   }
  }
  
  _propagateDataProcessor() {
    this.forceCenterManager.setDataProcessor(this.dataProcessor)
  }
  
  _propagateColorStore() {
    this.forceCenterManager.setColorStore(this.colorStore)
  }
  
  async _loadNewLayout() {
    //this._startLoadingAnimation()
    await this.forceCenterManager.updateLayout()
    //this._endLoadingAnimation()
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
    if (this.canvas.parentElement.contains(this.loaderDiv)) {
      this.canvas.parentElement.removeChild(this.loaderDiv)
    }
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
    this.interactionManager.registerClick(this.individuals)
    this.interactionManager.registerDoubleClick(this.forceCenterManager.getForceCenters())
  }
  
  _registerForceCenterAnnotations() {
    let annotations = this.forceCenterManager.getForceCenterAnnotations()
    annotations.forEach(annotation => {
      this.canvas.parentElement.appendChild(annotation)
    })
  }
  
  _updateInteractionSubjects() {
    this.interactionManager.setDraggingSubjects(this.forceCenterManager.getForceCenters())
    this.interactionManager.setToggleSubjects(this.forceCenterManager.getForceCenters())
  }
  
  _clearCanvas(canvasContext) {
    canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  _drawIndividuals() {
    this.individuals.forEach(individual => {
      let color = this.colorStore.convertColorObjectToRGBAValue(
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
      let hullCornerPoints = groupHull.getPaddedHullCornerPoints()
      if (hullCornerPoints.length > 0) {
        this._drawPolygon(hullCornerPoints, themeGroup.getColor())
      }  
    })
  }
  
  _drawPoint(x, y, size, color) {
    if (this.strokeStyle) {
      this.canvasContext.strokeStyle = color;
      this.canvasContext.beginPath();
      this.canvasContext.arc(x, y, size, 0, Math.PI * 2, true);
      this.canvasContext.stroke();
    } else {
      this.canvasContext.fillStyle = color;
      this.canvasContext.beginPath();
      this.canvasContext.arc(x, y, size, 0, Math.PI * 2, true);
      this.canvasContext.fill();
    }
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