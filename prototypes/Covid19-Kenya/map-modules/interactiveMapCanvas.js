export class InteractiveMapCanvas {
  
  constructor(defaultColoredMap, defaultColoredCanvas, drawingCanvas) {
    this.defaultColoredMap = defaultColoredMap
    this.defaultColoredCanvas = defaultColoredCanvas
    this.canvas = drawingCanvas
    this.context = drawingCanvas.getContext("2d")
    this.transform = {"k" : 1, "x" : 0, "y": 0}
    this.scale = 1
  }
  
  draw() {
    this.context.save()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.translate(this.transform.x, this.transform.y)
    this.context.scale(this.scale, this.scale)
    this.defaultColoredMap.drawMap()
    this.defaultColoredCanvas.drawIndividuals()
    this.context.restore()
  }
  
  updateTransform(transform) {
    this.transform = transform
  }
  
  updateScale(scale) {
    this.scale = scale
    this.defaultColoredMap.updateScale(scale)
    this.defaultColoredCanvas.updateScale(scale)
  }
}