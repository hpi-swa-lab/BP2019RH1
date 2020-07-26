// goal: analogous to lively4url, we need a bp2019url, which is "https://lively-kernel.org/lively4/BP2019RH1" or "https://lively-kernel.org/lively4/BP2019RH1-stable"

export default async function setup(scriptElement) {
  if (!self.repositoryURL) {
    // go through container!
    var container = lively.query(scriptElement, "lively-container");
    // https://lively-kernel.org/lively4/BP2019RH1
    
    var livelyServerUrl = "https://lively-kernel.org/lively4/";
    const bp2019name = container.getURL().toString().replace(livelyServerUrl, "").replace(/\/.*/, "");
    var repositoryURL = livelyServerUrl + bp2019name;
    // resets custom template paths
    // This is currently a necessary hack to allow usage of the "stable" checkout
    // Problems with this approach are: 
    // 1. it also removes every other custom template path, which may yield unexpected results
    // 2. it doesn't allow for completely seemless experience; in order to use "stable" checkout version,
    // you have to reload since dev and stable versions of components are named the same and live in a global namespace, and are not reloaded every time for permance sake
    lively.components.persistentCustomTemplatePaths = []
    lively.components.addPersistentCustomTemplatePath(repositoryURL + "/components/");
    self.bp2019url = repositoryURL;
  }
  
  let componentNameSets = {
    "Base components":
    [
      // "bp2019-activate-deactivate-list-widget",
      "bp2019-color-selection-item",
      "bp2019-filter-list-element",
      "bp2019-tab-widget",
      // "bp2019-fullscreen-button",
      "bp2019-statistic-widget",
      "bp2019-legend-widget",
      "bp2019-inspector-widget",
      "bp2019-select-widget",
      "bp2019-theme-group-list-item-widget",
      "bp2019-y-axis-group-widget",
      "bp2019-control-panel-widget",
    ], 
    "L1 components": // -> depend on a base component
    [
      "bp2019-color-widget",
      "bp2019-filter-widget",
      "bp2019-theme-group-widget",
    ], 
    "L2 components": // -> should depend on a L1 component, but some control panels don't. I just liked to keep the control panels together
    [
      "bp2019-global-control-widget",
      // "bp2019-group-chaining-control-widget",
      // "bp2019-individual-center-control-widget",
      "bp2019-map-control-widget",
      "bp2019-venn-control-widget",
      "bp2019-y-axis-control-widget",
    ], 
    "L3 components": // -> depend on L2 components
    [
      // "bp2019-group-chaining-widget",
      // "bp2019-individual-center-widget",
      "bp2019-map-widget",
      "bp2019-venn-widget",
      "bp2019-y-axis-widget",
    ], 
    "Top level components": // -> depend on L3 components
    [
      "bp2019-pane",
      "bp2019-individual-visualization",
    ]    
  }
  
  lively.notify("Component loading started")
  
  for (let level in componentNameSets) {
    let componentNames = componentNameSets[level]
    
    let originalComponentNumber = componentNames.length
    
    componentNames = componentNames.filter(componentName => {
      return !lively.components.templates[componentName]
    })

    let currentComponentNumber = componentNames.length
    console.log("Loading", level, "remaining: ", currentComponentNumber, " of ", originalComponentNumber)
    
    await Promise.all(componentNames.map(componentName => lively.create(componentName)))
    console.log("done")
  }
  
  lively.notify("Component loading finished")
}