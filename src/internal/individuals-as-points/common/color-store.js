/* 
This singleton class holds the consistent state for all the color menus accross the indiividuals applicaton. An example internal data format could look like the following

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

Thereby it is important that the keys for each attribute match the keys of the application the store is ment for. This is enshured through the initialization
*/



class ColorStore {
  
  constructor(){
   if(! ColorStore.instance){
     this.valueColorsByAttribute = {};
     ColorStore.instance = this;
   }

   return ColorStore.instance;
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  initializeWithValuesByAttribute(valuesByAttribute){
    this._clearCurrentValueColorsByAttribute = {};
    Object.keys(valuesByAttribute).forEach((attribute) => {
      let valuesForOneAttribute = valuesByAttribute[attribute];
      let colorsForOneAttribute = this._generateColorsForValues(valuesForOneAttribute);
      this.valueColorsByAttribute[attribute] = colorsForOneAttribute;
    })
  }
  
  getColorValuesForAttribute(attribute){
    return this.valueColorsByAttribute[attribute];
  }
  
  getColorForValue(attribute, value) {
    return this.valueColorsByAttribute[attribute][value];
  }
  
  getAllColorsForAttribute(attribute) {
    let colorsForAttribute = [];
    let colorValues = this.valueColorsByAttribute[attribute];
    Object.keys(colorValues).forEach((value) => {
      colorsForAttribute.push(colorValues[value])
    })
                                     
    return colorsForAttribute;
  }
  
  updateColorForValue(attribute, value, color) {
    if(this.valueColorsByAttribute[attribute].value !== undefined){
      this.valueColorsByAttribute[attribute][value] = color;
    } else {
      throw new Error(value + " is no valid value for attribute " + attribute + ". No color set");
    }
    
  }
  
  updateColorsByValueForAttribute(attribute, colorsByValue) {
    this.valueColorsByAttribute[attribute] = colorsByValue;
  }
  
  convertRGBStringToReglColorObject(rgbString){
    let rgbValues = this._exctractRgbValues(rgbString);
    return this._createReglColorObject(rgbValues);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _clearCurrentValueColorsByAttribute(){
    this.valueColorsByAttribute = {};
  }
  
  _generateColorsForValues(values) {
    let colorsByValue = {};
    values.forEach((value) => {
      colorsByValue[value] = this._generateRandomRGBColorString();
    })
    
    return colorsByValue;
  }
                   
  _generateRandomRGBColorString(){
    return 'rgb(' + 
      this._getRndInteger(1, 254).toString() + ',' +
      this._getRndInteger(1, 254).toString() + ',' +
      this._getRndInteger(1, 254).toString() + ')'
  }
    
  _getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min
  }
  
  _exctractRgbValues(rgbString){
    let rbgValuesPlusBracket = rgbString.split('(')[1]
    let rgbValues = rbgValuesPlusBracket.split(')')[0]
    return rgbValues.split(',')
  }
  
  _createReglColorObject(rgbValues) {
    return {
      r: rgbValues[0],
      g: rgbValues[1],
      b: rgbValues[2],
      opacity: 1
    }
  }
  
  

}

const colorStore = new ColorStore();

export default colorStore;