# Vega-Lite

A first research iteration has already bin done. There we concentrated on example diagrams which have been done with vega-lite. This first research can be found [here](../research-styles/vega-lite.md)

## Context

### Who uses it? Which other projects use this library? Use cases?

### is it maintained?

Yes. Last [release](https://github.com/vega/vega-lite/releases) of the software was at the 10th of october 2019 (status at the 28th of october 2019).

### Who wrote it?

A team of alumni and menbers of the University of Washington Interactive Data Lab as well as the community. A detailed list can be found on their [GitHub page](https://github.com/vega/vega-lite#team)

### how old is it?

The [copyright license](https://github.com/vega/vega-lite/blob/master/LICENSE) is from 2015 so i guess the development process started back then. It is four years old now.

### is it open source? + link

Yes, it is. The project can be found [here](https://github.com/vega/vega-lite).

The project is written mostly in TypeScript.

### what is produced as a visualisation? a picture, a svg, a html canvas, or different divs or other html elements, something else?

When embedding with the command vegaEmbed() a html canvas is produced.

### how to start using it? How to install? Do you have to pay for usage?

You do not have to pay for it when using it as long as the [license](https://github.com/vega/vega-lite/blob/master/LICENSE) is not violated. 

To use it, simply import the following libraries: 
  - https://cdn.jsdelivr.net/npm/vega@5.7.2 
  - https://cdn.jsdelivr.net/npm/vega-lite@4.0.0-beta.10" 
  - https://cdn.jsdelivr.net/npm/vega-embed@5.1.3

Then it can be embedded in any HTML-page using the JavaScript wrappers. There also is a [tutorial](https://vega.github.io/vega-lite/tutorials/getting_started.html) to get started with Vega-Lite.

## Examples

Vega-Lite embeds some unwanted parts in the div. These can be left out by using the following css-style:

```css
<style>
.vegaChart :nth-child(3) {
  display: none;
}
</style>
```

<style>
.vegaChart :nth-child(3) {
  display: none;
}
</style>

### A bar chart

<div class="vegaChart" id="barChart"></div>

<script>

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

""
</script>

### A line chart

<div class="vegaChart" id="interactiveChart"></div>

<script>  

(async () => {
  await lively.loadJavaScriptThroughDOM("vega", "https://cdn.jsdelivr.net/npm/vega@5.7.2");
  await lively.loadJavaScriptThroughDOM("vegaLite", "https://cdn.jsdelivr.net/npm/vega-lite@4.0.0-beta.10");
  await lively.loadJavaScriptThroughDOM("vegaEmbed","https://cdn.jsdelivr.net/npm/vega-embed@5.1.3");
  
  let table = {
    "description": "Average income per person of Germany, Japan and Switzerland over the years 1800 to 2040",
    "data": {"url": "https://lively-kernel.org/lively4/BP2019RH1/doc/research-libraries/testData/income_per_person_germany_japan_switzerland.json"},
    "mark": {
      "type": "line",
      "point": false,
      "tooltip": true
    },
    "encoding": {
      "x": {"field": "Year", "type": "quantitative"},
      "tooltip": [
        {"field": "Year", "type": "quantitative"},
        {"field": "Germany", "type": "quantitative"},
        {"field": "Japan", "type": "quantitative"},
        {"field": "Switzerland", "type": "quantitative"}
      ]
    },
    "layer": [
      {
        "mark": {"type": "line", "color": "blue"},
        "encoding": {
          "y": {"title": "Income in $US", "field": "Germany", "type": "quantitative"},
          "legend": {"symbol": "circle", "values": ["Germany"]}
        }
      },
      {
        "mark": {"type": "line", "color": "orange"},
        "encoding": {
          "y": {"title": "Income in $US", "field": "Japan", "type": "quantitative"}
        }
      },
      {
        "mark": {"type": "line", "color": "red"},
        "encoding": {
          "y": {"title": "Income in $US", "field": "Switzerland", "type": "quantitative"}
        }
      },
      {
        "mark": "rule",
        "selection": {
          "hover": {"type": "single", "on": "mouseover", "empty": "none"}
        },
        "encoding": {
          "color": {
            "condition": {
              "selection": {"not": "hover"},
              "value": "transparent"
            }
          }
        }
      },
    ]
  };
  
  let interactiveChart = lively.query(this, "#interactiveChart");
  vegaEmbed(interactiveChart, table);

})()
""
</script>

### A bar chart build with the JavaScript-API

<script>

import  vl  from 'https://unpkg.com/vega-lite-api@0.1.0/build/vega-lite-api.min.js';
(async () => {
  let dataFile = await fetch("https://lively-kernel.org/lively4/BP2019RH1/doc/research-libraries/testData/income_per_person_germany_japan_switzerland.json").then(r=>r.json()); 
  vl.markBar().data(dataFile).encode(vl.x().fieldN("Country"), vl.y().fieldQ("Income per capita in 2019")).render();
})()

""
</script>

## Experiment with examples: what can you add as interaction?



## Categorisation

## Experience

### How mature is the environment?

- Very well [documented](https://vega.github.io/vega-lite/docs/)
- The [Vega-Ecosystem](https://vega.github.io/vega-lite/ecosystem.html) (as they call it) is quite big. 
  - Several tools to create vega-visualizations 
  - Bindings for programming languages (including for example Python, Elm, R and [JavaScript](https://github.com/vega/vega-lite-api/))
  - Few "Data Scientist Environments" that support Vega-Lite. For example [Observable](https://observablehq.com/)