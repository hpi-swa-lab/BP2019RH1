import Morph from 'src/components/widgets/lively-morph.js'

export default class TabWidget extends Morph {
  
  async initialize() {
    this.contentsMap = this._getContentsMap();
    this._initializeButtons();
    this.buttonsMap = this._getButtonsMap();
    
    this._showFirstContent();
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  getContents() {
    let contents = [];
    Object.keys(this.contentsMap).forEach( (contentKey) => {
      contents.push(this.contentsMap[contentKey]);
    })
    return contents;
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _getContentsMap() {
    let contents = {};
    let contentDivs = this.get("#tab-contents").children;
    for (let contentDiv of contentDivs) {
      contents[contentDiv.getAttribute("id")] = contentDiv;
    }
    return contents;
  }
  
  _getButtonsMap() {
    let buttonsMap = {};
    let buttons = this.get("#tab-buttons").children
    for (let button of buttons) {
      let buttonID = button.getAttribute('data-content-id');
      buttonsMap[buttonID] = button;
      }
    return buttonsMap;
  }
  
  _initializeButtons() {
    let buttons = this.get("#tab-buttons").children
    for (let button of buttons) {
      button.addEventListener("click", () => {
        this._showContent(this.contentsMap[button.getAttribute("data-content-id")])
      })
    }
  }
  
  _contentsExist() {
    return Object.keys(this.contentsMap).length > 0
  }
  
  _showFirstContent() {
    if(this._contentsExist()) {
      let keyOfFirstContent = Object.keys(this.contentsMap)[0];
      this._showContent(this.contentsMap[keyOfFirstContent]);
    }
  }

  _showContent(content) {
    this._resetDisplay()
    content.style.display = "block"
    this._sendActivatedCallToNowVisibleContent(content);
    this._activateButtonForContent(content);
  }
  
  _sendActivatedCallToNowVisibleContent(content){
    if(content.activate) content.activate().catch(() => lively.notify(content + " could not handle activate call"));
  }
  
  _activateButtonForContent(content) {
    this.buttonsMap[content.id].classList.add('active');
  }
  
  _resetDisplay() {
    Object.keys(this.contentsMap).forEach( contentKey => {
      let content = this.contentsMap[contentKey];
      this._hideContent(content);
      this._disableButtonForContent(content);
    })
  }
  
  _hideContent(content) {
    content.style.display = "none";

  }
  
  _disableButtonForContent(content) {
    this.buttonsMap[content.id].classList.remove('active');
  }
  
}
