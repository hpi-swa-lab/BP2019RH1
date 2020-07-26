export const FilterActionType = "filterAction"
export const NullActionType = "nullAction"
export const ResetDrawingInformationActionType = "resetDrawingInformationAction"
export const GroupActionType = "groupAction"
export const ColorActionType = "colorAction"
export const EmptyFilterActionType = "emptyFilterAction"
export const SelectActionType = "selectAction"
export const InspectActionType = "inspectAction"
export const ThemeGroupAddedActionType = "themeGroupAddedAction"
export const ThemeGroupRemovedActionType = "themeGroupRemovedAction"
export const ThemeGroupUpdatedActionType = "themeGroupUpdatedAction"
export const ActionType = "action"

import { equalArrays } from "./utils.js"


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
  
  getType() {
    return ActionType
  }
}

export class NullAction extends Action {
  constructor(isGlobal=false) {
    super(isGlobal)
    this.filters = []
  }
  
  runOn(data) {
    return data
  }
  
  getType() {
    return NullActionType
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
  
  getType() {
    return ResetDrawingInformationActionType
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
  
  getType() {
    return GroupActionType
  }
}

export class FilterAction extends Action {
  constructor(dataProcessor = null, isGlobal = true, filters = [], combinationLogic = "and", includesStop = true) {
    super(isGlobal)
    this.filters = filters
    
    // added and removed Filters only occur for info transfer between 
    // two panes or control panel and pane and do not get set in the state of a pane
    this.addedFilters = []
    this.removedFilters = []
    this.combinationLogic = combinationLogic
    this.includesStop = includesStop
    this.dataProcessor = dataProcessor
  }
  
  getType() {
    return FilterActionType
  }
  
  getAllFilters() {
    return this.filters
  }
  
  addFilter(atomicFilter) {
    if (!this.filters.some(filter => filter.equals(atomicFilter))) {
      this.filters.push(atomicFilter)
    }
  }
  
  removeFilter(atomicFilter) {
    let removedFilter = this.filters.find(filter => filter.equals(atomicFilter))
    if (removedFilter) {
      this.filters.splice(this.filters.indexOf(removedFilter), 1)
    }  
  }
  
  getAddedFilters() {
    return this.addedFilters
  }
  
  setAddedFilters(filters) {
    this.addedFilters = filters
  }
  
  getRemovedFilters() {
    return this.removedFilters 
  }
  
  setRemovedFilters(filters) {
    this.removedFilters = filters
  }
  
  getCombinationLogic() {
    return this.combinationLogic
  }
  
  setCombinationLogic(combinationLogic) {
    this.combinationLogic = combinationLogic
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setIncludeStop(includesStop) {
    this.includesStop = includesStop
    return this
  }
  
  runOn(data) {
    data = this._filterSTOPAccordingToFlag(data)
    
    if (this.filters.length > 0) {
      switch(this.combinationLogic) {
        case "and":
          return this._runOnDataWithCombinationLogicAnd(data)
        case "or":
          return this._runOnDataWithCombinationLogicOr(data)
        default:
          return this._runOnDataWithCombinationLogicAnd(data)
      }
    } else {
      return data
    }
  }
  
  _filterSTOPAccordingToFlag(data) {
    if (this.includesStop) {
      return data
    } else {
      let stopFilter = new AtomicFilterAction("consent_withdrawn", ["FALSE"], this.dataProcessor)
      let filteredData = stopFilter.runOn(data)
      return filteredData
    }
  }
  
  _runOnDataWithCombinationLogicAnd(data) {
    let resultingData = data
    for (let i=0; i< this.filters.length; i++) {
      let atomicFilter = this.filters[i]
      resultingData = atomicFilter.runOn(resultingData)
    }    
    return resultingData
  }
  
  _runOnDataWithCombinationLogicOr(data) {
    let resultMap = {}
    for(let i=0; i < this.filters.length; i++) {
      let atomicFilter = this.filters[i]
      let filteredData = atomicFilter.runOn(data)
      filteredData.forEach(element => {
        resultMap[element.id] = element
      })
    }
    
    let resultArray = []
    Object.keys(resultMap).forEach(id => {
      resultArray.push(resultMap[id])
    })
    
    return resultArray
  }
}

export class AtomicFilterAction extends Action {
  constructor(attribute, values, dataProcessor, isGlobal=true, arrayTypes=["languages"], objectTypes=["themes"]) {
    super(isGlobal)
    this.filterAttribute = attribute
    this.filterValues = values
    this.dataProcessor = dataProcessor
    this.isGlobal = isGlobal
    this.arrayTypes = arrayTypes
    this.objectTypes = objectTypes
  }
  
  equals(atomicFilterAction) {
    return atomicFilterAction.filterAttribute === this.filterAttribute && equalArrays(atomicFilterAction.filterValues, this.filterValues)
  }
  
  getType() {
    return FilterActionType
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
  
  setArrayTypes(arrayTypes) {
    this.arrayTypes = arrayTypes
    return this
  }
  
  setObjectTypes(objectTypes) {
    this.objectTypes = objectTypes
    return this 
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
        if (elementValue === filterValue) {
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


export class SelectAction extends Action {
  constructor(filterAction = new FilterAction(), dataProcessor = null, colorStore = null, isGlobal=true) {
    super(isGlobal)
    this.dataProcessor = dataProcessor
    this.colorStore = colorStore
    this.colorAction = new ColorAction("", true, dataProcessor, colorStore)
    this.filterAction = filterAction
    this.filterAction.setDataProcessor(dataProcessor)
  }
  
  getType() {
    return SelectActionType
  }
  
  addFilter(filter) {
    this.filterAction.addFilter(filter)
  }
  
  removeFilter(atomicFilter) {
    this.filterAction.removeFilter(atomicFilter)
  }
  
  getAddedFilters() {
    return this.filterAction.getAddedFilters()
  }
  
  setAddedFilters(filters) {
    this.filterAction.setAddedFilters(filters)
  }
  
  getRemovedFilters() {
    return this.filterAction.getRemovedFilters()
  }
  
  setRemovedFilters(filters) {
    this.filterAction.setRemovedFilters(filters)
  }
  
  getAllFilters() {
    return this.filterAction.getAllFilters()
  }
  
  setArrayTypes(arrayTypes) {
    this.filterAction.setArrayTypes(arrayTypes)
    return this
  }
  
  setObjectTypes(objectTypes) {
    this.filterAction.setObjectTypes(objectTypes)
    return this 
  }
  
  setIncludeStop(includesStop) {
    this.filterAction.setIncludeStop(includesStop)
  }
  
  getCombinationLogic() {
    return this.filterAction.getCombinationLogic()
  }
  
  setCombinationLogic(combinationLogic) {
    this.filterAction.setCombinationLogic(combinationLogic)
  } 
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
    this.filterAction.setDataProcessor(dataProcessor)
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
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
}

export class ColorAction extends Action {
  constructor(attribute = "none", isGlobal=true, dataProcessor = null, colorStore = null) {
    super(isGlobal)
    this.attribute = attribute
    this.dataProcessor = dataProcessor
    this.colorStore = colorStore
  }
  
  getType() {
    return ColorActionType
  }
  
  setAttribute(attribute) {
    this.attribute = attribute
    return this
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
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
  constructor(element = null, isGlobal=true, dataProcessor = null, colorStore = null) {
    super(isGlobal)
    this.selection = element
    this.colorAction = new ColorAction("", true, dataProcessor, colorStore)
  }
  
  setDataProcessor(dataProcessor) {
    this.colorAction.setDataProcessor(dataProcessor)
  }
  
  setColorStore(colorStore) {
    this.colorAction.setColorStore(colorStore)
  }
  
  getType() {
    return InspectActionType
  }
  
  runOn(data) {
    this.uninspectAll(data)
    this.inspectIndividual(data)
  }
  
  uninspectAll(data) {
    data.forEach(element => {
      element.isInspected = false
    })
    
    this.colorAction.setColorsByFlags(data)
  }
  
  inspectIndividual(data) {
    if (this.selection) {
      data.forEach(element => {
        // not nice quickfix, data set should be consistent here
        if (this.selection.id) {
          if (element.id === this.selection.id) {
            element.isInspected = true
            element.drawing.currentColor = this.selection.drawing.inspectColor
          }
        } else if (this.selection.uid) {
          if (element.uid === this.selection.uid) {
            element.isInspected = true
            element.drawing.currentColor = this.selection.drawing.inspectColor
          }
        }
         
      }) 
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
  
  getType() {
    return ThemeGroupAddedActionType
  }
}

export class ThemeGroupRemovedAction {
  constructor(themeGroupUUID, isGlobal) {
    this.uuid = themeGroupUUID
    this.isGlobal = isGlobal
  }
  
  getType() {
    return ThemeGroupRemovedActionType
  }
}

export class ThemeGroupUpdatedAction {
  constructor(themeGroupUUID, themeGroupName, themes, isGlobal, color) {
    this.uuid = themeGroupUUID
    this.name = themeGroupName
    this.themes = themes
    this.color = color
  }
  
  getType() {
    return ThemeGroupUpdatedActionType
  }
}