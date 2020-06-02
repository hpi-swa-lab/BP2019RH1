export { 
  assertRootApplicationInterface,
  assertCanvasWidgetInterface,
  assertActionWidgetInterface,
  assertListenerInterface,
  assertSizeListenerInterface,
  assertActionInterface,
  assertColorSelectionItemListenerInterface,
  assertFilterListItemListenerInterface,
  assertAtomicFilterActionInterface,
  assertActivateDeactivateListListenerInterface,
  assertFreeHandSelectionListenerInterface
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
    'A CanvasWidget must implement setData. ' + canvasWidget + ' didnt implement one'
  );
  
  assertMethodExists(
    canvasWidget.getData, 
    'A CanvasWidget must implement getData. ' + canvasWidget + ' didnt implement one'
  );
  
  assertMethodExists(
    canvasWidget.name, 
    'A CanvasWidget must have a name. ' + canvasWidget + ' didnt implement one'
  );
  
  assertMethodExists(
    canvasWidget.addListener, 
    'A CanvasWidget must implement addListener. ' + canvasWidget + ' didnt implement one'
  );
  
  assertMethodExists(
    canvasWidget.applyAction, 
    'A CanvasWidget must implement applyAction. ' + canvasWidget + ' didnt implement one'
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

function assertColorSelectionItemListenerInterface(listener) {
  assertMethodExists(
    listener.setColorForValue,
    'The color selection item listener must implement setColorForValue(color, value)'
  );
}

function assertFilterListItemListenerInterface(listener) {
  assertMethodExists(
    listener.deleteFilterListItem,
    'The filter list item listener must implement deleteFilterListItem(filterListItem)'
  )
}

function assertListenerInterface(listener) {
  assertMethodExists(
    listener.applyAction, 
    'The listener must implement applyAction'
  );
}

function assertSizeListenerInterface(listener) {
  assertMethodExists(
    listener.onSizeChange, 
    'The size listener must implement onSizeChange'
  );
}

function assertActionInterface(action) {
  assertMethodExists(
    action.runOn,
    "An action must implement 'runOn(data)'"
  )
}

function assertAtomicFilterActionInterface(action) {
  assertActionInterface(action)
  
  assertMethodExists(
    action.setAttribute, 
    "A filter action must implement setAttribute(attribute)"
  )
  
  assertMethodExists(
    action.setFilterValues, 
    "A filter action must implement setFilterValues(values)"
  )
  
  assertMethodExists(
    action.getAttribute, 
    "A filter action must implement getAttribute()"
  )
  
  assertMethodExists(
    action.getFilterValues,
    "A filter action must implement getFilterValues()"
  )
}

function assertActivateDeactivateListListenerInterface(listener) {
  assertMethodExists(
    listener.onItemsActivated,
    "A listener for an activate-deactivate-list must implement onItemsActivated(activatedItemNames)"
  )
  
  assertMethodExists(
    listener.onItemsDeactivated,
    "A listener for an activate-deactivate-list must implement onItemsDeactivated(deactivatedItemNames)"
  )
}

function assertFreeHandSelectionListenerInterface(listener) {
  assertMethodExists(
    listener.openNewDiagramWithData,
    "A freeHandSelectionListener must implement openNewDiagramWithData(selectedData)"
  )
}

function assertMethodExists(method, errorMessage){
  if ((typeof method) === "undefined") {
    throw new Error(errorMessage);
  }
}