<div>
  <bp2019-y-axis-widget id="bp2019-y-axis"></bp2019-y-axis-widget>
  <bp2019-legend-widget id="legend-widget"></bp2019-legend-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import { assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"


class Listener {
  constructor() {
    this.widgets = []
    this.legend = {}
  }

  addWidget(widget) {
    assertCanvasWidgetInterface(widget)
    this.widgets.push(widget)
  }
  
  setLegend(legend) {
    this.legend = legend
  }

  applyAction(action) {
    this.legend.applyActionFromRootApplication(action)
    this.widgets.forEach(widget => {
      widget.applyActionFromRootApplication(action)
    })
  }
}

let widget = lively.query(this, '#bp2019-y-axis')
let legend = lively.query(this, '#legend-widget')
let listener = new Listener()

listener.addWidget(widget)
listener.setLegend(legend)
widget.addListener(listener);

(async () => {
  let data = await AVFParser.loadCovidData()
  let globalControlWidget = await lively.openComponentInWindow('bp2019-global-control-widget')
  
  DataProcessor.current().initializeWithIndividualsFromKenia(data)
  ColorStore.current().initializeWithValuesByAttribute(DataProcessor.current().getValuesByAttribute())
  
  globalControlWidget.addListener(widget)
  globalControlWidget.initializeAfterDataFetch()
  widget.setData(data)
})();

""
</script>