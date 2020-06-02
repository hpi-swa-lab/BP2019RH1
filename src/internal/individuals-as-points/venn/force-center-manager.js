import ForceCenter from "./force-center.js"
import ThemeGroup from "./theme-group.js"
import ForceCenterLayouter from './force-center-layouter.js'

import { getRandomInteger, generateUUID } from "../common/utils.js"

export const FORCE_CENTER_SIZE = 20
export const FORCE_CENTER_COLOR = "rgba(100, 100, 100, 0.5)"

export class ForceCenterManager {
  constructor(canvas, vennDiagramm) {
    this.vennDiagramm = vennDiagramm
    this.canvas = canvas
    this.canvasWidth = canvas.width
    this.canvasHeight = canvas.height
    this.forceCenters = []
    this.noMatchThemeGroup = null
    this.themeGroups = []
    this.forceCenterLayouter = new ForceCenterLayouter(this.canvasWidth, this.canvasHeight, this.vennDiagramm)
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  } 
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  getForceCenters(){
    return this.forceCenters
  }
  
  async updateLayout() {
    await this.forceCenterLayouter.layoutForceCenters(this.forceCenters)
  }
  
  setCanvasExtent(newCanvasWidth, newCanvasHeight) {
    this.forceCenterLayouter.setCanvasExtent(newCanvasWidth, newCanvasHeight)
  }
  
  getForceCenterAnnotations() {
    return this.forceCenters.map(forceCenter => forceCenter.getAnnotation())
  }
  
  setInitialForceCenter() {
    this.forceCenters = []
    this._createNoMatchThemeGroup()
    let forceCenter = new ForceCenter([this.noMatchThemeGroup])
    forceCenter.setDataProcessor(this.dataProcessor)
    forceCenter.setColorStore(this.colorStore)
    this.forceCenters.push(forceCenter)
  } 
  
  getThemeGroups() {
    let allThemeGroups = [this.noMatchThemeGroup]
    allThemeGroups.push(...this.themeGroups)
    
    return allThemeGroups
  }
  
  addThemeGroup(uuid, name, themes, color){
    let newThemeGroup = new ThemeGroup(uuid, name, themes, color)
    let newForceCenterGroupPermutations = this._createGroupPermutationsWithNewGroup(newThemeGroup)
    this._addNewForceCentersForGroups(newForceCenterGroupPermutations)
    this._sortForceCentersDescendingByGroupCount()
    this._addThemeGroup(newThemeGroup)
  }
  
  updateThemeGroup(uuid, name, themes, color) {
    this.themeGroups.forEach(themeGroup => {
      if(themeGroup.uuid === uuid) {
        themeGroup.setColor(color)
        themeGroup.setThemes(themes)
        themeGroup.setName(name)
      }
    })
  }
  
  removeThemeGroup(uuid) {
    this._removeForceCentersContainingGroup(uuid)
    this.themeGroups = this.themeGroups.filter(themeGroup => !(themeGroup.uuid === uuid))
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _createNoMatchThemeGroup() {
    let uuid = generateUUID()
    this.noMatchThemeGroup = new ThemeGroup(uuid, "no match", [], '#00FF44')
  }
  
  _createGroupPermutationsWithNewGroup(newThemeGroup){
    let combinedThemeGroups = [...this.themeGroups]
    combinedThemeGroups.push(newThemeGroup)
    
    let permutations = combinedThemeGroups.reduce(
        (subsets, value) => subsets.concat(
         subsets.map(set => [value,...set])
        ),
        [[]]
      )
    
    let permutationsWithNewGroup = permutations.filter(
      permutation => permutation.includes(newThemeGroup)
    )
    return permutationsWithNewGroup
  }
  
  _addNewForceCentersForGroups(forceCenterGroupPermutations) {
    forceCenterGroupPermutations.forEach(groupPermutation => {
      let forceCenter = new ForceCenter(groupPermutation)
      forceCenter.setDataProcessor(this.dataProcessor)
      forceCenter.setColorStore(this.colorStore)
      this.forceCenters.push(forceCenter)
    })
  }
  
  _sortForceCentersDescendingByGroupCount() {
    this.forceCenters.sort((forceCenter1, forceCenter2) => {
      return forceCenter2.themeGroups.length - forceCenter1.themeGroups.length
    })
    
    this._putNoMatchAtTheEnd()
  }
  
  _putNoMatchAtTheEnd() {
    let noMatchForceCenter = this.forceCenters.filter(
      forceCenter => forceCenter.themeGroups.includes(this.noMatchThemeGroup)
    )[0]
    this.forceCenters.push(
      this.forceCenters.splice(this.forceCenters.indexOf(noMatchForceCenter), 1)[0]
    );
  }
  
  _addThemeGroup(themeGroup) {
    this.themeGroups.push(themeGroup)
  }
  
  _removeForceCentersContainingGroup(uuid) {
    let remainingForceCenters = []
    this.forceCenters.forEach(forceCenter => {
      if(forceCenter.includesGroup(uuid)){
        forceCenter.removeInnerContent()
      } else {
        remainingForceCenters.push(forceCenter)
      }
    })
    
    this.forceCenters = remainingForceCenters
  }
  
}