import Annotation from "./force-center-annotation.js"

export default class ForceCenter {
  constructor(themeGroups) {
    this.x = undefined
    this.y = undefined
    this.is_center = true
    this.themeGroups = themeGroups
    this.annotation = new Annotation(themeGroups)
    this.individuals = []
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
  
  contains(individual) {
    let contains = true
    this.themeGroups.forEach(themeGroup => {
      if(!themeGroup.contains(individual)) contains = false
    })
    
    return contains
  }
  
  resetIndividuals() {
    this.individuals = []
  }
  
  addIndividual(individual) {
    this.addIndividualToAllGroups(individual)
    this._addIndividual(individual)
    
  }
  
  updateAnnotationCoordinates() {
    this.annotation.updatePosition(this.x, this.y)
  }
  
  updatePosition(x, y) {
    this.x = x
    this.y = y
    this.annotation.updatePosition(x, y)
  }
  
  setCenterForIndividual(individual) {
    individual.center = { x: this.x, y: this.y }
  }
  
  addIndividualToAllGroups(individual) {
    this.themeGroups.forEach(themeGroup => {
      themeGroup.addIndividual(individual)
    })
  }
  
  resetIndividualsInGroups() {
    this.themeGroups.forEach(themeGroup => {
      themeGroup.resetIndividuals()
    })
  }
  
  getFirstGroup() {
    return this.themeGroups[0]
  }
  
  includesGroup(uuid) {
    let includes = false
    this.themeGroups.forEach(themeGroup => {
      if(themeGroup.uuid === uuid) includes = true
    })
    
    return includes
  }
  
  getAnnotation() {
    return this.annotation.html
  }
  
  toggleSingleClick() {
    this.annotation.toggle()
  }
  
  toggleDoubleClick() {
    if(!this.statisticsWidget) {
      this._openStatisticsWidget()
    } else {
      this._closeStatisticsWidget()
    }
  }
  
  removeInnerContent() {
    this.annotation.removeHTML()
  }
  
  statisticWidgetIsClosed() {
    this.statisticsWidget = undefined
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _addIndividual(individual) {
    this.individuals.push(individual)
  }
  
  async _openStatisticsWidget() {
    this.statisticsWidget = await lively.openComponentInWindow('bp2019-statistic-widget', null, lively.pt(300, 700))
    this.statisticsWidget.setCreator(this)
    this.statisticsWidget.setData(this.individuals)
    this.statisticsWidget.setDataProcessor(this.dataProcessor)
    this.statisticsWidget.setColorStore(this.colorStore)
    this.statisticsWidget.addBarChartForKeys(['age', 'gender', 'constituency'])
  }
  
  _closeStatiticsWidget() {
    this.statisticsWidget.close()
    this.statisticsWidget = undefined
  }
}