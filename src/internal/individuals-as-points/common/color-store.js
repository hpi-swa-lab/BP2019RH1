/* 
This singleton class holds the consistent state for all the color menus across the individuals application. An example internal data format could look like the following

valueColorsByAttribute: {
  "neutral": "#someneutralcode",
  "age": {
    "18-25": "#aaaaa",
    "26-40": "#bbbbb",
    ...
  },
  "gender": {
    "male": "#cccc",
    "NC": "#dddd",
    ...
  }
  ....
}

Thereby it is important that the keys for each attribute match the keys of the application the store is meant for. This is ensured through the initialization
*/

import { getRandomInteger } from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/utils.js"

export default class ColorStore {
  
  static current(forceNewInstance=false) {
    if(!this._current || forceNewInstance) {
      this._current = new ColorStore()
    }
    return this._current
  }
  
  constructor() {
    this.valueColorsByAttribute = {}
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  initializeWithValuesByAttribute(valuesByAttribute){
    this._clearCurrentValueColorsByAttribute = {}
    Object.keys(valuesByAttribute).forEach((attribute) => {
      let valuesForOneAttribute = valuesByAttribute[attribute]
      let colorsForOneAttribute = this._generateColorsForValues(valuesForOneAttribute)
      this.valueColorsByAttribute[attribute] = colorsForOneAttribute
    })
  }
  
  getColorValuesForAttribute(attribute){
    return this.valueColorsByAttribute[attribute]
  }
  
  getColorForValue(attribute, value) {
    return this.valueColorsByAttribute[attribute][value]
  }
  
  getAllColorsForAttribute(attribute) {
    let colorsForAttribute = []
    let colorValues = this.valueColorsByAttribute[attribute]
    Object.keys(colorValues).forEach((value) => {
      colorsForAttribute.push(colorValues[value])
    })
                                     
    return colorsForAttribute
  }
  
  updateColorForValue(attribute, value, color) {
    if(this.valueColorsByAttribute[attribute].value !== undefined){
      this.valueColorsByAttribute[attribute][value] = color
    } else {
      throw new Error(value + " is no valid value for attribute " + attribute + ". No color set")
    }
  }
  
  updateColorsByValueForAttribute(attribute, colorsByValue) {
    this.valueColorsByAttribute[attribute] = colorsByValue
  }
  
  convertRGBStringToReglColorObject(rgbString) {
    let rgbValues = this._extractRgbValues(rgbString)
    return this._createReglColorObject(rgbValues)
  }
  
  convertRGBStringToRGBAColorObject(rgbString) {
    let rgbValues = this._extractRgbValues(rgbString)
    return this._createRGBAColorObject(rgbValues)
  }
  
  convertRGBAColorObjectToRGBAString(colorObject) {
    return this._createRBGAString(colorObject)
  }
  
  getUniqueRGBColor(colorToIndex) {
    let color = this._generateRandomRGBColorObject()
    let colorString = "r" + color.r + "g" + color.g + "b" + color.b
    while(colorToIndex[colorString]) {
      color = this._generateRandomRGBColorObject()
      colorString = "r" + color.r + "g" + color.g + "b" + color.b
    }
    return color
  } 
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _clearCurrentValueColorsByAttribute() {
    this.valueColorsByAttribute = {}
  }
  
  _generateColorsForValues(values) {
    let colorsByValue = {};
    values.forEach((value) => {
      colorsByValue[value] = this._generateRandomRGBColorString();
    })
    
    return colorsByValue;
  }
                   
  _generateRandomRGBColorString() {
    let letters = '0123456789abcdef'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[getRandomInteger(0, 16)]
    }
    return color
  }
  
  _generateRandomRGBColorObject() {
    let rgbString = this._generateRandomRGBColorString()
    let color = this.convertRGBStringToRGBAColorObject(rgbString)
    return color
  }
  
  _extractRgbValues(rgbString) {
    let rString = rgbString[1] + rgbString[2]
    let gString = rgbString[3] + rgbString[4]
    let bString = rgbString[5] + rgbString[6]
    
    return [
      parseInt(rString, 16),
      parseInt(gString, 16),
      parseInt(bString, 16),
    ]
  }
  
  _createReglColorObject(rgbValues) {
    return {
      r: rgbValues[0],
      g: rgbValues[1],
      b: rgbValues[2],
      opacity: 1
    }
  }
  
  _createRGBAColorObject(rgbValues) {
    return {
      "r" : rgbValues[0],
      "g" : rgbValues[1],
      "b" : rgbValues[2],
      "a" : 1
    }
  }
  
  _createRBGAString(colorObject) {
    return "rgba(" + 
      colorObject.r + ", " +
      colorObject.g + ", " +
      colorObject.b + ", " +
      colorObject.opacity + ")"
  }
}