import { Zoomer } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/groupchaining/node-modules/zoomer.js";
import { Selector } from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/groupchaining/node-modules/selection-with-zoom.js";
import { IndividualsGrouper } from "./individuals-grouper.js";
import d3 from "src/external/d3.v5.js";


export class InteractiveCanvas {
  
  constructor(world, canvas, regl, inspector, rawIndividuals) {
    this.canvas = canvas;
    this.regl = regl;
    this.transform = null;
    this.scale = 1;
    this.nodes = null;
    this.inspector = inspector;
    this.individualsGrouper = null;
    this.individuals = rawIndividuals;
    this.menu = null;
    this.world = world;
  }
  
  start() {
    this.nodes = this.individualsGrouper.getGroupingStructure();
    this.drawNodes();
  }
  
  updateNodes(nodes, groupingKey){
    this.nodes = nodes;
  } 
  
  updateMenu(groupingKey) {
    let uniqueValuesForKey = [...new Set(this.rawIndividuals.map(item => item[this.groupingKey]))]
    this.menu.generateGroupingLegend(groupingKey, uniqueValuesForKey);
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
  
  inspectNode(node){
    this.inspector.inspect(node);
  }
  
  registerZoom() {
    this.zoomer = new Zoomer(this);
  }
  
  registerSelection(){
    this.selector = new Selector(this);
  };
  
  registerGrouping(groupingLayouter, menuContainer, keys) {
    this.individualsGrouper = new IndividualsGrouper(this, this.individuals, groupingLayouter, menuContainer, this.world, keys);
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
  
}

