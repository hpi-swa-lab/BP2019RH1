<div id="container">
  <button class="btn" id="openGlobalControlPanel">Open Global Control Panel</button>
  <button class="btn" id="createPane">Create Pane</button>
</div>

<style>
#container {
  position: absolute;
}
</style>

<script>
import jsPlumb from 'https://lively-kernel.org/lively4/BP2019RH-stable/prototypes/npm-modules/jsplumb.js'

import ContextMenu from 'src/client/contextmenu.js';

import DataProcessor from '../../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import { deepCopy } from '../../src/internal/individuals-as-points/common/utils.js'
import { State } from '../../src/internal/individuals-as-points/common/actionState.js'
import { 
  SelectAction, 
  FilterAction, 
  AtomicFilterAction 
} from '../../src/internal/individuals-as-points/common/actions.js'

import setup from '../../setup.js'

let globalControlWidget
let colorStore = new ColorStore()
let dataProcessor = new DataProcessor()
dataProcessor.setColorStore(colorStore)

let baseData

let defaultExtent = lively.pt(500, 300) 

let container = lively.query(this, "#container")
let createPaneButton = lively.query(this, "#createPane")
let resizeTimer
let selectAction
let filterAction

let focusedPane
let openGlobalControlPanelButton = lively.query(this, "#openGlobalControlPanel")

let jsPlumbInstance = jsPlumb.jsPlumb.getInstance()

jsPlumbInstance.setContainer(container);

jsPlumbInstance.importDefaults({
  Connector : [ "Bezier", { curviness: 1 } ],
  Anchors : [ "BottomCenter", "TopCenter" ]
});

setup(this).then(() => {
  createPaneButton.addEventListener('click', async (evt) => {
    openChildTypeMenu(createPaneButton, evt, baseData)
  })

  openGlobalControlPanelButton.addEventListener('click', async () => {
    openNewGlobalControlWidget()
  })


  container.addEventListener("click", evt => {jsPlumbInstance.repaintEverything()})

  AVFParser.loadCovidData().then(result => {
    baseData = result

    dataProcessor.initializeWithIndividualsFromKenia(baseData)
    colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute())
    selectAction = new SelectAction(new FilterAction(), dataProcessor, colorStore, true)
    filterAction = new FilterAction()
    filterAction.setDataProcessor(dataProcessor)
  });
});

async function createNewVisualization(componentName, data) {
  let visualization = await lively.create(componentName)
    
  visualization.setDataProcessor(dataProcessor)
  visualization.setColorStore(colorStore)
  await visualization.setData(data)
  visualization.setExtent(defaultExtent)
  
  return visualization
}

async function createNewPane(visualization, parent, fromSelection=false, selection={}) {

  let newPane = await lively.create("bp2019-pane")
  
  newPane.addVisualization(visualization)
  newPane.setExtent(defaultExtent)
  
  lively.setPosition(newPane, lively.getPosition(parent).addPt(lively.pt(0, defaultExtent.y + 100)) )
  container.appendChild(newPane)
  
  if (fromSelection) {
    lively.setPosition(newPane, lively.getPosition(parent).addPt(lively.pt(defaultExtent.x + 100, 0)) )
    jsPlumbInstance.connect({
      source: parent,
      target: newPane,
      endpoint: ["Dot", {radius: 10}],
      endpointStyle:{ fill: selection.selectionColor},
      anchors : ["Right", "Left"],
      paintStyle: {stroke: selection.selectionColor}
    })
  } else {
    jsPlumbInstance.connect({
      source: parent,
      target: newPane,
      endpoint: ["Dot", {radius: 10}]
    })
  }
  
  
  newPane.addEventListener("contextmenu", async (evt) => {
    openChildTypeMenu(newPane, evt)
  })
  
  newPane.addEventListener("click", () => {
    setFocus(newPane)
    registerAtGlobalControlPanel(newPane)
  })
  
  newPane.addEventListener("selection-contextmenu", (evt) => {
    evt.clientX = evt.detail.clientX
    evt.clientY = evt.detail.clientY
    openChildTypeMenu(newPane, evt)
  })
  
  return newPane
}

function setFocus(pane) {
  if (focusedPane) {
    focusedPane.removeFocus()
  }
  pane.setFocus()
  focusedPane = pane
}

function registerAtGlobalControlPanel(pane) {
  if (!globalControlWidget) return
  globalControlWidget.clearListeners()
  globalControlWidget.addListener(pane)
  // get new reference for state
  
  globalControlWidget.loadState(deepCopy(pane.getState()))
}

async function openNewGlobalControlWidget() {
  if (!dataProcessor || !colorStore) {
    lively.notify("Missing data source")
    return
  }
  let position = lively.pt(1000, 10)
  let extent = lively.pt(300, 700)
  
  globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget', position, extent)
  globalControlWidget.setDataProcessor(dataProcessor)
  globalControlWidget.setColorStore(colorStore)
  
  globalControlWidget.initializeAfterDataFetch()
}

async function openChildTypeMenu(parentPane, evt) {
  evt.stopPropagation()
  evt.preventDefault()
  
  const menuItems = [
    ['New Map', () => createNewChildPane(parentPane, 'bp2019-map-widget', evt)],
    ['New X-Y-Diagram', () => createNewChildPane(parentPane, 'bp2019-y-axis-widget', evt)],
    ['New Venn-Diagram', () => createNewChildPane(parentPane, 'bp2019-venn-widget', evt)]
  ]
  const menu = await ContextMenu.openIn(document.body, evt, parentPane, document.body,  menuItems)
}

async function createNewChildPane(parentPane, childComponentName, evt) {

  let fromSelection = (evt.type === "selection-contextmenu")
  let selection = {}
  if (fromSelection) {
    selection = {selectionColor: evt.detail.selectionColor}
  }
  
  let childVisualization = await createNewVisualization(childComponentName, deepCopy(baseData))
  let childPane = await createNewPane(childVisualization, parentPane, fromSelection, selection)
  
  if (parentPane.localName == "bp2019-pane") {
    let parentState = parentPane.getState()
    childPane.applyState(deepCopy(State.fromState(parentState)))
    parentPane.addChild(childPane)
    let parentVisualization = parentPane.visualization
    Object.keys(parentVisualization.currentActions).forEach(action => {
      childVisualization.applyAction(deepCopy(parentVisualization.currentActions[action]))
    })
  } else {
    childPane.applyAction(deepCopy(selectAction))
    childPane.applyAction(deepCopy(filterAction))
  }
  
  if (fromSelection) {
    let individuals = evt.detail.selectedPoints
    
    let selectionFilter = new AtomicFilterAction ("index", individuals.map(individual => individual.index), dataProcessor)    
    
    let currentState = childPane.getState()
    currentState.filterAction.addFilter(selectionFilter)
    
    childPane.applyAction(currentState.filterAction)
  }
  
}

</script>