import { Pane } from "./pane.js";
import jsPlumb from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/npm-modules/jsplumb.js";
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js";

export class Diagram {
  constructor(div, pointWidth) {
    this.div = div;
    this.div.style.position = "absolute";
    this.controlPanel = {}
    this.diagramContainer = {};
    this.pointWidth = pointWidth;
    this.initialData = {};
    this.colorMap = {};
    this.canvasDimensions = {};
    this.panes = [];
    this.containers = [];
    this.addButton = <button>Add Pane</button>;
    this.inputPaneSize = <div></div>;
    this.dataSets = ["Somalia", "Covid19-2020-03-24"]
    this.dataSetSelect = <select></select>;
    this.initialize();
  }

  initialize() {
    this.div.style.overflow = "auto";
    this.controlPanel = <div></div>;
    this.controlPanel.style.border = "1px solid black";
    this.controlPanel.style.width = "100%";
    this.controlPanel.style.height = this.div.getBoundingClientRect().height * 0.09 + "px";
    
    this.jsPlumb = jsPlumb.jsPlumb.getInstance();
    this.jsPlumb.setContainer(this.div);
    
    this.jsPlumb.importDefaults({
      Connector : [ "Bezier", { curviness: 1 } ],
      Anchors : [ "BottomCenter", "TopCenter"]
    });

    this.canvasDimensions = {
      "width": this.div.getBoundingClientRect().width,
      "height": this.div.getBoundingClientRect().height
    };

    this.div.appendChild(<br></br>);
    this.div.appendChild(this.controlPanel);
    
    this.diagramContainer = <div></div>;
    this.diagramContainer.id = "diagramContainer"
    this.diagramContainer.style.display = "flex";
    this.diagramContainer.style.flexDirection = "row";
    this.diagramContainer.style.height = "auto";
    this.div.appendChild(this.diagramContainer);
    
    this.labelPaneWidth =  <label for="paneWidth">Pane width:</label>;
    this.inputPaneWidth = <input type="number" id="paneWidth" name="paneWidth" value="640"></input>;
    this.labelPaneHeight =  <label for="paneHeight">Pane height:</label>;
    this.inputPaneHeight = <input type="number" id="paneHeight" name="paneHeight" value="320"></input>;
    
    this.applyNewSizeButton = <button>Apply</button>;
    this.applyNewSizeButton.addEventListener("click", () => this.applyNewPaneSize());
    
    this.inputPaneSize.appendChild(this.labelPaneWidth);
    this.inputPaneSize.appendChild(this.inputPaneWidth);
    this.inputPaneSize.appendChild(this.labelPaneHeight);
    this.inputPaneSize.appendChild(this.inputPaneHeight);
    this.inputPaneSize.appendChild(this.applyNewSizeButton)
    
    this.controlPanel.appendChild(this.inputPaneSize);
    
    this.dataSets.forEach(dataSet => {
      this.dataSetSelect.options[this.dataSetSelect.options.length] = new Option(dataSet)
    })
    this.dataSetSelect.addEventListener("change", async () => {
      await this.changeDataSet(this.dataSetSelect.options[this.dataSetSelect.selectedIndex].value)
    })
    this.controlPanel.appendChild(this.dataSetSelect)
    
    this.addButton.style.margin = "0 auto";
    this.addButton.style.display = "table";
    this.addButton.addEventListener("click", () => {
      this.addNewPane();
    });
    
    this.controlPanel.appendChild(this.addButton);
    
    this.dataSetSelect.dispatchEvent(new Event("change"))
  }
  
  applyNewPaneSize() {
    let newWidth = this.inputPaneWidth.value + "px";
    let newHeight = this.inputPaneHeight.value + "px";
    this.panes.forEach(pane => {
      pane.updateSize(newWidth, newHeight)
      pane.setData(this.initialData)
      pane.runSelectedAction()
    });
    this.redrawConnections()
  }
  
  async changeDataSet(setName) {
    let newData;
    let newColorMap;
    
    switch(setName) {
      case "Somalia":
        newData = await AVFParser.loadCompressedIndividualsAnsweredThemes("OCHA")
        newColorMap = await AVFParser.getOchaColorMap()
        break;
      case "Covid19-2020-03-24":
        newData = await AVFParser.rebuildAndLoadCovidDataFlatThemes("2020-03-24")
        newColorMap = await AVFParser.getCoronaColorMap()
        break;
    }
    
    this.setColorMap(newColorMap)
    this.setData(newData)
    this.refreshAttributes()
    this.runActions()
  }
  
  refreshAttributes() {
    this.panes.forEach(pane => {
      pane.refreshAttributeSelectOptionsRecursively()
    })
  }
  
  runActions() {
    this.panes.forEach(pane => {
      pane.runSelectedAction()
    })
  }
  
  setData(newData) {
    this.initialData = newData

    this.panes.forEach(pane => {
      pane.setDataRecursively(newData)
    })
  }
  
  setColorMap(newColorMap) {
    this.colorMap = newColorMap
    
    this.panes.forEach(pane => {
      pane.setColorMap(newColorMap)
    })
  }

  addNewPane() {    
    let newDiv = <div></div>;
    newDiv.style.height = "auto";
    newDiv.style.width =  "auto";
    newDiv.style.margin = "0 auto";
    newDiv.style.display = "flex";
    newDiv.style.flexDirection = "row";
    newDiv.style.justifyContent = "center";
    newDiv.style.flexWrap = "wrap";

    let pane = new Pane(newDiv, this.pointWidth, this.initialData, this.colorMap, this.inputPaneWidth.value + "px", this.inputPaneHeight.value + "px");
    
    this.addPane(pane)
  }
  
  addConnection(parent, child) {
    let connection = this.jsPlumb.connect({
      source: parent.getDiv(),
      target: child.getDiv(),
      endpoint:[ "Dot", { radius: 5}]
    });
    child.setParentConnection(connection);
  }
  
  removeConnection(connection) {
    this.jsPlumb.deleteConnection(connection)
  }
  
  redrawConnections() {
    this.jsPlumb.repaintEverything();
  }
  
  addPane(pane) {
    pane.setDiagram(this)
    this.panes.push(pane)
    this.diagramContainer.appendChild(pane.getContainer())
  }

  removePane(pane) {
    this.panes.splice(this.panes.indexOf(pane), 1)
    this.diagramContainer.removeChild(pane.getContainer())
  }

  getColorMap() {
    return this.colorMap
  }

  isEmptyObject(obj){
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}