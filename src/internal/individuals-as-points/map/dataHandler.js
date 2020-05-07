import { GroupingAction } from "../../../../prototypes/display-exploration/actions.js"
import ColorStore from "../common/color-store.js"

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
  
  setIndividuals(individuals) {
    this.individuals = individuals
    this.individualsGroupedByDistrict = this.groupIndividualsByDistrict()
    this.individuals.forEach((individual) => {
      let color = individual.drawing.uniqueColor
      let colorString = "r" + color.r + "g" + color.g + "b" + color.b
      this.colorToIndividualIndex[colorString] = individual.index
    })
  }
  
  initializeIndividuals() {
    this.individuals.forEach((individual) => {
      individual.drawing.uniqueColor =  ColorStore.current().getUniqueRGBColor(this.colorToIndividualIndex)
      let color = individual.drawing.uniqueColor
      let colorString = "r" + color.r + "g" + color.g + "b" + color.b
      this.colorToIndividualIndex[colorString] = individual.index
      // TODO: use defaultPosition from dataprocessor scheme
      individual.drawing.position = {}
    })
  }
  
  calculateIndividualsPosition(imageData, path) {
    let districtCount = this.geoData.length
    var missingGroups = {}
    Object.keys(this.individualsGroupedByDistrict).forEach(key => {
      missingGroups[key] = 1
    })
    var missingFeatureMatches = []
    
    while(districtCount--){
      let districtName = this.getDistrictLookupName(this.geoData[districtCount])
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
      let districtColor = this.districtToColor[this.geoData[districtCount].properties[this.locationLookupKey]]
      let r = districtColor.r, g = districtColor.g, b = districtColor.b
      let bounds = path.bounds(this.geoData[districtCount])
      let area = path.area(this.geoData[districtCount])
      let squareArea = area / population
      
      while (count < population) {
        count = 0
        points = []
        
        let edgeLength = Math.sqrt(squareArea) / gridDensity
        let offset = 0
        
        if (edgeLength > this.pointSize / 2) { 
          offset = this.pointSize * 2
        }

        // error handling when districtColor is not defined (should not happen)
        for (let j = bounds[0][1]; j < bounds[1][1]; j += edgeLength) {
          for (let i = bounds[0][0]; i < bounds[1][0]; i += edgeLength) {
            if (this.testSquareColor(imageData, i, j, this.canvasWidth, r, g, b, offset)) {
              points.push([i, j])
              count++
            }
          }
        }
        gridDensity += 0.01
      }
      console.log(this.geoData[districtCount].properties[this.locationLookupKey], gridDensity)
      points = points.slice(0, population)
      for (let i = 0; i < points.length; i++) {
        this.setIndividualPosition(individualsInDistrict[i], points[i][0],points[i][1])
      }
    }
  }
  
  testSquareColor(imageData, x, y, w, r, g, b, offset) {
    let topLeft = this.testPixelColor(imageData, x - offset, y - offset, w, r, g, b)
    let topRight = this.testPixelColor(imageData, x + offset, y - offset, w, r, g, b)
    let bottomLeft = this.testPixelColor(imageData, x - offset, y + offset, w, r, g, b)
    let bottomRight = this.testPixelColor(imageData, x + offset, y + offset, w, r, g, b)
    return topLeft && topRight && bottomLeft && bottomRight
  }

  testPixelColor(imageData, x, y, w, r, g, b){    
    if (y < 0 || x < 0) {
      debugger
      return true
    }
    let index = (Math.round(x) + Math.round(y) * w) * 4
    return imageData.data[index] == r && imageData.data[index + 1] == g && imageData.data[index + 2] == b
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
    this.missingDataFeatureToTextCoordinates = {}
    let j = 1
    this.missingDataKeys.forEach(key => {
      let missingDataFeature = {"type" : "Feature", "properties" : {}, "geometry" : {"type" : "MultiPolygon", "coordinates" : []}
      }
      let coordinates = this.getCoordinatesForMissingFeature(j)
      missingDataFeature.geometry.coordinates = [[coordinates]]
      missingDataFeature.properties[this.locationLookupKey] = key
      this.geoData.push(missingDataFeature)
      j += 1.5
      this.missingDataFeatureToTextCoordinates[key] = [coordinates[0][0], coordinates[0][1] + 0.1]
    })
  }
    
  createDistrictColorCoding() {
    this.colorToDistrict = {}
    this.districtToColor = {}
    let i = this.geoData.length
    while(i--){
      let r = parseInt((i + 1) / 256)
      let g = (i + 1) % 256
      let b = 10*(i + 1) % 256
      this.colorToDistrict["rgb(" + r + "," + g + "," + b + ")"] = this.geoData[i]
      this.districtToColor[this.geoData[i].properties[this.locationLookupKey]] = {"r": r, "g": g, "b": b, "opacity": 1}
    }
  }
  
  setSelectedIndividual(individual) {
    this.selectedIndividual = individual
  }
}

export class SomaliaDataHandler extends DataHandler {
  getCoordinatesForMissingFeature(j) {
    return [[38,-1.5+j],
              [40.5,-1.5+j],
              [40.5,-2.5+j],
              [38,-2.5+j],
              [38,-1.5+j]]
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
    return [[31,-3.5+j],
              [35,-3.5+j],
              [35,-6.5+j],
              [31,-6.5+j],
              [31,-3.5+j]]
  }
  
  getIndividualThemes(individual) {
    return individual.themes["L1"].concat(individual.themes["L2"]).concat(individual.themes["L3"])
  }
  
  getIndividualDistrict(individual) {
    return individual.county
  }
}