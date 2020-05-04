// goal: analogous to lively4url, we need a bp2019url, which is "https://lively-kernel.org/lively4/BP2019RH1" or "https://lively-kernel.org/lively4/BP2019RH1-stable"

export default function setup(scriptElement) {

  if (!self.repositoryURL) {
    // go through container!
    var container = lively.query(scriptElement, "lively-container");
    // https://lively-kernel.org/lively4/BP2019RH1
    
    
    var livelyServerUrl = "https://lively-kernel.org/lively4/";
    const bp2019name = container.getURL().toString().replace(livelyServerUrl, "").replace(/\/.*/, "");
    var repositoryURL = livelyServerUrl + bp2019name;
    lively.components.addPersistentCustomTemplatePath(repositoryURL + "/components/");
    self.bp2019url = repositoryURL;
  }
}