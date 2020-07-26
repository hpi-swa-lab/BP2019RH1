import Morph from 'src/components/widgets/lively-morph.js';

import d3 from "src/external/d3.v5.js"

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'

import GeoData from "https://lively-kernel.org/lively4/BP2019RH1/src/geodata/geoData.js"

export default class Bp2019DataSourceWidget extends Morph {
  async initialize() {      
    this.colorStore = new ColorStore()
    this.dataProcessor = new DataProcessor()
    this.dataProcessor.setColorStore(this.colorStore)
    
    //for compatibility with current implementation for cloning of local actions
    this.currentActions = []
    
    this.dataSetSelection = this.get("#data-sets")
    this.dataSetSelection.addEventListener("change", async () => await this._handleDataSetSelection())
        
    this.dataSetSelection.dispatchEvent(new Event("change"))
  }
  
  applyAction(action) {
    
  }
  
  setData(data) {
    return
  }
  
  getData() {
    return this.data
  }
  
  getColorStore() {
    return this.colorStore
  }
  
  getDataProcessor() {
    return this.dataProcessor
  }
  
  setExtent(extent) {
    
  }
  
  async _handleDataSetSelection() {
    this._hideUserInstructions()
    this._showLoadingAnimation()
    
    let rawGeoData
  
    switch (this.dataSetSelection.options[this.dataSetSelection.selectedIndex].value) {
      case "kenya":
        this.data = await AVFParser.loadCovidData()
        this.dataProcessor.initializeWithIndividualsFromKenia(this.data)
        rawGeoData = await d3.json(bp2019url + "/src/geodata/kenya-simplified-repaired.geojson")
        break;
      case "somalia":
        this.data = await AVFParser.loadCovidSomDataMessageThemes()
        this.dataProcessor.initializeWithIndividualsFromSomalia(this.data)
        rawGeoData = await d3.json(bp2019url + "/src/geodata/somalia-simplified.geojson")
        break;
    }
    
    this.geoData = new GeoData(rawGeoData.features)
    
    await this.colorStore.loadDefaultColors()
    this.colorStore.initializeWithValuesByAttribute(this.dataProcessor.getValuesByAttribute())
    
    this._hideLoadingAnimation()
    this._showUserInstructions()
    
    this._dispatchDataLoadedEvent()
  }
  
  _dispatchDataLoadedEvent() {
    this.dispatchEvent(new CustomEvent("data-loaded", {
      detail: {
        "data": this.data,
        "dataProcessor": this.dataProcessor,
        "colorStore": this.colorStore,
        "geoData": this.geoData
      },
      bubbles: true
    }))
  }
  
  _showLoadingAnimation() {
    this.get("#loading-animation").style.display = "block"
  }
  
  _hideLoadingAnimation() {
    this.get("#loading-animation").style.display = "none"
  }
  
  _showUserInstructions() {
    this.get("#user-instructions").style.display = "block"
  }
  
  _hideUserInstructions() {
    this.get("#user-instructions").style.display = "none"
  }
}