import { equalArrays, deepCopy } from "./utils.js"

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
  "consent_withdrawn": "TRUE",
  "drawing": {
    "inspectColor": {r: 255, g: 0, b: 0, opacity: 1},
    "deselectColor": {r: 211, g: 211, b: 211, opacity: 1},
    "attributeColor": {r: 146, g: 135, b: 10, opacity: 1},
    "defaultColor": {r: 161, g: 176, b: 230, opacity: 1},
    "identifyingColor": //a unique color
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
  "indexIDUnique": {
    value_type: "single",
    grouping: false
  },
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
  },
  "consent_withdrawn" : {
    value_type: "single",
    grouping: false
  }
}

const DEFAULT_MISSING_VALUES = ["NC", "STOP", "CE", "NA", "NR", "greeting", "push_back", "question", "showtime_question", "WS"]

const SOMALIA_ATTRIBUTES = {
  "indexIDUnique": {
    value_type: "single",
    grouping: false
  },
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
  "state": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": DEFAULT_MISSING_VALUES
    }
  },
  "region": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": DEFAULT_MISSING_VALUES
    }
  },
  "gender": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": DEFAULT_MISSING_VALUES
    }
  },
  "district": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": DEFAULT_MISSING_VALUES
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
  "recently_displaced": {
    value_type: "single",
    grouping: true,
    grouping_type: "merge",
    groups: {
      "missing": DEFAULT_MISSING_VALUES
    }
  },
  "themes": {
    value_type: "object",
    grouping: false
  },
  "consent_withdrawn" : {
    value_type: "single",
    grouping: false
  },
  "household_language": {
    value_type: "single",
    grouping: false    
  }
}

export const DataProcessorType = "dataProcessor"

export default class IndividualsProcessor {
  
  constructor() {
    this.valuesByAttribute = {}
    this.valueAggregationLookUp = {}
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  getType() {
    return DataProcessorType
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
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
    let attributes = Object.keys(this.valuesByAttribute)
    if (attributes.includes("indexIDUnique")) {
      attributes.splice(attributes.indexOf("indexIDUnique"), 1)
    }
    if (attributes.includes("consent_withdrawn")) {
      attributes.splice(attributes.indexOf("consent_withdrawn"), 1)
    }
    return attributes
  }
  
  getValuesByAttribute() {
    let valuesByAttribute = deepCopy(this.valuesByAttribute)
    delete valuesByAttribute["indexIDUnique"]
    delete valuesByAttribute["consent_withdrawn"]
    return valuesByAttribute
  }
  
  getUniqueValueFromIndividual(individual, attribute) {
    let attributeProcessDescription = this.currentAttributes[attribute]
    if (attributeProcessDescription.grouping) {
      return this._getIndividualsValueFromGrouping(attributeProcessDescription, individual[attribute])
    } else {
      return individual[attribute]
    }
  }
  
  individualIsMale(individual) {
    return this.getUniqueValueFromIndividual(individual, "gender") === "male"
  }
  
  individualIsFemale(individual) {
    return this.getUniqueValueFromIndividual(individual, "gender") === "female"
  }
  
  individualGenderIsMissing(individual) {
    return (this.getUniqueValueFromIndividual(individual, "gender") !== "male") && (this.getUniqueValueFromIndividual(individual, "gender") !== "female")
  }
  
  getDemographicKeysForCurrentDataSet() {
    if(this.datasetName === "Kenya") {
      return  ['age', 'gender', 'languages', 'constituency', 'county']
    }
    if(this.datasetName === "Somalia") {
      return  ['age', 'gender', 'languages', 'district', 'state', 'region', 'zone']
    }
    
    return ['age', 'gender', 'languages']
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeIndividuals(individuals) {
    let colors = {}
    individuals.forEach((individual, index) => {
      individual.indexIDUnique = index
      individual.isInspected = false
      individual.isSelected = true
      individual.isColoredByAttribute = false
      individual.drawing = {
        "currentColor": this.colorStore.getDefaultColor(),
        "inspectColor": this.colorStore.getInspectColor(),
        "deselectColor": this.colorStore.getDeselectColor(),
        "attributeColor": this.colorStore.getDefaultColor(),
        "defaultColor": this.colorStore.getDefaultColor(),
        "identifyingColor": this.colorStore.getUniqueRGBColor(colors),
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
      this.valuesByAttribute[attribute] = this._sortValues(attribute, uniqueValues)
    })
  }
  
  _sortValues(attribute, uniqueValues) {
    if (attribute === "age" || attribute === "indexIDUnique") {
      return uniqueValues
    } else if (attribute === "themes") {
      let result = []
      let levelthemes = []
      for (let i = 0; i < uniqueValues.length; i++) {
        if (!uniqueValues[i].includes("missing")) {
          levelthemes.push(uniqueValues[i])
        } else {
          levelthemes.sort()
          levelthemes.push(uniqueValues[i])
          result = result.concat(levelthemes)
          levelthemes = []
        }
      }
      levelthemes.sort()
      result = result.concat(levelthemes)
      return result
    } else {
      uniqueValues = uniqueValues.sort()
      if (uniqueValues.includes("missing")) {
        uniqueValues.splice(uniqueValues.indexOf("missing"), 1)
        uniqueValues.push("missing")
      }
      return uniqueValues
    }    
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
    
    Object.keys(groups).forEach(groupName => {
      if (!individualValues.includes(groupName)) {
        individualValues.push(groupName)
      }
    })
    individualValues.sort()
    
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