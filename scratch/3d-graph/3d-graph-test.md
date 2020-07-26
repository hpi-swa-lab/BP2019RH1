<div id="root-div"></div>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import d3 from "src/external/d3.v5.js";
import ForceGraph3D from 'https://unpkg.com/3d-force-graph'

var rootDiv = lively.query(this, '#root-div')
var individuals


AVFParser.loadCovidData().then( (data) => {
  individuals = data
  let themes = individuals.map( individual => individual.themes['L3'])
  themes = new Set(themes.flat())

})
  
</script>