import Morph from 'src/components/widgets/lively-morph.js'
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js';
import { ColorAction, FilterAction } from "../src/internal/individuals-as-points/common/actions.js"
import Bp2019ControlPanelWidget from "./bp2019-control-panel-widget.js"


export default class VennControlWidget extends Bp2019ControlPanelWidget {
  async initialize() {
    super.initialize()
    this.listeners = [];
    this.colorStore = undefined
    this.themeGroupWidget = this.get("#theme-group-widget")
    this.controlWidgetRootContainer = this.get('#control-panel-root-container')
    this.themeGroupWidget.addListener(this);
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setDataProcessor(dataProcessor) {
    this.dataProcessor = dataProcessor
  }
  
  setColorStore(colorStore) {
    this.colorStore = colorStore
    this.themeGroupWidget.setColorStore(colorStore)
  }
  
  async initializeAfterDataFetch(individuals) {
    this._initializeWidgets(individuals);
  }
  
  applyAction(action) {
    this.listeners.forEach( (listener) => {
      listener.applyAction(action);
    })
  }
  
  addListener(listener) {
    this.listeners.push(listener);
    assertCanvasWidgetInterface(listener);
  }
  
  setHeight(height) {
    this.controlWidgetRootContainer.style.height = height + "px"
  }
  
  loadState(action) {
    let loaded = {}
    Object.keys(action).forEach(localAction => {
      if (!(typeof action[localAction] === "string")) {
        if (!loaded[action[localAction].uuid]) {
          this.themeGroupWidget.loadState(action[localAction])
          loaded[action[localAction].uuid] = true
        }
      }
    })
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWidgets(individuals){
    let themes = this._getAllUniqueThemes(individuals)
    Array.sort(themes)
    this.themeGroupWidget.initializeWithData(themes)
  }
  
  _getAllUniqueThemes(individuals) {
    let uniqueThemes = new Set()
    
    let individualsThemes = this.dataProcessor._getValuesFromIndividuals(individuals, 'themes')
    individualsThemes.forEach( individualTheme => {
      individualTheme.L3.forEach( theme => uniqueThemes.add(theme))
    })
    
    return [...uniqueThemes]
  }
}
