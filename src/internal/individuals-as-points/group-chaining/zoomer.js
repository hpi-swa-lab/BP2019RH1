import { mat3, vec2 } from "https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix.js";
import d3 from "src/external/d3.v5.js"
import { debounce } from "utils";

export class Zoomer {
  
  constructor(interactiveCanvas){
    this.interactiveCanvas = interactiveCanvas;
    this.interactiveCanvas.transform = mat3.create();
    
    d3.select(this.interactiveCanvas.canvas)
    .call(d3.zoom().on("zoom", () => {
        var t = d3.event.transform;
        let transform = this.updateTransform(
          this.interactiveCanvas.canvas,
          this.interactiveCanvas.transform, 
          t.x, t.y, t.k);
      
        this.interactiveCanvas.updateTransform(transform);
        this.interactiveCanvas.updateScale(t.k);
        this.interactiveCanvas.drawNodes();
    }).debounce(200));
  }
  
  
  updateTransform(canvas, transform, x, y, scale) {
    mat3.projection(transform, canvas.width, canvas.height);
    mat3.translate(transform, transform, [x,y]);
    mat3.scale(transform, transform, [scale,scale]);
    mat3.translate(transform, transform, [
      canvas.width / 2,
      canvas.height / 2
    ]);
    mat3.scale(transform, transform, [
      canvas.width / 2,
      canvas.height / 2
    ]);
    mat3.scale(transform, transform, [1, -1]);
    
    return transform;
  }
}