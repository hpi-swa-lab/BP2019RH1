import Windows from 'src/components/widgets/lively-window.js';
import {deepCopy} from "../src/internal/individuals-as-points/common/utils.js"
import {State} from "../src/internal/individuals-as-points/common/actionState.js"

import { SelectAction, FilterAction } from "../src/internal/individuals-as-points/common/actions.js"

export default class Bp2019Pane extends Windows {
  initialize() {
    super.initialize()
    this.childPanes = []
    this.state = new State()
    this.paneCloseButton = this.get("#pane-close-button")
    this.container = this.get(".window")
    this.colorActionBar = this.get("#color-action-bar")
    this.filterActionBar = this.get("#filter-action-bar")
    this.data = []
    this.individualsSelection = {}
    this.parent = "parent"
    
    this.addEventListener("data-loaded", (event) => {
      event.stopPropagation()
      
      this.setGeoData(event.detail.geoData)
      this.setData(event.detail.data)
      let selectAction = new SelectAction(new FilterAction(), event.detail.dataProcessor, event.detail.colorStore, true)
      let filterAction = new FilterAction()
      filterAction.setIncludeStop(false)
      filterAction.setDataProcessor(event.detail.dataProcessor)
      
      this.state.updateState(event.detail.dataProcessor)
      this.state.updateState(event.detail.colorStore)
      this.state.updateState(event.detail.geoData)
      this.state.updateState(selectAction)
      this.state.updateState(filterAction)
      
      this.applyState(State.fromState(this.state))
      this.propagateState(State.fromState(this.state))
    })
    
    this.paneCloseButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("click-pane-close-button", {
        detail: {
          sender: this
        },
        bubbles: true 
      }))
    })
    
    this.addEventListener("individual-inspected", (event) => {
      event.stopPropagation()
      this.applyActionFromTop(event.detail.action)
    })
  }
  
  applyActionFromTop(action) {
    let startingPane = this
    
    while(startingPane.getParent() !== "parent") {
      startingPane = startingPane.getParent()
    }
    
    startingPane.applyAction(action)
  }
  
  getParent() {
    return this.parent
  }
  
  setParent(newParent) {
    this.parent = newParent
  }
    
  addVisualization(visualization, componentName) {
    this.visualization = visualization
    this.visualizationType = componentName
    this.appendChild(visualization)
    this._bindListeners()
  }
  
  applyState(state) {
    this.state = state
    
    if (this.visualization.setDataProcessor) {
      this.visualization.setDataProcessor(this.state.dataProcessor)
    }
    if (this.visualization.setColorStore) {
      this.visualization.setColorStore(this.state.colorStore)
    }
    if (this.visualization.setGeoData) {
      this.visualization.setGeoData(this.state.geoData)
    }
    
    this.visualization.applyAction(this.state.filterAction)
    this.visualization.applyAction(this.state.selectAction)
    this.visualization.applyAction(this.state.colorAction)
    this.visualization.applyAction(this.state.inspectAction)
    
    this.state.localActions.forEach(action => this.visualization.applyAction(action))
    
    this._updateActionBar()
  }
  
  propagateState(state) {
    this.childPanes.forEach(child => {
      child.applyState(State.fromState(state))
      child.propagateState(State.fromState(state))
    })
  }
  
  setGeoData(geoData) {
     if (this.visualization) {
       if (typeof this.visualization.setGeoData === "function") {
          this.visualization.setGeoData(deepCopy(geoData))
       }
    }
    this.childPanes.forEach(child => {
      child.setGeoData(deepCopy(geoData))
    })
  }
  
  async setData(data) {
    this.data = deepCopy(data)
    if (this.visualization) {
      await this.visualization.setData(deepCopy(data))
    }
    this.childPanes.forEach(child => {
      child.setData(deepCopy(data))
    })
  }
  
  setGlobalControlWidget(globalControlWidget) {
    this.globalControlWidget = globalControlWidget
  }
  
  getData() {
    return this.data
  }
  
  getVisualizationType() {
    return this.visualizationType  
  }
  
  getState() {
    return this.state
  }
  
  setState(state) {
    this.state = deepCopy(state)
    this._updateActionBar()
  }
  
  getIndividualsSelection() {
    return this.individualsSelection
  }
  
  setIndividualsSelection(individualsSelection) {
    this.individualsSelection = individualsSelection
  }
  
  addChild(child) {
    this.childPanes.push(child)
  }
  
  updateStrokeStyle(strokeStyle) {
    if (typeof this.visualization.updateStrokeStyle === "function") {
      this.visualization.updateStrokeStyle(strokeStyle)
    }
  }
  
  removeChild(child) {
    const index = this.childPanes.indexOf(child);
    if (index > -1) {
      this.childPanes.splice(index, 1);
    }
  }
  
  deleteFreehandSelectionChildren(freehandSelection) {
    for (var i = this.childPanes.length - 1; i >= 0; i--) {
      if (freehandSelection.color === this.childPanes[i].getIndividualsSelection().selectionColor) {
        //color is chosen randomly, so it's actually not a completely safe way of identifying the panes
        this.childPanes[i].onCloseButtonClicked()
        this.removeChild(this.childPanes[i])
      }
    }
  }

  applyAction(action) {
    this.state.updateState(deepCopy(action))
    //this.applyState(this.state) //this.state
    
    this.visualization.applyAction(action)
    this._updateActionBar()
    
    this.childPanes.forEach(child => child.applyAction(deepCopy(action)))
  }
  
  setTitleBarColor(color) {
    this.get(".window-titlebar").style.background = color
  }
  
  setFocus() {
    this.container.classList.remove("pane-unselected")
    this.container.classList.add("pane-selected")
    
    if (typeof this.visualization.setLocalControls === "function") {
        this.visualization.setLocalControls()
    }
  }
  
  removeFocus() {
    this.container.classList.add("pane-unselected")
    this.container.classList.remove("pane-selected")
    
    if (typeof this.visualization.setLocalControls === "function") {
        this.visualization.unsetLocalControls()
    }
  }
  
  async onCloseButtonClicked(evt) {
    this.childPanes.forEach(pane => pane.onCloseButtonClicked(evt))
    super.onCloseButtonClicked(evt)
  }
  
  _updateActionBar() {
    while (this.filterActionBar.firstChild) {
      this.filterActionBar.removeChild(this.filterActionBar.lastChild);
    }
    
    while (this.colorActionBar.firstChild) {
      this.colorActionBar.removeChild(this.colorActionBar.lastChild);
    }
    
    if (this.state.filterAction.filters.length > 0) {
      this._addFilterToActionBar(this.state.filterAction)
    }
    if (this.state.colorAction.attribute !== "none") {
      this._addColoringToActionBar(this.state.colorAction)
    }
  }
  
  _addFilterToActionBar(filterAction) {
    let filterActionDiv = <div></div>;
    
    filterAction.filters.forEach(filter => {
      if (filter.getAttribute() === "indexIDUnique") return
      
      let filterDiv = <div></div>;
      filterDiv.innerHTML = "Filtered " + filter.getAttribute() + " by values " + filter.getFilterValues().join(", ")
      
      filterActionDiv.appendChild(filterDiv)
    })
    
    this.filterActionBar.appendChild(filterActionDiv)
  }
  
  _addColoringToActionBar(colorAction) {
    let coloringDiv = <div></div>;
    
    coloringDiv.innerHTML = "Colored by: " + colorAction.attribute
    
    this.colorActionBar.appendChild(coloringDiv)
  }
  
  _bindListeners() {
    this.addEventListener("extent-changed", () => {
      let windowBarExtent = lively.getExtent(this.get(".window-titlebar"))
      let windowBarHeight = windowBarExtent.y
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        let contentExtent = lively.getExtent(this)
        // subtracting the window border and the height of the actionBar (10% of the content)
        let visualizationExtent = contentExtent.subPt(lively.pt(0, contentExtent.y * 0.1)).subPt(lively.pt(10, 10)).subPt(lively.pt(0, windowBarHeight)) 
        this.visualization.setExtent(visualizationExtent) 
        if (this.globalControlWidget) {
          let controlWidgetExtent = lively.getExtent(this)
          this.globalControlWidget.setExtent(lively.pt(200, controlWidgetExtent.y))
        }
      }, 250);
    })
    
    this.addEventListener("local-actions-changed", (event) => {
      event.stopPropagation()
      this.state.updateLocalActions(event.detail.localActions)
    })
  }
}