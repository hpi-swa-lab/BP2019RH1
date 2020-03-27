# Today I learned

## 17.10.2019

- Javascript kann nicht automatisch zahlen-strings in ints umwandeln. 
  Bsp: "42"/42 wird nicht ausgeführt, wirft aber auch keinen Fehler. 
  Es gibt die Funktion parseInt(String text, int base), die einen String in einen int umwandelt.
  ```javascript
    let numberString = "42";
    let number = parseInt(numberString, 10);
  ```
  (Luc)
  
  
## 21.10.2019
- Um Bibliotheken über ein CDN einzubinden, kann die normale JS import function benutzt weren 
  ``` javascript
  import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js";
  
  ```
  (Simon)

- Um ganze Ordner zu löschen müssen diese in der Ansicht ausgeklappt sein (d.h. unter dem Ordnername alle innerhalb dieses  existierenden Datein stehen)
  (Leo)
  
- Jens hat uns unter home/doc/scripts/index.html ein paar Beispiele für Scripting in Lively zusammengehackt - theresa setzen

## 22.10.2019

- you can not only sync events but also reminders using our shared owncloud calendar - Leo

- if you want to change global css styles, you can do so in HOME/src/lively.css (or so), local style sheets can be used via <link href="url/sdf" rel="stylesheet" type="text/css" /> - Leo


## 24.10.2019

- zooming in and out (on Mac cmd + / cmd -) takes a while to master but makes for a far better workflow - Theresa

- Jens is searching for good options for behavior when minimizing a window - if you have ideas go talk to him - Theresa

## 18.11.2019

- if you want to add event listeners to elements via a for loop, you have to use ```let``` instead of ```var``` for declaring elements that you want to add the listeners to. If you use ```var```, the event callback will always use the last values that were put into the variables, not the values that were put into the variables while you created the listener.  - Luc and Lara

## 19.11.2019

![](../pictures/file_191119_103315.png)

- Today we learned that character by character merge doesn't produce semantically correct results and you should definitely not edit on the same line. - Luc and Theresa

## 08.03.2020

#### Regarding using npm modules in lively

- npm modules need to be integrated as import from a source file which you should place in src/external/...
- e.g.	import fit from "src/external/npm-canvas-fit.js" 
- (for further discussion check out https://lively-kernel.org/lively4/lively4-bp2019/doc/workflows/developing.md )

- Works well for libraries which have (e.g.) a build file you can download and import (see e.g. three.js)
- Problem: Many small modules only have their source code on github and no single file that includes all code (+ code from dependencies)
- Solution: [Browserify](http://browserify.org/) to the rescue. An npm module which can compile every source code needed to run your modules and dependencies in browser.
  - Theoretically there should be two ways of using it, one of which I got working so far
  - (Working) 1. Use [browserify as a service](https://wzrd.in/) to get the needed source code for the module you want to use. Put that source code in a file in src/external (e.g. "src/external/npm-canvas-fit.js) and import it like import fit from "src/external/npm-canvas-fit.js". 
  - 2. Compile all your dependencies into a bundle.js file which you should be able to use as a src tag for your script like <script src="/src/external/bundle.js"> </script> and use your modules like you would with npm installed in your project. (var fit = require('canvas-fit')). This is the primary way described in the browserify module. Couldn't get it to work in lively tho. (Theresa)

### 16.04.2020

##### Rendering in ThreeJS or PixiJS continous in background after going back to edit mode

- we can fix that with checking that our "world" is still in lively
- example:

```javascript
renderer.render(stage)
if (lively.isInBody(world)) {
  requestAnimationFrame(render)
}
```

- you can check this example in "scratch/individualsAsPoints/PixiJS/particles.md"

(Moe)