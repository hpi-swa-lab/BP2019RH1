<style>
  .loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #333;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
  }

  /* Safari */
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
  }
</style>

# All-in-one 

Here you can find our "all-in-one" system, which integrates a couple of visualization in a tab view. This is an important change
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

<div id="container">
  <button class="btn" id="openApplication">Open application</button>
</div>

<script>
import setup from '../setup.js'
let root = this

let loadingDiv = <div id="loaderCircle"><div class="loader"></div>Loading components</div>;
let container = lively.query(root, "#container")

container.appendChild(loadingDiv)

setup(root).then(() => {
  container.removeChild(loadingDiv)

  let buttonElement = lively.query(root, '#openApplication')
  buttonElement.addEventListener('click', () => {
    lively.openComponentInWindow('bp2019-individual-visualization', lively.pt(10, 10), lively.pt(1200, 800))
  })
})

""
</script>

------

### Documentation
The corresponding documentation can be found here: [doc/all-in-one-product](https://lively-kernel.org/lively4/BP2019RH1/doc/all-in-one-product/documentation.md)

----

### Standalone components
We also implemented the different visualizations for the all-in-one as standalone versions for testing.

- [Group-Chaining Prototype](standalone-group-chaining.md) (not working)
- [Individual-Cener Prototype](standalone-individual-center.md) (not working)
- [Map](standalone-map.md) -[Statistics Panel](statistic-widget-example.md)
- [Venn-Diagram](standalone-venn-widget)
- [XY-Axis Diagram](standalone-xy-axi)>