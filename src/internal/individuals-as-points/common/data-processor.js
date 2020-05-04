import { equalArrays } from "./utils.js"
import ColorStore from "./color-store.js"

/* 
This singleton class computes the unique values for the important attributes of the individuals applications. An example internal data structure could look like the following

valuesByAttributes: {
  "age": ["18-25", "26-40", ...],
  "gender": ["male", "NC", ...],
}
  
It also exposes an api that finds the unique value for an individual if the value string does not match the unique value classes (e.g. age is 19 => 18-25)

Schema for individuals:
{
  "index": 0,
  "isInspected": false,
  "isSelected": true,
  "isColoredByAttribute": false,
  "age": 10,
  "gender": "male",
  "languages": [],
  "themes": {
    "L1": [],
    "L2": []
  },
  "drawing": {
    "inspectColor": {r: 255, g: 0, b: 0, opacity: 1},
    "deselectColor": {r: 211, g: 211, b: 211, opacity: 1},
    "attributeColor": {r: 146, g: 135, b: 10, opacity: 1},
    "defaultColor": {r: 255, g: 100, b: 100, opacity: 1}
    "currentPosition": {
      "x": 0,
      "y": 0
    },
    "defaultPosition": {
      "x": 0,
      "y": 0
    },
    "targetPosition": {
      "x": 0,
      "y": 0
    },
    "startPosition": {
      "x": 0,
      "y": 0
    },
    "startSize": 5,
    "targetSize": 5,
    "currentSize": 5,
    "defaultSize": 5,
  }
}
*/

const KENYA_ATTRIBUTES = {
  "age": {
    value_type: "single",
    grouping: true,
    grouping_type: "bounds",
    groups: {
      "under 10": {
        upper_bound: 9,
        lower_bound: 0
      },
      "10 - 14": {
        lower_bound: 10,
        upper_bound: 14,
      },
      "15 - 17": {
        lower_bound: 15,
        upper_bound: 17,
      },
      "18 - 35": {
        lower_bound: 18,
        upper_bound: 35,
      },
      "36 - 54": {
        lower_bound: 36,
        upper_bound: 54,
      },
      "over 55": {
        lower_bound: 55,
        upper_bound: 1000,
      },
      "missing": {
        lower_bound: "missing",
        upper_bound: "missing"
      }      
    }
  },
  "constituency": {
    value_type: "single",
    grouping: false
  },
  "county": {
    value_type: "single",
    grouping: false
  },
  "gender": {
    value_type: "single",
    grouping: true,
    grouping_type: "enumeration",
    groups: {
      "male": ["male"],
      "female": ["female"],
      "missing": ["missing"]
    }
  },
  "languages": {
    value_type: "multi",
    grouping: true,
    grouping_type: "all",
    groups: {
      "(En) & (Swa)": ["(En)", "(Swa)"],
      "(En)": ["(En)"],
      "(Swa)" : ["(Swa)"],
      "missing": ["missing"]
    }
  },
  "themes": {
    value_type: "object",
    grouping: false,
  }
}
  
const SOMALIA_ATTRIBUTES = {
  "age": {
    value_type: "single",
    grouping: true,
    grouping_type: "bounds",
    groups: {
      "under 18": {
        upper_bound: 17,
        lower_bound: 0
      },
      "18 - 25": {
        lower_bound: 18,
        upper_bound: 25,
      },
      "over 25": {
        lower_bound: 26,
        upper_bound: 1000,
      },
      "missing": {
        lower_bound: "missing",
        upper_bound: "missing"
      }
    }
  },
  "state": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": ["NC", "STOP", "CE", "NA", "NR", "greeting", "push_back", "question", "showtime_question", "WS"]
    }
  },
  "region": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": ["NC", "STOP", "CE", "NA", "NR", "greeting", "push_back", "question", "showtime_question", "WS"]
    }
  },
  "gender": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": ["NC", "STOP", "CE", "NA", "NR", "greeting", "push_back", "question", "showtime_question", "WS"]
    }
  },
  "district": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": ["NC", "STOP", "CE", "NA", "NR", "greeting", "push_back", "question", "showtime_question", "WS"]
    }
  },
  "zone": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": ["NC", "STOP", "CE", "NA", "NR", "greeting", "push_back", "question", "showtime_question", "WS"]
    }
  },
  "themes": {
    value_type: "single",
    grouping: false
  }
}

export default class IndividualsProcessor {
  
  static current(forceNewInstance=false) {
    if(!this._current || forceNewInstance) {
      this._current = new IndividualsProcessor()
    }
    return this._current
  }
  
  constructor() {
    this.valuesByAttribute = {}
    this.valueAggregationLookUp = {}
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  initializeWithIndividualsFromKenia(individuals) {
    this.datasetName = "Kenya"
    this.currentAttributes = KENYA_ATTRIBUTES
    this.valuesByAttribute = {}
    this._initializeIndividuals(individuals)
    
    this._generateValuesByAttribute(individuals)
  }
  
  initializeWithIndividualsFromSomalia(individuals) {
    this.datasetName = "Somalia"
    this.currentAttributes = SOMALIA_ATTRIBUTES
    this.valuesByAttribute = {}
    this._initializeIndividuals(individuals)
    
    this._generateValuesByAttribute(individuals)
  }
  
  getValuesForAttribute(attribute) {
    return this.valuesByAttribute[attribute]
  }
  
  getAllAttributes() {
    return Object.keys(this.valuesByAttribute)
  }
  
  getValuesByAttribute() {
    return this.valuesByAttribute
  }
  
  getUniqueValueFromIndividual(individual, attribute) {
    let attributeProcessDescription = this.currentAttributes[attribute]
    if (attributeProcessDescription.grouping) {
      return this._getIndividualsValueFromGrouping(attributeProcessDescription, individual[attribute])
    } else {
      return individual[attribute]
    }
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeIndividuals(individuals) {
    individuals.forEach((individual, index) => {
      individual.index = index
      individual.isInspected = false
      individual.isSelected = true
      individual.isColoredByAttribute = false
      individual.drawing = {
        "currentColor": ColorStore.current().getDefaultColor(),
        "inspectColor": ColorStore.current().getInspectColor(),
        "deselectColor": ColorStore.current().getDeselectColor(),
        "attributeColor": ColorStore.current().getDefaultColor(),
        "defaultColor": ColorStore.current().getDefaultColor(),
        "currentPosition": {
          "x": 0,
          "y": 0
        },
        "defaultPosition": {
          "x": 0,
          "y": 0
        },
        "targetPosition": {
          "x": 0,
          "y": 0
        },
        "startPosition": {
          "x": 0,
          "y": 0
        },
        "startSize": 5,
        "targetSize": 5,
        "currentSize": 5,
        "defaultSize": 5
      }
    })
  }

  _generateValuesByAttribute(individuals) {
    Object.keys(this.currentAttributes).forEach((attribute) => {
      let attributeProcessDescription = this.currentAttributes[attribute]
      let uniqueValues = this._extractUniqueValuesWithAttributeDescription(
        attribute, attributeProcessDescription, individuals) 
      this.valuesByAttribute[attribute] = uniqueValues
    })
  }
  
  _extractUniqueValuesWithAttributeDescription(attribute, attributeProcessDescription, individuals) {
    if (attributeProcessDescription.grouping) {
      if (attributeProcessDescription.grouping_type === "merge") {
        return this._getValuesFromMergedGrouping(individuals, attribute, attributeProcessDescription)
      }
      return this._getValuesFromGrouping(attributeProcessDescription)
    } else {
      if (this.currentAttributes[attribute].value_type === "object") {
        // TODO: rename functions from theme to object related name
        return this._getThemesFromIndividuals(individuals)
      } else {
        return this._getValuesFromIndividuals(individuals, attribute)
      }
    }
  }
  
  _getValuesFromGrouping(attributeProcessDescription){
    return Object.keys(attributeProcessDescription.groups)
  }
  
  _getValuesFromIndividuals(individuals, attribute){
    return [... new Set(individuals.map((individual) => individual[attribute]))]
  }
  
  _getThemesFromIndividuals(individuals) {
    let themeCombinations = this._getValuesFromIndividuals(individuals, "themes")
    let themes = {}
    themeCombinations.forEach(themeCombination => {
      Object.keys(themeCombination).forEach(level => {
        themeCombination[level].forEach(theme => {
          if(!themes[level]) {
            themes[level] = []
          }
          if(!themes[level].includes(theme)) {
            themes[level].push(theme)
          }
        })
      })
    })
    
    let themeArray = []
    Object.keys(themes).forEach(level => {
      themeArray = themeArray.concat(themes[level])
    })
    return themeArray
  }
  
  _getValuesFromMergedGrouping(individuals, attribute, attributeProcessDescription) {
    let individualValues = this._getValuesFromIndividuals(individuals, attribute)
    let groups = attributeProcessDescription.groups
    Object.keys(groups).forEach((groupLabel) => {
      groups[groupLabel].forEach((attribute) => {
        if (individualValues.includes(attribute)) {
          let index = individualValues.indexOf(attribute)
          individualValues.splice(index, 1)
        }
      })
    })
    individualValues.sort()
    individualValues = individualValues.concat(Object.keys(groups))
    return individualValues
  }
  
  _getIndividualsValueFromGrouping(attributeProcessDescription, value){
    if (attributeProcessDescription.value_type === "single") {
      return this._getIndividualsValueFromSingleValueType(attributeProcessDescription, value)

    }
    if (attributeProcessDescription.value_type === "multi") {
      return this._getIndividualsValueFromMultiValueType(attributeProcessDescription, value)
    }
  }
         
  _getIndividualsValueFromSingleValueType(attributeProcessDescription, value) {
    if (attributeProcessDescription.grouping_type === "bounds") {
      return this._getIndividualsValueFromWithinBounds(attributeProcessDescription.groups, value)
    }
    if (attributeProcessDescription.grouping_type === "enumeration") {
      return this._getIndividualsValueFromEnumeration(attributeProcessDescription.groups, value)
    }
    if (attributeProcessDescription.grouping_type === "merge") {
      return this._getIndividualsValueFromMerge(attributeProcessDescription.groups, value)
    }
  }
  
  _getIndividualsValueFromWithinBounds(groups, value) {
    let resultingGroup = "missing"
    Object.keys(groups).forEach((groupLabel) => {
      let groupDescription = groups[groupLabel]
      if (groupDescription.lower_bound <= +value && +value <= groupDescription.upper_bound)
        resultingGroup = groupLabel
    })
    return resultingGroup
  }
  
  _getIndividualsValueFromEnumeration(groups, value) {
    let resultingGroup = "missing"
    Object.keys(groups).forEach((groupLabel) => {
      let acceptedValues = groups[groupLabel]
      if (acceptedValues.includes(value)) {
        resultingGroup = groupLabel
      }
    })
    return resultingGroup
  }
  
  _getIndividualsValueFromMerge(groups, value) {
    let resultingGroup = value
    Object.keys(groups).forEach((groupLabel) => {
      let acceptedValues = groups[groupLabel]
      if (acceptedValues.includes(value)) {
        resultingGroup = groupLabel
      }
    })
    return resultingGroup
  }
  
  _getIndividualsValueFromMultiValueType(attributeProcessDescription, values){
    if (attributeProcessDescription.grouping_type === "all") {
      return this._getIndividualsValueThatMatchesAll(attributeProcessDescription.groups, values)
    }
  }
  
  _getIndividualsValueThatMatchesAll(groups, values){
    let resultingGroup = "missing"
    
    Object.keys(groups).forEach((group) => {
      let acceptedSet = [... new Set(groups[group])]
      let testedSet = [... new Set(values)]
      
      if (equalArrays(acceptedSet, testedSet)) {
        resultingGroup = group
      }
    })
    
    return resultingGroup
  }
}