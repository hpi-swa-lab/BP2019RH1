<div>
  <button class="btn" id="open-global-controls">Global controls</button>
  <bp2019-y-axis-widget id="bp2019-y-axis"></bp2019-y-axis-widget>
  <bp2019-legend-widget id="legend-widget"></bp2019-legend-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import { assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"

let colorStore = new ColorStore()
let dataProcessor = new DataProcessor()
dataProcessor.setColorStore(colorStore)

let globalControlWidget = {}
let globalControlButton = lively.query(this, "#open-global-controls")
globalControlButton.addEventListener("click", () => openNewGlobalControlWidget())

let legend = lively.query(this, '#legend-widget')
let widget = lively.query(this, '#bp2019-y-axis')

;
(async () => {
  let data = await AVFParser.loadCovidData()
  
  dataProcessor.initializeWithIndividualsFromKenia(data)
  colorStore.initializeWithValuesByAttribute(dataProcessor.getValuesByAttribute())
  
  legend.setColorStore(colorStore)
  
  widget.setDataProcessor(dataProcessor)
  widget.setColorStore(colorStore)
  
  widget.setData(data)
  let extent = lively.pt(900, 700)
  widget.setExtent(extent)
})();

async function openNewGlobalControlWidget() {
  let position = lively.pt(1000, 10)
  let extent = lively.pt(300, 700)
  
  globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget', position, extent)
  
  globalControlWidget.setDataProcessor(dataProcessor)
  globalControlWidget.setColorStore(colorStore)
  
  globalControlWidget.addListener(widget)
  globalControlWidget.addListener(legend)
  
  globalControlWidget.initializeAfterDataFetch()
}

""
</script>