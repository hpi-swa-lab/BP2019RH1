import d3 from "src/external/d3.v5.js";

export default class ForcesStructure {
  constructor(individuals, groups) {
    this.individuals = individuals
    this.groups = groups
    this._sortGroupsByLentgh()
    this._enrichIndividualsWithGroupInformation();
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  getNodesWithDrawingInformationForGroups(groups) {
    return
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _enrichIndividualsWithGroupInformation() {
    this.individuals.forEach( individual => {
      this._setGroupOfIndividual(individual);
    })
  }
  
  _sortGroupsByLentgh() {
    this.groups.sort(function (group1, group2) { return group2.themes.length - group1.themes.length })
  }
  
  _setGroupOfIndividual(individual) {
    let l3ThemesOfIndividual = individual.themes['L3']
    
    this.groups.some((group) => {
      let groupThemes = group.themes
      if(this._groupThemesAreSubsetOfIndividualsThemes(groupThemes, l3ThemesOfIndividual)) {
        individual['group'] = group.name
      }
      return this._groupThemesAreSubsetOfIndividualsThemes(groupThemes, l3ThemesOfIndividual)
    })
    
    if(!individual['group']) {
      individual['group'] = 'nothing'
    }
  }
  
  _groupThemesAreSubsetOfIndividualsThemes(groupThemes, individualThemes) {
    return groupThemes.every(theme => individualThemes.includes(theme));
  }
}

