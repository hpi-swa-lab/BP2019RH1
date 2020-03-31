import Morph from 'src/components/widgets/lively-morph.js'

export default class MenuWidget extends Morph {
  async initialize() {
    this.rootContainer = this.get("#root-container")
    this.tabDiv = this.get("#tabs")
    this.tabContentDiv = this.get("#tab-content")
  }
  
  addNewWidget(actionWidget) {
    this.assertActionWidgetInterface(actionWidget);
    this.addTabButton(actionWidget);
    this.addTabContent(actionWidget);
  }
  
  addTabButton(actionWidget) {
    let tabButton = <button id={ actionWidget.id + "-button" }>{ actionWidget.id }</button>;
    tabButton.addEventListener("click", () => { this.openWidget(actionWidget.id) });
    tabButton.classList.add("tablinks")
    this.tabDiv.append(tabButton);
  }
  
  addTabContent(actionWidget) {
    this.tabContentDiv.append(actionWidget);
    actionWidget.className = "tabcontent";
  }
  
  openWidget(actionWidgetName) {
    this.hideCurrentTabContent();
    this.setTabBarInactive();
    this.displayClickedWidget(actionWidgetName);
  }
  
  hideCurrentTabContent(){
    var i, tabcontent;
    
    tabcontent = lively.queryAll(this.rootContainer, ".tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  }
  
  setTabBarInactive(){
    var tablinks, i;
    
    tablinks = lively.queryAll(this.rootContainer, ".tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  }
  
  displayClickedWidget(actionWidgetName){
    lively.query(this.rootContainer, "#" + actionWidgetName).style.display = "block";
    lively.query(this.rootContainer, "#" + actionWidgetName + "-button").className += " active";
  }
  
  assertActionWidgetInterface(actionWidget) {
    if ((typeof actionWidget.name) === "undefined") {
      throw new Error('An ActionWidget must have a name');
    }
  }
}
