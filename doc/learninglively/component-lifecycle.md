# Component life cycle

There is a default life cycle for javascript conponents. The documentation of that can be found at [https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)

## Callbacks in lively

Lively does some things differently in order to enable live development. So here is a table of the callbacks in lively, what their original name is and when they are called.

| callback in lively | callback original | what it does |
|---|---|----|
| onAttachedCallback() | connectedCallback() | invoked, when the element is appended to a document-connected component. That will also happen each time the element is moved. |
| onDetachedCallback() | disconnectedCallback() | Invoked each time the custom element is disconnected from the document's DOM |
| adoptedCallback() | adoptedCallback() | Invoked each time the custom element is moved to a new document. |
| attributeChangedCallback() | attributeChangedCallback() | invoked, when one of the observed Attributes is changed. For this to work, the custom element's class must implement ```static get observedAttributes() { return [<attribute 1>, ..., <attribute n>] }```

## How I think we could use it

I think the attributeChangedCallback is interesting. 

In the tab view: an element within a tab view could observe the style.display value and when it is set to "none" stop animations and so on.

To enforce a life cycle on our own we could create new attributes and listen to them in a sort of super class. Here a (probably not good) example of how something like that could look like:

```javascipt

class Diagram extends Morph {
  async initialize() {}
  
  static get observedAttributes() {
    return {["attached", "visible"]}
  }
  
  attributeChangedCallback() {
    let changedAttribute = //TODO
    let value = this[changedAttribute]
    
    if (changedAttribute === "visible") {
      if (value == true) {
        this.onVisible()
      } else {
        this.onInvisible()
      }
    } else if (changedAttribute === "attached") {
      if (value == true) {
        this.onAttached()
      } else {
        this.onDetached()
      }
    }
  }
  
  onVisible() {
    //subclass responsibility
  }
  
  onInvisible() {
    //subclass responsibility
  }
  
  onAttached() {
    //subclass responsibility
  }
  
  onDetached() {
    //subclass responsibility
  }
  
}

```

Note: making attached with this is a bad idea as the attachedCallback already exists!