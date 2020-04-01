export class GroupingMenu {
  
  constructor(grouper, attributes) {
    this.grouper = grouper;
    this.attributes = attributes;
    this.currentGroupings = [];
  }
  
  initGroupingSelectBox(containerElement, world, addGrouping, removeGrouping) {
    let selectContainer = <div></div>
    let groupingBar = <div></div>
    this.containerElement = containerElement;
    selectContainer.id = "selectContainer"
    groupingBar.id = "filter-bar"
    this.world = world;
    
    containerElement.appendChild(selectContainer)
    containerElement.appendChild(groupingBar)
    
    
    let uniqueValues = this.attributes;
    let textElement = <div></div>
    let selectElement = <select></select>
    let buttonElement = <button>Group</button>

    uniqueValues.sort()

    selectElement.id = "group-select"
    buttonElement.id = "group-button"
    textElement.innerHTML =  "Group 6: "

    for (let value of uniqueValues) {
      selectElement.options[selectElement.options.length] = new Option(value)
    }

    selectContainer.appendChild(textElement)
    selectContainer.appendChild(selectElement)
    selectContainer.appendChild(buttonElement)
    
    let menu = this;

    buttonElement.addEventListener("click", () => {

      let value = selectElement.options[selectElement.selectedIndex].value
      if (!this.currentGroupings.includes(value)) {
        menu.addGroupingLegendAndRemoveGroupingButton(value, groupingBar, removeGrouping)
        menu.grouper.addGrouping(value);
      }
      

    })
  }
  
  addGroupingLegendAndRemoveGroupingButton(value, groupingBar, removeGrouping) {
    
    this.removeCurrentLegend();
        
    let groupingLegend = this.generateGroupingLegend(value)
    let removeGroupingButton = this.generateRemoveGroupingButton(value, groupingBar, removeGrouping, groupingLegend);
    this.disablePreviousRemoveGroupingButton();
    this.currentGroupings.push(value);
    
    groupingBar.appendChild(removeGroupingButton);
    this.containerElement.appendChild(groupingLegend);
  }
  
  removeCurrentLegend(){
    try {
      let currentLegend = lively.query(this.world, "#legend");
      currentLegend.parentElement.removeChild(currentLegend);
    } catch(e) {
      console.log(e);
    }
    
  }
  
  generateRemoveGroupingButton(value, groupingBar, removeGrouping, groupingLegend){
    let removeGroupingButton = <button></button>;
    removeGroupingButton.innerHTML = "Grouping: " + value;
    removeGroupingButton.setAttribute("value", value);
    removeGroupingButton.id = value;
    
    removeGroupingButton.addEventListener("click", () => {
      
      let clickedGroupingKey = removeGroupingButton.getAttribute("value");
      this.currentGroupings= this.currentGroupings
        .filter(groupingKey => groupingKey != clickedGroupingKey);
      this.grouper.removeGrouping(clickedGroupingKey);
      groupingBar.removeChild(removeGroupingButton);
      this.containerElement.removeChild(groupingLegend);
      this.addLegendFromLastGrouping();  
      this.enableLastRemoveGroupingButton();
    });
    
    return removeGroupingButton;
    
  }
  
  addLegendFromLastGrouping(){
      this.containerElement.appendChild(
        this.generateGroupingLegend(this.currentGroupings[this.currentGroupings.length - 1]));
  }  
  
  generateGroupingLegend(key){
    let uniqueValuesForKey = this.grouper.getUniqueValuesForKey(key);
    let groupingLegendTable = <tabel></tabel>;
    groupingLegendTable.id = "legend";
        
    uniqueValuesForKey.forEach((value) => {
      let tableRow = <th></th>;
      let valueTableCell = <td>{value}</td>;
      let d3Color = this.grouper.groupingLayouter.getColorForValue(value);
      valueTableCell.style.backgroundColor = this.getRGBValueFromD3Color(d3Color);
      valueTableCell.style.padding = "5px";

      tableRow.appendChild(valueTableCell);
      groupingLegendTable.appendChild(tableRow);
    });
    
    return groupingLegendTable;
    
    
  }
  
  getRGBValueFromD3Color(d3Color){
    return `#${d3Color["r"].toString(16)}${d3Color["g"].toString(16)}${d3Color["b"].toString(16)}`;
  }
  
  getFilteredData(points) {
    return points.filter(this.activeFilterExpr)
  }
  
  disablePreviousRemoveGroupingButton(){
    if(this.currentGroupings.length >= 1) {
      let removeGroupingButton = this.getLastButtonOfButtonBar();
      removeGroupingButton.disabled = true;
    }
  }
  
  enableLastRemoveGroupingButton(){
    if(this.currentGroupings.length >= 1) {
      let removeGroupingButton =  this.getLastButtonOfButtonBar();
      removeGroupingButton.disabled = false;
    }
  }
  
  getLastButtonOfButtonBar() {
    let previousGroupingKey = this.currentGroupings.slice(-1)[0];
    let removeGroupingButton = lively.query(this.world, `#${previousGroupingKey}`);
    return removeGroupingButton;
  }
  
}
