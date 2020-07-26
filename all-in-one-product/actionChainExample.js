import {
  ColorAction,
  FilterAction,
  SelectAction,
  ActionChain
} from "../src/internal/individuals-as-points/common/actions.js"

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import DataProcessor from "../src/internal/individuals-as-points/common/data-processor.js"
import ColorStore from "../src/internal/individuals-as-points/common/color-store.js"

let colorStore = new ColorStore()
let dataProcessor = new DataProcessor();

(async () => {
  let data = await AVFParser.loadCovidData()
  dataProcessor.initializeWithIndividualsFromKenia(data);
  let valuesByAttribute = dataProcessor.getValuesByAttribute()
  await colorStore.loadDefaultColors()
  colorStore.initializeWithValuesByAttribute(valuesByAttribute);

  let actions = [
    new ColorAction("gender", true, dataProcessor, colorStore),
    new FilterAction("gender", ["female", "missing"], true, dataProcessor),
    new FilterAction("age", ["missing"], true, dataProcessor),
    new SelectAction(data[0], true)
  ]
  
  let actionChain = new ActionChain(actions)
  console.log(actionChain.runOn(data))
})();