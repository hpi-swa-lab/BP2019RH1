import inside from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-point-in-polygon.js"

import Noose from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-noose.js"

export class Selector {
  constructor(parentElement, mb, mp, selectPreferences, inspector) {
    this.parentElement = parentElement;
    this.selectPreferences = selectPreferences;
    this.selectedObjects = [];
    this.highlightColor = {r: 245, g: 245, b: 0, opacity: 1}
    this.history = []
    this.mb = mb
    this.mp = mp
    this.inspector = inspector
    this.selector = this
    this.setUpKeyEventListeners(parentElement, selectPreferences)
  }
  
  init(objects, drawFunction) {
    this.objects = objects;
    this.drawFunction = drawFunction;
  }
  
  updateSelectableObjects(objects) {
    this.objects = objects;
  }

  
  start() {
    let selector = this.selector
    let inspector = this.inspector
    this.mb.on('down', function(event) {
      let clickedHighlightedPointIndices = selector.calculateClickedPointsIndices(selector.objects, selector.mp)
      if (selector.mb.left) {
        selector.updateSelectedObjects(selector.objects, selector.mp)
        let clickedPointIndices = clickedHighlightedPointIndices["clickedPointIndices"]
        let oneClickedPointIndex = clickedPointIndices[0]
        if (inspector != null) inspector.inspect(selector.objects[oneClickedPointIndex])
        selector.draw()
      } else if (selector.mb.right && clickedHighlightedPointIndices["clickedPointIndices"].length > 0) {
        event.preventDefault()
        event.stopPropagation()
        let clickedPointIndices = clickedHighlightedPointIndices["clickedPointIndices"]
        let oneClickedPointIndex = clickedPointIndices[0]
        if (inspector == null) {
          lively.openInspector(selector.objects[oneClickedPointIndex])
        } else {
          inspector.inspect(selector.objects[oneClickedPointIndex])
        }
      }
    })
    this.noose = new Noose(this.parentElement, {
      select: false,
      start: function(e, coors, selected) {
          //selector.selectPreferences.multipleSelect = true;
      },
    move: function(e, coors, selected) {
        console.log(coors)
      }
    })
  }
  
  stop() {
    this.mb.dispose()
  }
  draw() {
    this.drawFunction(this.objects)
  }
  
  updateSelectedObjects(objects, mp) {
    this.history.push(this.selectedObjects)
    let unselectedObjectsIndices = []
    let newlySelectedObjects = this.calculateNewlySelectedObjects(objects, mp)
    if (!this.selectPreferences.multipleSelect) {
      unselectedObjectsIndices = this.selectedObjects.filter(obj => !newlySelectedObjects.includes(obj))
      this.selectedObjects = newlySelectedObjects
    } else {
      this.selectedObjects = this.selectedObjects.concat(newlySelectedObjects)
    }
    this.highlightObjects(this.selectedObjects)
    this.dishighlightObjects(unselectedObjectsIndices)
  }
  
  dishighlightObjects(unselectedObjectIndices) {
    unselectedObjectIndices.forEach((index) => {
      this.objects[index].drawing.highlighted = false
      this.objects[index].drawing.color = this.objects[index].drawing.defaultColor
    })
  }
  
  highlightObjects(selectedObjectIndices) {
    selectedObjectIndices.forEach((index) => {
      this.objects[index].drawing.highlighted = true
      this.objects[index].drawing.color = this.highlightColor
      console.log(this.objects[index])
    })
  }
  
  calculateNewlySelectedObjects(objects, mp) {
    let newlySelectedObjects = []
    for (let i = 0; i < objects.length; i++) {
      var point = objects[i]
      var point_polygon = [
          [point.drawing.x - point.drawing.size/2, point.drawing.y - point.drawing.size/2],
          [point.drawing.x + point.drawing.size/2, point.drawing.y - point.drawing.size/2],
          [point.drawing.x + point.drawing.size/2, point.drawing.y + point.drawing.size/2],
          [point.drawing.x - point.drawing.size/2, point.drawing.y + point.drawing.size/2]
        ]  
      if (inside(mp, point_polygon)) {
        newlySelectedObjects.push(i)
      }
    }
    return newlySelectedObjects
  }
  
  calculatedPointsInPolygon(points, polygon){}
  

  calculateClickedPointsIndices(points, mp) {
    let clickedPointIndices = []
    let highlightedPointIndices = []

    for (let i = 0; i < points.length; i++) {
      var point = points[i]
      var point_polygon = [
          [point.drawing.x - point.drawing.size/2, point.drawing.y - point.drawing.size/2],
          [point.drawing.x + point.drawing.size/2, point.drawing.y - point.drawing.size/2],
          [point.drawing.x + point.drawing.size/2, point.drawing.y + point.drawing.size/2],
          [point.drawing.x - point.drawing.size/2, point.drawing.y + point.drawing.size/2]
        ]  
      if (inside(mp, point_polygon)) {
        clickedPointIndices.push(i)
      }

      if (point.drawing.highlighted) {
        highlightedPointIndices.push(i)
      }
    }

    return {"clickedPointIndices": clickedPointIndices, "highlightedPointIndices": highlightedPointIndices}
  }

  unhighlightPoints(points, highlightedPointIndices) {
    highlightedPointIndices.forEach((index) => {
      points[index].drawing.highlighted = false
      points[index].drawing.color = points[index].drawing.defaultColor
    })

    return points
  }

  markClickedPoint(points, clickedPointsIndices) {
    clickedPointsIndices.forEach((index) => {
      points[index].drawing.highlighted = true
      points[index].drawing.color = this.highlightColor;
    })

    return points
  }

  // MULTIPLE SELECT

  handleKeyDown(event, selectPreferences) {
    event.preventDefault();
    event.stopPropagation();

    if (event.shiftKey) {
      selectPreferences.multipleSelect = true
    }
  }

  handleKeyUp(event, selectPreferences) {

    let key = event.keyCode;

    event.preventDefault();
    event.stopPropagation();

    // needed because event.shiftKey is not set on an keyup event
    switch (key) {
      case 16: //shift
        selectPreferences.multipleSelect = false
        break;
    }
  }
 setUpKeyEventListeners(parentElement, selectPreferences) {
    // this allows parentElement to get focus and thus capture key events
    parentElement.setAttribute("tabindex", 0);

    parentElement.addEventListener("keydown", (event) => { this.handleKeyDown(event, selectPreferences) });
    parentElement.addEventListener("keyup", (event) => { this.handleKeyUp(event, selectPreferences) });

  }

}