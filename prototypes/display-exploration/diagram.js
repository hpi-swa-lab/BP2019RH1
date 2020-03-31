import { Pane } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/pane.js";
import jsPlumb from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/npm-modules/jsplumb.js"

export class Diagram {
  constructor(div, pointWidth, data, colorMap) {
    this.div = div;
    this.pointWidth = pointWidth;
    this.initialData = data;
    this.colorMap = colorMap;
    this.canvasDimensions = {};
    this.panes = [];
    this.containers = [];
    this.addButton = <button>Add subsequent Pane</button>;
    this.colorMap = this.getColorMap();

    this.initialize();
  }

  initialize() {
    this.div.style.overflow = "auto";
    this.addButton.style.margin = "0 auto";
    this.addButton.style.display = "table";

    this.canvasDimensions = {
      "width": this.div.getBoundingClientRect().width,
      "height": this.div.getBoundingClientRect().height
    };

    this.div.appendChild(<br></br>);

    this.addButton.addEventListener("click", () => {
      this.addNewPane();
    });
    this.div.appendChild(this.addButton);
  }

  addNewPane(parent = {}) {
    if (this.panes.length == 0) this.div.removeChild(this.addButton);
    
    let index = this.getIndexOfPane(parent);
    let level = index + 1;
    
    if (this.panes.length <= level) {
      let newContainer = <div></div>;
      newContainer.style.height = this.canvasDimensions.height * 0.33 + "px";
      newContainer.style.display = "flex";
      newContainer.style.flexDirection = "row";
      
      this.div.appendChild(newContainer);
      this.div.appendChild(<br></br>);
      
      this.containers.push(newContainer);
      this.panes.push([]);
    }
    
    let newDiv = <div></div>;
    newDiv.style.height = this.canvasDimensions.height * 0.33 + "px";
    newDiv.style.width =  this.canvasDimensions.width * 0.45 + "px";
    newDiv.style.border = "1px solid black";
    newDiv.style.margin = "0 auto";
    
    this.containers[level].style.width = this.canvasDimensions.width * 0.50 * (this.panes[level].length + 1) + "px";
    this.containers[level].appendChild(newDiv);

    let data;
    if (this.isEmptyObject(parent)) {
      data = this.initialData;
    } else {
      data = parent.getData();
    }

    let pane = new Pane(newDiv, this.pointWidth, data, this.colorMap);
    pane.setDiagram(this);

    if (!this.isEmptyObject(parent)) {
      pane.setParent(parent);
      parent.addChild(pane);
      parent.updateChildren();
      console.log(jsPlumb);
      jsPlumb.jsPlumb.connect({
        source: parent.getDiv(),
        target: pane.getDiv(),
        endpoint:"Rectangle"
      });
    }

    this.panes[level].push(pane);
    
  }

  removePane(pane) {
    let index = this.getIndexOfPane(pane);
    this.containers[index].removeChild(pane.getDiv());
    this.panes[index].splice(this.panes[index].indexOf(pane), 1);
    if (this.panes[index].length == 0) {
      this.panes.splice(index, 1);
      this.div.removeChild(this.containers[index]);
      this.containers.splice(index, 1);
    }
    if (this.panes.length == 0) this.div.appendChild(this.addButton);
  }

  getColorMap() {
    return this.colorMap
  }
  
  getIndexOfPane(pane){
    for (let i = 0; i < this.panes.length; i++){
        if (this.panes[i].includes(pane)) return i;
    }
    return -1;
  }

  isEmptyObject(obj){
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}