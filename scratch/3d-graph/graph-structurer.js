import { generateUUID } from '../../src/internal/individuals-as-points/common/utils.js'

export default class GraphStructurer {
  constructor(individuals) {
    this.individuals = individuals
    this.graph = {
      nodes: [],
      links: []
    }
  }
  
  getGraph() {
    this._buildGraphStructure()
    return this.graph
  }
  
  _buildGraphStructure() {
    this._buildNodes()
    this._buildLinks()
  }
  
  _buildNodes() {
    this.individuals.forEach( individual => {
      this._enrichWithNodeInformation(individual)
      this.graph.nodes.push(individual)
    })
    this._buildNodesForThemes()
  }
  
  _buildNodesForThemes() {
    let themes = this._getThemes()
    themes.forEach(theme => {
      let themeNode = {id: theme, name: theme, value: 1}
      this.graph.nodes.push(themeNode)
    })
  }
  
  _buildLinks() {
    this.individuals.forEach(individual => {
      this._buildLinksForIndividual(individual)
    })
  }
  
  _getThemes() {
    return [...new Set(this.individuals.map( individual => individual.themes['L3']))]
  }
  
  _buildLinksForIndividual(individual) {
    let individualThemes = individual.themes.L3
    this.individuals.forEach( otherIndividual => {
      let otherIndividualThemes = otherIndividual.themes.L3
      let themeIntersection = this._getThemeIntersection(individualThemes, otherIndividualThemes)
      if(themeIntersection.length > 2) {
        this._addLinkToGraph(individual, otherIndividual)
      }
    })
  }
  
  _addLinkToThemeNode(individual, theme) {
    let link = {source: individual, target: theme}
    this.graph.links.push(link)
  }
  
  _addLinkToGraph(individual, otherIndividual) {
    let link = {source: individual.id, target: otherIndividual.id}
    this.graph.links.push(link)
  }
  
  _getThemeIntersection(themesA, themesB) {
    return themesA.filter(value => themesB.includes(value))
  }
  
  _enrichWithNodeInformation(individual) {
    individual.id = generateUUID()
    individual.value = 1
    individual.name = individual.id
  }
}