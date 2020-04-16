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
    this.container = container
    
    this.addZoomToMaster()
  }
  
  addZoomToMaster() {
    d3.select(this.masterCanvas.canvas)
      .call(this.zoom.on("zoom", () => {
        let newZoomEvent = Date.now()
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
    
    lively.removeEventListener("bpmapzoomer", this.container, "extent-changed")
    lively.addEventListener("bpmapzoomer", this.container, "extent-changed", () => {
      this.updateExtent()
    })
  }
  
  updateExtent() {
    let worldExtent = this.canvasWindow.getBoundingClientRect()
    this.zoom.extent([[0,0], [worldExtent.width, worldExtent.height]])
    let minimumScale
    if (worldExtent.width < worldExtent.height) {
      minimumScale = worldExtent.width / 5000
    } else {
      minimumScale = worldExtent.height / 5000
    }
    if (minimumScale === 0) {
      return
    }
    this.zoom.scaleExtent([minimumScale , 10])
    // Request from Robin: keep the scale relative to the scale before and the center in the middle, so that when zoomed in and resizing, it does not jump back out
    d3.select(this.masterCanvas.canvas).call(this.zoom.scaleTo, minimumScale)
  }
}