import { 
  assertAtomicFilterActionInterface 
} from "./interfaces.js"

class Action {
  constructor (isGlobal=false) {
    this.isGlobal = isGlobal
    this.groupsData = this.groupsData()
  }
  
  isGlobal() {
    return this.isGlobal
  }
  
  groupsData() {
    return false
  }
  
  runOn(data) {
    return data
  }
}

export class NullAction extends Action {
  constructor(isGlobal=false) {
    super(isGlobal)
  }
  
  runOn(data) {
    return data
  }
}

export class ResetDrawingInformationAction extends Action {
  constructor(isGlobal=true) {
    super(isGlobal)
  }
  
  runOn(data) {
    data.forEach(element => {
      element.drawing.currentColor = element.drawing.defaultColor
      element.drawing.currentSize = element.drawing.defaultSize
      element.drawing.currentPosition.x = element.drawing.defaultPosition.x
      element.drawing.currentPosition.y = element.drawing.defaultPosition.y
    })
    return data
  }
}

export class GroupAction extends Action {
  constructor (attribute, isGlobal=false, axis="x", objectTypes=["themes"]) {
    super(isGlobal)
    this.attribute = attribute
    this.objectTypes = objectTypes
    this.axis = axis
  }
  
  groupsData() {
    return true
  }
  
  setAttribute(attribute) {
    this.attribute = attribute
    return this
  }
  
  runOn(data) {
    if ((typeof this.attribute) === "undefined") {
      throw new Error('The grouping attribute must be set.');
    }
    
    if (this.objectTypes.includes(this.attribute)) {
      //TODO
      return {}
    } else {
      let values = {}
      data.forEach(element => {
        values[element[this.attribute]] = true
      })

      let groups = {}
      Object.keys(values).forEach(key => {
        groups[key] = []
      })

      data.forEach(element => {
        groups[element[this.attribute]].push(element)
      })
      
      return groups
    }        
  }
}

export class AtomicFilterAction extends Action {
  constructor(attribute, values, isGlobal=true, dataProcessor, arrayTypes=["languages"], objectTypes=["themes"]) {
    super(isGlobal)
    this.filterAttribute = attribute
    this.filterValues = values
    this.arrayTypes = arrayTypes
    this.objectTypes = objectTypes
    this.dataProcessor = dataProcessor
  }
  
  setAttribute(attribute) {
    this.filterAttribute = attribute
    return this
  }
  
  setFilterValues(filterValues) {
    this.filterValues = filterValues
    return this
  }
  
  getFilterValues() {
    return this.filterValues
  }
  
  getAttribute() {
    return this.filterAttribute
  }
  
  runOn(data) {
    if ((typeof this.filterAttribute) === "undefined") {
      throw new TypeError('The filtering attribute must be set.');
    }
    if (this.filterValue === "") {
      throw new TypeError('The filtering value must be set.');
    }
        
    if (this.arrayTypes.includes(this.filterAttribute)) {
      return this._runOnArrayTypeAttributeData(data)
    } else if (this.objectTypes.includes(this.filterAttribute)) {
      return this._runOnObjectTypeAttributeData(data)
    } else {
      return this._runOnFlatData(data)
    } 
  }
  
  _runOnFlatData(data) {
    return data.filter(element => {
      let value = this.dataProcessor.getUniqueValueFromIndividual(element, this.filterAttribute)
      return this.filterValues.includes(value)
    })
  }
  
  _runOnArrayTypeAttributeData(data) {
    return data.filter(element => {
      let returnValue = false
      this.filterValues.forEach(value => {
        let elementValue = this.dataProcessor.getUniqueValueFromIndividual(element, this.filterAttribute)
        if (element[this.filterAttribute].includes(value) || elementValue === value) {
          returnValue = true
        }
      })
      return returnValue
    })
  }
  
  _runOnObjectTypeAttributeData(data) {
    return data.filter(element => {
      let valueObject = this.dataProcessor.getUniqueValueFromIndividual(element, this.filterAttribute)
      let isIncluded = false
      Object.keys(valueObject).forEach(key => {
        if (valueObject[key].some(value => this.filterValues.includes(value))) {
          isIncluded = true
        }
      })
      return isIncluded
    })
  }
}

export class FilterAction extends Action {
  constructor(attributeValuePairs, isGlobal=true, dataProcessor, arrayTypes=["languages"], objectTypes=["themes"]) {
    super(isGlobal)
    this.atomicFilters = []
    attributeValuePairs.forEach(pair => {
      this.atomicFilters.push(new AtomicFilterAction(pair["attribute"], pair["values"], this.isGlobal, dataProcessor, arrayTypes, objectTypes))
    })
    this.arrayTypes = arrayTypes
    this.objectTypes = objectTypes
    this.dataProcessor = dataProcessor
    this.combinationLogic = "and"
  }
  
  addFilter(atomicFilter) {
    assertAtomicFilterActionInterface(atomicFilter)
    this.atomicFilters.push(atomicFilter)
  }
  
  removeFilter(atomicFilter) {
    this.atomicFilters.splice(this.atomicFilters.indexOf(atomicFilter), 1)
  }
  
  getNumberOfAtomicFilters() {
    return this.atomicFilters.length
  }
  
  setArrayTypes(arrayTypes) {
    this.arrayTypes = arrayTypes
    return this
  }
  
  setObjectTypes(objectTypes) {
    this.objectTypes = objectTypes
    return this 
  }
  
  setCombinationLogic(combinationLogic) {
    switch(combinationLogic) {
      case "logic and":
        this.combinationLogic = "and"
        break;
      case "logic or":
        this.combinationLogic = "or"
        break;
      default:
        this.combinationLogic = "and"
        break;
    }
  }
  
  runOn(data) {
    switch(this.combinationLogic) {
      case "and":
        return this._runOnDataWithCombinationLogicAnd(data)
      case "or":
        return this._runOnDataWithCombinationLogicOr(data)
      default:
        return this._runOnDataWithCombinationLogicAnd(data)
    }
  }
  
  _runOnDataWithCombinationLogicAnd(data) {
    let resultingData = data
    for (let i=0; i< this.atomicFilters.length; i++) {
      let atomicFilter = this.atomicFilters[i]
      resultingData = atomicFilter.runOn(resultingData)
    }
    return resultingData
  }
  
  _runOnDataWithCombinationLogicOr(data) {
    let resultMap = {}
    for(let i=0; i < this.atomicFilters.length; i++) {
      let atomicFilter = this.atomicFilters[i]
      let filteredData = atomicFilter.runOn(data)
      filteredData.forEach(element => {
        resultMap[element.index] = element
      })
    }
    
    let resultArray = []
    Object.keys(resultMap).forEach(index => {
      resultArray.push(resultMap[index])
    })
    
    return resultArray
  }
}

export class ColorAction extends Action {
  constructor(attribute, isGlobal=true, dataProcessor, colorStore) {
    super(isGlobal)
    this.attribute = attribute
    this.dataProcessor = dataProcessor
    this.colorStore = colorStore
  }
  
  setAttribute(attribute) {
    this.attribute = attribute
    return this
  }
  
  runOn(data) {
    if ((typeof this.attribute) === "undefined") {
      throw new TypeError('The coloring attribute must be set.');
    }
    
    data.forEach(element => {
      let value = this.dataProcessor.getUniqueValueFromIndividual(element, this.attribute)
      let colorString = this.colorStore.getColorForValue(this.attribute, value);
      element.drawing.currentColor = this.colorStore.convertRGBStringToReglColorObject(colorString);
    })
    
    return data
  }
  
  runOnDataWithRGBAStrings(data) {
    if ((typeof this.attribute) === "undefined") {
      throw new TypeError('The coloring attribute must be set.');
    }
    
    data.forEach(element => {
      let value = this.dataProcessor.getUniqueValueFromIndividual(element, this.attribute)
      element.drawing.currentColor = this.colorStore.getColorForValue(this.attribute, value);
    })
    
    return data
  }
}

export class InspectAction extends Action {
  constructor(element, isGlobal=true) {
    super(isGlobal)
    this.selection = element
  }
}

export class ThemeGroupAddedAction extends Action {
  constructor(themeGroupUUID, themeGroupName, themes, isGlobal, color){
    super(isGlobal)
    this.uuid = themeGroupUUID
    this.name = themeGroupName
    this.themes = themes
    this.color = color
  }
}

export class ThemeGroupRemovedAction {
  constructor(themeGroupUUID, isGlobal) {
    this.uuid = themeGroupUUID
    this.isGlobal = isGlobal
  }
}

export class ThemeGroupUpdatedAction {
  constructor(themeGroupUUID, themeGroupName, themes, isGlobal, color) {
    this.uuid = themeGroupUUID
    this.name = themeGroupName
    this.themes = themes
    this.color = color
  }
}