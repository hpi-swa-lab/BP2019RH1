import Morph from 'src/components/widgets/lively-morph.js'
import { assertActionWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"

export default class TabWidget extends Morph {
  async initialize() {
    this.rootContainer = this.get("#root-container")
    this.tabDiv = this.get("#tabs")
    this.tabContentDiv = this.get("#tab-content")
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  addWidget(actionWidget) {
    assertActionWidgetInterface(actionWidget);
    this._addTabButton(actionWidget);
    this._addTabContent(actionWidget);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _addTabButton(actionWidget) {
    let tabButton = <button id={ actionWidget.id + "-button" }>{ actionWidget.id }</button>;
    tabButton.addEventListener("click", () => { this._openActionWidget(actionWidget.id) });
    tabButton.classList.add("tablinks")
    this.tabDiv.append(tabButton);
  }
  
  _addTabContent(actionWidget) {
    this.tabContentDiv.append(actionWidget);
    actionWidget.className = "tabcontent";
  }
  
  _openActionWidget(actionWidgetName) {
    this._hideCurrentTabContent();
    this._setTabBarInactive();
    this._displayClickedWidget(actionWidgetName);
  }
  
  _hideCurrentTabContent(){
    var i, tabcontent;
    
    tabcontent = lively.queryAll(this.rootContainer, ".tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  }
  
  _setTabBarInactive(){
    var tablinks, i;
    
    tablinks = lively.queryAll(this.rootContainer, ".tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  }
  
  _displayClickedWidget(actionWidgetName){
    lively.query(this.rootContainer, "#" + actionWidgetName).style.display = "block";
    lively.query(this.rootContainer, "#" + actionWidgetName + "-button").className += " active";
  }
  
}
