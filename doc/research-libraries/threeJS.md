# ThreeJS

## simple example

```javascript {.chartExample .}

import THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/109/three.js"

var scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, 2, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer();

renderer.setSize( 800, 400 );
renderer.setClearColor( 0xfcba03, 1);
this.parentElement.appendChild( renderer.domElement );
let geometry = new THREE.BoxGeometry( 3, 2, 4 );
let material = new THREE.MeshLambertMaterial( { color: 0x00005c } );
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
const pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

animate();
```
<lively-script><script>import boundEval from "src/client/bound-eval.js"; let source = lively.query(this, ".chartExample").textContent boundEval(source, this).then(r => r.value)</script> </lively-script><canvas width="800" height="400" style="width: 800px; height: 400px;"></canvas>