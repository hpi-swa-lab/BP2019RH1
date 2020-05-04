"enable aexpr";

import Morph from 'src/components/widgets/lively-morph.js';
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'

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
    this.label.innerText = labelText
  }
  
  getName() {
    return this.label.innerText
  }
  
  setColor(color) {
    this.colorPicker.value = ColorStore.current().convertColorObjectToRGBHexString(color)
  }
  
  getColor() {
    let hexString = this.colorPicker.value
    return ColorStore.current().convertRGBHexStringToColorObject(hexString)
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