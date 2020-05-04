import { assertListenerInterface } from "../src/internal/individuals-as-points/common/interfaces.js"
import { ReGL } from "../src/internal/individuals-as-points/common/regl-point-wrapper.js"
import { GroupingLayouter } from "../src/internal/individuals-as-points/group-chaining/grouping-layouter.js"
import d3 from "src/external/d3.v5.js"
import { Zoomer } from "../src/internal/individuals-as-points/group-chaining/zoomer.js"
import { Selector } from "../src/internal/individuals-as-points/group-chaining/selection-with-zoom.js"
import { IndividualsGrouper } from "../src/internal/individuals-as-points/group-chaining/individuals-grouper.js"
import Morph from 'src/components/widgets/lively-morph.js'

import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'

import { InspectAction, FilterAction, ColorAction, GroupAction } from '../src/internal/individuals-as-points/common/actions.js'

const POINT_PADDING = 3

export default class GroupChainingWidget extends Morph {
  async initialize() {
    this.listeners = []
    
    this.name = "group-canvas-widget"
    this.regl = this._createReglContextOnCanvas()
    
    this.canvasHeight = this.get('#group-chaining-widget-canvas').height
    this.canvasWidth = this.get('#group-chaining-widget-canvas').width
    
    this.nodes = null
  
    this.transform = null
    this.scale = 1
    this.zoomer = new Zoomer(this)
    this.selector = new Selector(this)
  }
  
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  // *** Interface to IndividualsGrouper ***
  
  updateNodes(nodes){
    this.nodes = nodes
  } 
  
  drawNodes(){
    this.regl.drawZoomedPoints(
      {
        points: this.nodes,
        transform: this.transform,
        scale: this.scale
      });
  }
  
  animateNodes() {

    const duration = 2000;
    const ease = d3.easeCubic;
    let timer = d3.timer((elapsed) => {
        const t = Math.min(1, ease(elapsed / duration))
        this.regl.animateZoomedPoints({
          points: this.nodes,
          transform: this.transform,
          scale: this.scale,
          tick: t,
        })

        if (t === 1) {
          timer.stop()
        }
      })
  }
  
  // *** Interface to Zoomer *** 
  
  updateScale(scale){
    this.scale = scale
  }
  
  updateTransform(transform){
    this.transform = transform
  }
  
  // *** Interface to application ***
  
  async setData(individuals) {
    this.individuals = individuals;
    await this._initializeWithData()
  }
  
  async applyActionFromRootApplication(action) {
     this._dispatchAction(action)
  }
  
  // *** Interface to control menu ***
  
  applyAction(action){
    if(action.isGlobal){
      this._applyActionToListeners(action)
    } else {
      this._dispatchAction(action)
    }
    
    lively.notify("group-chaining received an action")   
    
  }
  
  addListener(listener) {
    assertListenerInterface(listener);
    this.listeners.push(listener);
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _createReglContextOnCanvas(){
    this.canvas = this.get("#group-chaining-widget-canvas");
    let context = this.canvas.getContext("webgl"); 
    return new ReGL(context);
  }
  
  _initializeWithData(){
    this.controlMenu = this._registerControlWidget();
    this.individualsGrouper = this._registerIndividualsGrouper();
    
    this._start()
  }
  
  _registerControlWidget() {
    let controlMenu = this.get("#group-chaining-widget-control-widget");
    controlMenu.addListener(this);
    controlMenu.initializeAfterDataFetch();
    
    return controlMenu;
  }
  
  _registerIndividualsGrouper(){
    let groupingLayouter = new GroupingLayouter(this.canvasWidth, this.canvasHeight, POINT_PADDING);
    let individualsGrouper = new IndividualsGrouper(this, this.individuals, groupingLayouter);
    
    return individualsGrouper;
  }
  
  _applyActionToListeners(action){
    this.listeners.forEach((listener) => {
      listener.applyAction(action);
    })
  }
  
  _dispatchAction(action) {
    switch(true) {
      case (action instanceof GroupAction):
        this._handleGroupAction(action);
        break;
      case (action instanceof ColorAction):
        this._handleColorAction(action);
        break;
      case (action instanceof InspectAction):
        this._handleInspectAction(action);
        break;
      case (action instanceof FilterAction):
        this._handleFilterAction(action);
        break;
      default:
        this._handleNotSupportedAction(action);
     }
  }
  
  _handleGroupAction(groupAction) {
    this.individualsGrouper.addGrouping(groupAction.attribute);
  }
  
  _handleColorAction(colorAction) {
    this._recolorNodes(colorAction.attribute);
    this.drawNodes();
  }
  
  _recolorNodes(currentColorAttribute){
    this.nodes.forEach((node) => {
      let nodeUniqueValue = DataProcessor.current().getUniqueValueFromIndividual(node.data, currentColorAttribute)
      let colorString = ColorStore.current().getColorForValue(currentColorAttribute, nodeUniqueValue);
      node.drawing.tcolor = ColorStore.current().convertRGBStringToReglColorObject(colorString);
    })
  }
  
  _handleInspectAction(action) {
    this.drawNodes();
  }
  
  _handleNotSupportedAction(action) {
    lively.notify(this.name + " can't apply this action: " + action.name);
  }
  
  _handleFilterAction(action){
    
  }
  
  _start(){
    this.nodes = this.individualsGrouper.getGroupingStructure();
    this.drawNodes();
  }

}