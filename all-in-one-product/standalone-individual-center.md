<div>
  <bp2019-individual-center-widget id="individual-center-widget"></bp2019-individual-center-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

const world = this

const widget = lively.query(this, '#individual-center-widget');

let dataProcessor = new DataProcessor()
let colorStore = new ColorStore()

(async () => {
  let data = await AVFParser.loadCovidData();
  dataProcessor.initializeWithIndividualsFromKenia(data);
  await colorStore.loadDefaultColors()
  colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute());
    
  widget.setData(data);
})();

let watcher = setInterval(() => watchOpenedWindow(), 3000)


function watchOpenedWindow() {
  if (!lively.isInBody(world)) {
    clearInterval(watcher)
    widget.stop()
  }
}

</script>