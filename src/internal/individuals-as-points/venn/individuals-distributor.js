export default class IndividualsDistributor {
  constructor() {
    
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDistribution(individuals, orderedForceCenters) {
    this._resetGroupsInForceCenters(orderedForceCenters)
    this._distributeIndividualsToForceCenter(individuals, orderedForceCenters)
    this._setHullsForGroups(orderedForceCenters)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _resetGroupsInForceCenters(forceCenters) {
    forceCenters.forEach(forceCenter => {
      forceCenter.resetIndividualsInGroups()
    })
  }
  
  _distributeIndividualsToForceCenter(individuals, orderedForceCenters) {
    individuals.forEach(individual => {
      for(let index in orderedForceCenters) {
        let forceCenter = orderedForceCenters[index]
        if(forceCenter.contains(individual)) {
          forceCenter.setCenterForIndividual(individual)
          forceCenter.addIndividualToAllGroups(individual)
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