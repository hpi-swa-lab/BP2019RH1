
<link rel="stylesheet" type="text/css" href="../src/components/index-style.css"  />

# Web Components
Here you can find all of our components we wrote for the all-in-one system as well as the pane system.

##  Components we are using:

### Pane-specific
- [data-source-widget](./bp2019-data-source-widget.js)
- [inspector-widget](./bp2019-inspector-widget.js)
- [pane](./bp2019-pane.js) + [pane-menu](./bp2019-pane-menu.js)

### All-in-one specific
- [individual-visualization](./bp2019-individual-visualization.js)
- [tab-widget](./bp2019-tab-widget.js)
- [legend-widget](./bp2019-legend-widget.js)

### Visualization components + control panels
- [group-chaining](./bp2019-group-chaining-widget.js)
- [individual-center](./bp2019-individual-center-widget.js)
- [map](./bp2019-map-widget.js)
- [statistic-widget](./bp2019-statistic-widget.js)
- [venn](./bp2019-venn-widget.js)
- [y-axis](./bp2019-y-axis-widget.js) (also called XY)

### Control components
- [color-widget](./bp2019-color-widget.js) including [color-selection-items](./bp2019-color-selection-item.js)
- [control-panel](./bp2019-control-panel-widget.js) as a basis for all specific controls
- [filter-widget](./bp2019-filter-widget.js) including [filter-list-elements](./bp2019-filter-list-element.js)
- [select-widget](./bp2019-select-widget.js) including [filter-list-elements](./bp2019-filter-list-element.js)
- [theme-group-widget](./bp2019-theme-group-widget.js) including [theme-group-list-items](./bp2019-theme-group-list-item.js) (venn specific)
- [y-axis-group-widget](./bp2019-y-axis-group-widget.js)

- [Inspect-human?](./bp2019-inspect-human.js)

## Components we are  not using:
- [activate-deactivate-list-widget](./bp2019-activate-deactivate-list.js) (an idea for the movement prototype)
- [fullscreen-button](./bp2019-full-screen-button.js) (was used in an older map prototype)
- group-chaining-\* (unfinished)
- individual-center-\* (unfinished)

# Component Creator
To create new components from a template, enter a name here:
<script>
  import ComponentCreator from "src/client/morphic/component-creator.js"
  var container  = lively.query(this, "lively-container")
  if(!container) throw new Error("Not inside lively container?");
  ComponentCreator.createUI(container)
</script>