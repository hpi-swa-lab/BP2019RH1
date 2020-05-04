import {Zoomer} from "./zoomer.js"
import d3 from "src/external/d3.v5.js"

class IndividualCanvas {
  
  constructor(world, canvas, individuals, pointSize) {
    this.canvas = canvas
    this.transform = {"k": 1, "x": 0, "y": 0}
    this.scale = 1
    this.individuals = individuals
    this.world = world
    this.pointSize = pointSize
    this.constPointSize = this.pointSize
    this.context = canvas.getContext("2d")
  }
  
  updateScale(scale) {
    this.scale = scale
    this.updatePointSize()
  }
  
  updateTransform(transform) {
    this.transform = transform
  }
  
  updatePointSize() {
    // maybe use transform.invert for smaller scales?
    if (this.scale < (this.constPointSize + 1)) {
      this.pointSize = this.constPointSize / this.scale
    } else if ((this.constPointSize + 1) <= this.scale) {
      this.pointSize = this.constPointSize / (this.constPointSize + 1)
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
  
  drawPixel(individual) {
    let color = this.getColor(individual)
    let r = color.r
    let g = color.g
    let b = color.b
    let a = color.a
    let x = individual.drawing.position.x
    let y = individual.drawing.position.y
    
    this.context.fillStyle = "rgba("+ r +","+ g +","+ b +","+ a +")"
    this.context.fillRect(x - (this.pointSize/2), y - (this.pointSize/2), this.pointSize, this.pointSize)
  }
  
}

export class DefaultColoredCanvas extends IndividualCanvas {
  
  getColor(individual) {
    return individual.drawing.currentColor
  }
  
}

export class UniqueColoredCanvas extends IndividualCanvas {

  getColor(individual) {
    return individual.drawing.uniqueColor
  }
  
}