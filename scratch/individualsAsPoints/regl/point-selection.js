import inside from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-point-in-polygon.js"

let highlightColor = {r: 255, g: 0, b: 255}

// TODO refactor clickedPointIndices to selected Point indices

export const addSelectionEventListener = (points, drawFunction, mb, mp, parentElement, selectPreferences) => {  
  
  setUpKeyEventListeners(parentElement, selectPreferences);
  
  mb.on('down', function() {
    let clickedHighlightedPointIndices = calculateClickedPointsIndices(points, mp)
    if (mb.left) {
      if (!selectPreferences.multipleSelect) {
        unhighlightPoints(points, clickedHighlightedPointIndices["highlightedPointIndices"])
      }
      markClickedPoint(points, clickedHighlightedPointIndices["clickedPointIndices"])
      
      drawFunction()

    } else if (mb.right && clickedHighlightedPointIndices["clickedPointIndices"].length > 0) {
      let clickedPointIndices = clickedHighlightedPointIndices["clickedPointIndices"]
      let oneClickedPointIndex = clickedPointIndices[0]
      
      lively.openInspector(points[oneClickedPointIndex])
    }
  })
}

function calculateClickedPointsIndices(points, mp) {
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

function unhighlightPoints(points, highlightedPointIndices) {
  highlightedPointIndices.forEach((index) => {
    points[index].drawing.highlighted = false
    points[index].drawing.color = points[index].drawing.defaultColor
  })
  
  return points
}

function markClickedPoint(points, clickedPointsIndices) {
  clickedPointsIndices.forEach((index) => {
    points[index].drawing.highlighted = true
    points[index].drawing.color = highlightColor;
  })
  
  return points
}

// MULTIPLE SELECT

function handleKeyDown(event, selectPreferences) {
  event.preventDefault();
  event.stopPropagation();

  if (event.shiftKey) {
    selectPreferences.multipleSelect = true
  }
}
  
function handleKeyUp(event, selectPreferences) {

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

function setUpKeyEventListeners(parentElement, selectPreferences) {
  // this allows parentElement to get focus and thus capture key events
  parentElement.setAttribute("tabindex", 0);

  parentElement.addEventListener("keydown", (event) => { handleKeyDown(event, selectPreferences) });
  parentElement.addEventListener("keyup", (event) => { handleKeyUp(event, selectPreferences) });

}




