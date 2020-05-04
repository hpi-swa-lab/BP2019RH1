/*
Simple Tooltip. 
Usage with defaultStyling included in tooltip-style.css:
  - var tooltip = new Tooltip()
Usage with self defined styling on div element:
  - var tooltip = new Tooltip(div, false)
*/

export class Tooltip {
  
  constructor(div = <div></div>, defaultStyling = true) {
    if (defaultStyling) {
      this.div = <div rel="stylesheet" href="./tooltip-style.css"></div>
    } else {
      this.div = div 
    }
    this.div.className = "tooltip"
    this.div.style.display = "none"
    this.div.style.width = "auto"
  }
  
  setPosition(top, left) {
    this.div.style.top =  top + "px"
    this.div.style.left = left + "px"
  }
  
  setText(text) {
    this.div.innerHTML = text
  }
  
  hide() {
    this.div.style.display = "none"
  }
  
  show() {
    this.div.style.display = "block"
  }
  
  getDiv() {
    return this.div
  }
}
