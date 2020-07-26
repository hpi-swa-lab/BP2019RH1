import { DefaultColoredCanvas, UniqueColoredCanvas } from "./individualCanvas.js"
import { DefaultColoredMap, UniqueColoredMap } from "./mapCanvas.js"
import { InteractiveMapCanvas } from "./interactiveMapCanvas.js"
import { KenyaDistrictTooltip, SomaliaDistrictTooltip } from "./tooltip.js"
import { MapHoverer } from "./mapHoverer.js"
import { IndividualClicker } from "./individualClicker.js"
import { KenyaDataHandler, SomaliaDataHandler } from "./dataHandler.js"
import { Zoomer } from "./zoomer.js"
import d3 from "src/external/d3.v5.js"

class Map {
  constructor(mapWidget, initialPointSize) {
    this.mapWidget = mapWidget
    this.width = this.mapWidget.drawingCanvas.width
    this.height = this.mapWidget.drawingCanvas.height
    this.initialPointSize = initialPointSize
    this.individuals = []
    this.geoData = {}
    this.dataHandler = undefined
    this.uniqueColoredMap = undefined
    this.defaultColoredMap = undefined
    this.uniqueColoredCanvas = undefined
    this.visibleIndividualCanvas = undefined
    this.interactiveMapCanvas = undefined
    this.districtTooltip = undefined
    this.mapHoverer = undefined
    this.individualClicker = undefined
    this.zoomer = undefined
  }
  
  setGeoData(geoData) {
    if (geoData) {
      this.geoData = geoData
    }
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
  }
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor  
  } 
  
  setStrokeStyle(strokeStyle) {
    this.interactiveMapCanvas.setStrokeStyle(strokeStyle)
  }
  
  clear() {
    this.mapWidget.drawingCanvas.getContext("2d").clearRect(0, 0, this.width, this.height)
    this.districtTooltip.hide()
  }
  
  draw() {
    this.interactiveMapCanvas.draw()
  }
  
  updateStrokeStyle(strokeStyle) {
    this.interactiveMapCanvas.updateStrokeStyle(strokeStyle)
  }
  
  updateZoom() {
    if (this.zoomer) {
      this.zoomer.updateZoom()
    }
  }
  
  addEventListenersForNavigation() {
    this.zoomer.addZoomToMaster()
  }
  
  removeEventListenersForNavigation() {
    this.zoomer.removeZoomFromMaster()
  }
  
  updateIndividuals(individuals) {
    this.dataHandler.setIndividuals(individuals)
    this.dataHandler.calculateIndividualsPosition(this.imageData, this.path)
    this.uniqueColoredCanvas.setIndividuals(this.dataHandler.individuals)
    this.uniqueColoredCanvas.draw()
    this.visibleIndividualCanvas.setIndividuals(this.dataHandler.individuals)
    this.draw()
  }
  
  
  async create(individuals) {
    this.individuals = individuals
    if (Object.keys(this.geoData).length === 0) {
      let result = await d3.json(bp2019url + this.geoDataUrl)
      this.geoData = result.features
    }
    
    this.dataHandler = this.createDataHandler(this.geoData, this.individuals)
    this.dataHandler.setColorStore(this.colorStore)
    this.dataHandler.addDistrictsForMissingData()
    this.dataHandler.createDistrictColorCoding()

    this.uniqueColoredMap = new UniqueColoredMap(this.mapWidget.uniquePolygonCanvas, this.dataHandler, this.projection)
    this.uniqueColoredMap.setColorStore(this.colorStore)
    this.uniqueColoredMap.drawMap()

    this.defaultColoredMap = new DefaultColoredMap(this.mapWidget.drawingCanvas, this.dataHandler, this.projection)
    this.defaultColoredMap.setColorStore(this.colorStore)
    this.defaultColoredMap.drawMap()

    this.imageData = this.mapWidget.uniquePolygonCanvas.getContext("2d").getImageData(0,0,this.width,this.height) 

    this.dataHandler.initializeIndividuals()
    this.dataHandler.calculateIndividualsPosition(this.imageData, this.path)
    this.uniqueColoredCanvas = new UniqueColoredCanvas(this.mapWidget.uniqueIndividualCanvas, this.dataHandler.individuals, this.initialPointSize)
    this.uniqueColoredCanvas.drawIndividuals()
  
    this.visibleIndividualCanvas = new DefaultColoredCanvas(this.mapWidget.drawingCanvas, this.dataHandler.individuals, this.initialPointSize)
    this.visibleIndividualCanvas.drawIndividuals()

    this.interactiveMapCanvas = new InteractiveMapCanvas(this.defaultColoredMap, this.visibleIndividualCanvas, this.mapWidget.drawingCanvas)

    this.districtTooltip = this.createDistrictTooltip()

    this.mapHoverer = new MapHoverer(this.uniqueColoredMap, this.interactiveMapCanvas, this.districtTooltip, this.dataHandler)
    this.mapHoverer.addHover()

    this.individualClicker = new IndividualClicker(this, this.mapWidget, this.dataHandler)
    this.individualClicker.setDataProcessor(this.dataProcessor)
    this.individualClicker.setColorStore(this.colorStore)
    this.individualClicker.addClick()

    this.zoomer = new Zoomer(this.interactiveMapCanvas, [this.uniqueColoredMap, this.uniqueColoredCanvas], this.mapWidget.drawer, this.mapWidget.canvasWindow)
  }
}

export class KenyaMap extends Map {
  
  constructor(mapWidget, initialPointSize) {
    super(mapWidget, initialPointSize)
    this.projection = d3.geoEquirectangular().center([37, 0]).scale(4400).translate([this.width / 2, this.height / 2])
    this.path = d3.geoPath().projection(this.projection)

    this.locationLookupKey = "COUNTY"
    this.locationGroupingAttribute = "county"
    this.featureToAVF = {
      "Trans Nzoia" : "trans_nzoia", 
      "Homa Bay" : "homa_bay", 
      "Keiyo-Marakwet" : "elgeyo_marakwet", 
      "Uasin Gishu" : "uasin_gishu", 
      "West Pokot" : "west_pokot", 
      "Murang'a" : "muranga", 
      "Tharaka": "tharaka_nithi", 
      "Taita Taveta": "taita_taveta", 
      "Tana River": "tana_river"
    }
    this.missingDataKeys = ["missing"]
    this.colorAttributes = ["default", "age", "county", "constituency", "gender", "themes"]
    this.themeAttributes = [
      "escalate", 
      "question", 
      "answer", 
      "knowledge", 
      "attitude", 
      "behaviour", 
      "about_coronavirus", 
      "symptoms", 
      "how_to_prevent", 
      "how_to_treat", 
      "what_is_govt_policy", 
      "kenya_update", 
      "rumour_stigma_misinfo", 
      "opinion_on_govt_policy", 
      "collective_hope", 
      "anxiety_panic", 
      "how_spread_transmitted", 
      "other_theme", 
      "push_back", 
      "showtime_question", 
      "greeting", 
      "opt_in", 
      "similar_content", 
      "participation_incentive", 
      "exclusion_complaint", 
      "gratitude", 
      "other"
    ]
    this.geoDataUrl = "/src/geodata/kenya-simplified-repaired.geojson"
  }
  
  createDataHandler(geoData, individuals) {
    return new KenyaDataHandler(
      geoData, 
      individuals, 
      this.initialPointSize, 
      this.width, 
      this.height, 
      this.featureToAVF, 
      this.missingDataKeys, 
      this.locationGroupingAttribute, 
      this.locationLookupKey
    )
  }

  createDistrictTooltip() {
    return new KenyaDistrictTooltip(this.mapWidget.districtTooltipDiv)
  }
}

export class SomaliaMap extends Map {
  
  constructor(mapWidget, initialPointSize) {
    super(mapWidget, initialPointSize)
    this.projection = d3.geoEquirectangular().center([45,5]).scale(4000).translate([this.width / 2, this.height / 2])
    this.path = d3.geoPath().projection(this.projection)

    this.locationLookupKey = "DISTRICT"
    this.locationGroupingAttribute = "district"
    this.featureToAVF = {
      "Gabiley" : "gebiley", 
      "Galkaacyo" : "gaalkacyo", 
      "Bulo Burti" : "bulo burto", 
      "Laasqoray" : "lasqooray", 
      "El Waq" : "ceel waaq", 
      "Wanle Weyne" : "wanla weyn", 
      "NC" : "NC", 
      "NA" : "NA", 
      "STOP" : "STOP", 
      "CE" : "CE", 
      "NR" : "NR"
    }
    this.missingDataKeys = ["missing"]
    this.colorAttributes = ["default", "age", "district", "gender", "themes"]
    this.themeAttributes = [
      "rqa_s04e01_food_nutrition",
      "rqa_s04e01_health_services",
      "rqa_s04e01_access_to_water",
      "rqa_s04e01_hygiene",
      "rqa_s04e01_education",
      "rqa_s04e01_shelter",
      "rqa_s04e01_peace_and_security",
      "rqa_s04e01_good_governance",
      "rqa_s04e01_protection_of_rights",
      "rqa_s04e01_cooperation_between_government_and_people",
      "rqa_s04e01_cooperation_between_government_and_NGOs",
      "rqa_s04e01_NGOs_to_be_accountable_participatory",
      "rqa_s04e01_community_organisation",
      "rqa_s04e01_job_creation",
      "rqa_s04e01_build_resilience_to_drought",
      "rqa_s04e01_support_for_IDPs",
      "rqa_s04e01_information",
      "rqa_s04e01_religion",
      "rqa_s04e01_support_to_the_poor",
      "rqa_s04e01_return_and_resettlement_of_IDPs",
      "rqa_s04e01_stop_aid_dependency",
      "rqa_s04e01_farming_support",
      "rqa_s04e01_stop_clannism",
      "rqa_s04e01_economic_development",
      "rqa_s04e01_other",
      "rqa_s04e01_NA",
      "rqa_s04e01_NS",
      "rqa_s04e01_NC",
      "rqa_s04e01_NR",
      "rqa_s04e01_NIC",
      "rqa_s04e01_STOP",
      "rqa_s04e01_WS",
      "rqa_s04e01_CE",
      "rqa_s04e01_push_back",
      "rqa_s04e01_showtime_question",
      "rqa_s04e01_question",
      "rqa_s04e01_greeting",
      "rqa_s04e01_opt_in",
      "rqa_s04e02_health_service",
      "rqa_s04e02_government_stability",
      "rqa_s04e02_job_creation",
      "rqa_s04e02_economic_development",
      "rqa_s04e02_peace_and_security",
      "rqa_s04e02_education",
      "rqa_s04e02_shelter",
      "rqa_s04e02_NGOs_to_be_accountable_and_transparent",
      "rqa_s04e02_access_to_water",
      "rqa_s04e02_food_nutrition",
      "rqa_s04e02_resettlement_and_return_for_IDPs",
      "rqa_s04e02_support_for_agriculture",
      "rqa_s04e02_cooperation_between_NGOs_people_government",
      "rqa_s04e02_stop_aid_dependency",
      "rqa_s04e02_support_the_poor_IDPs",
      "rqa_s04e02_information",
      "rqa_s04e02_other",
      "rqa_s04e02_NA",
      "rqa_s04e02_NS",
      "rqa_s04e02_NC",
      "rqa_s04e02_NR",
      "rqa_s04e02_NIC",
      "rqa_s04e02_STOP",
      "rqa_s04e02_WS",
      "rqa_s04e02_CE",
      "rqa_s04e02_push_back",
      "rqa_s04e02_showtime_question",
      "rqa_s04e02_question",
      "rqa_s04e02_greeting",
      "rqa_s04e02_opt_in"
    ]
    this.geoDataUrl = "/src/geodata/somalia.geojson"
  }
  
  createDataHandler(geoData, individuals) {
    return new SomaliaDataHandler(
      geoData, 
      individuals, 
      this.initialPointSize, 
      this.width, 
      this.height, 
      this.featureToAVF, 
      this.missingDataKeys, 
      this.locationGroupingAttribute, 
      this.locationLookupKey
    )
  }

  createDistrictTooltip() {
    return new SomaliaDistrictTooltip(this.mapWidget.districtTooltipDiv)
  }
}
