import { DefaultColoredCanvas, UniqueColoredCanvas } from "./individualCanvas.js"
import { DefaultColoredMap, UniqueColoredMap } from "./mapCanvas.js"
import { InteractiveMapCanvas } from "./interactiveMapCanvas.js"
import { KenyaDistrictTooltip, KenyaIndividualTooltip, SomaliaDistrictTooltip, SomaliaIndividualTooltip } from "./tooltip.js"
import { MapHoverer } from "./mapHoverer.js"
import { IndividualClicker } from "./individualClicker.js"
import { KenyaDataHandler, SomaliaDataHandler } from "./dataHandler.js"
import { Zoomer } from "./zoomer.js"
import d3 from "src/external/d3.v5.js"

class Map {
  constructor(mapWidget, width, height, initialPointSize) {
    this.mapWidget = mapWidget
    this.width = width
    this.height = height
    this.initialPointSize = initialPointSize
    this.individuals = []
    this.geoData = {}
    this.dataHandler = null
    this.uniqueColoredMap = null
    this.defaultColoredMap = null
    this.uniqueColoredCanvas = null
    this.visibleIndividualCanvas = null
    this.interactiveMapCanvas = null
    this.individualTooltip = null
    this.districtTooltip = null
    this.mapHoverer = null
    this.individualClicker = null
    this.zoomer = null
  }
  
  clear() {
    this.mapWidget.drawingCanvas.getContext("2d").clearRect(0, 0, this.width, this.height)
    this.individualTooltip.hide()
    this.districtTooltip.hide()
  }
  
  draw() {
    this.interactiveMapCanvas.draw()
  }
  
  updateExtent() {
    this.zoomer.updateExtent()
  }
  
  updateIndividuals(individuals) {
    this.dataHandler.setIndividuals(individuals)
    this.dataHandler.calculateIndividualsPosition(this.imageData, this.path)
    this.uniqueColoredCanvas.setIndividuals(individuals)
    this.uniqueColoredCanvas.drawIndividuals()
    this.visibleIndividualCanvas.setIndividuals(individuals)
    this.draw()
  }
  
  create(result) {
    this.individuals = result
    
    return new Promise ((resolve) => {
      d3.json(bp2019url + this.geoDataUrl).then((result) => {
        let geoData = result.features

        this.dataHandler = this.createDataHandler(geoData, this.individuals)
        this.dataHandler.addDistrictsForMissingData()
        this.dataHandler.createDistrictColorCoding()

        this.uniqueColoredMap = new UniqueColoredMap(this.mapWidget.uniquePolygonCanvas, this.dataHandler, this.projection)
        this.uniqueColoredMap.drawMap()

        this.defaultColoredMap = new DefaultColoredMap(this.mapWidget.drawingCanvas, this.dataHandler, this.projection)
        this.defaultColoredMap.drawMap()

        this.imageData = this.mapWidget.uniquePolygonCanvas.getContext("2d").getImageData(0,0,this.width,this.height) 

        this.dataHandler.initializeIndividuals()
        this.dataHandler.calculateIndividualsPosition(this.imageData, this.path)
        this.uniqueColoredCanvas = new UniqueColoredCanvas(this.mapWidget.uniqueIndividualCanvas, this.dataHandler.individuals, this.initialPointSize)
        this.uniqueColoredCanvas.drawIndividuals()

        this.visibleIndividualCanvas = new DefaultColoredCanvas(this.mapWidget.drawingCanvas, this.dataHandler.individuals, this.initialPointSize)
        this.visibleIndividualCanvas.drawIndividuals()

        this.interactiveMapCanvas = new InteractiveMapCanvas(this.defaultColoredMap, this.visibleIndividualCanvas, this.mapWidget.drawingCanvas)

        this.individualTooltip = this.createIndividualTooltip()
        this.districtTooltip = this.createDistrictTooltip()

        this.mapHoverer = new MapHoverer(this.uniqueColoredMap, this.interactiveMapCanvas, this.districtTooltip, this.dataHandler)
        this.mapHoverer.addHover()

        this.individualClicker = new IndividualClicker(this, this.mapWidget, this.individualTooltip, this.dataHandler)
        this.individualClicker.addClick()

        this.zoomer = new Zoomer(this.interactiveMapCanvas, [this.uniqueColoredMap, this.uniqueColoredCanvas], this.mapWidget.canvasWindow, this.mapWidget.container)
        
        resolve()
      })
    })
  }
}

export class KenyaMap extends Map {
  
  constructor(mapWidget, width, height, initialPointSize) {
    super(mapWidget, width, height, initialPointSize)
    this.projection = d3.geoEquirectangular().center([37, 0]).scale(22000).translate([this.width / 2, this.height / 2])
    this.path = d3.geoPath().projection(this.projection)

    this.locationLookupKey = "COUNTY"
    this.locationGroupingAttribute = "county"
    this.featureToAVF = {"TRANS NZOIA" : "trans_nzoia", "HOMA BAY" : "homa_bay", "ELEGEYO-MARAKWET" : "elgeyo_marakwet", "UASIN GISHU" : "uasin_gishu", "WEST POKOT" : "west_pokot", "MURANG'A" : "muranga", "THARAKA - NITHI": "tharaka_nithi", "TAITA TAVETA": "taita_taveta", "TANA RIVER":"tana_river"}
    this.missingDataKeys = ["missing"]
    this.colorAttributes = ["default", "age", "county", "constituency", "gender", "themes"]
    this.themeAttributes = ["escalate", "question", "answer", "knowledge", "attitude", "behaviour", "about_coronavirus", "symptoms", "how_to_prevent", "how_to_treat", "what_is_govt_policy", "kenya_update", "rumour_stigma_misinfo", "opinion_on_govt_policy", "collective_hope", "anxiety_panic", "how_spread_transmitted", "other_theme", "push_back", "showtime_question", "greeting", "opt_in", "similar_content", "participation_incentive", "exclusion_complaint", "gratitude", "other"]
    this.geoDataUrl = "/src/geodata/kenya-new.geojson"
  }
  
  createDataHandler(geoData, individuals) {
    return new KenyaDataHandler(geoData, individuals, this.initialPointSize, this.width, this.height, this.featureToAVF, this.missingDataKeys, this.locationGroupingAttribute, this.locationLookupKey)
  }
  
  createIndividualTooltip() {
    return new KenyaIndividualTooltip(this.mapWidget.individualTooltipDiv)
  }
  
  createDistrictTooltip() {
    return new KenyaDistrictTooltip(this.mapWidget.districtTooltipDiv)
  }
}

export class SomaliaMap extends Map {
  
  constructor(mapWidget, width, height, initialPointSize) {
    super(mapWidget, width, height, initialPointSize)
    this.projection = d3.geoEquirectangular().center([45,5]).scale(20000).translate([this.width / 2, this.height / 2])
    this.path = d3.geoPath().projection(this.projection)

    this.locationLookupKey = "DISTRICT"
    this.locationGroupingAttribute = "district"
    this.featureToAVF = {"Gabiley" : "gebiley", "Galkaacyo" : "gaalkacyo", "Bulo Burti" : "bulo burto", "Laasqoray" : "lasqooray", "El Waq" : "ceel waaq", "Wanle Weyne" : "wanla weyn", "NC" : "NC", "NA" : "NA", "STOP" : "STOP", "CE" : "CE", "NR" : "NR"}
    this.missingDataKeys = ["NC", "NA", "STOP", "CE", "question", "showtime_question", "NR", "greeting", "push_back"]
    this.colorAttributes = ["default", "age", "district", "gender", "themes"]
    this.themeAttributes = ["rqa_s04e01_food_nutrition", "rqa_s04e01_health_services", "rqa_s04e01_access_to_water", "rqa_s04e01_hygiene", "rqa_s04e01_education", "rqa_s04e01_shelter", "rqa_s04e01_peace_and_security", "rqa_s04e01_good_governance", "rqa_s04e01_protection_of_rights", "rqa_s04e01_cooperation_between_government_and_people", "rqa_s04e01_cooperation_between_government_and_NGOs", "rqa_s04e01_NGOs_to_be_accountable_participatory", "rqa_s04e01_community_organisation", "rqa_s04e01_job_creation", "rqa_s04e01_build_resilience_to_drought", "rqa_s04e01_support_for_IDPs", "rqa_s04e01_information", "rqa_s04e01_religion", "rqa_s04e01_support_to_the_poor", "rqa_s04e01_return_and_resettlement_of_IDPs", "rqa_s04e01_stop_aid_dependency", "rqa_s04e01_farming_support", "rqa_s04e01_stop_clannism", "rqa_s04e01_economic_development", "rqa_s04e01_other", "rqa_s04e01_NA", "rqa_s04e01_NS", "rqa_s04e01_NC", "rqa_s04e01_NR", "rqa_s04e01_NIC", "rqa_s04e01_STOP", "rqa_s04e01_WS", "rqa_s04e01_CE", "rqa_s04e01_push_back", "rqa_s04e01_showtime_question", "rqa_s04e01_question", "rqa_s04e01_greeting", "rqa_s04e01_opt_in", "rqa_s04e02_health_service", "rqa_s04e02_government_stability", "rqa_s04e02_job_creation", "rqa_s04e02_economic_development", "rqa_s04e02_peace_and_security", "rqa_s04e02_education", "rqa_s04e02_shelter", "rqa_s04e02_NGOs_to_be_accountable_and_transparent", "rqa_s04e02_access_to_water", "rqa_s04e02_food_nutrition", "rqa_s04e02_resettlement_and_return_for_IDPs", "rqa_s04e02_support_for_agriculture", "rqa_s04e02_cooperation_between_NGOs_people_government", "rqa_s04e02_stop_aid_dependency", "rqa_s04e02_support_the_poor_IDPs", "rqa_s04e02_information", "rqa_s04e02_other", "rqa_s04e02_NA", "rqa_s04e02_NS", "rqa_s04e02_NC", "rqa_s04e02_NR", "rqa_s04e02_NIC", "rqa_s04e02_STOP", "rqa_s04e02_WS", "rqa_s04e02_CE", "rqa_s04e02_push_back", "rqa_s04e02_showtime_question", "rqa_s04e02_question", "rqa_s04e02_greeting", "rqa_s04e02_opt_in"]
    this.geoDataUrl = "/src/geodata/somalia.geojson"
  }
  
  createDataHandler(geoData, individuals) {
    return new SomaliaDataHandler(geoData, individuals, this.initialPointSize, this.width, this.height, this.featureToAVF, this.missingDataKeys, this.locationGroupingAttribute, this.locationLookupKey)
  }
  
  createIndividualTooltip() {
    return new SomaliaIndividualTooltip(this.mapWidget.individualTooltipDiv)
  }
  
  createDistrictTooltip() {
    return new SomaliaDistrictTooltip(this.mapWidget.districtTooltipDiv)
  }
}
