<canvas id="canvas" width="1000" height="800"></canvas>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import ForcesStructure from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces-structure.js"

AVFParser.loadCovidData().then( (data) => {
  let individuals = data;
  let themes = individuals.map( individual => individual.themes['L3']);
  themes = new Set(themes.flat());
  debugger;
})
</script>