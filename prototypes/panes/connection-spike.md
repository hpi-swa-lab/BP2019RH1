### Panes!

<div id="container">
  <button class="btn" id="createDataSource">Create data source</button>
  <button class="btn" id="changePointStyle">Change Point Style</button>
</div>

<style>
#container {
  position: absolute;
}

.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #333;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.jtk-connector { z-index: 1000; }

.jtk-endpoint { z-index: 1000; }
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

let defaultExtent = lively.pt(500, 300) 

let container = lively.query(this, "#container")
let resizeTimer
let selectAction
let filterAction

let inspectorPane
let focusedPane
let createDataSourceButton = lively.query(this, "#createDataSource")
let changePointStyle = lively.query(this, "#changePointStyle")
let strokeStyle = false

let loadingDiv = <div><div class="loader"></div>Loading components</div>

container.appendChild(loadingDiv);

let jsPlumbInstance = jsPlumb.jsPlumb.getInstance()

jsPlumbInstance.setContainer(container);

jsPlumbInstance.importDefaults({
  Connector : [ "Bezier", { curviness: 1 } ],
  Anchors : [ "BottomCenter", "TopCenter" ]
});

let lastRedraw = 0

let dataSourcePane

(async () => {
  await setup(this)
  
  createDataSourceButton.addEventListener('click', async () => {
    createDataSource()
  })
  
  changePointStyle.addEventListener('click', () => {
    updatePointStyle()
  })
  
  dataSourcePane = await createDataSource()
  
  container.removeChild(loadingDiv)
})()

async function createDataSource() {
  let dataSourceWidget = await lively.create("bp2019-data-source-widget")
  
  let newPane = await lively.create("bp2019-pane")
  
  newPane.setAttribute("title", "Datasource")
  newPane.setTitleBarColor("DeepPink")
  
  newPane.addVisualization(dataSourceWidget)
  newPane.setExtent(lively.pt(245, 150))
  
  lively.setPosition(newPane, lively.pt(400, 100))
  container.appendChild(newPane)
  
  newPane.addEventListener("contextmenu", async (evt) => {
    openChildTypeMenu(newPane, evt, false, true)
  })
  
  newPane.addEventListener("click", () => {
    setFocus(newPane)
  })
  
  newPane.addEventListener("position-changed", () => {
    if (Date.now() - lastRedraw > 100) {
      jsPlumbInstance.repaintEverything()
      lastRedraw = Date.now()
    }
  })
  
  return newPane
}

async function createInspectPane(parentPane) {
  let inspectWidget = await lively.create("bp2019-inspector-widget")
  inspectorPane = await lively.create("bp2019-pane")
  
  inspectorPane.setAttribute("title", "Inspector")
  inspectorPane.setTitleBarColor("Blue")
  
  inspectorPane.addVisualization(inspectWidget)
  inspectorPane.setExtent(lively.pt(260, 300))
  
  inspectorPane.applyState(State.fromState(parentPane.getState()))
  
  lively.setPosition(inspectorPane, lively.pt(100, 100))
  container.appendChild(inspectorPane)
  
  inspectorPane.addEventListener("click", () => {
    setFocus(inspectorPane)
  })
  
  jsPlumbInstance.connect({
    source: parentPane,
    target: inspectorPane,
    endpoint: ["Dot", {radius: 10}],
    endpointStyle:{ fill: "Blue"},
    anchors : ["Left", "Top"],
    paintStyle: {stroke: "Blue"}
  })
  
  inspectorPane.addEventListener("click-pane-close-button", () => {
    jsPlumbInstance.remove(inspectorPane)
    inspectorPane.childPanes.forEach(pane => 
      jsPlumbInstance.remove(pane)
    )
    parentPane.removeChild(inspectorPane)
  })
  
  inspectorPane.addEventListener("position-changed", () => {
    if (Date.now() - lastRedraw > 100) {
      jsPlumbInstance.repaintEverything()
      lastRedraw = Date.now()
    }
  })
  
  parentPane.addChild(inspectorPane)
  inspectorPane.setParent(parentPane)
  
  return inspectorPane
}

async function createNewVisualization(componentName, data, dataProcessor, colorStore, geoData) {
  let visualization = await lively.create(componentName)
  
  visualization.setDataProcessor(dataProcessor)
  visualization.setColorStore(colorStore)
  if (visualization.setGeoData) { visualization.setGeoData(geoData) }
  
  visualization.setExtent(defaultExtent)
  
  if (visualization.setContainerType) { visualization.setContainerType("pane") }
  if (visualization.setStrokeStyle) { visualization.setStrokeStyle(strokeStyle) }
  
  return visualization
}

async function createNewPane(component, componentName, position, data=[], extent=defaultExtent, state=false) {
  let newPane = await lively.create("bp2019-pane")
  
  newPane.addVisualization(component, componentName)
  await newPane.setData(data) 
  lively.setPosition(newPane, position)
  newPane.setExtent(extent)
  setFocus(newPane)
  
  if (state) {
    newPane.applyState(State.fromState(state))
  }
  
  createNewGlobalControlWidget(newPane)
  
  container.appendChild(newPane)
  
  newPane.addEventListener("contextmenu", async (evt) => {
    openChildTypeMenu(newPane, evt)
  })
  
  newPane.addEventListener("click", (evt) => {
    setFocus(newPane)
  })
  
  newPane.addEventListener("freehand-selection-contextmenu", (evt) => {
    evt.clientX = evt.detail.clientX
    evt.clientY = evt.detail.clientY
    openChildTypeMenu(newPane, evt, true)
  })
  
  newPane.addEventListener("freehand-selection-deleted", (evt) => {
    evt.stopPropagation()
    evt.preventDefault()
    let freehandSelection = evt.detail.selection
    newPane.deleteFreehandSelectionChildren(freehandSelection)
  })
  
  newPane.addEventListener("position-changed", () => {
    if (Date.now() - lastRedraw > 100) {
      jsPlumbInstance.repaintEverything()
      lastRedraw = Date.now()
    }
    if (inspectorPane) {
      let panePosition = lively.getPosition(newPane)
      lively.setPosition(inspectorPane, lively.pt(panePosition.x - 550, panePosition.y))
    }
  })
  
    
  newPane.addEventListener("extent-changed", () => {
      //ugly waiting for extent change of pane and selections happening in pane.js
      setTimeout(jsPlumbInstance.repaintEverything, 500)
  })
  
  return newPane
}

async function createNewChildPane(parentPane, childComponentName, evt) {
  let childPosition
  let fromSelection = (evt.type === "freehand-selection-contextmenu")
  let selection = {}
  
  if (fromSelection) {
    let individuals = evt.detail.individualsSelection.selectedIndividuals
    if (individuals.length === 0) {
      lively.notify("Please select some individuals to open a new visualization")
      return
    }
    
    selection = {selectionColor: evt.detail.individualsSelection.selectionColor}
    childPosition = lively.getPosition(parentPane).addPt(lively.pt(defaultExtent.x + 100, 0))
  } else {
    childPosition = lively.getPosition(parentPane).addPt(lively.pt(100, defaultExtent.y + 100))
  }
  
  let parentState = parentPane.getState()
  let parentData = parentPane.getData()
  let childVisualization = await createNewVisualization(
    childComponentName, 
    deepCopy(parentData), 
    parentState.dataProcessor, 
    parentState.colorStore, 
    parentState.geoData
  )

  let childPane = await createNewPane(
    childVisualization, 
    childComponentName, 
    childPosition, 
    deepCopy(parentData), 
    defaultExtent, 
    parentPane.getState()
  )
  
  childPane.addEventListener("click-pane-close-button", () => {
    jsPlumbInstance.remove(childPane)
    childPane.childPanes.forEach(pane => 
      jsPlumbInstance.remove(pane)
    )
    parentPane.removeChild(childPane)
  })
  
  parentPane.addChild(childPane)
  childPane.setParent(parentPane)
  
  if (fromSelection) {
    let individuals = evt.detail.individualsSelection.selectedIndividuals
    
    let currentState = childPane.getState()
    
    let selectionFilter = new AtomicFilterAction (
      "indexIDUnique", 
      individuals.map(individual => individual.indexIDUnique), 
      currentState.dataProcessor
    )
    
    currentState.filterAction.addFilter(selectionFilter)
    
    childPane.applyAction(currentState.filterAction)
    childPane.setIndividualsSelection(evt.detail.individualsSelection)
  }

  if (fromSelection) {
    jsPlumbInstance.connect({
      source: evt.detail.freehandSelectionSVGElement,
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

function updatePointStyle() {
  strokeStyle = !strokeStyle
  Object.keys(container.getElementsByTagName("bp2019-pane")).forEach(pane => {
    container.getElementsByTagName("bp2019-pane")[pane].updateStrokeStyle(strokeStyle)
  }) 
}

function setFocus(pane) {
  // when same pane no switching needed so that no race condition with filter events occur
  if (pane === focusedPane) {
    return 
  }
  
  if (focusedPane) {
    if (focusedPane.globalControlWidget) {
      focusedPane.globalControlWidget.style.visibility = "hidden"
    }
    focusedPane.removeFocus()
  }
  
  pane.setFocus()
  focusedPane = pane
  
  if (focusedPane.globalControlWidget) {
    focusedPane.globalControlWidget.style.visibility = "visible"
    focusedPane.globalControlWidget.loadState(State.fromState(focusedPane.getState()))
  }
  
  if (inspectorPane && inspectorPane !== focusedPane && dataSourcePane !== focusedPane) {
    let focusedPanePosition = lively.getPosition(focusedPane)
    lively.setPosition(inspectorPane, lively.pt(focusedPanePosition.x - 500, focusedPanePosition.y))
  }
} 

function registerAtGlobalControlPanel(pane) {
  if (!globalControlWidget) return
  if (!pane) return
  
  globalControlWidget.clearListeners()
  globalControlWidget.addListener(pane)
  
  globalControlWidget.loadState(State.fromState(pane.getState()))
}

async function createNewGlobalControlWidget(pane) {
  if (!dataSourcePane) {
    lively.notify("Missing data source")
    return
  }
    
  globalControlWidget = await lively.create('bp2019-global-control-widget')
  globalControlWidget.setDataProcessor(dataSourcePane.getState().dataProcessor)
  globalControlWidget.setColorStore(dataSourcePane.getState().colorStore) 
  globalControlWidget.initializeAfterDataFetch()

  globalControlWidget.style.background = "grey"
  globalControlWidget.style.left = "-205px"
  globalControlWidget.style.top = "-24px"
  globalControlWidget.style.overflow = "scroll"
  globalControlWidget.style.width = "200px"
  
  pane.appendChild(globalControlWidget)
  globalControlWidget.setPosition(lively.getPosition(globalControlWidget))
  pane.setGlobalControlWidget(globalControlWidget)
  
  registerAtGlobalControlPanel(pane)
}

async function openChildTypeMenu(parentPane, evt, selection = false, dataSource = false) {
  evt.stopPropagation()
  evt.preventDefault()
  
  const menuItems = [
    ['New Map', () => createNewChildPane(parentPane, 'bp2019-map-widget', evt)],
    ['New X-Y-Diagram', () => createNewChildPane(parentPane, 'bp2019-y-axis-widget', evt)],
    ['New Statistic', () => createNewChildPane(parentPane, 'bp2019-statistic-widget', evt)],
    ['New Venn-Diagram', () => createNewChildPane(parentPane, 'bp2019-venn-widget', evt)]
  ]
  
  if(dataSource) {
    menuItems.push(['Open inspector', () => createInspectPane(parentPane)])
  }
  
  if (!selection && !dataSource) {
    menuItems.push(['Clone this pane', () => clonePane(parentPane, evt)])
  }
  
  const menu = await ContextMenu.openIn(document.body, evt, parentPane, document.body,  menuItems)
}

async function clonePane(pane, evt) {
  let paneState = pane.getState()
  
  let clonedVisualization = await createNewVisualization(
    pane.visualizationType, 
    State.fromState(pane.getData()), 
    paneState.dataProcessor, 
    paneState.colorStore, 
    paneState.geoData
  )
  
  let clonedPanePosition = lively.getPosition(pane).addPt(lively.pt(100, -100))
  
  createNewPane(
    clonedVisualization, 
    pane.visualizationType, 
    clonedPanePosition, 
    pane.getData(), 
    defaultExtent, 
    paneState
  )
}

// well turns out jsPlumb cannot connect SVG shapes (as offset and size calculation don't work out of the box with them like with html elements)
// let's just write our own calculations then (reference: https://jsplumbtoolkit.com/blog/connecting-svg-shapes)

// needs to be corrected
var offsetCalculators = {
"POLYGON":function(el) {
    var rect = el.getBoundingClientRect()
    var containerRect = container.getBoundingClientRect()
    return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top
    };
  }
};

// custom size calculators for SVG shapes.
var sizeCalculators = {
"POLYGON":function(el) {
    var rect = el.getBoundingClientRect()
    var rx = rect.width,
        ry = rect.height;
    return [ rx, ry ];
  }
}

// store original jsPlumb prototype methods for getOffset and size.
var originalOffset = jsPlumb.jsPlumb.getOffset
var originalSize = jsPlumb.jsPlumb.getSize


jsPlumbInstance.getOffset = function(el) {
  var tn = el.tagName.toUpperCase();
  
  if (offsetCalculators[tn]) {
    return offsetCalculators[tn](el);
  } else {
    return originalOffset.apply(this, [el]);
  }
};

jsPlumbInstance.getSize = function(el) {
  var tn = el.tagName.toUpperCase();

  if (sizeCalculators[tn]) {
    return sizeCalculators[tn](el);
  } else {
    return originalSize.apply(this, [el]);
  }
};

""
</script>