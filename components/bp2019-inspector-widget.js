import Morph from 'src/components/widgets/lively-morph.js'
import { InspectAction } from '../src/internal/individuals-as-points/common/actions.js'


export default class InspectorWidget extends Morph {
  
  async initialize() {
    this.inspector = this.get('#lively-inspector')
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyActionFromRootApplication(action) {
    switch (true) {
      case (action instanceof InspectAction):
        this._applyInspectAction(action)
        break
      default:
        break
    }
  }

  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
 
  _applyInspectAction(inspectAction) {
    let dataToInspect
    if (inspectAction.selection) {
      dataToInspect = inspectAction.selection
    } else {
      // TODO: it would be nice to delete the content of the inspector when nothing is selected
      dataToInspect = {}
    }
    this.inspector.inspect(dataToInspect)
  }
  
}
