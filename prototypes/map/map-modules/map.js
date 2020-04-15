import { DefaultColoredCanvas, UniqueColoredCanvas } from "./individualCanvas.js"
import { DefaultColoredMap, UniqueColoredMap } from "./mapCanvas.js"
import { InteractiveMapCanvas } from "./interactiveMapCanvas.js"
import { KenyaDistrictTooltip, KenyaIndividualTooltip, SomaliaDistrictTooltip, SomaliaIndividualTooltip } from "./tooltip.js"
import { MapHoverer } from "./mapHoverer.js"
import { IndividualClicker } from "./individualClicker.js"
import { KenyaDataHandler, SomaliaDataHandler } from "./dataHandler.js"
import { Zoomer } from "./zoomer.js"
import { Menu } from "./menu.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import d3 from "src/external/d3.v5.js"

class Map {
  constructor(world, width, height, initialPointSize) {
    this.world = world
    this.width = width
    this.height = height
    this.initialPointSize = initialPointSize
  }
  
  clear() {
    this.menu.clear()
    this.drawingCanvas.getContext("2d").clearRect(0, 0, this.width, this.height)
    this.individualTooltip.hide()
    this.districtTooltip.hide()
  }
  
  queryHtmlElements() {
    this.drawingCanvas = lively.query(this.world, "#drawing-canvas")
    this.uniquePolygonCanvas = lively.query(this.world, "#unique-polygon-canvas")
    this.uniqueIndividualCanvas = lively.query(this.world, "#unique-individual-canvas")

    this.districtTooltipDiv = lively.query(this.world, "#district-tooltip-div")
    this.individualTooltipDiv = lively.query(this.world, "#individual-tooltip-div")

    this.colorSelect = lively.query(this.world, "#color-select")
    this.themeSelect = lively.query(this.world, "#theme-select")
    this.ageSelect = lively.query(this.world, "#age-select")
    this.genderSelect = lively.query(this.world, "#gender-select")
    this.applyButton = lively.query(this.world, "#apply-button")
    
    this.legend = lively.query(this.world, "#legend")
  }
    
  create(result) {
    this.queryHtmlElements()
    let individuals = result

    d3.json(bp2019url + this.geoDataUrl).then((result) => {
      let geoData = result.features

      let dataHandler = this.createDataHandler(geoData, individuals)
      dataHandler.addDistrictsForMissingData()
      dataHandler.createDistrictColorCoding()

      let uniqueColoredMap = new UniqueColoredMap(this.world, this.uniquePolygonCanvas, dataHandler.geoData, this.projection, dataHandler)
      uniqueColoredMap.drawMap()

      let defaultColoredMap = new DefaultColoredMap(this.world, this.drawingCanvas, dataHandler.geoData, this.projection, dataHandler)
      defaultColoredMap.drawMap()

      let imageData = this.uniquePolygonCanvas.getContext("2d").getImageData(0,0,this.width,this.height) 

      dataHandler.initializeIndividuals()
      dataHandler.calculateIndividualsPosition(imageData, this.path)
      let uniqueColoredCanvas = new UniqueColoredCanvas(this.world, this.uniqueIndividualCanvas, dataHandler.individuals, this.initialPointSize)
      uniqueColoredCanvas.drawIndividuals()

      let visibleIndividualCanvas = new DefaultColoredCanvas(this.world, this.drawingCanvas, dataHandler.individuals, this.initialPointSize)
      visibleIndividualCanvas.drawIndividuals()

      let interactiveMapCanvas = new InteractiveMapCanvas(defaultColoredMap, visibleIndividualCanvas, this.drawingCanvas)

      this.individualTooltip = this.createIndividualTooltip()
      this.districtTooltip = this.createDistrictTooltip()

      let mapHoverer = new MapHoverer(uniqueColoredMap, interactiveMapCanvas, this.districtTooltip, dataHandler)
      mapHoverer.addHover()

      let individualClicker = new IndividualClicker(uniqueColoredCanvas, interactiveMapCanvas, this.individualTooltip, dataHandler)
      individualClicker.addClick()

      let zoomer = new Zoomer(interactiveMapCanvas, [uniqueColoredMap, uniqueColoredCanvas])

      this.menu = new Menu(this.colorSelect, this.colorAttributes, this.themeSelect, this.themeAttributes, this.genderSelect, this.ageSelect, this.applyButton, this.legend, dataHandler, interactiveMapCanvas)
      this.menu.create()
    })
  }
}

export class KenyaMap extends Map {
  
  constructor(world, width, height, pointSize) {
    super(world, width, height, pointSize)
    this.projection = d3.geoEquirectangular().center([37, 0]).scale(22000).translate([this.width / 2, this.height / 2])
    this.path = d3.geoPath().projection(this.projection)

    this.locationLookupKey = "COUNTY_NAM"
    this.locationGroupingAttribute = "county"
    this.featureToAVF = {"TRANS NZOIA" : "trans_nzoia", "HOMA BAY" : "homa_bay", "ELEGEYO-MARAKWET" : "elgeyo_marakwet", "UASIN GISHU" : "uasin_gishu", "WEST POKOT" : "west_pokot", "MURANG'A" : "muranga", "THARAKA - NITHI": "tharaka_nithi", "TAITA TAVETA": "taita_taveta", "TANA RIVER":"tana_river"}
    this.missingDataKeys = ["missing"]
    this.colorAttributes = ["default", "age", "county", "gender", "themes"]
    this.themeAttributes = ["escalate", "question", "answer", "knowledge", "attitude", "behaviour", "about_coronavirus", "symptoms", "how_to_prevent", "how_to_treat", "what_is_govt_policy", "kenya_update", "rumour_stigma_misinfo", "opinion_on_govt_policy", "collective_hope", "anxiety_panic", "how_spread_transmitted", "other_theme", "push_back", "showtime_question", "greeting", "opt_in", "similar_content", "participation_incentive", "exclusion_complaint", "gratitude", "other"]
    this.geoDataUrl = "/src/geodata/kenya.geojson"
  }
  
  load() {
    AVFParser.loadCovidData().then((result) => {
      this.create(result)
    })
  }
  
  createDataHandler(geoData, individuals) {
    return new KenyaDataHandler(geoData, individuals, this.initialPointSize, this.width, this.height, this.featureToAVF, this.missingDataKeys, this.locationGroupingAttribute, this.locationLookupKey)
  }
  
  createIndividualTooltip() {
    return new KenyaIndividualTooltip(this.individualTooltipDiv)
  }
  
  createDistrictTooltip() {
    return new KenyaDistrictTooltip(this.districtTooltipDiv)
  }
}

export class SomaliaMap extends Map {
  
  constructor(world, width, height, pointSize) {
    super(world, width, height, pointSize)
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
  
  load() {
    AVFParser.loadCompressedIndividualsAnsweredThemes("OCHA").then((result) => {
      this.create(result)
    })
  }
  
  createDataHandler(geoData, individuals) {
    return new SomaliaDataHandler(geoData, individuals, this.initialPointSize, this.width, this.height, this.featureToAVF, this.missingDataKeys, this.locationGroupingAttribute, this.locationLookupKey)
  }
  
  createIndividualTooltip() {
    return new SomaliaIndividualTooltip(this.individualTooltipDiv)
  }
  
  createDistrictTooltip() {
    return new SomaliaDistrictTooltip(this.districtTooltipDiv)
  }
}
