<style data-src="/src/external/font-awesome/css/font-awesome.css"></style>
  <style data-src="/templates/livelystyle.css"></style>
  <style data-src="../BP2019RH1/src/internal/individuals-as-points/common/button-styles.css"></style>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

<div>
  <div id="canvas-row">
    <bp2019-map-widget id="bp2019-map-widget"></bp2019-map-widget>
  </div>
  <div id="legend-row" class="row">
    <bp2019-legend-widget id="legend-widget" class="col-10"></bp2019-legend-widget>
  </div>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import { assertCanvasWidgetInterface } from "../src/internal/individuals-as-points/common/interfaces.js"


class Listener {
  constructor() {
    this.widgets = []
    this.legend = null
  }

  addWidget(widget) {
    assertCanvasWidgetInterface(widget)
    this.widgets.push(widget)
  }
  
  registerLegend(legend) {
    this.legend = legend
  }

  applyAction(action) {
    this.legend.applyActionFromRootApplication(action)
    this.widgets.forEach(widget => {
      widget.applyActionFromRootApplication(action)
    })
  }
}


let widget = lively.query(this, '#bp2019-map-widget')
let legend = lively.query(this, '#legend-widget')
let listener = new Listener()

listener.addWidget(widget)
listener.registerLegend(legend)
widget.addListener(listener);

(async () => {
  let data = await AVFParser.loadInferredCovidData()
  DataProcessor.current().initializeWithIndividualsFromKenia(data)
  ColorStore.current().initializeWithValuesByAttribute(DataProcessor.current().getValuesByAttribute())

  await widget.setData(data)
})()

</script>