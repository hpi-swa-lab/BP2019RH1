<canvas id="canvas" width="1000" height="800"></canvas>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"
import ForcesStructure from "https://lively-kernel.org/lively4/BP2019RH1/scratch/forces-structure.js"

AVFParser.loadCompressedIndividualsAnsweredThemes("OCHA").then( (data) => {
  let individuals = data;
  debugger;
})
</script>