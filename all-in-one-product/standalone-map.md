<style data-src="/src/external/font-awesome/css/font-awesome.css"></style>
  <style data-src="/templates/livelystyle.css"></style>
  <style data-src="../BP2019RH1/src/internal/individuals-as-points/common/button-styles.css"></style>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

<div>
  <div id="header-row" class="form-row header align-item-center justify-content-center">
    <label for="dataset-select" class="col-form-label col-auto">Dataset:</label>
    <select id="dataset-selection" class="col-auto">
      <option>Kenya</option>
      <option>Somalia</option>
    </select>
    <div class="col-auto">
      <button class="btn" id="open-global-controls">
        Global controls
      </button>
    </div>
  </div>
  <div id="canvas-row">
    <bp2019-map-widget id="bp2019-map-widget"></bp2019-map-widget>
  </div>
  <div id="legend-row" class="row">
    <bp2019-legend-widget id="legend-widget" class="col-10"></bp2019-legend-widget>
  </div>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import { assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"


class Listener {
  constructor() {
    this.widgets = []
    this.legend = null
    this.container = null
  }

  addWidget(widget) {
    assertCanvasWidgetInterface(widget)
    this.widgets.push(widget)
  }
  
  registerLegend(legend) {
    this.legend = legend
  }
  
  registerContainer(container) {
    this.container = container
  }
  
  registerContainerContent(containerContent) {
    this.containerContent = containerContent
  }

  applyAction(action) {
    this.legend.applyAction(action)
    this.widgets.forEach(widget => {
      widget.applyAction(action)
    })
    this.setCanvasWidgetExtents()
  }
  
  setCanvasWidgetExtents() {
    let extent = this.calculateVisualizationExtent()
    this.widgets.forEach(widget => {
      widget.setExtent(extent)
    })
  }
  
  calculateVisualizationExtent() {
    let ownExtent = lively.getExtent(this.containerContent)
    let legendExtent = lively.getExtent(legend)
    let headerRowExtent = lively.getExtent(headerRow)
    let margin = lively.pt(10, 10)
    
    return ownExtent.subPt(lively.pt(0, legendExtent.y)).subPt(lively.pt(0, headerRowExtent.y)).subPt(margin)
  }
  
  addEventListenerForResizing() {
    lively.removeEventListener("bp2019", this.container, "extent-changed")
    lively.addEventListener("bp2019", this.container, "extent-changed", () => {
      this.setCanvasWidgetExtents()
    })
  }
}

let widget = lively.query(this, '#bp2019-map-widget')
let legend = lively.query(this, '#legend-widget')
let container = lively.query(this, "lively-container")
let containerContent = lively.query(this, "#container-content")
let listener = new Listener()
let globalControlWidget
let controlWidgetButton = lively.query(this, '#open-global-controls')
let datasetSelection = lively.query(this, "#dataset-selection") 
let headerRow = lively.query(this, "#header-row")
datasetSelection.addEventListener("change", (evt) => changeDataset(evt, widget)) 

listener.addWidget(widget)
listener.registerLegend(legend)
listener.registerContainer(container)
listener.registerContainerContent(containerContent)
widget.addListener(listener)
listener.addEventListenerForResizing()
listener.setCanvasWidgetExtents()

let colorStore = new ColorStore()
let dataProcessor = new DataProcessor()
dataProcessor.setColorStore(colorStore);

(async () => {
  let data = await AVFParser.loadInferredCovidData()
  
  dataProcessor.initializeWithIndividualsFromKenia(data)
  colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute())
  
  legend.setColorStore(colorStore)
  
  widget.setDataProcessor(dataProcessor)
  widget.setColorStore(colorStore)
  
  await widget.setData(data)
  
  await openNewGlobalControlWidget()
  controlWidgetButton.addEventListener(
      "click", () => openNewGlobalControlWidget())
  
})();

async function openNewGlobalControlWidget() {
  let position = lively.pt(1000, 10)
  let extent = lively.pt(300, 700)
  globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget', position, extent)
  globalControlWidget.setDataProcessor(dataProcessor)
  globalControlWidget.setColorStore(colorStore)
  globalControlWidget.addListener(widget)
  globalControlWidget.initializeAfterDataFetch()
}
  
function changeDataset(evt) {
  let datasetName = evt.target.value 
  loadDatasetWithName(datasetName) 
}
  
function loadDatasetWithName(datasetName) {
  switch(datasetName) {
    case 'Somalia':
      updateCanvasesWithSomaliaData() 
      break;
    case 'Kenya':
      updateCanvasesWithKenyaData() 
      break;
    default:
      break;
  }
}

async function updateCanvasesWithKenyaData() {
  let data = await fetchKenyaData()
  dataProcessor.initializeWithIndividualsFromKenia(data) 
  initializeColorScales() 
  widget.setData(data)
  updateGlobalControlWidget() 
}

async function updateCanvasesWithSomaliaData() {
  let data = await fetchSomaliaData() 
  dataProcessor.initializeWithIndividualsFromSomalia(data) 
  initializeColorScales() 
  debugger
  widget.setData(data) 
  updateGlobalControlWidget() 
}

function initializeColorScales(){
  colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute()) 
}

function updateGlobalControlWidget(){
  globalControlWidget.initializeAfterDataFetch()
}

async function fetchKenyaData() {
  let data = await AVFParser.loadInferredCovidData() 
  return data 
}

async function fetchSomaliaData() {
  let data = await AVFParser.loadCovidSomDataMessageThemes()
  return data 
}

</script>