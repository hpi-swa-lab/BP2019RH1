export default class ForcesUtils {
  
  generateAllGroupNames(groups) {
    groups.forEach( groupName => {
      this._generateCombinationsForGroup(groupName, groups)
    })
  }
  
}