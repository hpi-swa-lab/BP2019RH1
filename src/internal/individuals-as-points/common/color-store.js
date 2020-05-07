/* 
This singleton class holds the consistent state for all the color menus across the individuals application. An example internal data format could look like the following

valueColorsByAttribute: {
  "neutral": {r: 255, g: 100, b: 100, opacity: 1},
  "age": {
    "18-25": {r: 10, g: 10, b: 10, opacity: 1},
    "26-40": {r: 20, g: 20, b: 20, opacity: 1},
    ...
  },
  "gender": {
    "male": {r: 30, g: 30, b: 30, opacity: 1},
    "NC": {r: 40, g: 40, b: 40, opacity: 1},
    ...
  }
  ....
}

Thereby it is important that the keys for each attribute match the keys of the application the store is meant for. This is ensured through the initialization
*/

import { getRandomInteger } from "./utils.js"

export default class ColorStore {
  
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
  
  getInspectColor() {
    return {r: 255, g: 0, b: 0, opacity: 1}
  }
        
  getDeselectColor() {
    return {r: 211, g: 211, b: 211, opacity: 1}
  }
  
  getDefaultColor() {
    return {r: 255, g: 100, b: 100, opacity: 1}
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
  
  convertColorObjectToRGBAValue(colorObject) {
    // RGBAValue has the format rgba(1, 2, 3, 1)
    return this._createRGBAValue(colorObject)
  }
  
  convertColorObjectToRGBHexString(colorObject) {
    // Color picker cannot handle opacity that is why we need a RGBHexString instead of an RGBAHexString
    return this._createRGBHexString(colorObject)
  }
  
  convertColorObjectToRGBAHexString(colorObject) {
    return this._createRGBAHexString(colorObject)
  }
  
  convertRGBHexStringToColorObject(RGBHexString) {
    let rgbValues = this._extractRgbValues(RGBHexString)
    return this._createColorObject(rgbValues)
  }
  
  getUniqueRGBColor(colorToIndex) {
    let color = this._generateRandomColorObject()
    let colorString = "r" + color.r + "g" + color.g + "b" + color.b
    while(colorToIndex[colorString]) {
      color = this._generateRandomColorObject()
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
      colorsByValue[value] = this._generateRandomColorObject();
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
  
  _generateRandomColorObject() {
    let rgbString = this._generateRandomRGBColorString()
    let color = this.convertRGBHexStringToColorObject(rgbString)
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
  
  _createColorObject(rgbValues) {
    return {
      r: rgbValues[0],
      g: rgbValues[1],
      b: rgbValues[2],
      opacity: 1
    }
  }
  
  _createRGBAValue(colorObject) {
    return "rgba(" + 
      colorObject.r + ", " +
      colorObject.g + ", " +
      colorObject.b + ", " +
      colorObject.opacity + ")"
  }
  
  _createRGBHexString(colorObject) {
    let red = this._getHexStringWithTwoCharacters(colorObject.r)
    let green = this._getHexStringWithTwoCharacters(colorObject.g)
    let blue = this._getHexStringWithTwoCharacters(colorObject.b)
    
    return "#" + red + green + blue
  }
  
  _createRGBAHexString(colorObject) {
    let red = this._getHexStringWithTwoCharacters(colorObject.r)
    let green = this._getHexStringWithTwoCharacters(colorObject.g)
    let blue = this._getHexStringWithTwoCharacters(colorObject.b)
    let opacity = this._getHexStringWithTwoCharacters(colorObject.opacity * 255)
    
    return "#" + red + green + blue + opacity
  }
  
  _getHexStringWithTwoCharacters(number) {
    if (number == 0) {
      return "00"
    } 
    
    let result = ""
    if (number < 16) {
      result += "0"
    }
    
    return result + number.toString(16)
  }
}