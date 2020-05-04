import { GroupingAction } from "../../display-exploration/actions.js"

export class DataHandler {
  
  constructor(geoData, individuals, pointSize, canvasWidth, canvasHeight, featureToAVFLookup, missingDataKeys, locationGroupingAttribute, locationLookupKey) {
    this.geoData = geoData
    this.individuals = individuals
    this.colorToIndividualIndex = {}
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.featureToAVFLookup = featureToAVFLookup
    this.missingDataKeys = missingDataKeys
    this.locationGroupingAttribute = locationGroupingAttribute
    this.locationLookupKey = locationLookupKey
    this.individualsGroupedByDistrict = this.groupIndividualsByDistrict()
    this.themeToAmount = {}
    this.themeToAmountInDistrict = {}
    this.selectedThemes = null
    this.pointSize = pointSize
  }
  
  initializeIndividuals() {
    this.individuals.forEach((individual, index) => {
      individual.id = index
      individual.drawing = {}
      individual.drawing.defaultColor = {"r" : 0, "g" : 0, "b" : 255, "a" : 0.5}
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
    let i = this.geoData.length
    var missingGroups = {}
    Object.keys(this.individualsGroupedByDistrict).forEach(key => {
      missingGroups[key] = 1
    })
    var missingFeatureMatches = []
    
    while(i--){
      let districtName = this.getDistrictLookupName(this.geoData[i])
      let individualsInDistrict = this.individualsGroupedByDistrict[districtName]
      
      if(!individualsInDistrict) {
        missingFeatureMatches.push(districtName)
        continue
      }
      
      let population = individualsInDistrict.length
      delete missingGroups[districtName]
      if ( !population ) {
        continue
      }
      let count = 0
      let gridDensity = 1
      let points = []
      while (count < population) {
        count = 0
        points = []

        let bounds = path.bounds(this.geoData[i])
        let area = path.area(this.geoData[i])
        let squareArea = area / population
        let edgeLength = Math.sqrt(squareArea) / gridDensity
        let offset = 0
        
        if (edgeLength > this.pointSize) { 
          offset = this.pointSize * 2
        } 

        let r = parseInt((i + 1) / 256), g = (i + 1) % 256
        for (let j = bounds[0][1]; j < bounds[1][1]; j += edgeLength) {
          for (let i = bounds[0][0]; i < bounds[1][0]; i += edgeLength) {
            if (this.testSquareColor(imageData, i, j, this.canvasWidth, r, g, offset)) {
              points.push([i, j])
              count++
            }
          }
        }
        gridDensity += 0.01
      }
      points = points.slice(0, population)
      for (let i = 0; i < points.length; i++) {
        this.setIndividualPosition(individualsInDistrict[i], points[i][0],points[i][1])
      }
    }
  }
  
  testSquareColor(imageData, x, y, w, r, g, offset) {
    let topLeft = this.testPixelColor(imageData, x - offset, y - offset, w, r, g)
    let topRight = this.testPixelColor(imageData, x + offset, y - offset, w, r, g)
    let bottomLeft = this.testPixelColor(imageData, x - offset, y + offset, w, r, g)
    let bottomRight = this.testPixelColor(imageData, x + offset, y + offset, w, r, g)
    return topLeft && topRight && bottomLeft && bottomRight
  }

  testPixelColor(imageData, x, y, w, r, g){
    if (y < 0 || x < 0) {
      debugger
      return true
    }
    let index = (Math.round(x) + Math.round(y) * w) * 4
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
      debugger
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
  
  setColorByAttribute(selectedAttributes, colorAttribute) {
    this.attributeValues = this.getValuesOfAttribute(colorAttribute)
    if (selectedAttributes.length && (selectedAttributes.length !== this.attributeValues.length)) {
      this.attributeValues = selectedAttributes
      this.attributeValues.sort()
      this.attributeValues.push("not selected")
    } else {
      this.attributeValues.sort()
    }
    
    let colors = []
    this.attributeValues.forEach(() => {
      colors.push(this.getUniqueColor(colors))
    })
    
    this.colorMap = {}
    for (let i = 0; i < this.attributeValues.length; i++) {
      this.colorMap[this.attributeValues[i]] = colors[i] 
    }
    this.colorMap["not selected"]= {"r" : 0, "g" : 0, "b" : 0, "a" : 0.15}
    
    this.individuals.forEach((individual) => {
      if (this.attributeValues.includes(individual[colorAttribute])) {
        individual.drawing.defaultColor = this.colorMap[individual[colorAttribute]]
        individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
      } else {
        individual.drawing.defaultColor = this.colorMap["not selected"]
        individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
      }
    })
  }
  
  
  setColorByThemeAttribute() {
    this.themeCount = 0
    this.themeCountInDistrict = {}
    this.attributeValues = ["selected", "not selected"]
    this.colorMap = {"selected" : {"r" : 0, "g" : 0, "b" : 200, "a" : 255}, "not selected" : {"r" : 0, "g" : 0, "b" : 0, "a" : 0.15}}
    this.individuals.forEach((individual) => {
      let individualThemes = this.getIndividualThemes(individual)
      let individualDistrict = this.getIndividualDistrict(individual)
      
      if (this.selectedThemes.every(theme => individualThemes.includes(theme))) {
        individual.drawing.defaultColor = this.colorMap["selected"]
        individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
        this.themeCount += 1
        if (this.themeCountInDistrict[individualDistrict]) {
          this.themeCountInDistrict[individualDistrict] += 1 
        } else {
          this.themeCountInDistrict[individualDistrict] = 1
        }
      } else {
        individual.drawing.defaultColor = this.colorMap["not selected"]
        individual.drawing.currentColor = Object.assign({}, individual.drawing.defaultColor)
      }
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
  
  getIndividualThemes(individual) {
    return individual.themes
  }
  
  getIndividualDistrict(individual) {
    return individual.district
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
  
  getIndividualThemes(individual) {
    return individual.themes["L1"].concat(individual.themes["L2"]).concat(individual.themes["L3"])
  }
  
  getIndividualDistrict(individual) {
    return individual.county
  }
}