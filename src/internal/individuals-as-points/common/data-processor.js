import { equalArrays } from "https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/utils.js"

/* 
This singleton class computes the unique values for the important attributes of the individuals applications. An example internal data structure could look like the following

valuesByAttributes: {
  "age": ["18-25", "26-40", ...],
  "gender": ["male", "NC", ...],
}
  
It also exposes an api that finds the unique value for an individual if the value string does not match the unique value classes (e.g. age is 19 => 18-25)
*/

const KENYA_ATTRIBUTES = {
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
      "(EN) & (SWA)": ["(EN)", "(SWA)"],
      "(EN)": ["(EN)"],
      "(SWA)" : ["(SWA)"],
      "missing": ["missing"]
    }
  },
  "themes": {
    value_type: "object",
    grouping: false,
  } 
};
  
const SOMALIA_ATTRIBUTES = {
  "age": {
    value_type: "single",
    grouping: false
  },
  "state": {
    value_type: "single",
    grouping: false
  },
  "region": {
    value_type: "single",
    grouping: false
  },
  "gender": {
    value_type: "single",
    grouping: false
  },
  "district": {
    value_type: "single",
    grouping: false
  },
  "zone": {
    value_type: "single",
    grouping: false
  },
  "themes": {
    value_type: "single",
    grouping: false
  }
};

class IndividualsProcessor {
  
  constructor(){
   if(! IndividualsProcessor.instance){
     this.valuesByAttribute = {};
     this.valueAggregationLookUp = {};
     IndividualsProcessor.instance = this;
   }

   return IndividualsProcessor.instance;
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  initializeWithIndividualsFromKenia(individuals) {
    this.datasetName = "Kenya"
    this.currentAttributes = KENYA_ATTRIBUTES;
    this.valuesByAttribute = {};
    
    this._generateValuesByAttribute(individuals);
  }
  
  initializeWithIndividualsFromSomalia(individuals) {
    this.datasetName = "Somalia"
    this.currentAttributes = SOMALIA_ATTRIBUTES;
    this.valuesByAttribute = {};
    
    this._generateValuesByAttribute(individuals);
  }
  
  getValuesForAttribute(attribute){
    return this.valuesByAttribute[attribute];
  }
  
  getAllAttributes(){
    return Object.keys(this.valuesByAttribute);
  }
  
  getValuesByAttribute(){
    return this.valuesByAttribute;
  }
  
  getUniqueValueFromIndividual(individual, attribute) {
    let attributeProcessDescription = this.currentAttributes[attribute];
    if(attributeProcessDescription.grouping){
      return this._getIndividualsValueFromGrouping(attributeProcessDescription, individual[attribute]);
    } else {
      return individual[attribute];
    }
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _generateValuesByAttribute(individuals) {
    Object.keys(this.currentAttributes).forEach((attribute) => {
      let attributeProcessDescription = this.currentAttributes[attribute];
      let uniqueValues = this._extractUniqueValuesWithAttributeDescription(
        attribute, attributeProcessDescription, individuals); 
      this.valuesByAttribute[attribute] = uniqueValues;
    })
  }
  
  _extractUniqueValuesWithAttributeDescription(attribute, attributeProcessDescription, individuals) {
    if(attributeProcessDescription.grouping) {
      return this._getValuesFromGrouping(attributeProcessDescription);
    } else {
      return this._getValuesFromIndividuals(individuals, attribute)
    }
  }
  
  _getValuesFromGrouping(attributeProcessDescription){
    return Object.keys(attributeProcessDescription.groups);
  }
  
  _getValuesFromIndividuals(individuals, attribute){
    return [... new Set(individuals.map((individual) => individual[attribute]))]
  }
  
  _getIndividualsValueFromGrouping(attributeProcessDescription, value){
    if(attributeProcessDescription.value_type === "single") {
      return this._getIndividualsValueFromSingleValueType(attributeProcessDescription, value);

    }
    if(attributeProcessDescription.value_type === "multi") {
      return this._getIndividualsValueFromMultiValueType(attributeProcessDescription, value);
    }
    
  }
         
  _getIndividualsValueFromSingleValueType(attributeProcessDescription, value) {
    if(attributeProcessDescription.grouping_type === "bounds") {
      return this._getIndividualsValueFromWithinBounds(attributeProcessDescription.groups, value);
    }
    if(attributeProcessDescription.grouping_type === "enumeration") {
      return this._getIndividualsValueFromEnumeration(attributeProcessDescription.groups, value);
    }
  }
  
  _getIndividualsValueFromWithinBounds(groups, value) {
    let uniqueValue = "missing";
    Object.keys(groups).forEach((groupLabel) => {
      let groupDescription = groups[groupLabel];
      if(groupDescription.lower_bound <= +value && +value <= groupDescription.upper_bound)
        uniqueValue = groupLabel
    })
    return uniqueValue;
  }
  
  _getIndividualsValueFromEnumeration(groups, value) {
    let resultingGroup = "missing"
    Object.keys(groups).forEach((group) => {
      let acceptedValues = groups[group];
      if(acceptedValues.includes(value)) {
        resultingGroup = group;
      }
    })
    return resultingGroup
  }
  
  _getIndividualsValueFromMultiValueType(attributeProcessDescription, values){
    if(attributeProcessDescription.grouping_type === "all") {
      return this._getIndividualsValueThatMatchesAll(attributeProcessDescription.groups, values);
    }
  }
  
  _getIndividualsValueThatMatchesAll(groups, values){
    let resultingGroup = "missing"
    
    Object.keys(groups).forEach((group) => {
      let acceptedSet = [... new Set(groups[group])]
      let testedSet = [... new Set(values)];
      
      if(equalArrays(acceptedSet, testedSet)) {
        resultingGroup = group;
      }
    })
    
    return resultingGroup
  }
}

const individualsProcessor = new IndividualsProcessor();

export default individualsProcessor;