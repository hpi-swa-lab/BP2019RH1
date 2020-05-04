export class MapCanvas {
  
  constructor(canvas, dataHandler, projection) {
    this.canvas = canvas
    this.transform = {"k": 1, "x": 0, "y": 0}
    this.scale = 1
    this.geoData = dataHandler.geoData
    this.context = canvas.getContext("2d")
    this.projection = projection
    this.dataHandler = dataHandler
    this.lineWidth = 1
    this.constLineWidth = 1
  }
  
  updateScale(scale){
    this.scale = scale;
    this.updateLineWidth()
  }
  
  updateTransform(transform){
    this.transform = transform;
  }
  
  updateLineWidth() {
    this.lineWidth = this.constLineWidth / this.scale
  }
  
  draw() {
    this.context.save()
    this.clear()
    this.context.translate(this.transform.x, this.transform.y)
    this.context.scale(this.scale, this.scale)
    this.drawMap()
    this.context.restore()
  }
  
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  drawMap() {
    let i = this.geoData.length
    while(i--){
      let districtName = this.geoData[i].properties[this.dataHandler.locationLookupKey]
      let fill = this.getFillColor(districtName) 
      this.drawPolygon(this.geoData[i], fill)
      if (this.dataHandler.missingDataKeys.includes(districtName)) {
        this.writeText(districtName, this.dataHandler.missingDataFeatureToTextCoordinates[districtName])
      }
    }
  }
  
  writeText(districtName, coordinates) {
    let projectedCoordinates = this.projection(coordinates)
    this.context.font = "125px Arial"
    this.context.fillStyle = "black"
    let text = districtName + " data"
    this.context.fillText(text, projectedCoordinates[0], projectedCoordinates[1])
  }
  
  drawPolygon(feature, fill) {
    let coordinates = feature.geometry.coordinates
    this.context.fillStyle = fill
    this.context.strokeStyle = "black"
    this.context.lineWidth = this.lineWidth
    this.context.beginPath()
    
    // TODO: make this dynamic for all four levels
    coordinates.forEach((rings) => {
      rings.forEach((ring, i) => {
        if (Array.isArray(ring[0])) {
          ring.forEach((coord, i) => {
            this.drawLine(coord, i)
          })
        } else {
          this.drawLine(ring, i)
        }
      })
    })

    this.context.stroke()
    this.context.closePath()
    this.context.fill()
  }
  
  drawLine(coord, i) {
    let projected = this.projection( coord );
    if (i == 0) {
      this.context.moveTo(projected[0], projected[1])
    } else {
      this.context.lineTo(projected[0], projected[1])
    }
  }
  
}

export class DefaultColoredMap extends MapCanvas {
  
  getFillColor() {
    return "white"
  }
  
}

export class UniqueColoredMap extends MapCanvas {
  
  getFillColor(districtName) {
    return this.dataHandler.districtToColor[districtName]
  }
  
}