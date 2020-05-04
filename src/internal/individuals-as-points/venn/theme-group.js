import GroupHull from './group-hull.js'

import { THEME_GROUP_COLOR_TRANSPARENCY } from './venn-diagram.js'

export default class ThemeGroup {
  constructor(uuid, name, themes, color) {
    this.uuid = uuid
    this.name = name
    this.themes = themes
    this.individuals = []
    this.groupHull = new GroupHull()
    this.color = color + THEME_GROUP_COLOR_TRANSPARENCY
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  contains(individual) {
    let contains = false
    this.themes.forEach(theme => {
      if(individual.themes.L3.includes(theme)) {
        contains = true
      }
    })
    
    return this.themes.length ? contains : true
  }
  
  addIndividual(individual) {
    this.individuals.push(individual)
  }
  
  resetIndividuals() {
    this.individuals = []
  }
  
  fillHullWithIndividuals() {
    this.groupHull.setIndividualsToInclude(this.individuals)
  }
  
  getGroupHull() {
    return this.groupHull;
  }
  
  getColor() {
    return this.color
  }
  
  setColor(color) {
    this.color = color + THEME_GROUP_COLOR_TRANSPARENCY
  }
}