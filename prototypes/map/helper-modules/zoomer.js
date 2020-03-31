import d3 from "src/external/d3.v5.js"
import { throttle } from "utils";

export class Zoomer {
  
  constructor(masterCanvas, slaveCanvases) {
    this.masterCanvas = masterCanvas
    this.slaveCanvases = slaveCanvases
    this.zoom = d3.zoom()
      .scaleExtent([0.2, 10])
      //.translateExtent([[0, 0], [5000, 5000]])
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
          //this.updateTranslateExtent(null)
          let eventTransform = d3.event.transform
          
          // console.log(eventTransform)
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
      //.call(this.zoom.scaleBy, 0.1, [0,0])
      .call(this.zoom.transform, d3.zoomIdentity.scale(0.2))
    
    this.lastZoomEvent = Date.now()
  }
  
  updateTranslateExtent(transform) {
    // const margin = 200
    console.log(d3.event.transform)
    const worldTopLeft = [0, 0]
    const worldBottomRight = [
      this.masterCanvas.canvas.width *10, // d3.event.transform.k,
      this.masterCanvas.canvas.height *10 // d3.event.transform.k
    ]
    console.log(worldTopLeft, worldBottomRight)
    this.zoom.translateExtent([worldTopLeft, worldBottomRight])
  }
}