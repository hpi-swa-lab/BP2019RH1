# Vega-Lite

A first research iteration has already bin done. There we concentrated on example diagrams which have been done with vega-lite. This first research can be found [here](../research-styles/vega-lite.md)

## Context

## Examples

<style>
.vegaChart .vega-bindings {
  display: none;
}
</style>

<div class="vegaChart" id="barChart"></div>

```javascript {.firstChart}
(async () => {
  await lively.loadJavaScriptThroughDOM("vega", "https://cdn.jsdelivr.net/npm/vega@5.7.2");
  await lively.loadJavaScriptThroughDOM("vegaLite", "https://cdn.jsdelivr.net/npm/vega-lite@4.0.0-beta.10");
  await lively.loadJavaScriptThroughDOM("vegaEmbed","https://cdn.jsdelivr.net/npm/vega-embed@5.1.3");
  
  let table = {
    "description": "Average income per person and country for the year 2019",
    "data": {"url": "https://lively-kernel.org/lively4/BP2019RH1/doc/research-libraries/testData/income_per_person_2019.json"},
    "mark": "bar",
    "encoding": {
      "x": {"field": "Country", "type": "ordinal"},
      "y": {"field": "Income per capita in 2019", "type": "quantitative"}
    }
  };
  
  let barChart = lively.query(this, "#barChart");
  vegaEmbed(barChart, table);
})()
```

<script>

import boundEval from "src/client/bound-eval.js";
let source = lively.query(this, ".firstChart").textContent;
boundEval(source, this).then(r => r.value);

</script>

## Experience