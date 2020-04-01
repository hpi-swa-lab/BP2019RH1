import { Pane } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/pane.js";
import jsPlumb from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/npm-modules/jsplumb.js";

export class Diagram {
  constructor(div, pointWidth, data, colorMap) {
    this.div = div;
    this.div.style.position = "absolute";
    this.pointWidth = pointWidth;
    this.initialData = data;
    this.colorMap = colorMap;
    this.canvasDimensions = {};
    this.panes = [];
    this.containers = [];
    this.addButton = <button>Add Pane</button>;
    this.colorMap = this.getColorMap();

    this.initialize();
  }

  initialize() {
    this.div.style.overflow = "auto";
    this.addButton.style.margin = "0 auto";
    this.addButton.style.display = "table";
    
   //completely necessary cat head css class construction
    var style = <style></style>;
    style.innerHTML = '.catHead { height: 10px; width: 10px }';
    this.div.appendChild(style);
      
    
    this.jsPlumb = jsPlumb.jsPlumb.getInstance();
    this.jsPlumb.setContainer(this.div);
    
    this.jsPlumb.importDefaults({
      Connector : [ "Flowchart" ],
      Anchors : [ "BottomCenter", "TopCenter"]
    });

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
    let index = this.getIndexOfPane(parent);
    let level = index + 1;
    
    if (this.panes.length <= level) {
      let newContainer = <div></div>;
      newContainer.style.height = this.canvasDimensions.height * 0.33 + "px";
      newContainer.style.display = "flex";
      newContainer.style.flexDirection = "row";
      
      this.div.appendChild(newContainer);
      this.div.appendChild(<br></br>);
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
      
      let connection = this.jsPlumb.connect({
        source: parent.getDiv(),
        target: pane.getDiv(),
        endpoint:[ "Dot", { radius: 5}]
      });
      pane.setParentConnection(connection);
    }

    this.panes[level].push(pane);
  }

  removePane(pane) {
    
    if (pane.getParent()) {
      this.jsPlumb.deleteConnection(pane.getParentConnection()); 
    }
    
    let index = this.getIndexOfPane(pane);
    this.containers[index].removeChild(pane.getDiv());
    this.panes[index].splice(this.panes[index].indexOf(pane), 1);
    this.containers[index].style.width = this.canvasDimensions.width * 0.50 * this.panes[index].length + "px";
    
    pane.getChildren().forEach(child =>{
        this.jsPlumb.deleteConnection(child.getParentConnection());
        if (index != 0) {
          let newConnection = this.jsPlumb.connect({
            source: pane.getParent().getDiv(),
            target: child.getDiv(),
            endpoint:[ "Dot", { radius: 5}]
          });
          child.setParentConnection(newConnection);
        }
        this.adjustLevel(child);
    })
    
    for (let i = index; i < this.containers.length; i++){
      this.panes[i].forEach(pane => this.jsPlumb.revalidate(pane.getDiv()));
    }
    
    if (this.panes[index].length == 0) {
      this.panes.splice(index, 1);
      this.div.removeChild(this.containers[index]);
      this.containers.splice(index, 1);
    }
  }

  getColorMap() {
    return this.colorMap
  }
  
  adjustLevelRecursively(pane) {
    
    if (this.getIndexOfPane(pane) == 0) {
      console.log("Cannot reduce level of pane on level 0");
      return;
    }
    this.adjustLevel(pane);
    pane.getChildren().forEach(child => this.adjustLevel(child));
  }
  
  adjustLevel(pane) {
    let oldIndex = this.getIndexOfPane(pane);
    let newIndex = oldIndex - 1;
    
    this.containers[oldIndex].removeChild(pane.getDiv());
    this.panes[oldIndex].splice(this.panes[oldIndex].indexOf(pane), 1);
    this.containers[oldIndex].style.width = this.canvasDimensions.width * 0.50 * this.panes[oldIndex].length + "px";
    
    if (this.panes[oldIndex].length == 0) {
      this.panes.splice(oldIndex, 1);
      this.div.removeChild(this.containers[oldIndex]);
      this.containers.splice(oldIndex, 1);
    }
    
    this.containers[newIndex].appendChild(pane.getDiv());
    this.panes[newIndex].push(pane);
    this.containers[newIndex].style.width = this.canvasDimensions.width * 0.50 * this.panes[newIndex].length + "px";
    
    this.jsPlumb.revalidate(pane.getDiv());
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