// goal: analogous to lively4url, we need a bp2019url, which is "https://lively-kernel.org/lively4/BP2019RH1" or "https://lively-kernel.org/lively4/BP2019RH1-stable"

export default function setup(scriptElement) {
  
  if (!self.repositoryURL) {
    // go through container!
    var container = lively.query(scriptElement, "lively-container")
    var repositoryURL = container.getURL().toString().replace("prototypes/individualsAsDots.md", "")
    lively.components.addPersistentCustomTemplatePath(repositoryURL + "components/")
    self.bp2019url = repositoryURL  
  }
}