// trial, doesn;t work right right now
//right now only usable for specific individual center arcs. Needs to be properly refactored

import d3 from "src/external/d3.v5.js"
import mp2 from "https://lively-kernel.org/lively4/BP2019RH1/scratch/individualsAsPoints/regl/npm-modules/npm-mouse-position.js"
import { Tooltip } from "./tooltip-individual-center.js"

export class ArcDrawer {
  
  constructor(radius, arcThickness, padAngle, padding, scale, colorScale, svg, parentElement) {
    this.radius = radius
    this.arcThickness = arcThickness
    this.padAngle = padAngle
    this.padding = padding
    this.scale = scale
    this.colorScale = colorScale
    this.svg = svg
    this.mp = mp2(svg)
    this.tooltip = new Tooltip()
    parentElement.appendChild(this.tooltip.getDiv())
    debugger
  }
  
  setArcModel() {
    let arcDrawer = this
    this.arc = d3.arc()
      .innerRadius(function(d){return d[3] * arcDrawer.radius - arcDrawer.arcThickness / 2 + d[4]*(arcDrawer.arcThickness / d[5]);})
      .outerRadius(function(d){return d[3] * arcDrawer.radius - arcDrawer.arcThickness / 2 +  (d[4] + 1) * (arcDrawer.arcThickness / d[5]);})
      .startAngle(function(d){return arcDrawer.scale(d[1]);})
      .endAngle(function(d){return arcDrawer.scale(d[0]);})
      .padAngle([arcDrawer.padAngle]);
  }
  
  drawArcs(arcs, center) {
   let arcDrawer = this
   d3.select(this.svg).selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .style("fill", function(d){return d3.rgb(arcDrawer.colorScale(d[2]));})
    .style("opacity", 0.4)
    .attr("transform", "translate(" + center.drawing.x + "," + center.drawing.y +")")
    .attr("d", arcDrawer.arc)
    .on("mouseover", arcDrawer._mouseover)
    .on("mousemove", function(d){return arcDrawer._mousemove(d);})
    .on("mouseout", arcDrawer._mouseout)
  }
  
  _mouseover() {
    this.tooltip.show()
  }

  _mousemove(d) {
    this.tooltip.setPosition(this.mp[1] - 5, this.mp[0] + 15)
    this.tooltip.setText("<b>Differing Attributes: </b> <br>" + d[6])
  }

  _mouseout() {
    this.tooltip.hide()
  }
}