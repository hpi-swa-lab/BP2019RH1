<div>
  <bp2019-y-axis-widget id="bp2019-y-axis"></bp2019-y-axis-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import { assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"


class Listener {
  constructor() {
    this.widgets = []
  }

  addWidget(widget) {
    assertCanvasWidgetInterface(widget)
    this.widgets.push(widget)
  }

  applyAction(action) {
    this.widgets.forEach(widget => {
      widget.applyActionFromRootApplication(action)
    })
  }
}


let widget = lively.query(this, '#bp2019-y-axis');
let listener = new Listener()

listener.addWidget(widget)
widget.addListener(listener);

(async () => {
  let data = await AVFParser.loadCovidData()
  DataProcessor.current().initializeWithIndividualsFromKenia(data);
  let valuesByAttribute = DataProcessor.current().getValuesByAttribute()
  ColorStore.current().initializeWithValuesByAttribute(valuesByAttribute);
  widget.setData(data);
  
})();

""
</script>