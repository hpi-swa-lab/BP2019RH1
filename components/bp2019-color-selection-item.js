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
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  setName(labelText) {
    this.label.innerText = labelText
  }
  
  getName() {
    return this.label.innerText
  }
  
  setColor(color) {
    this.colorPicker.value = this.colorStore.convertColorObjectToRGBHexString(color)
  }
  
  getColor() {
    let hexString = this.colorPicker.value
    return this.colorStore.convertRGBHexStringToColorObject(hexString)
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