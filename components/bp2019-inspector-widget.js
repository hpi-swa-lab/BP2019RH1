import Morph from 'src/components/widgets/lively-morph.js'
import { InspectAction } from '../src/internal/individuals-as-points/common/actions.js'


export default class InspectorWidget extends Morph {
  
  async initialize() {
    this.inspector = this.get('#lively-inspector')
    this.dataProcessor = undefined
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  async applyAction(action) {
    switch (true) {
      case (action instanceof InspectAction):
        this._applyInspectAction(action)
        break
      default:
        break
    }
  }
  
  setExtent() {}
  
  setData() {
    this.inspector.inspect({})
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }

  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _applyInspectAction(inspectAction) {
    let dataToInspect = {}
    if (inspectAction.selection) {
      let ageGroup = this.dataProcessor.getUniqueValueFromIndividual(inspectAction.selection, "age")
      dataToInspect["age group"] = ageGroup
      
      let keysToShow = ["constituency", "county", "gender", "languages", "themes", "recently_displaced", "district", "state", "region" , "zone"]
      keysToShow.forEach(key => {
        dataToInspect[key] = inspectAction.selection[key]
      })     
    } else {
      // TODO: it would be nice to delete the content of the inspector when nothing is selected
    }
    this.inspector.inspect(dataToInspect)
  }

  
}
