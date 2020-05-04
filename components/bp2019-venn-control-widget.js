import Morph from 'src/components/widgets/lively-morph.js'
import { assertActionWidgetInterface, assertCanvasWidgetInterface } from '../src/internal/individuals-as-points/common/interfaces.js';
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import { ColorAction, FilterAction } from "../src/internal/individuals-as-points/common/actions.js"


export default class VennControlWidget extends Morph {
  async initialize() {
    this.listeners = [];
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
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
  
  setStateFromAction(action) {
    this._dispatchAction(action)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeWidgets(individuals){
    let themes = this._getAllUniqueThemes(individuals)
    let attributes = DataProcessor.current().getAllAttributes()
    let valuesByAttribute = DataProcessor.current().getValuesByAttribute()
    this._initializeWidgetWithData("#theme-group-widget", themes)
    this._initializeWidgetWithData("#individuals-color-widget", attributes)
    this._initializeWidgetWithData("#individuals-filter-widget", valuesByAttribute)
  }
  
  _initializeWidgetWithData(widgetName, dataForWidget){
    let widget = this.get(widgetName);
    assertActionWidgetInterface(widget);
    widget.addListener(this);
    widget.initializeWithData(dataForWidget);
  }
  
  _getAllUniqueThemes(individuals) {
    let uniqueThemes = new Set()
    
    let individualsThemes = DataProcessor.current()._getValuesFromIndividuals(individuals, 'themes')
    individualsThemes.forEach( individualTheme => {
      individualTheme.L3.forEach( theme => uniqueThemes.add(theme))
    })
    
    return [...uniqueThemes]
  }
  
  _dispatchAction(action){
    switch(true) {
      case (action instanceof ColorAction):
        this._setStateForColorWidgetFromAction(action);
        break;
      case (action instanceof FilterAction):
        this._setStateForFilterWidgetFromAction(action);
        break;
      default:
        this._handleNotSupportedAction(action);
     }
  }
  
  _setStateForColorWidgetFromAction(colorAction) {
    this.get("#individuals-color-widget").setStateFromAction(colorAction)
  }
  
  _setStateForFilterWidgetFromAction(filterAction) {
    lively.notify("filter action from global state in venn control widget recieved")
  }
  
  _handleNotSupportedAction(action){
    lively.notify("unsupported action from global state in venn control widget recieved")
  } 
  
}
