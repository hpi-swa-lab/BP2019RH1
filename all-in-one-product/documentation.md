## Indiviuals Visiualization
### Basic Structure
#### UI
![UI structure](https://lively-kernel.org/lively4/BP2019RH1/all-in-one-product/component-view.png)

The application is build with lively components. The components are stuck together through the components templates. 

#### Backend
![Basic Class Diagram](https://lively-kernel.org/lively4/BP2019RH1/all-in-one-product/2020-04-07-class-diagram.drawio)

The applications front-end view can approximately be mirrored in the backend structure of the classes, since every component has its template, that represents its front-end as well as its implementation class, that contains business logic in the back-end.


### How To Integrate a new view into the application
#### Step 1 - Create a bp2019-{your-prototype}-widget component
Use the [component creator](https://lively-kernel.org/lively4/BP2019RH1/components/index.md) of our components folder to create a lively component that contains the view of your prototype, like `group-chaining-widget` contains the view of the group chaining prototype. When created, the components folder should contain two more files

* `bp2019-{your-prototype}-widget.js`
* `bp2019-{your-prototype}-widget.html`

Double check, that the id of the template tag in the `.html` file matches the file name. It is also best practice to have a root `<div>` inside the root template tag with an id, that is unique and lets your component easily be recognized when examining the DOM. It could be something like `id="bp2019-{your-prototype}-root-container"`.

You could get rid of all the code in the class generated in the `.js` file expect of the `async initialize`.

Since lively includes our components folder in its search for components, lively should be familiar with your component and you can proceed to integrate your view in the application. Should lively complain later on, that a component with that name can not be found:

* reset the template cache (workspace `lively.components.resetTemplatePathCache()`) 
* reload lively 
* execute the script on top of the [individualsAsDots.md](https://lively-kernel.org/lively4/BP2019RH1/prototypes/individualsAsDots.md) by loading the file once.

#### Step 2 - Integrate component in front-end
You can use the `id` of your template as a new HTML Tag in the [`individual-visualization.html`](https://lively-kernel.org/lively4/BP2019RH1/components/individual-visualization.html). Just check out how the group-chaining-prototype is integrated in the individual-visualization.html, your code should look similar.

To register your view in the tab-view of the root application, you have to specify a button as well as a tab content. The content will be your newly generated component tag and the button will be a button that references the content. Please make sure that the button-id matches your content-div-id.

```html
 <tab-widget id="canvas-tab-widget">
    <div id="tab-buttons" slot="tab-buttons" class="p-1">
      <div data-content-id="group-chaining" class="tab">Group-Chain</div>
      <div data-content-id="bp2019-{your-prototype}" class="tab">{Your Prototype}</div>
    </div>
    <div id="tab-contents" slot="tab-contents" class="p-1">
      <group-chaining-widget id="group-chaining"></group-chaining-widget>
      <bp2019-{your-prototype}-widget id="bp2019-{your-prototype}"></bp2019-{your-prototype}-widget>
    </div>
  </tab-widget>
```

In the implementation of the root component, [`individuals-visualization.js`](https://lively-kernel.org/lively4/BP2019RH1/components/individual-visualization.js), you can see that your component gets automatically queried and taken into account when it comes to initializing the application with a selected data set. 

Because of that, once you open the root application / root component, your new view can be seen in the tab view, but some errors may occur, since the implementation of your component does not support the interfaces that the root application needs to provide your component with data etc.

Notice that once the root app has queried the DOM element of your component, it automatically holds an instance of the class that is implemented in the `bp2019-{your-prototype}-widget.js` file. With that is has access to its interface.


### Step 3 - Integrate component in back-end
The interface a new prototype view - which is really a canvas-widget, to stay in the naming scheme - needs, is specified in the class diagram, mentioned prior in this file. So you need to implement these in your `bp2019-{your-prototype}-widget.js`. To gain a better understanding what the purpose of the interface is, you could have a look in the existing [`group-chaining-widget.js`](https://lively-kernel.org/lively4/BP2019RH1/components/group-chaining-widget.js). It could also help to take a look at the following sequence diagram which showcases a typical use case of the application. Also, you can check out all the existing interface assertions in [`interfaces.js`](https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/interfaces.js). We are using those methods/assertions to check wether an Action-Object or an Root-Application-Object etc. matches the required interface.

Most of the code which is currently in the .md-file of you prototype will be integrated in your new bp2019-{your-prototype}-widget.js. Most of the code which is currently placed after the data fetch will move to the initialize() of your new component. E.g.

AVFParser.loadCovidData().then( data => {
  YOUR-MAIN-DRIVER-CODE
})

Most of the YOUR-MAIN-DRIVER-CODE will move to the initialize of the new component.

![Sequence Diagram of initializing the data and triggering actions](https://lively-kernel.org/lively4/BP2019RH1/all-in-one-product/2020-04-07-sequence-diagram.drawio)


### Step 4 - Build an control menu with action capabilities

#### Step 4.1 Build the control menu wrapper
The tab of your prototype is quite empty at the moment. We agreed to include a control panel on the left and a canvas on the right of each view at a minimum. This needs to be included in your template `.html` file. We recommend to wrap the controls in another component, which serves then as the control widget specifically for your canvas widget. This component is responsible for injecting data into the action widgets.

So create a `bp2019-{your-prototype}-control-widget` with the component creator and integrate it in your canvas widget, as you integrated the canvas widget in the root application (Steps 2-3).

Concerning both the `bp2019-{your-prototype}-control-widget.js` as well as `bp2019-{your-prototype}-widget.js`:

Make sure the control-widgets gets your canvas as a listener after initializing, so actions triggered  (if you implemented the interface properly) in the action menus, can be forwarded from the control-widget to the canvas-widget. Since your canvas widget should hold a listener array itself since step 3 (if you implemented the interface properly), an action can be forwarded to the root application. This should happen only if the action is globally applicable.

Concerning `bp2019-{your-prototype}-control-widget.html`:

You may have noticed the tab widget in the root application as an widget that was build by us, and you may notice the same tab widget used in the [`group-chaining-control-widget.html`](https://lively-kernel.org/lively4/BP2019RH1/components/group-chaining-control-widget.html) to manage the various action-widgets. It is recommended to also wrap your action-widgets in a tab view - which is done exactly the way you see in the existing `group-chaining-control-widget.html`, since this way the control menu stays slim and the UI is consistent across different canvas-widgets.

Due to the reusability of components we can use the same tab-view we used in the root application since this component only takes care of displaying tab content when the tab button is clicked. 

#### Step 4.2 Build the action widgets for the control menu
Once you have a wrapper component as the control menu as well as the managing tab view in its template, you can fill the control widget with action widgets. There are a bunch of already existing action widgets - like [`group-widget`](https://lively-kernel.org/lively4/BP2019RH1/components/group-widget.html) or [`color-widget`](https://lively-kernel.org/lively4/BP2019RH1/components/color-widget.html) - in the components folder where you can pick yourself the one that fits your prototype.

Integrate those into the tab view of the `bp2019-{your-prototype}-control-widget.html` the same way you integrated your canvas widget in the tab view of the root application. (Step 2) 

Please make sure the action widgets get your control widget as a listener after initialization, so that actions triggered in the action menu can be received by the control-widget. Also make sure that on the `initializeAfterDataLoad()` call in the control-widget, every action widget you register, gets filled with the correct data. This has to be done in the control-widget, since this makes the action-widgets reusable across different applications. How this is done is explained in Step 5.

Feel free to create new action widgets (Step 1 and 2) or modify the existing ones if they lack functionality. Please make sure that the widgets implement the interfaces specified in the class diagram.

### Step 5 - Make use of helper singletons
There exist two helper singletons for achieving data and color schema consistency across the application. 

* [`color-store`](https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/color-store.js)
* [`data-processor`](https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/common/data-processor.js)

Those are singletons that can be used the following way:

```javascript
import ColorStore from '../src/internal/individuals-as-points/common/color-store.js'
import DataProcessor from '../src/internal/individuals-as-points/common/data-processor.js'

let attributesForGrouping = DataProcessor.getAllAttributes();
let colorsForAttributeValues = ColorStore.getAllColorsForAttribute(attributesForGrouping[0]);
```

So whenever you have to deal with filling a menu with attributes or values that have to do with the global coloring or the global data scheme, use the API of these classes. This should mostly be the case in the control-widgets, since this fills the control menus with data.

While working with individuals, we've come up with the need to group values for a specific attribute, for example `age`. The values for age are bucketed. These buckets, respectively the labels for the buckets can be defined in the data processor and are returned by the data processor, when attributes or values for attributes are requested through the API.

So what if you want to know - maybe to get the color of an individual - in which bucket he is / which value this attribute has for the individual, provided its raw value?

You can use the API of the data-processor to query exact this information:

```javascript
let indiviualActualValue = DataProcessor.getUniqueValueFromIndividual(individual, currentAttribute)
let colorString = ColorStore.getColorForValue(currentAttribute, indiviualActualValue);
```

### Coding Standarts
It would be great if you could put every helper class that your widgets need (mostly the canvas-widget) in a subfolder specific to your view in the [`individual-as-points`](https://lively-kernel.org/lively4/BP2019RH1/src/internal/individuals-as-points/) folder. This way the application stays nicely organized.

We have taken great care to write clean code when implementing the architectural framework. Most of functions are small and we focused on readability of the code. You can do whatever you want when programming on your own prototype-component, but whenever you write code which affects all other prototypes or should be reusable we encourage you to make the code as clean as possible. To have some standards across all reusable components, we suggest the following schema:
* use this template to mark a section of public functions:

  // ------------------------------------------  
  // Public Methods  
  // ------------------------------------------  

* use this template to mark a section of private functions:

  // ------------------------------------------  
  // Private Methods  
  // ------------------------------------------  

* prefix all private functions with an underscore, e.g _registerButtonCallback()

* when possible, *don't* use semicolons to mark the end of statements and expressions