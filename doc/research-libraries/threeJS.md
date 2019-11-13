# ThreeJS

## Context
#### Who uses it?
The entire internet [(examples)](https://threejs.org/). It can be used for almost anything, which is imaginable in a 3D world. 


### Is it maintained?
The last release was 22 days, ago, so yes it is maintained. It is open source licensed under MIT. The git project can be found [here](https://github.com/mrdoob/three.js/).


### What is produced as a visualization?
The library creates a custom scene object, with renders, which renders a canvas into the DOM. Every 3D object within the scene can - must - be created by the user, and must be individually styled and sized. 

### Others
It can be installed and used via a CDN as seen below. No pricing included.


## Examples

### Simple example

```javascript {.chartExample}

import THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/109/three.js"

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, 2, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();

renderer.setSize( 800, 400 );
renderer.setClearColor( 0xfcba03, 1);
this.parentElement.appendChild( renderer.domElement );
var geometry = new THREE.BoxGeometry( 3, 2, 4 );
var material = new THREE.MeshLambertMaterial( { color: 0xF6A2FF } );
var cube = new THREE.Mesh( geometry, material );

var edge = new THREE.EdgesHelper(cube, 0xc096ff);
edge.material.linewidth = 2;
cube.userData.edgeHelper = edge;
scene.add(edge);
scene.add( cube );

camera.position.z = 5;

let animate = function () {
  requestAnimationFrame( animate );

  cube.rotation.x += 0.001;
  cube.rotation.y += 0.001;
  edge.rotation.x += 0.001;
  edge.rotation.y += 0.001;

  renderer.render( scene, camera );
};

// create a point light
var pointLight = new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

animate();
```
<script>
import boundEval from "src/client/bound-eval.js"; 
let source = lively.query(this, ".chartExample").textContent
boundEval(source, this).then(r => r.value)
</script>

## Simple block stacking example

```javascript {.stackingExample}

import THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/109/three.js"

var stackingScene = new THREE.Scene();
var stackingCamera = new THREE.PerspectiveCamera( 75, 2, 0.1, 1000 );
var stackingRenderer = new THREE.WebGLRenderer();

stackingRenderer.setSize(800, 400);
stackingRenderer.setClearColor(0xbafcff, 1);
this.parentElement.appendChild( stackingRenderer.domElement );

var stackingObjects = [];

for (let i = 0; i < 10; i++){
  let stackingBlock = new THREE.BoxGeometry( 1, i+1, 1 );
  let stackingMaterial = new THREE.MeshLambertMaterial( { color: 0xF6A2FF } );
  let stackingCube = new THREE.Mesh( stackingBlock, stackingMaterial );

  let stackingEdge = new THREE.EdgesHelper(stackingCube, 0xc096ff);
  stackingEdge.material.linewidth = 2;
  stackingCube.userData.edgeHelper = stackingEdge;
  stackingCube.position.x = i * 2 + 1;
  stackingCube.position.y = (i + 1) / 2;
  
  stackingEdge.position.x = i * 2 + 1;
  stackingEdge.position.y = (i + 1) / 2;
  stackingScene.add(stackingEdge);
  stackingScene.add(stackingCube);
  
  let stackingObject = {"cube": stackingCube, "edge": stackingEdge};
  
  stackingObjects.push(stackingObject);
  
  
}

var duration = 0;
var column = 0;

let animateStacking = function(){
  
  requestAnimationFrame( animateStacking );
  
  if(column == 10){
    column = 0;
  }
  
  if(duration <= 50){
    let stackingObject = stackingObjects[column];
    stackingObject.cube.scale.y += 0.002;
    stackingObject.edge.scale.y += 0.002;
    
    duration += 1;
  }
  
  if(duration > 50 && duration <= 100){
    let stackingObject = stackingObjects[column];
    stackingObject.cube.scale.y -= 0.002;
    stackingObject.edge.scale.y -= 0.002;
    
    duration += 2;
  }
  
  if(duration > 100){
    duration = 0;
    column += 1;
  }
  
  stackingRenderer.render( stackingScene, stackingCamera );
  
};

stackingCamera.position.set(10, 5, 10);

animateStacking();


```
<script>
import boundEval from "src/client/bound-eval.js"; 
let source = lively.query(this, ".stackingExample").textContent
boundEval(source, this).then(r => r.value)
</script>

## Experience
### Writing Text
no experience

### Customize to needs
Very customizable, can be painful though, because dealing with 3D objects and their parameters as scale, position, shade.
The environment and community is quite big, google uses it for some projects, the documentation is not as readable as ChartJS, but well maintained. 
More advanced and thus steeper learning curve as ChartJS.


