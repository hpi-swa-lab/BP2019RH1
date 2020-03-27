<div id="canvas_placeholder">
</div>

<script>
  import Two from "https://raw.githubusercontent.com/jonobr1/two.js/master/build/two.js"
  
  var width = 600;
  var height = 600;
  var amountDots = 10000;
  var canvas_placeholder = lively.query(this, "#canvas_placeholder")
  
  var two = new Two({width: width, height: height, type: Two.Types['svg'] }).appendTo(canvas_placeholder)
  
  for(var i = 0; i<amountDots; i++){
    var circle = two.makeCircle(Math.floor(Math.random()* width-10), Math.floor(Math.random()*height-10),2)
    circle.fill = 'yellow'
    
  }
  
  
  two.render()
  
  ''
</script>