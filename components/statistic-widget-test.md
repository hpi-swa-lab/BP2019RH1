<bp2019-statistic-widget></bp2019-statistic-widget>

<script>
import { AVFParser } from "https://lively-kernel.org/voices/parsing-data/avf-parser.js"

statisticWidget = lively.query(this, 'bp2019-statistic-widget')

AVFParser.loadCovidDataFlatThemes().then(data => {
  let individuals = data
  
  statisticsWidget.setData(individuals)
  debugger;
})

</script>