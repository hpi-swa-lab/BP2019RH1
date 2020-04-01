export { 
  assertRootApplicationInterface,
  assertCanvasWidgetInterface,
  assertActionWidgetInterface,
  assertListenerInterface
};

function assertRootApplicationInterface(individualsVisualization){
  assertMethodExists(
    individualsVisualization.setRootApp, 
    'An CanvasWidget must implement setRootApp' 
  );
}

function assertCanvasWidgetInterface(canvasWidget) {
  assertMethodExists(
    canvasWidget.setRootApp, 
    'An CanvasWidget must implement setRootApp'
  );
  
  assertMethodExists(
    canvasWidget.setData, 
    'An CanvasWidget must implement setData'
  );
}

function assertActionWidgetInterface(actionWidget) {
  assertMethodExists(
    actionWidget.name, 
    'An ActionWidget must have a name'
  );
}

function assertListenerInterface(listener) {
  assertMethodExists(
    listener.applyAction, 
    'The listener must implement applyAction'
  );
}

function assertMethodExists(method, errorMessage){
  if ((typeof method) === "undefined") {
    throw new Error(errorMessage);
  }
}