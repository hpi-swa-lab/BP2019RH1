import d3 from "src/external/d3.v5.js"

class Tooltip {
  
  constructor(div) {
    this.div = div
  }
  
  setText(text) {
    d3.select(this.div).html(text)
  }
  
  hide() {
    this.setText("")
  }
}

export class SomaliaDistrictTooltip extends Tooltip {
  showDistrictInformation(district, amount) {
    let regionName = district.properties.REGION
    let districtName = district.properties.DISTRICT
    this.setText("Region: " + regionName + "<br/>" + "District: " + districtName + "<br>" + "Individuals: " + amount)
  }
}

export class SomaliaIndividualTooltip extends Tooltip {
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
  }
}

export class KenyaDistrictTooltip extends Tooltip {
  showDistrictInformation(county, amount) {
    let countyName = county.properties.COUNTY_NAM
    this.setText("County: " + countyName + "<br/>" + "Individuals: " + amount)
  }
}

export class KenyaIndividualTooltip extends Tooltip {
  showIndividualInformation(individual) {
    this.setText("<b> Selected individual </b>" + "<br/>" +  
            "<b> age: </b>" + individual.age + "<br/>" +  
            "<b> gender: </b>" + individual.gender + "<br/>" + 
            "<b> county: </b>" + individual.county + "<br/>" + 
            "<b> constituency: </b>" + individual.constituency + "<br/>" +
            "<b> themes: </b>" + individual.themes["L1"] + " about " + individual.themes["L2"] + " including " + individual.themes["L3"].join(", ") + "<br/>")
  }
}