import d3 from "src/external/d3.v5.js"

export class Zoomer {
  
  constructor(masterCanvas, slaveCanvases, freeHandDrawer, canvasWindow) {
    this.masterCanvas = masterCanvas
    this.slaveCanvases = slaveCanvases
    this.freeHandDrawer = freeHandDrawer
    this.maximumScale = 300
    this.originalCanvasWidth = masterCanvas.canvas.width
    this.originalCanvasHeight = masterCanvas.canvas.height
    this.zoom = d3.zoom()
      .scaleExtent([1, this.maximumScale])
      .extent([[0,0], [100, 100]])
      .translateExtent([[0, 0], [this.originalCanvasWidth, this.originalCanvasHeight]])
    this.lastZoomEvent = 0
    this.canvasWindow = canvasWindow
    this.currentZoomLevel = this.zoom.scaleExtent()[0]
    this.transform = {k:1, x:0, y:0}
  }
  
  updateZoom() {
    let canvasExtent = lively.getExtent(this.masterCanvas.canvas)
    // let worldExtent = lively.getExtent(this.canvasWindow)
    let width = canvasExtent.x
    let height = canvasExtent.y
    this.zoom.extent([[0,0], [width, height]])
    let zoomRatio = this.currentZoomLevel / this.zoom.scaleExtent()[0]
    let minimumScale
    if (width < height) {
      minimumScale = width / this.originalCanvasWidth
    } else {
      minimumScale = height / this.originalCanvasHeight
    }
    if (minimumScale === 0) {
      // just a failsafe, because scaling to scale 0 breaks the d3.event.transform to {0, NaN, NaN}
      return
    }
    this.zoom.scaleExtent([minimumScale , this.maximumScale])
    
    let newZoomLevel = zoomRatio * minimumScale
    
    d3.select(this.masterCanvas.canvas).call(this.zoom.scaleTo, newZoomLevel)
  }
  
  addZoomToMaster() {
    d3.select(this.masterCanvas.canvas)
      .call(this.zoom
            .on("zoom", () => {if (!this.shiftKeyPressed) this._onZoom()}))
    d3.select(this.masterCanvas.canvas).on("dblclick.zoom", null)
  }
  
  removeZoomFromMaster() {
    d3.select(this.masterCanvas.canvas).on("mousedown.zoom", null)
    d3.select(this.masterCanvas.canvas).on("mousemove.zoom", null)
    d3.select(this.masterCanvas.canvas).on("wheel.zoom", null)
  }
  
  _onZoom() {
    let newZoomEvent = Date.now()
    this.currentZoomLevel = d3.event.transform.k
    if (newZoomEvent - this.lastZoomEvent < 100) {
      return
    } else {
      this.lastZoomEvent = newZoomEvent
      this.transform = d3.event.transform
      this.masterCanvas.updateTransform(this.transform)
      this.masterCanvas.updateScale(this.transform.k)
      this.masterCanvas.draw()
      this.slaveCanvases.forEach(canvas => {
        canvas.updateTransform(this.transform)
        canvas.updateScale(this.transform.k)
        canvas.draw()
      })
      this.freeHandDrawer.applyTransform(this.transform)
      this.freeHandDrawer.updateStyle({lineWidth: 1/this.transform.k})
    }
  }
}