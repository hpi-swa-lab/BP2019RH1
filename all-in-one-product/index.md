### Individuals visualization

<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

<button class="btn" id="openApplication">Open application</button>
<a class="btn" href="./documentation.md">Go to documentation</a>

<script>
import setup from '../setup.js'

let root = this

setup(this).then(() => {
  let buttonElement = lively.query(root, '#openApplication')
  buttonElement.addEventListener('click', () => {
    lively.openComponentInWindow('bp2019-individual-visualization', lively.pt(10, 10), lively.pt(1200, 1000))
  })
})

</script>