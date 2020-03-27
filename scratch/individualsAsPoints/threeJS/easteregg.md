<style>
.tooltip {
  background-color: white;
  text-align: center
}
</style>

<div class="world" id="world"></div>
<div class="tooltip" id="tooltip">Tooltip </div>


<script>
import THREE from "src/external/three.min.js"
import d3 from "src/external/d3.v5.js"

let fov = 40
let near = 10
let far = 100

let viz_width = 1000
let height = 1000

let points_num = 100000 
let canvas_radius = 25

// color the points
let color_array = [
  "#1f78b4",
  "#b2df8a",
  "#33a02c",
  "#fb9a99",
  "#e31a1c",
  "#fdbf6f",
  "#ff7f00",
  "#6a3d9a",
  "#cab2d6",
  "#ffff99"
]

  
// Anti-aliased settings



let aspect = viz_width / height;
//let camera = new THREE.PerspectiveCamera(fov, aspect, near, far + 1);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 4;

let renderer = new THREE.WebGLRenderer({antialias: true})
// Configure renderer clear color
renderer.setClearColor("#000000");

// Configure renderer size
renderer.setSize( viz_width, height );

// Append Renderer to DOM
let world = lively.query(this, "#world")
world.appendChild( renderer.domElement );


let view = d3.select(renderer.domElement)

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xefefef);

// generate and color points

let pointsGeometry = new THREE.Geometry();
  
let colors = [];

let generated_points = generatePoints(points_num, canvas_radius)

for (let datum of generated_points) {
  // Set vector coordinates from data
  let vertex = new THREE.Vector3(datum.position[0], datum.position[1], 0);
  pointsGeometry.vertices.push(vertex);
  let color = new THREE.Color(color_array[datum.group]);
  colors.push(color);
}
pointsGeometry.colors = colors;

let pointsMaterial = new THREE.PointsMaterial({
  size: 8,
  map: createCircleTexture('#ffffff', 256),
  transparent: true,
  depthWrite: false,
  sizeAttenuation: false,
  vertexColors: THREE.VertexColors
});

// Add settings from sprite_settings


var points = new THREE.Points( pointsGeometry, pointsMaterial );

scene.add(points);


// Hover functionality



let raycaster = new THREE.Raycaster()

raycaster.params.Points.threshold = 0.1; //weird debuggy thing, really needed?

view.on("mousemove", () => {
    let [mouseX, mouseY] = d3.mouse(view.node());
    let mouse_position = [mouseX, mouseY];
	checkIntersects(mouse_position);
});

view.on("mouseleave", () => {
    removeHighlights()
})

let hoverContainer = new THREE.Object3D()
scene.add(hoverContainer);


// Tooltip functionality

let tooltip = lively.query(this, "#tooltip")
tooltip.style.display = 'none' 
world.appendChild(tooltip)


// Zoom functionality

let d3_zoom = d3.zoom()
  	.scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
  	.on('zoom', () =>  {
      let d3_transform = d3.event.transform;
      zoomHandler(d3_transform);
});

setUpZoom(d3_zoom);







// Render Loop
var render = function () {
  requestAnimationFrame( render );
  
  // Render the scene
  renderer.render(scene, camera);
};

render();

function generatePoints(point_num, radius) {
  let data_points = [];
  for (let i = 0; i < point_num; i++) {
    let group = Math.floor(Math.random() * 6);
    let position = randomPosition(radius);
    let name = 'Point ' + i;
    let point = { position, name, group };
    data_points.push(point);
  }
  return data_points;
}

 function randomPosition(radius) {
  var pt_angle = Math.random() * 2 * Math.PI;
  var pt_radius_sq = Math.random() * radius * radius;
  var pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
  var pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
  return [pt_x, pt_y];
}

function createCircleTexture(color, size) {
  var matCanvas = document.createElement('canvas');
  matCanvas.width = matCanvas.height = size;
  var matContext = matCanvas.getContext('2d');
  // create texture object from canvas.
  var texture = new THREE.Texture(matCanvas);
  // Draw a circle
  var center = size / 2;
  matContext.beginPath();
  matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
  matContext.closePath();
  matContext.fillStyle = color;
  matContext.fill();
  // need to set needsUpdate
  texture.needsUpdate = true;
  // return a texture made from the canvas
  return texture;
}

// Hover helpers

function mouseToThree(mouseX, mouseY) {
  return new THREE.Vector3(
    mouseX / viz_width * 2 - 1,
    -(mouseY / height) * 2 + 1,
    1
  );
}

function checkIntersects(mouse_position) {
  let mouse_vector = mouseToThree(...mouse_position);
  raycaster.setFromCamera(mouse_vector, camera);
  let intersects = raycaster.intersectObject(points);
  if (intersects[0]) {
    let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
    let intersect = sorted_intersects[0];
    let index = intersect.index;
    let datum = generated_points[index];
    highlightPoint(datum);
    showTooltip(mouse_position, datum);
  } else {
    removeHighlights();
    hideTooltip();
  }
}

function sortIntersectsByDistanceToRay(intersects) {
  return _.sortBy(intersects, "distanceToRay");
}

function highlightPoint(datum) {
  removeHighlights();
  
  let geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(
      datum.position[0],
      datum.position[1],
      0
    )
  );
  geometry.colors = [ new THREE.Color(color_array[datum.group]) ];

  let material = new THREE.PointsMaterial({
    size: 26,
    sizeAttenuation: false,
    map: createCircleTexture('#ffffff', 256),
    transparent: true,
    depthWrite: false,
    vertexColors: THREE.VertexColors
  });
  
  let point = new THREE.Points(geometry, material);
  hoverContainer.add(point);
}

function removeHighlights() {
  hoverContainer.remove(...hoverContainer.children);
}

function showTooltip(mouse_position, datum) {
  tooltip.style.display = "block"
  tooltip.innerHTML = datum.name;
  let tooltip_width = 120;
  let x_offset = - tooltip_width/2;
  let y_offset = 30;
  let ptX = mouse_position[0] + x_offset;
  let ptY = mouse_position[1] + y_offset;
  lively.setPosition(tooltip,lively.pt(ptX, ptY))
}

function hideTooltip() {
  tooltip.style.display = "none";
}


// Zoom helpers

function getScaleFromZ (camera_z_position) {
  let half_fov = fov/2;
  let half_fov_radians = toRadians(half_fov);
  let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
  let fov_height = half_fov_height * 2;
  let scale = height / fov_height; // Divide visualization height by height derived from field of view
  return scale;
}

function getZFromScale(scale) {
  let half_fov = fov/2;
  let half_fov_radians = toRadians(half_fov);
  let scale_height = height / scale;
  let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));
  return camera_z_position;
}

function zoomHandler(d3_transform) {
  let scale = d3_transform.k;
  let x = -(d3_transform.x - viz_width/2) / scale;
  let y = (d3_transform.y - height/2) / scale;
  let z = getZFromScale(scale);
  camera.position.set(x, y, z);
}

function setUpZoom(zoom) {
    view.call(zoom);    
    let initial_scale = getScaleFromZ(far);
    var initial_transform = d3.zoomIdentity.translate(viz_width/2, height/2).scale(initial_scale);    
    zoom.transform(view, initial_transform);
    camera.position.set(0, 0, far);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}






</script>