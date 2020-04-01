import { assertRootApplicationInterface } from "../src/internal/individuals-as-points/common/interfaces.js";

import { ReGL } from "../src/internal/individuals-as-points/common/regl-point-wrapper.js"
import { GroupingLayouter } from "../src/internal/individuals-as-points/group-chaining/grouping-layouter.js"
import d3 from "src/external/d3.v5.js";
import { Zoomer } from "../src/internal/individuals-as-points/group-chaining/zoomer.js";
import { IndividualsGrouper } from "../src/internal/individuals-as-points/group-chaining/individuals-grouper.js";
import Morph from 'src/components/widgets/lively-morph.js'


const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;
const POINT_PADDING = 3;

export default class GroupChainingWidget extends Morph {
  async initialize() {
    this.regl = this._createReglContextOnCanvas();
    
    this.nodes = null;
  
    this.transform = null;
    this.scale = 1;
    this.zoomer = new Zoomer(this);
  }
  
  _createReglContextOnCanvas(){
    this.canvas = this.get("#canvas");
    let context = this.canvas.getContext("webgl"); 
    return new ReGL(context);
  }
  
  _initializeWithData(){
    this.controlMenu = this._registerControlWidget();
    this.individualsGrouper = this._registerIndividualsGrouper();
    
    this._start()
  }
  
  _registerControlWidget() {
    let controlMenu = this.get("#control-widget");
    controlMenu.addListener(this);
    controlMenu.setIndividuals(this.individuals);
    
    return controlMenu;
  }
  
  _registerIndividualsGrouper(){
    let groupingLayouter = new GroupingLayouter(MAX_WIDTH, MAX_HEIGHT, POINT_PADDING);
    let individualsGrouper = new IndividualsGrouper(this, this.individuals, groupingLayouter);
    
    return individualsGrouper;
  }
  
  _start(){
    this.nodes = this.individualsGrouper.getGroupingStructure();
    this.drawNodes();
  }

  updateNodes(nodes){
    this.nodes = nodes;
  } 
  
  updateScale(scale){
    this.scale = scale;
  }
  
  updateTransform(transform){
    this.transform = transform;
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
  
  // interface to application
  setData(individuals) {
    this.individuals = individuals;
    this._initializeWithData();
  }
  
  setRootApp(individualsVisualization){
    assertRootApplicationInterface(individualsVisualization);
    this.individualVisualsation = individualsVisualization;
  }
  
  //interface to control menu
  applyAction(action){
    console.log("action applied");
    this.individualsVisualization.applyActionFromCanvasWidget(action, this);
  }
}