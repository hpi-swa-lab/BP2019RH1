import { GroupingAction } from "../../display-exploration/actions.js"

export class DataHandler {
  
  constructor(geoData, individuals, canvasWidth, canvasHeight, featureToAVFLookup, missingDataKeys, locationGroupingAttribute, locationLookupKey) {
    this.geoData = geoData
    this.individuals = individuals
    this.colorToIndividualIndex = {}
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.featureToAVFLookup = featureToAVFLookup
    this.missingDataKeys = missingDataKeys
    this.locationGroupingAttribute = locationGroupingAttribute
    this.locationLookupKey = locationLookupKey
  }
  
  initializeIndividuals() {
    this.individuals.forEach((individual, index) => {
      individual.id = index
      individual.drawing = {}
      individual.drawing.defaultColor = {"r" : 0, "g" : 0, "b" : 255, "a" : 255}
      let defaultColor = Object.assign({}, individual.drawing.defaultColor)
      individual.drawing.currentColor = defaultColor
      individual.drawing.uniqueColor = this.getUniqueColor()  
      let color = individual.drawing.uniqueColor
      let colorString = "r" + color.r + "g" + color.g + "b" + color.b
      this.colorToIndividualIndex[colorString] = index
      individual.drawing.position = {}
    })
  }
  
  getUniqueColor() {
    let color = this.getRandomColor()
    let colorString = "r" + color.r + "g" + color.g + "b" + color.b
    while (this.colorToIndividualIndex[colorString]) {
      color = this.getRandomColor()
      colorString = "r" + color.r + "g" + color.g + "b" + color.b
    }
    return color
  }

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min
  }

  getRandomColor() {
    return {"r": this.getRndInteger(1, 254), "g" : this.getRndInteger(1, 254), "b" : this.getRndInteger(1, 254), "a" : 255}
  }

  calculateIndividualsPosition(imageData, path) {
    let individualsGroupedByDistrict = this.groupIndividualsByDistrict()
    let i = this.geoData.length
    // testing
    var missingGroups = {}
  Object.keys(individualsGroupedByDistrict).forEach(key => {
    missingGroups[key] = 1
  })
    var missingFeatureMatches = []
    // ...
    while(i--){
      let districtName = this.getDistrictLookupName(this.geoData[i])
      let individualsInDistrict = individualsGroupedByDistrict[districtName]
      
      if(!individualsInDistrict) {
        missingFeatureMatches.push(districtName)
        continue
      }
      
      let population = individualsInDistrict.length
      delete missingGroups[districtName]
      if ( !population ) {
        continue
      }

      let bounds = path.bounds(this.geoData[i])
      let x0 = bounds[0][0]
      let y0 = bounds[0][1]
      let w = bounds[1][0] - x0
      let h = bounds[1][1] - y0
      let hits = 0
      let count = 0
      let limit = population *10
      let x
      let y
      let r = parseInt((i + 1) / 256)
      let g = (i + 1) % 256
      let usedCoordinates = {}

      while( hits < population && count < limit){
        x = parseInt(x0 + Math.random()*w)
        y = parseInt(y0 + Math.random()*h)

        if (!usedCoordinates[x + "," + y]) {
          if (this.testPixelColor(imageData,x,y,this.canvasWidth,r,g) ){
            usedCoordinates[x + "," + y] = true
            this.setIndividualPosition(individualsInDistrict[hits], x, y)
            hits++
          }
        }
        count++
      }
    }
  }

  testPixelColor(imageData,x,y,w,r,g){
    if (y < 0 || x < 0) {
      debugger
      return true
    }
    let index = (x + y * w) * 4
    return imageData.data[index] == r && imageData.data[index + 1] == g
  }

  setIndividualPosition(individual, x, y) {
    individual.drawing.position.x = x
    individual.drawing.position.y = y
  }
  
  groupIndividualsByDistrict() {
    let action = new GroupingAction()
    action.setAttribute(this.locationGroupingAttribute)
    let individualsGroupedByDistrict = action.runOn(this.individuals)
    return individualsGroupedByDistrict
  }

  getDistrictLookupName(feature) {
    let lookupName = this.featureToAVFLookup[feature.properties[this.locationLookupKey]]
    if (lookupName) {
      return lookupName
    } else {
      lookupName = feature.properties[this.locationLookupKey].toLowerCase()
      return lookupName
    }
  }
  
  addDistrictsForMissingData() {
    let j = 1
    this.missingDataKeys.forEach(key => {
      let missingDataFeature = {"type" : "Feature", "properties" : {}, "geometry" : {"type" : "MultiPolygon", "coordinates" : []}
      }
      let coordinates = this.getCoordinatesForMissingFeature(j)
      missingDataFeature.geometry.coordinates = coordinates
      missingDataFeature.properties[this.locationLookupKey] = key
      this.geoData.push(missingDataFeature)
      j += 1.5
    })
  }
    
  createDistrictColorCoding() {
    this.colorToDistrict = {}
    this.districtToColor = {}
    let i = this.geoData.length
    while(i--){
      let r = parseInt((i + 1) / 256)
      let g = (i + 1) % 256
      this.colorToDistrict["rgb(" + r + "," + g + ",0)"] = this.geoData[i]
      this.districtToColor[this.geoData[i].properties[this.locationLookupKey]] = "rgb(" + r + "," + g + ",0)"
    }
  }
  
  setColorToHighlight(individual) {
    individual.drawing.currentColor = {"r" : 255, "g" : 0, "b" : 0, "a" : 255}
  }
  
  resetColorToDefault(individual) {
    let defaultColor = Object.assign({}, individual.drawing.defaultColor)
    individual.drawing.currentColor = defaultColor
  }
  
  setColorByAttribute(attribute) {
    let domain = this.getValuesOfAttribute(attribute)
    let colors = []
    domain.forEach(() => {
      colors.push(this.getUniqueColor(colors))
    })
    
    let domainColorMap = {}
    for (let i = 0; i < domain.length; i++) {
      domainColorMap[domain[i]] = colors[i] 
    }
    
    this.individuals.forEach((individual) => {
      individual.drawing.defaultColor = domainColorMap[individual[attribute]]
      individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
    })
  }

  getValuesOfAttribute(attribute) {
    let attributeValues = {}
    this.individuals.forEach(individual => {
      attributeValues[individual[attribute]] = true
    })
    return Object.keys(attributeValues)
  }
}

export class SomaliaDataHandler extends DataHandler {
  getCoordinatesForMissingFeature(j) {
    return [[[[40.5,-1.5+j],
          [40.5,-2.5+j],
          [38,-2.5+j],
          [38,-1.5+j],
          [40.5,-1.5+j]]]]
  }
  
  setColorByThemeAttribute(attribute) {
    this.individuals.forEach((individual) => {
        if (individual.themes.includes(attribute)) {
          individual.drawing.defaultColor = {"r" : 0, "g" : 0, "b" : 100, "a" : 255}
          individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
        } else {
          individual.drawing.defaultColor = {"r" : 0, "g" : 200, "b" : 255, "a" : 0.25}
          individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
        }
    })
  }
}

export class KenyaDataHandler extends DataHandler {
  getCoordinatesForMissingFeature(j){
    return [[[[35,-3.5+j],
        [35,-6.5+j],
        [31,-6.5+j],
        [31,-3.5+j],
        [35,-3.5+j]]]]
  }
  
  setColorByThemeAttribute(attribute) {
    this.individuals.forEach((individual) => {
        if (individual.themes["L1"].includes(attribute) || individual.themes["L2"].includes(attribute) || individual.themes["L3"].includes(attribute)) {
          individual.drawing.defaultColor = {"r" : 0, "g" : 0, "b" : 100, "a" : 255}
          individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
        } else {
          individual.drawing.defaultColor = {"r" : 0, "g" : 200, "b" : 255, "a" : 0.25}
          individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
        }
    })
  }
}