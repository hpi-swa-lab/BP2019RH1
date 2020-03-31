import d3 from "src/external/d3.v5.js"

export class MapHoverer {
  constructor(uniqueColoredMap, defaultColoredMap, tooltip, dataHandler) {
    this.uniqueColoredMap = uniqueColoredMap
    this.defaultColoredMap = defaultColoredMap
    this.tooltip = tooltip
    this.dataHandler = dataHandler
  }
  
  addHover() {
    d3.select(this.defaultColoredMap.canvas).on("mousemove", () => {
      let mouseX = d3.event.layerX
      let mouseY = d3.event.layerY
      let color = this.uniqueColoredMap.context.getImageData(mouseX, mouseY, 1, 1).data
      let colorKey = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
      let districtData = this.dataHandler.colorToDistrict[colorKey]

      if (districtData) {
        let districtName = this.dataHandler.getDistrictLookupName(districtData)
        let individualsGroupedByDistrict = this.dataHandler.groupIndividualsByDistrict()
        let individualsInDistrict = individualsGroupedByDistrict[districtName]
        let amount = 0
        if (individualsInDistrict) {
          amount = individualsInDistrict.length
        }
        // TODO: amount in district data 
        this.tooltip.showDistrictInformation(districtData, amount)
      } else {
        this.tooltip.hide()
      }
    })
  }
}