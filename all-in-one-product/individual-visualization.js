import Morph from 'src/components/widgets/lively-morph.js';


export default class IndividualVisualization extends Morph {
  
  async initialize() {
    this.windowTitle = "Individual visualizations"
    
    let menu = this.get("#menu-widget");

    // Create actions
    let filterWidget = await this.generateActionWidget('filter-widget');
    let groupWidget = await this.generateActionWidget('group-widget');
    
    // Add actions to menu
    menu.addNewWidget(filterWidget);
    menu.addNewWidget(groupWidget);
  }
  
  
  async generateActionWidget(name) {
    let actionWidget = await this.createActionWidget(name);
    actionWidget.addListener(this);
    actionWidget.setData(this.getTestData())
    return actionWidget;
  }
  
  async createActionWidget(actionWidgetName) {
    let actionWidget = await lively.create(actionWidgetName);
    this.assertActionWidgetInterface(actionWidget);
    this.setIdForActionWidget(actionWidget);
    return actionWidget;
  }
  
  setIdForActionWidget(actionWidget) {
    actionWidget.id = actionWidget.name
  }
  
  applyAction(action) {
    lively.notify("Listener received action");
  }
  
  assertActionWidgetInterface(actionWidget) {
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
  
  getTestData() {
    return {
      "a": ["1", "2", "4"],
      "b": ["3", "6", "9"],
      "c": ["5", "7", "8"]
    };
  }
}