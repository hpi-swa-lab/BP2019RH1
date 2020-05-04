<script>
  import setup from '../setup.js'
  setup(this)
</script>

### Individuals visualization

<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

<button class="btn" id="openApplication">Open application</button>
<a class="btn" href="./documentation.md">Go to documentation</a>

<script>
  let buttonElement = lively.query(this, '#openApplication')
  buttonElement.addEventListener('click', () => {
    lively.openComponentInWindow('bp2019-individual-visualization')
  })
</script>