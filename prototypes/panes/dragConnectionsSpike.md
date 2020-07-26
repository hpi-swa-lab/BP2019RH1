<div>
  <div id="container">
    <button class="btn" id="openGlobalControlPanel">Open Global Control Panel</button>
    <button class="btn" id="createPane">Create Pane</button>
  </div>
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


jsPlumbInstance.importDefaults({
  Connector : [ "Bezier", { curviness: 1 } ],
  Anchors : [ "BottomCenter", "TopCenter" ]
});

var generalDropOptions = {
    tolerance: "touch",
    hoverClass: "dropHover",
    activeClass: "dragActive"
  };

var outputEndpoint = {
    endpoint: ["Dot", {radius: 10}],
    connector: ["Bezier", { curviness: 63 } ],
    anchor: "Bottom",
    isSource: true,
    reattach: true,
    maxConnections: 20,
    scope: "output",
    beforeDrop: function (params) {
      return confirm("Connect " + params.sourceId + " to " + params.targetId + "?");
    },
    dropOptions: generalDropOptions
  };

var inputEndpoint = {
    endpoint: ["Dot", {radius: 10}], 
    connector: ["Bezier", { curviness: 63 } ],
    anchor: "Top",
    isTarget: true,
    reattach: true,
    scope: "input",
    beforeDrop: function (params) {
      return confirm("Connect " + params.sourceId + " to " + params.targetId + "?");
    },
    dropOptions: generalDropOptions
  };

let context = this

(async () => {
  await setup(context)
  
  createPaneButton.addEventListener('click', async (evt) => {
    openChildTypeMenu(createPaneButton, evt, baseData)
  })

  openGlobalControlPanelButton.addEventListener('click', async () => {
    openNewGlobalControlWidget()
  })
  
  await createDataSource()
  
  baseData = await AVFParser.loadCovidData()

  dataProcessor.initializeWithIndividualsFromKenia(baseData)
  await colorStore.loadDefaultColors()
  colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute())
  
  selectAction = new SelectAction(new FilterAction(), dataProcessor, colorStore, true)
  filterAction = new FilterAction()
  filterAction.setDataProcessor(dataProcessor)
})()

async function createDataSource() {
  let dataSourceWidget = await lively.create("bp2019-data-source-widget")
  
  let newPane = await lively.create("bp2019-pane")
  newPane.setAttribute("title", "Datasource")
  newPane.setTitleBarColor("DeepPink")
  
  newPane.addVisualization(dataSourceWidget)
  newPane.setExtent(lively.pt(235, 60))
  
  lively.setPosition(newPane, lively.pt(100, 100))
  container.appendChild(newPane)
  
  newPane.addEventListener("contextmenu", async (evt) => {
    openChildTypeMenu(newPane, evt)
  })
  
  newPane.addEventListener("click", () => {
    setFocus(newPane)
    registerAtGlobalControlPanel(newPane)
  })
  
  newPane.addEventListener("position-changed", () => {
    jsPlumbInstance.repaintEverything()
  })
  
  jsPlumbInstance.addEndpoint(newPane, outputEndpoint)
  jsPlumbInstance.draggable(newPane)
  
  return newPane
}

async function createNewVisualization(componentName, data) {
  let visualization = await lively.create(componentName)
    
  visualization.setDataProcessor(dataProcessor)
  visualization.setColorStore(colorStore)
  await visualization.setData(data)
  visualization.setExtent(defaultExtent)
  
  return visualization
}



async function createNewPane(component, componentName, position, extent=defaultExtent, state=false) {

  let newPane = await lively.create("bp2019-pane")
  
  newPane.addVisualization(component, componentName)
  lively.setPosition(newPane, position)
  newPane.setExtent(extent)
  
  if (state) {
    newPane.applyState(deepCopy(State.fromState(state)))
  }
  
  container.appendChild(newPane)
  
  newPane.addEventListener("contextmenu", async (evt) => {
    openChildTypeMenu(newPane, evt)
  })
  
  newPane.addEventListener("click", (evt) => {
    setFocus(newPane)
    registerAtGlobalControlPanel(newPane)
  })
  
  newPane.addEventListener("selection-contextmenu", (evt) => {
    evt.clientX = evt.detail.clientX
    evt.clientY = evt.detail.clientY
    openChildTypeMenu(newPane, evt)
  })
  
  newPane.addEventListener("position-changed", () => {
    jsPlumbInstance.repaintEverything()
  })
  
  jsPlumbInstance.addEndpoint(inputEndpoint)
  jsPlumbInstance.addEndpoint(outputEndpoint)

  
  return newPane
}

async function createNewChildPane(parentPane, childComponentName, evt) {

  let childPosition
  let fromSelection = (evt.type === "selection-contextmenu")
  let selection = {}
  if (fromSelection) {
    selection = {selectionColor: evt.detail.selectionColor}
    childPosition = lively.getPosition(parentPane).addPt(lively.pt(defaultExtent.x + 100, 0))
  } else {
    childPosition = lively.getPosition(parentPane).addPt(lively.pt(0, defaultExtent.y + 100))
  }
  
  let childVisualization = await createNewVisualization(childComponentName, deepCopy(baseData))
  
  let childPane = await createNewPane(childVisualization, childComponentName, childPosition, defaultExtent, parentPane.getState())
  
  parentPane.addChild(childPane)
  
  if (fromSelection) {
    let individuals = evt.detail.selectedPoints
    
    let selectionFilter = new AtomicFilterAction ("index", individuals.map(individual => individual.index), dataProcessor)    
    
    let currentState = childPane.getState()
    currentState.filterAction.addFilter(selectionFilter)
    
    childPane.applyAction(currentState.filterAction)
  }

  if (fromSelection) {
      jsPlumbInstance.connect({
        source: parentPane,
        target: childPane,
        endpoint: ["Dot", {radius: 10}],
        endpointStyle:{ fill: selection.selectionColor},
        anchors : ["Right", "Left"],
        paintStyle: {stroke: selection.selectionColor}
      })
    } else {
      jsPlumbInstance.connect({
        source: parentPane,
        target: childPane,
        endpoint: ["Dot", {radius: 10}]
      })
    }
  
  
  return childPane
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
  if (!pane) return
  
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
  
  //TODO: load data processor and color store from data source / state as soon as the state holds them
  globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget', position, extent)
  globalControlWidget.setDataProcessor(dataProcessor)
  globalControlWidget.setColorStore(colorStore)
  
  globalControlWidget.initializeAfterDataFetch()
  
  registerAtGlobalControlPanel(focusedPane)
}

async function openChildTypeMenu(parentPane, evt) {
  evt.stopPropagation()
  evt.preventDefault()
  
  const menuItems = [
    ['New Map', () => createNewChildPane(parentPane, 'bp2019-map-widget', evt)],
    ['New X-Y-Diagram', () => createNewChildPane(parentPane, 'bp2019-y-axis-widget', evt)],
    ['New Venn-Diagram', () => createNewChildPane(parentPane, 'bp2019-venn-widget', evt)],
    ['New Statistic', () => createNewChildPane(parentPane, 'bp2019-statistic-widget', evt)],
    ['Clone this pane', () => clonePane(parentPane, evt)]
  ]
  const menu = await ContextMenu.openIn(document.body, evt, parentPane, document.body,  menuItems)
}


async function clonePane(pane, evt) {
  let clonedVisualization = await createNewVisualization(pane.visualizationType, deepCopy(baseData))
  let clonedPanePosition = lively.getPosition(pane).addPt(lively.pt(100, -100))
  createNewPane(clonedVisualization, pane.visualizationType, clonedPanePosition, defaultExtent, pane.getState())
}

</script>