
<script>
import { Processing } from "https://cdnjs.cloudflare.com/ajax/libs/processing.js/1.6.0/processing.js"

function sketchProc(processing) {
  
  // Override draw function, by default it will be called 60 times per second
  processing.draw = function() {
    
    // determine center and max clock arm length
    var centerX = processing.width / 2, centerY = processing.height / 2;
    var maxArmLength = Math.min(centerX, centerY);

   // erase background
   processing.background(100);

  };
}


(async () => {

  var canvas = document.getElementById("canvas1");
  // attaching the sketchProc function to the canvas
  var processingInstance = await new Processing(canvas, sketchProc);


})()

</script>

<canvas id="canvas1"> </canvas>
