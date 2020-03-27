export class MapCanvas {
  
  constructor(world, canvas, geoData, projection) {
    this.canvas = canvas
    this.transform = null
    this.scale = 1
    this.world = world
    this.geoData = geoData
    this.context = canvas.getContext("2d")
    this.projection = projection
  }
  
  updateScale(scale){
    this.scale = scale;
  }
  
  updateTransform(transform){
    this.transform = transform;
  }
  
  registerZoom() {
    // this.zoomer = new Zoomer(this);
  }
  
  drawMap() {
    let i = this.geoData.length
    while(i--){
      let fill = this.getFillColor(this.geoData[i].properties.DISTRICT) 
      this.drawPolygon(this.geoData[i], fill)
    }
  }
  
  drawPolygon(feature, fill) {
    let coordinates = feature.geometry.coordinates
    this.context.fillStyle = fill
    this.context.strokeStyle = "black"
    this.context.beginPath()

    coordinates.forEach((rings) => {
      rings.forEach((ring) => {
        ring.forEach((coord, i) => {
          let projected = this.projection( coord );
          if (i == 0) {
            this.context.moveTo(projected[0], projected[1])
          } else {
            this.context.lineTo(projected[0], projected[1])
          }
        })
      })
    })

    this.context.stroke()
    this.context.closePath()
    this.context.fill()
  }
  
}

export class DefaultColoredMap extends MapCanvas {
  
  getFillColor() {
    return "white"
  }
  
}

export class UniqueColoredMap extends MapCanvas {
  
  start() {
    this.colorToDistrict = {}
    this.districtToColor = {}
    let i = this.geoData.length
    while(i--){
      let r = parseInt((i + 1) / 256)
      let g = (i + 1) % 256
      this.colorToDistrict["rgb(" + r + "," + g + ",0)"] = this.geoData[i]
      this.districtToColor[this.geoData[i].properties.DISTRICT] = "rgb(" + r + "," + g + ",0)"
    }
  }
  
  getFillColor(districtName) {
    return this.districtToColor[districtName]
  }
  
}