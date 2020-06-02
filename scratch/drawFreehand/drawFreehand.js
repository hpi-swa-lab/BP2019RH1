// needed to be able to call functions called with event listener with the context of FreehandDrawer and not the context of the element to which the event listener is bound
var boundDraw
var boundSetPosition
var boundSignalDrawStop

export default class FreehandDrawer {
  constructor(parentElement, canvas) {
    this.parentElement = parentElement
    this.canvas = canvas
    this.pos = { x: 0, y: 0}
    this.ctx = canvas.getContext('2d')
    this.lastLinePoints = []
    
    this.listeners = []
    
    boundDraw = this._draw.bind(this)
    boundSetPosition = this._setPosition.bind(this)
    boundSignalDrawStop = this._signalDrawStop.bind(this)
  }
  
  start() {
    this.parentElement.addEventListener('mousemove', boundDraw)
    this.parentElement.addEventListener('mousedown', boundSetPosition);
    this.parentElement.addEventListener('mouseup', boundSignalDrawStop)
  }
  
  stop() {
    this.parentElement.removeEventListener('mousemove', boundDraw)
    this.parentElement.removeEventListener('mousedown', boundSetPosition)
    this.parentElement.removeEventListener('mouseup', boundSignalDrawStop)
  }
  
  addListener(listener) {
    this.listeners.push(listener)
  }
  
  _setPosition(e) {
    this.pos.x = e.offsetX;
    this.pos.y = e.offsetY;
  }
  
  _draw(e) {
    // mouse left button must be pressed
    if (e.buttons !== 1) return

    this.ctx.beginPath() // begin

    this.ctx.lineWidth = 5
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = '#c0392b'
    
    this.ctx.moveTo(this.pos.x, this.pos.y) // from
    this.lastLinePoints.push({"x": this.pos.x, "y": this.pos.y})
    
    this._setPosition(e);
    this.ctx.lineTo(this.pos.x, this.pos.y) // to

    this.ctx.stroke() // draw it!
  }

  _signalDrawStop() {
    this.lastLinePoints.push(this.pos)
    
    this.listeners.forEach(listener => {
      listener.drawFinished(this.lastLinePoints)
    })
    
    this.lastLinePoints = []
  } 
}