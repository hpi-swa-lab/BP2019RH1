export { 
  assertRootApplicationInterface,
  assertCanvasWidgetInterface,
  assertActionWidgetInterface,
  assertListenerInterface
};

function assertRootApplicationInterface(individualsVisualization){  
  assertMethodExists(
    individualsVisualization.applyActionFromCanvasWidget, 
    'A CanvasWidget must implement applyActionFromCanvasWidget' 
  );
}

function assertCanvasWidgetInterface(canvasWidget) {

  assertMethodExists(
    canvasWidget.setData, 
    'A CanvasWidget must implement setData'
  );
  
  assertMethodExists(
    canvasWidget.name, 
    'A CanvasWidget must have a name'
  );
  
  assertMethodExists(
    canvasWidget.addListener, 
    'A CanvasWidget must implement addListener'
  );

  assertMethodExists(
    canvasWidget.applyActionFromRootApplication, 
    'A CanvasWidget must implement applyActionFromRootApplication'
  );
  
  assertMethodExists(
    canvasWidget.applyAction, 
    'A CanvasWidget must implement applyAction'
  );
  
}

function assertActionWidgetInterface(actionWidget) {
  assertMethodExists(
    actionWidget.name, 
    'An ActionWidget must have a name'
  );
  
  assertMethodExists(
    actionWidget.addListener, 
    'An ActionWidget must implement addListener'
  );
  
  assertMethodExists(
    actionWidget.initializeWithData, 
    'An ActionWidget must implement initializeWithData'
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