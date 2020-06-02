import Morph from 'src/components/widgets/lively-morph.js';
import { assertSizeListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import { collapse } from "../src/internal/individuals-as-points/common/utils.js"

export default class Bp2019ControlPanelWidget extends Morph {
  
  async initialize() {
    this.sizeListeners = []
    this.controlPanelContainer = this.get("#control-panel-container")
    
    //only supports Chrome, for cross platform support integration of other transitionEnd Events is needed 
    this.controlPanelContainer.addEventListener('webkitTransitionEnd', () => {this._notifySizeListeners()})
    
    this.collapsed = false
    
    this.toggleButton = this.get("#control-panel-toggle-button")
    this.toggleButton.addEventListener("click", () => {
      this.collapsed = !this.collapsed
      collapse(this, "#control-panel-container", "toggle")
      this.toggleButton.classList.toggle("collapse-button")
      this.toggleButton.classList.toggle("expand-button")
    })    
  }
  
  addSizeListener(listener) {
    assertSizeListenerInterface(listener)
    this.sizeListeners.push(listener)
  }
  
  _notifySizeListeners() {
    this.sizeListeners.forEach(listener => listener.onSizeChange(this.collapsed)) 
  }
  
}