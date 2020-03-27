<div class="world" id="world"></div>

<script>

import * as PIXI from 'src/external/pixi.min.js';

var world = lively.query(this, "#world");

const renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, { transparent: true });
world.appendChild(renderer.view)

const stage = new PIXI.Container();
let container
let total = 100000
let list = []
const w = renderer.view.width
const h = renderer.view.height
const size = 2
const speed = 5

function makeParticleGraphic() {
  const graphic = new PIXI.Graphics()
  graphic.beginFill(0xFF00FF);
  graphic.drawRect(0, 0, size, size);
  return graphic
}


function useParticleContainer() {
  container = new PIXI.particles.ParticleContainer(total, {alpha:true});
  const graphic = makeParticleGraphic()
  let texture = renderer.generateTexture( graphic );

  for(var i=0;i<total;i++) {
    const p = new PIXI.Sprite(texture)
    p.x = Math.random() * w
    p.y = Math.random() * h
    p.v = createVel()


    container.addChild(p)
  }

  list = container.children
  stage.addChild(container)
}

function createVel() {
  const x = range(-speed, speed)
  const y = range(-speed, speed)
  const v = {x, y}
  return v
}

function range(min, max) {
  const diff = max - min
  return min + (Math.random() * diff)
}

function useContainer() {
  container = new PIXI.Container()
  const graphic = makeParticleGraphic()
  const p = new PIXI.Sprite()
  p.addChild(graphic)
  container.addChild(p)
  stage.addChild(container)
}

function render() {
  list.map((item) => {
    item.x += item.v.x
    item.y += item.v.y
    if(item.x<0 || item.x>w) {
      item.v.x *= -1
      // item.alpha *= .5;
    }else if(item.y<0 || item.y>h) {
      item.v.y *= -1
      // item.alpha *= .5;
    }

  })
  renderer.render(stage)
  if (lively.isInBody(world)) {
    requestAnimationFrame(render)
  }
}

useParticleContainer()
// useContainer()
render()

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

</script>