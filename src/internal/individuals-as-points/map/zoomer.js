import d3 from "src/external/d3.v5.js"

export class Zoomer {
  
  constructor(masterCanvas, slaveCanvases, canvasWindow, container) {
    this.masterCanvas = masterCanvas
    this.slaveCanvases = slaveCanvases
    this.zoom = d3.zoom()
      .scaleExtent([0.15, 10])
      .extent([[0,0], [1000, 1000]])
      .translateExtent([[0, 0], [5000, 5000]])
    this.lastZoomEvent = 0
    this.canvasWindow = canvasWindow
    this.container = container // not needed anymore
    this.currentZoomLevel = this.zoom.scaleExtent()[0]
    
    this.addZoomToMaster()
  }
  
  addZoomToMaster() {
    d3.select(this.masterCanvas.canvas)
      .call(this.zoom.on("zoom", () => {
        let newZoomEvent = Date.now()
        this.currentZoomLevel = d3.event.transform.k
        if (newZoomEvent - this.lastZoomEvent < 100) {
          return
        } else {
          this.lastZoomEvent = newZoomEvent
          let eventTransform = d3.event.transform
          this.masterCanvas.updateTransform(eventTransform)
          this.masterCanvas.updateScale(eventTransform.k)
          this.masterCanvas.draw()
          this.slaveCanvases.forEach(canvas => {
            canvas.updateTransform(eventTransform)
            canvas.updateScale(eventTransform.k)
            canvas.draw()
          })
        }
      }))
  }
  
  updateZoom() {
    let worldExtent = lively.getExtent(this.canvasWindow)
    let width = worldExtent.x
    let height = worldExtent.y
    this.zoom.extent([[0,0], [width, height]])
    let zoomRatio = this.currentZoomLevel / this.zoom.scaleExtent()[0]
    let minimumScale
    if (width < height) {
      minimumScale = width / 5000
    } else {
      minimumScale = height / 5000
    }
    if (minimumScale === 0) {
      // just a failsafe, because scaling to scale 0 breaks the d3.event.transform to {0, NaN, NaN}
      return
    }
    this.zoom.scaleExtent([minimumScale , 10])
    
    let newZoomLevel = zoomRatio * minimumScale
    
    d3.select(this.masterCanvas.canvas).call(this.zoom.scaleTo, newZoomLevel)
  }
}