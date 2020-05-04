export default class IndividualsDistributor {
  constructor() {
    
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDistribution(individuals, orderedForceCenters) {
    this._resetForceCenters(orderedForceCenters)
    this._distributeIndividualsToForceCenter(individuals, orderedForceCenters)
    this._setHullsForGroups(orderedForceCenters)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _resetForceCenters(forceCenters) {
    forceCenters.forEach( forceCenter => {
      forceCenter.resetIndividuals()
      forceCenter.resetIndividualsInGroups()
    })
  }
  
  _distributeIndividualsToForceCenter(individuals, orderedForceCenters) {
    individuals.forEach(individual => {
      for(let index in orderedForceCenters) {
        let forceCenter = orderedForceCenters[index]
        if(forceCenter.contains(individual)) {
          forceCenter.setCenterForIndividual(individual)
          forceCenter.addIndividual(individual)
          break
        }
      }
    })
  }
  
  _setHullsForGroups(forceCenters) {
    forceCenters.forEach(forceCenter => {
      forceCenter.themeGroups.forEach(themeGroup => {
        themeGroup.fillHullWithIndividuals()
      })
    })
  }
}