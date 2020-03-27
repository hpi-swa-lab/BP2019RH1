import d3 from "src/external/d3.v5.js"
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js";

export class IndividualsAsDots {
  
  static get groupingGenderCategory(){ return "GROUPING_GENDER"}
  
  
  constructor (containingDiv, width, height){
    this.svgCanvas = d3.select(containingDiv)
      .append("svg")
        .attr("width", width)
        .attr("height", height)
    
    this.height = height
    this.width = width
    
    this.toolTip = d3.select(containingDiv).append("div")	
      .attr("class", "toolTip")				
      .style("opacity", 0);
    
  }
  
  initializeRandom(){
    AVFParser.loadCompressedIndividualsWithKeysFromFile("OCHA").then((data) => {
      this.svgCanvas.selectAll("circle")
        .data(data).enter()
          .append("circle")
            .attr("fill", () => {return "grey"})
            .attr("r", 3)
            .attr("cx", () => {return this.getRndInteger(10, this.height+10)})
            .attr("cy", () => {return this.getRndInteger(10, this.width-10)})
            .on("mouseover", (d) => {
              debugger;
              this.toolTip.transition()		
                .duration(50)		
                .style("opacity", .9)
                .style("left", d3.event.pageX + "px")		
                .style("top", (d3.event.pageY - 1000) + "px");
              this.toolTip.html(this.generateToolTipInformationText(d))
            })
            .on("mouseout", () => {
              this.toolTip.transition()
                .duration(50)
                .style("opacity", 0)
            })
    })
  }
  
  
  addGrouping(groupingCategory){
    if(groupingCategory === IndividualsAsDots.groupingGenderCategory){
      this.addGroupingGender()
    }
  }
  
  addGroupingGender(){
    
  }
  
  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }
    
  generateToolTipInformationText(individualObject){
    let informationText = "Gender: <b>" + individualObject.gender + "</b></br>"
    informationText += "Age: <b>" + individualObject.age + "</b></br>"
    informationText += "Region: <b>" + individualObject.region + "</b></br></br>"
    
    let themes = []
    let individualThemes = individualObject.themes
    Object.keys(individualThemes).forEach((themeKey)=> {
      if(individualThemes[themeKey] === "1"){
        themes.push(themeKey.split("_")[2])
      }
    })
    
    let themeString = ""
    themes.forEach((theme) => {
      themeString += "<b>" + theme + "</b>" + "</br>"
    })
    
    informationText += "Themes: </br>" + themeString
    
    return informationText
    
  }
  
}


class ExploringHistory {
  
  constructor(rootData, canvasArea){
    this.rootData = rootData
    this.next = null
  }
  
  addGrouping(groupingLambda, groupCount){
    
  }
  
}



