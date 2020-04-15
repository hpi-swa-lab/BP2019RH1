import Morph from 'src/components/widgets/lively-morph.js'
import SelectAction from '../src/internal/individuals-as-points/common/actions/select-action.js'


export default class InspectorWidget extends Morph {
  
  async initialize() {
    this.inspector = this.get('#lively-inspector')
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyActionFromRootApplication(action) {
    switch (true) {
      case (action instanceof SelectAction):
        this._applySelectAction(action);
        break;
      default:
        break;
    }
  }

  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
 
  _applySelectAction(selectAction) {
    let dataToInspect = selectAction.selection;
    this.inspector.inspect(dataToInspect);
  }
  
}
