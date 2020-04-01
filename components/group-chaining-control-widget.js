import Morph from 'src/components/widgets/lively-morph.js'

export default class GroupChainingControlWidget extends Morph {
  async initialize() {
    this.listeners = [];
    
    this.rootContainer = this.get("#root-container");
    this.tabWidget = this.get("#tab-widget");
    
    // Generate Actions
    let groupActionWidget = await this._generateActionWidget('group-widget');
    let filterActionWidget = await this._generateActionWidget('filter-widget');
    
    // Add Actions to tab view 
    this.tabWidget.addNewWidget(groupActionWidget);
    this.tabWidget.addNewWidget(filterActionWidget);
  }
  
  setIndividuals(individuals) {
    this.individuals = individuals;
  }
  
  async _generateActionWidget(name) {
    let actionWidget = await this._createActionWidget(name);
    actionWidget.addListener(this);
    actionWidget.setData(this._getTestData())
    return actionWidget;
  }
  
  async _createActionWidget(actionWidgetName) {
    let actionWidget = await lively.create(actionWidgetName);
    this._assertActionWidgetInterface(actionWidget);
    this._setIdForActionWidget(actionWidget);
    return actionWidget;
  }
  
  _setIdForActionWidget(actionWidget) {
    actionWidget.id = actionWidget.name
  }
  
  applyAction(action) {
    lively.notify("GroupChainingControlWidget received action");
    this.listeners.forEach( (listener) => {
      listener.applyAction();
    })
  }
  
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  _assertActionWidgetInterface(actionWidget) {
    if ((typeof actionWidget.name) === "undefined") {
      throw new Error('An ActionWidget must have a name');
    }
    if ((typeof actionWidget.addListener) === "undefined") {
      throw new Error('An ActionWidget must implement addListener');
    }
    if ((typeof actionWidget.setData) === "undefined") {
      throw new Error('An ActionWidget must implement setData');
    }
  }
  
  _getTestData() {
    return {
      "a": ["1", "2", "4"],
      "b": ["3", "6", "9"],
      "c": ["5", "7", "8"]
    };
  }
  
}
