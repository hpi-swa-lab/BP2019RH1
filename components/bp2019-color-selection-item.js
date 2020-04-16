"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';

import { assertColorSelectionItemListenerInterface as assertInterface } from '../src/internal/individuals-as-points/common/interfaces.js'

export default class Bp2019ColorSelectionItem extends Morph {
  async initialize() {
    this.listeners = []
    this.colorPicker = this.get("#colorInput")
    this.label = this.get("#colorInputLabel")
    this.colorPicker.addEventListener("change", () => {
      this._updateColor()
    })
  }
  
  setName(labelText) {
    this.label.innerHTML = labelText
  }
  
  getName() {
    return this.label.innerHTML
  }
  
  setColor(color) {
    this.colorPicker.value = color
  }
  
  getColor() {
    return this.colorPicker.value
  }
  
  addListener(listener) {
    assertInterface(listener)
    this.listeners.push(listener)
  }
  
  _updateColor() {
    this.listeners.forEach(listener => {
      listener.setColorForValue(this.getColor(), this.getName())
    })
  }
}