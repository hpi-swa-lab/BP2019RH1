import d3 from "src/external/d3.v5.js"
import { throttle } from "utils";

export class Zoomer {
  
  constructor(masterCanvas, slaveCanvases) {
    this.masterCanvas = masterCanvas
    this.slaveCanvases = slaveCanvases
    this.zoom = d3.zoom()
      .scaleExtent([0.2, 10])
      .extent([[0,0], [1000, 1000]])
      .translateExtent([[0, 0], [5000, 5000]])
    this.lastZoomEvent = 0
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
          this.masterCanvas.updateTransform(eventTransform);
          this.masterCanvas.updateScale(eventTransform.k);
          this.masterCanvas.draw()
          this.slaveCanvases.forEach(canvas => {
            canvas.updateTransform(eventTransform)
            canvas.updateScale(eventTransform.k)
            canvas.draw()
          })
        }
      }))
      .call(this.zoom.transform, d3.zoomIdentity.scale(0.2))
    
    this.lastZoomEvent = Date.now()
  }
}