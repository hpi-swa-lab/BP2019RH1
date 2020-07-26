class IndividualCanvas {
  
  constructor(canvas, individuals, pointSize) {
    this.canvas = canvas
    this.transform = {"k": 1, "x": 0, "y": 0}
    this.scale = 1
    this.individuals = individuals
    this.pointSize = pointSize
    this.constPointSize = this.pointSize
    this.context = canvas.getContext("2d")
  }
  
  setIndividuals(individuals) {
    this.individuals = individuals
  }
  
  updateScale(scale) {
    this.scale = scale
    this.updatePointSize()
  }
  
  updateTransform(transform) {
    this.transform = transform
  }
  
  updatePointSize() {
    let threshold = 200
    // maybe use transform.invert for smaller scales?
    if (this.scale < (this.constPointSize + threshold)) {
      this.pointSize = this.constPointSize / this.scale
    } else if ((this.constPointSize + threshold) <= this.scale) {
      this.pointSize = this.constPointSize / (this.constPointSize + threshold)
    }
  }
  
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  draw() {
    this.context.save()
    this.clear()
    this.context.translate(this.transform.x, this.transform.y)
    this.context.scale(this.scale, this.scale)
    this.drawIndividuals()
    this.context.restore()
  }
  
  drawIndividuals() {
    this.individuals.forEach((individual) => {
      this.drawPixel(individual)
    })
  }
  
  drawIndividualsStroked() {
    this.individuals.forEach((individual) => {
      this.drawPixelStroked(individual)
    })
  }
  
  drawPixel(individual) {
    let color = this.getColor(individual)
    let r = color.r
    let g = color.g
    let b = color.b
    let opacity = color.opacity
    let x = individual.drawing.position.x
    let y = individual.drawing.position.y
    
    this.context.beginPath()
    this.context.arc(x, y, this.pointSize/2, 0, 2 * Math.PI)
    this.context.fillStyle = "rgba("+ r +","+ g +","+ b +","+ opacity +")"
    this.context.fill()
  }
  
  drawPixelStroked(individual) {
    let color = this.getColor(individual)
    let r = color.r
    let g = color.g
    let b = color.b
    let opacity = color.opacity
    let x = individual.drawing.position.x
    let y = individual.drawing.position.y
    
    this.context.beginPath()
    this.context.arc(x, y, this.pointSize/2, 0, 2 * Math.PI)
    this.context.strokeStyle = "rgba("+ r +","+ g +","+ b +","+ opacity +")"
    this.context.stroke()
  }
  
}

export class DefaultColoredCanvas extends IndividualCanvas {
  
  getColor(individual) {
    return individual.drawing.currentColor
  }
  
}

export class UniqueColoredCanvas extends IndividualCanvas {

  getColor(individual) {
    return individual.drawing.identifyingColor
  }
  
}