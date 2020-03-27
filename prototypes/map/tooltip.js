import d3 from "src/external/d3.v5.js"

class Tooltip {
  
  constructor(div) {
    this.div = div
    this.visible = false
  }
  
  setText(text) {
    d3.select(this.div).html(text)
  }
  
  show() {
    this.visible = true
    d3.select(this.div).style("visibility", "visible")
  }
  
  hide() {
    this.visible = false
    d3.select(this.div).style("visibility", "hidden")
  }
}

export class DistrictTooltip extends Tooltip {
  showDistrictInformation(district) {
    let regionName = district.properties.REGION
    let districtName = district.properties.DISTRICT
    this.setText("Region: " + regionName + "<br/>" + "District: " + districtName + "<br>")// + "Individuals: " + amount
    this.show()
  }
}

export class IndividualTooltip extends Tooltip {
  showIndividualInformation(individual) {
    this.setText("<b> Selected individual </b>" + "<br/>" +  
            "<b> age: </b>" + individual.age + "<br/>" +  
            "<b> gender: </b>" + individual.gender + "<br/>" + 
            "<b> district: </b>" + individual.district + "<br/>" + 
            "<b> region: </b>" + individual.region + "<br/>" + 
            "<b> state: </b>" + individual.state + "<br/>" + 
            "<b> zone: </b>" + individual.zone + "<br/>" +
            "<b> themes: </b>" + individual.themes.join(', ') + "<br/>" +
            "<b> message s04e02: </b>" + individual.rqa_s04e02_raw + "<br/>" + 
            "<b> message s04e01: </b>" + individual.rqa_s04e01_raw)
    this.show()
  }
}