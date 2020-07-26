<div id="animation-container">
</div>

<script>
  import lottie from './lottie.js'
  
  let container = lively.query(this, "#animation-container")
  var animation = lottie.loadAnimation({
    container: document.getElementById('bm'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'data.json'
  })
</script>