<div>
  <bp2019-venn-widget id="venn-widget"></bp2019-venn-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

const world = this

const widget = lively.query(this, '#venn-widget');

(async () => {
  let data = await AVFParser.loadCovidData();
  //let globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget')
  
  DataProcessor.current().initializeWithIndividualsFromKenia(data);
  ColorStore.current().initializeWithValuesByAttribute(DataProcessor.current().getValuesByAttribute());
    
  //globalControlWidget.addListener(widget)
  //globalControlWidget.initializeAfterDataFetch()
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