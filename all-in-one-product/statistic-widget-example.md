# Statistics component

The component has 3 public functions:
- setData()
- addBarChartForKey()
- addBarChartForKeys()

The workflow is as follows:
- initialize the component
- give it the individuals for which you want to get some basic statistics
- call addBarChartForKey with 'age', 'gender' etc. to append a canvas with the chart within the component

Architecture:
- the component works with the class DistributionBarChart 'src/internal/individuals-as-points/common'
- for every bar-chart, a new object of DistributionBarChart is initialized
- the DistributionBarChart handles the creation of a canvas with the bar chart
- the charts are created with ChartJS within the DistributionBarChart class

# Example

```{javascript}
  statisticWidget.setData(individuals)
  statisticWidget.addBarChartForKeys(['age', 'gender', 'constituency'])
```

<div>
  <bp2019-statistic-widget></bp2019-statistic-widget>
</div>

<script>
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

let statisticWidget = lively.query(this, 'bp2019-statistic-widget')

AVFParser.loadCovidData().then(data => {
  
  DataProcessor.current().initializeWithIndividualsFromKenia(data);
  ColorStore.current().initializeWithValuesByAttribute(DataProcessor.current().getValuesByAttribute());
  DataProcessor.id = 1
  debugger;
  
  let individuals = data
  
  statisticWidget.setData(individuals)
  statisticWidget.addBarChartForKeys(['age', 'gender', 'constituency'])
})

</script>