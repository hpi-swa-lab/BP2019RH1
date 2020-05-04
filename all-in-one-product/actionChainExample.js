import {
  ColorAction,
  FilterAction,
  SelectAction,
  ActionChain
} from "../src/internal/individuals-as-points/common/actions.js"

import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

import DataProcessor from "../src/internal/individuals-as-points/common/data-processor.js"
import ColorStore from "../src/internal/individuals-as-points/common/color-store.js"

AVFParser.loadCovidData().then(data => {
  DataProcessor.initializeWithIndividualsFromKenia(data);
  let valuesByAttribute = DataProcessor.getValuesByAttribute()
  ColorStore.initializeWithValuesByAttribute(valuesByAttribute);

  let actions = [
    new ColorAction("gender", true, DataProcessor, ColorStore),
    new FilterAction("gender", ["female", "missing"], true, DataProcessor),
    new FilterAction("age", ["missing"], true, DataProcessor),
    new SelectAction(data[0], true)
  ]
  
  let actionChain = new ActionChain(actions)
  console.log(actionChain.runOn(data))
})