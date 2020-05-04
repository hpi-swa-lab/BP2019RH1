import Annotation from "./force-center-annotation.js"

export default class ForceCenter {
  constructor(x, y, themeGroups) {
    this.x = x
    this.y = y
    this.is_center = true
    this.themeGroups = themeGroups
    this.annotation = new Annotation(themeGroups)
    
    this.annotation.updatePosition(x, y)
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  contains(individual) {
    let contains = true
    this.themeGroups.forEach(themeGroup => {
      if(!themeGroup.contains(individual)) contains = false
    })
    
    return contains
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
  
  toggle() {
    this.annotation.toggle()
  }
  
  removeInnerContent() {
    this.annotation.removeHTML()
  }
}