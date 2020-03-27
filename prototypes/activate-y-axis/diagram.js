import d3 from "src/external/d3.v5.js"

export class Diagram {
  
  constructor(div, inspector, data, pointWidth, animationDuration) {
    this.div = div
    this.margin = {}
    this.canvasDimensions = {}
    this.canvas = {}
    this.svgChart = {}
    this.scales = {}
    this.axes = {}
    this.g_axes = {}
    this.inspector = inspector
    this.axisAttributes = {}
    this.data = data
    this.uniqueColors = {}
    this.pointWidth = pointWidth
    this.animationDuration = animationDuration
    
    this.initialize()
  }
  
  initialize() {
    this.margin = {
      "top": 20, 
      "right": 15, 
      "bottom": 100, 
      "left": 70
    }
    this.canvasDimensions = {
      "width": this.div.getBoundingClientRect().width - this.margin.left - this.margin.right,
      "height": this.div.getBoundingClientRect().height - this.margin.top - this.margin.bottom
    }
    this.canvas = d3.select(this.div).append("canvas")
      .attr('width', this.canvasDimensions.width)
      .attr('height', this.canvasDimensions.height)
      .style('margin-left', this.margin.left + 'px')
      .style('margin-top', this.margin.top + 'px')
      .attr('class', 'canvas-plot');
    this.svgChart = d3.select(this.div).append('svg')
      .attr('width', this.div.getBoundingClientRect().width)
      .attr('height', this.div.getBoundingClientRect().height)
      .attr('class', 'svg-plot')
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.scales = {
      "x": d3.scaleBand().domain([]).range([0, this.canvasDimensions.width]),
      "y": d3.scaleBand().domain([]).range([this.canvasDimensions.height, 0])
    }
    this.axes = {
      "x": d3.axisBottom(this.scales.x),
      "y": d3.axisLeft(this.scales.y)
    }
    this.g_axes = {
      "x": this.svgChart.append('g').attr('transform', `translate(0, ${this.canvasDimensions.height})`).call(this.axes.x),
      "y": this.svgChart.append('g').call(this.axes.y)
    }
    this.axisAttributes = {
      "x": "random",
      "y": "random"
    }
    for (let index = 0; index < this.data.length; index++) {
      this.initializeIndividual(this.data[index], index)
    }
    this.setColorByAttribute("index")
    this.identifyingImageData = this.getIdentifyingImageData()
    this.inspector.inspect({})
    this.drawCanvasWithColorSelector("currentColor")
  }

  setNewAttributeToAxis(axis, attribute, scaleMode="total amount") {
    this.copyDrawingInformation("currentPosition", "startPosition")

    if (attribute === "random") {
      this.setAxisDomainToRandom(axis)
    } else if (attribute === "amount") {
      this.setAxisDomainToAmount(axis, scaleMode)
    } else {
      this.setAxisDomainByAttribute(axis, attribute)
    }

    this.axisAttributes[axis] = attribute
    this.identifyingImageData = this.getIdentifyingImageData()
  }

  setAxisDomainToRandom(axis) {
    this.renderAxisWithDomain(axis, [])
    this.data.forEach(individual => {
      individual.drawing.targetPosition[axis] = this.getRandomInteger(0, axis === "x" ? this.canvasDimensions.width : this.canvasDimensions.height)
    })
  }

  setAxisDomainToAmount(axis, scaleMode="total amount") {
    let otherAxisAttribute = this.axisAttributes[axis === "x" ? "y" : "x"]
    if (otherAxisAttribute === "random" || otherAxisAttribute === "amount") {
      return;
    }
    
    let otherAxisDomain = this.getValuesOfAttribute(otherAxisAttribute)
    let amountsByDomain = this.getAmountsOfAttributeValues(otherAxisAttribute, otherAxisDomain)
    
    let baseValue = 0
    let axisDomain = []
    let maximumAmount = this.getMaximum(amountsByDomain)
    if (scaleMode === "total amount") {    
      axisDomain = [0, this.data.length]
      baseValue = this.data.length
    } else if (scaleMode === "maximum amount") {
      axisDomain = [0, maximumAmount]
      baseValue = maximumAmount
    }
    
    this.changeAxisScaleTypeTo(axis, "linear", axisDomain, this.getRangeForAxis(axis))
    this.renderAxisWithDomain(axis, axisDomain)

    this.data.forEach(individual => {
      if (axis === "x") {
        let pixelAmount = Math.floor((this.canvasDimensions.width / baseValue) * amountsByDomain[individual[otherAxisAttribute]])
        individual.drawing.targetPosition[axis] = this.getRandomInteger(0, pixelAmount)
      } else {
        let pixelAmount = Math.floor((this.canvasDimensions.height / baseValue) * amountsByDomain[individual[otherAxisAttribute]])
        individual.drawing.targetPosition[axis] = this.getRandomInteger(this.canvasDimensions.height - pixelAmount, this.canvasDimensions.height)
      }
    })
  }

  getMaximum(domainAmountMap) {
    let maximum = -1
    Object.keys(domainAmountMap).forEach(key => {
      if (domainAmountMap[key] > maximum) {
        maximum = domainAmountMap[key]
      }
    }) 
    return maximum
  }
  
  setAxisDomainByAttribute(axis, attribute) {
    let domain = this.getValuesOfAttribute(attribute)
    this.changeAxisScaleTypeTo(axis, "band", domain, this.getRangeForAxis(axis))
    this.renderAxisWithDomain(axis, domain)
    
    if (axis === "y") {
      domain.reverse()
    }
    
    this.data.forEach(individual => {
      individual.drawing.targetPosition[axis] = this.getPositionOnAxisByAttribute(axis, individual, attribute, domain)
    })
  }

  getRangeForAxis(axis) {
    if (axis === "x") {
      return [0, this.canvasDimensions.width]
    } else {
      return [this.canvasDimensions.height, 0]
    }
  }

  changeAxisScaleTypeTo(axis, scaleType, domain, range) {
    if (scaleType === "linear") {
      this.scales[axis] = d3.scaleLinear()
    } else if (scaleType === "band") {
      this.scales[axis] = d3.scaleBand() 
    }

    this.scales[axis].domain(domain).range(range)
    this.axes[axis].scale(this.scales[axis])
  }

  renderAxisWithDomain(axis, domain) {
    if (axis === "x") {
      this.scales[axis].domain(domain)
      this.g_axes[axis]
        .call(this.axes[axis])
        .selectAll("text")
          .attr("transform", "translate(-10, 5)rotate(-45)")
          .style("text-anchor", "end")
    } else {
      this.scales[axis].domain(domain)
      this.g_axes[axis]
        .call(this.axes[axis])
    }
  }

  setColorByAttribute(attribute) {
    let domain = this.getValuesOfAttribute(attribute)
    let colors = []
    domain.forEach(() => {
      colors.push(this.getUniqueColor(colors))
    })
    let domainColorMap = {}
    for (let i = 0; i < domain.length; i++) {
      domainColorMap[domain[i]] = colors[i] 
    }
    this.data.forEach((individual) => {
      individual.drawing.defaultColor = domainColorMap[individual[attribute]]
      individual.drawing.currentColor = individual.drawing.defaultColor
    })
    this.drawCanvasWithColorSelector("currentColor")
  }
  
  getClickedIndividual(event) {
    let position = this.getCursorPosition(event)
    let color = this.getColorAtPosition(position.x, position.y)
    let individualIndex = this.uniqueColors[color]
    return this.data[individualIndex]
  }

  highlightIndividual(individual) {
    this.setCurrentColorOfAllIndividuals("lightgrey")
    this.setCurrentColorOfIndividual(individual, "red")
    this.inspector.inspect(individual)
    this.drawCanvasWithColorSelector("currentColor")
  }
  
  resetHighlighting() {
    this.copyDrawingInformation("defaultColor", "currentColor")
    this.inspector.inspect({})
    this.drawCanvasWithColorSelector("currentColor")
  }
  
  animate() {
    const ease = d3.easeSinIn
    let timer = d3.timer((elapsed) => {
      const t = Math.min(1, ease(elapsed / this.animationDuration))
      this.data.forEach(individual => {
        individual.drawing.currentPosition.x = individual.drawing.startPosition.x * (1 - t) + individual.drawing.targetPosition.x * t
        individual.drawing.currentPosition.y = individual.drawing.startPosition.y * (1 - t) + individual.drawing.targetPosition.y * t
      })
      this.drawCanvasWithColorSelector("currentColor")
      if (t === 1) {
        timer.stop()
      }
    })
  }

  getIdentifyingImageData() {
    this.copyDrawingInformation("targetPosition", "currentPosition")
    this.drawCanvasWithColorSelector("uniqueColor")
    
    const context = this.canvas.node().getContext("2d")
    let imageData = context.getImageData(0, 0, this.canvasDimensions.width, this.canvasDimensions.height)
    
    this.copyDrawingInformation("startPosition", "currentPosition")
    this.drawCanvasWithColorSelector("currentColor")
    
    return imageData
  }

  getColorAtPosition(x, y) {
    let startPosition = (y * this.identifyingImageData.width + x) * 4
    let r = this.identifyingImageData.data[startPosition]
    let g = this.identifyingImageData.data[startPosition+1]
    let b = this.identifyingImageData.data[startPosition+2]
    let a = this.identifyingImageData.data[startPosition+3]
    let color = this.argbToRGB((a << 24) + (r << 16) + (g << 8) + b)
    return color
  }

  setCurrentColorOfAllIndividuals(color) {
    this.data.forEach((individual) => {
      this.setCurrentColorOfIndividual(individual, color)
    })
  }
  
  setCurrentColorOfIndividual(individual, color) {
    individual.drawing.currentColor = color
  }

  copyDrawingInformation(sourceSelector, destinationSelector) {
    this.data.forEach(individual => {
      individual.drawing[destinationSelector] = individual.drawing[sourceSelector]
    })
  }
  
  drawCanvasWithColorSelector(colorSelector) {
    const context = this.canvas.node().getContext("2d")
    context.save()
    context.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height)
    for (let i = 0; i < this.data.length; i++) {
      const drawingInformation = this.data[i].drawing
      context.fillStyle = drawingInformation[colorSelector]
      context.fillRect(
        drawingInformation.currentPosition.x,
        drawingInformation.currentPosition.y, 
        this.pointWidth, 
        this.pointWidth
      )
    }  
    context.restore()
  }

  getPositionOnAxisByAttribute(axis, individual, attribute, attributeValues) {
    let maximum = axis === "x" ? this.canvasDimensions.width : this.canvasDimensions.height
    let start = maximum / attributeValues.length * (attributeValues.indexOf(individual[attribute]))
    return this.getRandomInteger(start, start + maximum / attributeValues.length)
  }
  
  getValuesOfAttribute(attribute) {
    let attributeValues = {}
    this.data.forEach(individual => {
      attributeValues[individual[attribute]] = true
    })
    return Object.keys(attributeValues)
  }

  getAmountsOfAttributeValues(attribute, attributeValues) {
    let amountsByAttributeValue = {}
    attributeValues.forEach(value => {
      amountsByAttributeValue[value] = this.getAmountOfAttributeValue(attribute, value)
    })
    return amountsByAttributeValue
  }

  getAmountOfAttributeValue(attribute, value) {
    let amount = 0
    this.data.forEach((individual) => {
      if (individual[attribute] === value) {
        amount++
      }
    })
    return amount
  }

  initializeIndividual(individual, index) {
    individual.index = index
    individual.drawing = {}
    individual.drawing.uniqueColor = this.getUniqueColor(this.uniqueColors)
    this.uniqueColors[individual.drawing.uniqueColor] = index
    individual.drawing.defaultColor = "blue"
    individual.drawing.currentColor = individual.drawing.defaultColor
    individual.drawing.currentPosition = {
      "x": this.getRandomInteger(0, this.canvasDimensions.width), 
      "y": this.getRandomInteger(0,this.canvasDimensions.height)
    }
    individual.drawing.targetPosition = {
      "x": individual.drawing.currentPosition.x, 
      "y": individual.drawing.currentPosition.y
    }
    individual.drawing.startPosition = {
      "x": individual.drawing.currentPosition.x, 
      "y": individual.drawing.currentPosition.y
    } 
  }
  
  getCursorPosition(event) {
    const rect = this.div.getBoundingClientRect()
    const x = event.clientX - rect.left - this.margin.left
    const y = event.clientY - rect.top - this.margin.top
    return {"x": Math.floor(x), "y": Math.floor(y)}
  }
  
  getUniqueColor(colors) {
    let color = this.getRandomColor()
    while (colors[color] || color === "ffffff" || color === "000000") {
      color = this.getRandomColor()
    }
    return color
  }

  getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min
  }

  getRandomColor() {
    var letters = '0123456789abcdef'
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[this.getRandomInteger(0, 16)]
    }
    return color
  }

  argbToRGB(color) {
    return '#'+ ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);
  }
}