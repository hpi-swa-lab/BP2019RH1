<div>
  <bp2019-group-chaining-widget id="group-chaining-widget"></bp2019-group-chaining-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

const widget = lively.query(this, '#group-chaining-widget');

(async () => {
  let data = await AVFParser.loadCovidData();
  DataProcessor.initializeWithIndividualsFromKenia(data);
  ColorStore.initializeWithValuesByAttribute(DataProcessor.getValuesByAttribute());
  widget.setData(data);
})();


</script>