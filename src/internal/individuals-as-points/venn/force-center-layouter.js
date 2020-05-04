import { generateUUID, getRandomInteger } from '../common/utils.js'

import d3 from "src/external/d3.v5.js";

export default class ForceCenterLayouter {
  
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.graph = {
      nodes: [],
      links: []
    }
    this.forceCenters = undefined
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  async layoutForceCenters(forceCenters) {
    this.forceCenters = forceCenters
    this._resetGraph()
    this._buildForceNodes()
    this._buildForceCenterConnections()
    await this._layout()
    this._updateForceCenterAnnotationCoordinates()
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _resetGraph() {
    this.graph = {
      nodes: [],
      links: []
    }
  }
  
  _buildForceNodes() {
    this._addForceCentersToGraph()
  }
  
  _buildForceCenterConnections() {
    this.forceCenters.forEach( forceCenter => {
      this._buildLinksForForceCenter(forceCenter)
    })
  }
  
  _buildLinksForForceCenter(forceCenter) {
    let initialForceCenterThemeGroups = forceCenter.themeGroups
    let allOtherForceCenters = this.forceCenters.filter( otherForceCenter => { return otherForceCenter.uuid != forceCenter.uuid })
    allOtherForceCenters.forEach( otherForceCenter => {
      if(this._forceCenterDeservesLink(forceCenter, otherForceCenter)) {
        this._addLink(forceCenter, otherForceCenter)
      }
    })
  }
  
  _forceCenterDeservesLink(forceCenter, otherForceCenter) {
    let notIntersectionEmpty = this._themeGroupIntersectionIsNotEmpty(forceCenter.themeGroups, otherForceCenter.themeGroups)
    let otherForceCenterHasLessThemeGroups = this._otherForceCenterHasLessThemeGroups(forceCenter.themeGroups, otherForceCenter.themeGroups)
    
    return notIntersectionEmpty && otherForceCenterHasLessThemeGroups
  }
  
   _themeGroupIntersectionIsNotEmpty(forceCenterThemeGroups, otherForceCenterThemegroups) {
    let themeGroupIntersection = forceCenterThemeGroups.filter(themeGroup => otherForceCenterThemegroups.includes(themeGroup))
    return themeGroupIntersection.length !== 0
  }
  
  _otherForceCenterHasLessThemeGroups(forceCenterThemeGroups, otherForceCenterThemeGroups) {
    return forceCenterThemeGroups.length < otherForceCenterThemeGroups.length
  }
  
  _addLink(forceCenter, otherForceCenter) {
    this.graph.links.push({source: forceCenter.uuid, target: otherForceCenter.uuid});
  }
  
  _addForceCentersToGraph() {
    this.forceCenters.forEach( forceCenter => {
      forceCenter.uuid = generateUUID()
      this.graph.nodes.push(forceCenter)
    })
  }
  
  _layout() {
    return new Promise((resolve) => {
      let simulation = d3.forceSimulation()
        .force("link", d3.forceLink().distance(70).strength(0.1).id(function(d) { return d.uuid; }))
        .force("charge", d3.forceManyBody().strength(function(d) { return -120;}))
        .alphaDecay(0.03)
        .force('center', d3.forceCenter().x(this.canvasWidth * .5).y(this.canvasHeight * .5))
      
      simulation.on('tick', () => this._tickActions())
      
      simulation.nodes(this.graph.nodes)
      simulation.force("link").links(this.graph.links);
      simulation.alphaTarget(0).on("end", () => resolve(this.graph)).restart(); 
      
    });
  }
  
  _tickActions() {
    this.graph.nodes.forEach( node => {
      let radius = 30
      node.x = Math.max(radius, Math.min(this.canvasWidth  - radius, node.x))
      node.y = Math.max(radius, Math.min(this.canvasHeight - radius, node.y))
    })
} 

  _randomizePositions(forceCenters) {
    forceCenters.forEach(forceCenter => {
      let x = getRandomInteger(0, 1000)
      let y = getRandomInteger(0, 600)
      forceCenter.updatePosition(x, y)
    })
  }
  
  _updateForceCenterAnnotationCoordinates() {
    this.forceCenters.forEach( forceCenter => {
      forceCenter.updateAnnotationCoordinates()
    })
  }
}