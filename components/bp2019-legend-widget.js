import Morph from 'src/components/widgets/lively-morph.js'
import { ColorAction } from '../src/internal/individuals-as-points/common/actions.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'

export default class LegendWidget extends Morph {
  
  async initialize() {
    this.legendElementsContainer = this.get('#legend-elements-container')  
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  applyActionFromRootApplication(action) {
    switch (true){
      case (action instanceof ColorAction):
        this._update(action);
        break;
      default:
        break;
    }
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _update(colorAction) {
    if (colorAction.attribute === "none") {
      this._updateEmpty()
    } else {
      this._updateColored(colorAction)
    }    
  }
  
  _updateEmpty() {
    this._clearCurrentLegendElements()
  }
  
  _updateColored(colorAction) {
    let currentColorsByValue = ColorStore.current().getColorValuesForAttribute(colorAction.attribute);
    this._generateNewLegend(currentColorsByValue);
  }
  
  _generateNewLegend(colorsByValue){
    this._clearCurrentLegendElements();
    this._createNewLegend(colorsByValue);
  }
  
  _clearCurrentLegendElements(){
    var legendElement = this.legendElementsContainer.lastElementChild;
    while (legendElement) { 
        this.legendElementsContainer.removeChild(legendElement); 
        legendElement = this.legendElementsContainer.lastElementChild; 
    } 
  }
  
  _createNewLegend(colorsByValue){
    Object.keys(colorsByValue).forEach((value) => {
      let newLegendElement = this._createLegendElement(value, colorsByValue[value]);
      this.legendElementsContainer.appendChild(newLegendElement);
    })
    let notSelected = this._createLegendElement("not selected", ColorStore.current().getDeselectColor())
    this.legendElementsContainer.appendChild(notSelected)
  }
  
  _createLegendElement(value, color) {
    let singleElementParent = <div class="col-2 p-2"></div>;
    
    let singleElementRow = <div class="row"></div>;
    
    let valueDiv = <div class="col-7">{value}</div>
    let colorDiv = <div class="col-5 dot"></div>;
    colorDiv.style.backgroundColor = ColorStore.current().convertColorObjectToRGBAValue(color);
    
    singleElementRow.appendChild(colorDiv);
    singleElementRow.appendChild(valueDiv);
    
    singleElementParent.appendChild(singleElementRow);
    
    return singleElementParent;
  }
  
}