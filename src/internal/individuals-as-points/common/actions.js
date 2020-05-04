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
      throw new Error('The grouping attribute must be set.')
    }
    
    if(this.attribute === "none") {
      return {"all": data}
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
      throw new TypeError('The filtering attribute must be set.')
    }
    
    if (this.filterValues.length === 0) {
      throw new TypeError('The filtering value must be set.')
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
      let isIncluded = false
      this.filterValues.forEach(filterValue => {
        let elementValue = this.dataProcessor.getUniqueValueFromIndividual(element, this.filterAttribute)
        if (element[this.filterAttribute].includes(filterValue) || elementValue === filterValue) {
          isIncluded = true
        }
      })
      return isIncluded
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
        break
      case "logic or":
        this.combinationLogic = "or"
        break
      default:
        this.combinationLogic = "and"
        break
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

export class SelectAction extends Action {
  constructor(attributeValuePairs, isGlobal=true, dataProcessor, colorStore) {
    super(isGlobal)
    this.dataProcessor = dataProcessor
    this.colorStore = colorStore
    this.colorAction = new ColorAction("", true, dataProcessor, colorStore)
    this.filterAction = new FilterAction(attributeValuePairs, true, dataProcessor)
  }
  
  addFilter(atomicFilter) {
    this.filterAction.addFilter(atomicFilter)
  }
  
  removeFilter(atomicFilter) {
    this.filterAction.removeFilter(atomicFilter)
  }
  
  getNumberOfAtomicFilters() {
    return this.filterAction.getNumberOfAtomicFilters()
  }
  
  setArrayTypes(arrayTypes) {
    this.filterAction.setArrayTypes(arrayTypes)
    return this
  }
  
  setObjectTypes(objectTypes) {
    this.filterAction.setObjectTypes(objectTypes)
    return this 
  }
  
  runOn(data) {
    data.forEach(element => {
      element.isSelected = false
    })
    
    let selectedIndividuals = this.filterAction.runOn(data)
    
    selectedIndividuals.forEach(individual => {
      individual.isSelected = true
    })
    
    this.colorAction.setColorsByFlags(data)
        
    return selectedIndividuals
  }
    
  setCombinationLogic(combinationLogic) {
    this.filterAction.setCombinationLogic(combinationLogic)
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
      throw new TypeError('The coloring attribute must be set.')
    }
    
    if (this.attribute === "none") {
      this._resetCurrentColorToDefault(data)
      return data
    } 
    
    data.forEach(element => {
      element.isColoredByAttribute = true
      let value = this.dataProcessor.getUniqueValueFromIndividual(element, this.attribute)
      element.drawing.attributeColor = this.colorStore.getColorForValue(this.attribute, value)
    })
    this.setColorsByFlags(data)
    
    return data
  }
  
  setColorsByFlags(data) {
    data.forEach(element => {
      if (element.isInspected) {
        element.drawing.currentColor = element.drawing.inspectColor
      } else if (!element.isSelected) {
        element.drawing.currentColor = element.drawing.deselectColor
      } else if (element.isColoredByAttribute) {
        element.drawing.currentColor = element.drawing.attributeColor
      } else {
        element.drawing.currentColor = element.drawing.defaultColor
      }
    })
  }
  
  setCurrentColorsTo(data, colortype) {
    data.forEach(element => {
      element.drawing.currentColor = element.drawing[colortype]
    })
  }
  
  _resetCurrentColorToDefault(data) {
    data.forEach(element => {
      element.isColoredByAttribute = false
    })
    this.setColorsByFlags(data)
  }
}

export class InspectAction extends Action {
  constructor(element, isGlobal=true, dataProcessor, colorStore) {
    super(isGlobal)
    this.selection = element
    this.colorAction = new ColorAction("", true, dataProcessor, colorStore)
  }
  
  runOn(data) {
    this.uninspectAll(data)
    this.inspectIndividual()
    
  }
  
  uninspectAll(data) {
    data.forEach(element => {
      element.isInspected = false
    })
    
    this.colorAction.setColorsByFlags(data)
  }
  
  inspectIndividual() {
    if (this.selection) {
      this.selection.isInspected = true
      this.selection.drawing.currentColor = this.selection.drawing.inspectColor
    }
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