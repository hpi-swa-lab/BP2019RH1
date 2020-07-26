Übergabe von gestern:
(Was ist implementierungstechnisch passiert)

### Panes:

ToDo:
- [ ] vllt. sinnvollere Positionierung für neu erzeugte Pane als 500 Pixel unter Parentpane
- [ ] alle Panes resizen können?
- [x] register children as listener of vis.
- [x] vis must hold and update State (when applyaction is called)
- [x] create vis.: setData with original data, copy state from parent, applyState
- [x] when selection vis.: register only current vis as listener for control panel
- [ ] when selection vis.: load corresponding state to global control window
- [ ] local controls are hideable


- possibly: adjustable selections
//spike draggable borders - draw a draggable Point of each point in polygon
    // if dragged update linePoints and call updatePolygon
    /*
    this.linePoints = linePoints 
    let ctx = this
    
    let drag = d3.drag()
        .on('start', this._dragstarted)
        .on('drag', this._dragged)
        .on('end', this._dragended);
    

    this.scalesSVG.selectAll("circle")
        .data(linePoints)
      .enter().append("circle")
        .attr("cx", function (d) { return d.x + leftPadding})
        .attr("cy", function (d) { return d.y + topPadding})
        .attr("r", function (d) { return 3 })
        .style("fill", "black");
    
    this.scalesSVG.selectAll("circle")
      .call(drag)
  }
  
  _dragstarted(d) {
    d3.select(this).raise().classed('active', true);
  }
  
  _dragged(d) {
    d3.select(this)
        .attr('cx', d3.event.x)
        .attr('cy', d3.event.y)
    
    ctx.scalesSVG.select('polygon')
      .data([ctx.linePoints])
      .attr("points", function(d) { 
          return d.map(function(d) {
              return [d.x + ctx.canvasPadding.left, d.y + ctx.canvasPadding.top].join(",");
          }).join(" ");
    })
  }
  
  _dragended(d) {
    d3.select(this).classed('active', false);
  } */