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
  
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export class SomaliaDistrictTooltip extends Tooltip {
  showDistrictInformation(district, population, themes, totalThemeAmount, districtThemeAmount, uniformDistributedSample) {
    let regionName = district.properties.REGION
    let districtName = district.properties.DISTRICT
      
    if (!themes) {
      this.setText("<b>Region: </b>" + regionName + "<br/>" + "<b>District: </b>" + districtName + "<br>" + "<b>Individuals: </b>" + population)
    } else { 
      this.setText("<b>Region: </b>" + regionName + "<br/>" + 
                   "<b>District: </b>" + districtName + "<br/>" + 
                   "<b>Individuals: </b>" + population + "<br/>" + "<br/>" + 
                   totalThemeAmount + " individuals talk about " + themes.join(", ") + "." + "<br/>" + "<br/>" + 
                   districtThemeAmount + " individuals talk about " + themes.join(", ") + " in " + districtName + "." + "<br/>" + "<br/>" + 
                   uniformDistributedSample + " individuals should be talking about " + themes.join(", ") + " in " + districtName + " assuming an uniform distribution sample.")
    }
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
            "<b> themes: </b>" + individual.themes.join(", ") + "<br/>" +
            "<b> message s04e02: </b>" + individual.rqa_s04e02_raw + "<br/>" + 
            "<b> message s04e01: </b>" + individual.rqa_s04e01_raw)
  }
}

export class KenyaDistrictTooltip extends Tooltip {
  showDistrictInformation(county, population, themes, totalThemeAmount, countyThemeAmount, uniformDistributedSample) {
    let countyName = county.properties.COUNTY_NAM.toLowerCase()
    countyName = this.capitalizeFirstLetter(countyName)
    
    if (!themes) {
      this.setText("<b>County: </b>" + countyName + "<br/>" + "<b>Individuals: </b>" + population)
    } else { 
      this.setText("<b>County: </b>" + countyName + "<br/>" + 
                   "<b>Individuals: </b>" + population + "<br/>" + "<br/>" + 
                   totalThemeAmount + " individuals talk about " + themes.join(", ") + "." + "<br/>" + "<br/>" + 
                   countyThemeAmount + " individuals talk about " + themes.join(", ") + " in " + countyName + "." + "<br/>" + "<br/>" + 
                   uniformDistributedSample + " individuals should be talking about " + themes.join(", ") + " in " + countyName + " assuming an uniform distribution sample.")
    }
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