<div>
  <bp2019-group-chaining-widget id="group-chaining-widget"></bp2019-group-chaining-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

const widget = lively.query(this, '#group-chaining-widget');

let colorStore = new ColorStore()
let dataProcessor = new DataProcessor();

(async () => {
  let data = await AVFParser.loadCovidData();
  dataProcessor.initializeWithIndividualsFromKenia(data);
  await colorStore.loadDefaultColors()
  colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute());
  widget.setData(data);
})();


</script>