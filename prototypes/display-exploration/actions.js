class Action {
  constructor () {
    
  }
  
  groupsData() {
    return false
  }
  
  runOn(data) {
    return data
  }
}

export class NullAction extends Action {
  constructor () {
    super()
  }
  
  setAttribute() {
    return this
  }
  
  runOn(data) {
    return data
  }
}

export class ResetAction extends Action {
  constructor() {
    super()
  }
  
  runOn(data) {
    data.forEach(element => {
      element.drawing.currentColor = element.drawing.defaultColor
      element.drawing.currentPosition.x = element.drawing.defaultPosition.x
      element.drawing.currentPosition.y = element.drawing.defaultPosition.y
    })
    return data
  }
}

export class GroupingAction extends Action {
  constructor () {
    super()
    this.attribute = {}
  }
  
  groupsData() {
    return true
  }
  
  setAttribute(attribute) {
    this.attribute = attribute
    return this
  }
  
  runOn(data) {
    if ((typeof this.attribute) === "undefined") {
      throw new Error('The grouping attribute must be set.');
    }
    
    let values = {}
    data.forEach(element => {
      values[element[this.attribute]] = true
    })
    
    let groups = {}
    Object.keys(values).forEach(key => {
      groups[key] = []
    })
    
    data.forEach(element => {
      groups[element[this.attribute]].push(element)
    })
        
    return groups
  }
}

export class FilterAction extends Action {
  constructor() {
    super()
    this.attribute = {}
    this.filterValue = ""
  }
  
  setAttribute(attribute) {
    this.attribute = attribute
    return this
  }
  
  setFilterValue(filterValue) {
    this.filterValue = filterValue
    return this
  }
  
  runOn(data) {
    if ((typeof this.attribute) === "undefined") {
      throw new TypeError('The filtering attribute must be set.');
    }
    if (this.filterValue === "") {
      throw new TypeError('The filtering value must be set.');
    }
    
    let arrayTypes = ["languages", "themes"]
    
    if(arrayTypes.includes(this.attribute)) {
      return data.filter(element => element[this.attribute].includes(this.filterValue))
    }
    
    return data.filter(element => element[this.attribute] === this.filterValue)
  }
}

export class ColoringAction extends Action {
  constructor() {
    super()
    this.attribute = {}
    this.colorMap = {}
  }
  
  setAttribute(attribute) {
    this.attribute = attribute
    return this
  }
  
  setColorMap(map) {
    this.colorMap = map
    return this
  }
  
  runOn(data) {
    if ((typeof this.attribute) === "undefined") {
      throw new TypeError('The coloring attribute must be set.');
    }
    
    if ((typeof this.colorMap) === "undefined") {
      throw new TypeError('The color map must be set.');
    }
    
    data.forEach(element => {
      element.drawing.currentColor = this.colorMap[element[this.attribute]]
    })
    
    return data
  }
  
  getUniqueColor(colors) {
    let color = this.getRandomColor()
    while (colors[color] || color === "ffffff" || color === "000000") {
      color = this.getRandomColor()
    }
    return color
  }

  getRandomColor() {
    var letters = '0123456789abcdef'
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[this.getRandomInteger(0, 16)]
    }
    return color
  }
  
  getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min
  }
}