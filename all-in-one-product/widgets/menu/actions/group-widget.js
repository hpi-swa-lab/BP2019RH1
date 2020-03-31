import Morph from 'src/components/widgets/lively-morph.js'

export default class FilterWidget extends Morph {
  async initialize() {
    this.name = "group";
    
    this.listeners = [];
    this.valuesByAttribute = {};
    
    this.attributeSelect = this.get("#attributeSelect");
    this.applyButton = this.get("#applyButton");
    
    this.applyButton.addEventListener("click", () => {
      this.applyGrouping();
    });
  }
  
  setData(data) {
    this.setValuesByAttributes(data);
  }
  
  setValuesByAttributes(valuesByAttributes) {
    this.valuesByAttribute = valuesByAttributes;
    this.setGroupAttributes(Object.keys(valuesByAttributes));
  }
  
  applyGrouping() {
    this.listeners.forEach( (listener) => {
      listener.applyAction(this);
    });
  }
  
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  setGroupAttributes(attributes) {
    this.clearSelectOptions(this.attributeSelect);
    attributes.forEach( (attribute) => {
      this.attributeSelect.appendChild(new Option(attribute));
    });
  }
  
  getSelectedGroupAttribute() {
    return this.attributeSelect.options[this.attributeSelect.selectedIndex].value
  }
  
  clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0);
    }
  }
}