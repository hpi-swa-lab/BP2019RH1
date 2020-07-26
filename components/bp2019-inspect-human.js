import Morph from 'src/components/widgets/lively-morph.js'
import { InspectAction } from '../src/internal/individuals-as-points/common/actions.js'


export default class InspectHuman extends Morph {
  
  async initialize() {
    this.dataProcessor = undefined
    this.demographicContainer = this.get('#demographic-data-container');
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyInspectAction(action) {
    let individual = action.selection
    if(individual) {
      if(individual.isSelected)
      this._showIndividual(individual)
      this._showIndividualInformation(individual)
    } else {
      this._deleteSelf()
    }
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }

  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
 
  _showIndividual(selectedIndividual) {
    this._resetCSSSettings()
    this._showFigureForGender(selectedIndividual)
    this._registerEventListeners()
  }
  
  _showFigureForGender(individual) {
    switch (true) {
      case this.dataProcessor.individualIsMale(individual):
        this._displayMaleFigure();
        break;
      case this.dataProcessor.individualIsFemale(individual):
        this._displayFemaleFigure()
        break;
      default:
        this._displayFigureForNoGender()
        break;
      }
  }
  
  _resetCSSSettings() {
    this.get("#inspect-human-male").style.display = "none"
    this.get("#inspect-human-female").style.display = "none"
    this.get("#inspect-human-no-gender").style.display = "none"
  }
  
  _displayMaleFigure() {
    this.get("#inspect-human-male").style.display = "inline"
  }
  
  _displayFemaleFigure() {
    this.get("#inspect-human-female").style.display = "inline"
  }
  
  _displayFigureForNoGender() {
    this.get("#inspect-human-no-gender").style.display = "inline"
  }
  
  _deleteSelf() {
    this.parentNode.removeChild(this)
  }
  
  _showIndividualInformation(individual) {
    let demographicString = this._buildDemographicString(individual)
    this.demographicContainer.innerHTML = demographicString
  }
  
  _buildDemographicString(individual) {
    let string = ""
    let demographicKeys = this.dataProcessor.getDemographicKeysForCurrentDataSet()
    demographicKeys.forEach(key => {
      string += key + ": " + individual[key] + "</br>"
    })
    
    return string;
  }
  
  _getRelevantDemographicKeys(individual) {
    let allKeys = Object.keys(individual)
    
    
    return allKeys;
  }
  
  _registerEventListeners() {
    
  }
}