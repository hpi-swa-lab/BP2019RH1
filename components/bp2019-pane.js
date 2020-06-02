"enable aexpr";

import Windows from 'src/components/widgets/lively-window.js';
import {deepCopy} from "../src/internal/individuals-as-points/common/utils.js"
import {State} from "../src/internal/individuals-as-points/common/actionState.js"
import {FilterAction} from "../src/internal/individuals-as-points/common/actions.js"

export default class Bp2019Pane extends Windows {
  initialize() {
    super.initialize()
    this.childPanes = []
    this.state = new State()
    this.container = this.get(".window")
  }
  
  addVisualization(visualization) {
    this.visualization = visualization
    this.appendChild(visualization)
    this._bindListeners()
  }
  
  applyState(state) {
    this.state = state
    this.visualization.applyAction(this.state.filterAction)
    this.visualization.applyAction(this.state.selectAction)
    this.visualization.applyAction(this.state.colorAction)
  }
  
  getState() {
    return this.state
  }
  
  addChild(child) {
    this.childPanes.push(child)
  }
  
  removeChild(child) {
    const index = this.childPanes.indexOf(child);
    if (index > -1) {
      this.childPanes.splice(index, 1);
    }
  }

  applyAction(action) {
    this.visualization.applyAction(deepCopy(action))
    this.state.updateState(deepCopy(action))
    
    // new action needed
    this.childPanes.forEach(child => child.applyAction(deepCopy(action)))
  }
  
  setFocus() {
    this.container.classList.add("pane-selected")
  }
  
  removeFocus() {
    this.container.classList.remove("pane-selected")
  }
  
  _bindListeners() {
    this.addEventListener("extent-changed", () => {
      //TODO subtract windows thingy at the top
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.visualization.setExtent(lively.getExtent(this)) 
      }, 250);
    })
  }
  
}