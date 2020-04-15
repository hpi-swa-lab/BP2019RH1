# Atoms

```javascript {.myjavascript}
lively.notify("hello")
```

<script> 
let source = this.parentElement.querySelector(".myjavascript").textContent;
let button = <button click={/*we are in javascript now*/ (evt) => eval(source) } > JUST DO IT! </button>
button
</script>

## ToDos

- [x] den Rand entlanglaufen
- [x] Stop Button für Animationen
- [x] Slider für Speed
- [x] durch den Raum bewegen
- [x] Kollisionen zwischen vielen Atomen :D
- [ ] Refactoring: Vector durch pt austauschen
- [ ] AtomSpeed, AtomSize renaming
- [ ] Atome außerhalb der World
- [ ] lively.notify extra
- [ ] Screenshots/Videos
- [ ] in .js extrahieren?
- [ ] Benennungen von worlds


<style>
.world {
  position: relative;
  width: 200px;
  height: 200px;
  background-color: lightgray;
}

.atom {
  background-color: red;
  width: 10px;
  height: 10px;
  border-radius: 5px;
}
</style>

Wir brauchen eine Welt:

<div class="world" id="world"></div>

Und dann kommt Bewegung! (zumindest bis zu einem Viertel xD)

<div class="world" id="world1"></div>

<script>
(async () => {
  let world1 = lively.query(this, "#world1")
  let atom = <div class="atom"></div>
  world1.appendChild(atom)
  lively.setPosition(atom, lively.pt(40,50))
  
  // animation loop
  let i = 0
  let run = true
  
  while (run && lively.isInBody(atom)) {
  
    lively.setPosition(atom, lively.pt(i++,50))
  
    if (i > 50) {
      run = false
    }
    
    await lively.sleep(100)
  } 
})()

""
</script>

Das Atom kann auch bis zum Ende der Welt laufen und wieder zum Anfang teleportiert werden:

<div class="world" id="world2"></div>

<script>
(async () => {
  let world2 = lively.query(this, "#world2")
  let worldWidth = lively.getExtent(world2).x
  let atom = <div class="atom"></div>
  world2.appendChild(atom)
  lively.setPosition(atom, lively.pt(40,50))
  let atomSize = lively.getExtent(atom).x
  
  let i = 0
  
  while (lively.isInBody(atom)) {
  
    lively.setPosition(atom, lively.pt(i++,50))
    
    if (i > worldWidth - atomSize) { 
      i = 0
    } 
    
    await lively.sleep(10)
  }
})()

""
</script>

Das Atom kann auch bis zum Ende der Welt laufen, am Rand abprallen und wieder zurücklaufen:

<div class="world" id="world3"></div>

<script>
(async () => {
  let world3 = lively.query(this, "#world3")
  let worldWidth = lively.getExtent(world3).x
  let atom = <div class="atom"></div>
  world3.appendChild(atom)
  lively.setPosition(atom, lively.pt(40,50))
  let atomSize = lively.getExtent(atom).x
  
  let i = 0
  let direction = 1
  
  while(lively.isInBody(atom)) {
    
    lively.setPosition(atom, lively.pt(i += direction,50))
    
    if (i > worldWidth - atomSize || i < 0) {
      direction *= -1
    } 
    
    await lively.sleep(10)
  } 
})()

""
</script>

Jetzt kann es auch an der Wand entlang laufen und sich erschrecken:

<div class="world" id="world4"></div> 

<script>
(async () => {
  
  let movementVector = lively.pt(1, 0)
  let world4 = lively.query(this, "#world4")
  let worldWidth = lively.getExtent(world4).x
  let worldHeight = lively.getExtent(world4).y
  
  let atom = <div class="atom"></div>
  world4.appendChild(atom)
  lively.setPosition(atom, lively.pt(0,0))
  let atomSize = lively.getExtent(atom).x
  
  let i = 0
  let j = 0
  let direction = 1
  
  let setDirectionButton = <button click={() => {direction *= -1; movementVector = movementVector.negated()} }>Buuuuuuuh!</button>
  world4.appendChild(setDirectionButton)
  lively.setPosition(setDirectionButton, lively.pt(worldWidth, 0))
  
  while (lively.isInBody(atom)) {
  
    lively.setPosition(atom, lively.pt(i += movementVector.x, j += movementVector.y))
    
    if (i > worldWidth - atomSize || j > worldHeight - atomSize || i < 0 || j < 0) {
      movementVector = lively.pt(movementVector.y * direction, -1 * movementVector.x * direction)
    }
      
    await lively.sleep(10)
  }
})()
""
</script>

Jetzt kann unser Atom auch anhalten!

<div class="world" id="world5"></div> 

<script>
(async () => {
  let world5 = lively.query(this, "#world5")
  let worldWidth = lively.getExtent(world5).x
  let atom = <div class="atom"></div>
  world5.appendChild(atom)
  lively.setPosition(atom, lively.pt(40,50))
  let atomSize = lively.getExtent(atom).x
  let moving = true
  
  let stopButton = <button click={() => {moving ? moving = false : moving = true} }>Freeze!</button>
  world5.appendChild(stopButton)
  lively.setPosition(stopButton, lively.pt(worldWidth, 0))

  let i = 0
  let direction = 1
  
  while(lively.isInBody(atom)) {
  
    if (moving) {
    
      lively.setPosition(atom, lively.pt(i += direction,50))
      
      if (i > worldWidth - atomSize || i < 0) {
        direction *= -1
      } 
    }
    
    await lively.sleep(10)
  } 
})()

""
</script>

Jetzt können wir die Geschwindigkeit verändern:

<div class="world" id="world6"></div> 

<div>
  <input type="range" min="-5" max="5" value="0" id="slider">
</div>

<script>
(async () => {
  let world6 = lively.query(this, "#world6")
  let worldWidth = lively.getExtent(world6).x
  let atom = <div class="atom"></div>
  world6.appendChild(atom)
  lively.setPosition(atom, lively.pt(40,50))
  let atomSize = lively.getExtent(atom).x
  let atomSpeed = 0
  let slider = lively.query(this, "#slider")
  
  world6.appendChild(slider)
  lively.setPosition(slider, lively.pt(worldWidth, 0))
  
  let i = 0
  let direction = 1
  
  while(lively.isInBody(atom)) {
    
      lively.setPosition(atom, lively.pt(i += direction * atomSpeed,50))
      atomSpeed = slider.value
      
      if (i > worldWidth - atomSize || i < 0) {
        direction *= -1
      } 
    
    await lively.sleep(10)
  } 
})()

""
</script>

Das Atom kann sich auch durch den ganzen Raum bewegen:

<div class="world" id="world7"></div> 

<script>
(async () => {
  let world7 = lively.query(this, "#world7")
  let worldWidth = lively.getExtent(world7).x
  let worldHeight = lively.getExtent(world7).y
  
  let atom = <div class="atom"></div>
  world7.appendChild(atom)
  lively.setPosition(atom, lively.pt(40,50))
  let atomSize = lively.getExtent(atom).x
  let movementVector = lively.pt(0.45, 1.75)
  
  let i = 0
  let j = 0
  let direction = 1
  
  while(lively.isInBody(atom)) {
    
      lively.setPosition(atom, lively.pt(i += direction * movementVector.x, j += direction * movementVector.y))
      
      if (i > worldWidth - atomSize || i < 0) {
        movementVector = lively.pt(-movementVector.x, movementVector.y)
      }
      
      if (j > worldWidth - atomSize || j < 0) {
        movementVector = lively.pt(movementVector.x, -movementVector.y)
      } 
    
    await lively.sleep(10)
  } 
})()

""
</script>

Jetzt gibt es gleich mehrere!

<div class="world" id="world8">

</div> 

<script>
(async () => {
  let world8 = lively.query(this, "#world8")
  let worldWidth = lively.getExtent(world8).x
  let worldHeight = lively.getExtent(world8).y
  
  var atoms = [] 
  for (let i = 0; i < 10; i++) {
    var atom = document.createElement("atom")
    atom.className = "atom"
    atoms.push(atom)
    world8.appendChild(atom)
    atoms[i].position = {x: i * 20, y: i * 20}
    lively.setPosition(atoms[i], lively.pt(atoms[i].position.x, atoms[i].position.y))
    atoms[i].movementVector = lively.pt(1, i / 10)
    atoms[i].atomSize = lively.getExtent(atoms[i]).x
  }
      
  while (lively.isInBody(atom)) {
  
    for (let k = 0; k < 10; k++) {
    
        atoms[k].position.x += atoms[k].movementVector.x
        atoms[k].position.y += atoms[k].movementVector.y
        
        lively.setPosition(atoms[k], lively.pt(atoms[k].position.x, atoms[k].position.y))

        if (atoms[k].position.x > worldWidth - atoms[k].atomSize || atoms[k].position.x < 0) {
          atoms[k].movementVector = lively.pt(-atoms[k].movementVector.x, atoms[k].movementVector.y)
        }

        if (atoms[k].position.y > worldHeight - atoms[k].atomSize || atoms[k].position.y < 0) {
          atoms[k].movementVector = lively.pt(atoms[k].movementVector.x, -atoms[k].movementVector.y)
        }         
    }
    await lively.sleep(10)
  }

})()

""
</script>

Gaaanz viele Kollisionen!!!

<div class="world" id="world9">

</div> 

<script>
function detectCollision(atoms) {
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      if (atoms[i].position.dist(atoms[j].position) <= atoms[i].size) {
      debugger
        let dx = atoms[i].position.x - atoms[j].position.x
        let dy = atoms[i].position.y - atoms[j].position.y
        let normal = lively.pt(dx, dy)
        let tangent = lively.pt(-1 * dy, dx)
        let gradient = Math.atan2(dy, dx)
        
        atoms[i].movementVector = tangent.scaleByPt(lively.pt(atoms[i].movementVector.dotProduct(tangent) * 2), lively.pt(atoms[i].movementVector.dotProduct(tangent) * 2)).subPt(atoms[i].movementVector)
        atoms[j].movementVector = tangent.scaleByPt(lively.pt(atoms[j].movementVector.dotProduct(tangent) * 2), lively.pt(atoms[j].movementVector.dotProduct(tangent) * 2)).subPt(atoms[j].movementVector)
        let temp = atoms[i].atomSpeed
        atoms[i].atomSpeed = atoms[j].atomSpeed
        atoms[j].atomSpeed = temp
        let angle = 0.5 * Math.PI + gradient
        debugger
        atoms[i].position.x += Math.sin(angle)
        atoms[i].position.y -= Math.cos(angle)
        atoms[j].position.x -= Math.sin(angle)
        atoms[j].position.y += Math.cos(angle)
      } 
    }
  }
};

(async () => {
  let world9 = lively.query(this, "#world9")
  let worldWidth = lively.getExtent(world9).x
  let worldHeight = lively.getExtent(world9).y
  
  let atoms = [] 
  let numberOfAtoms = 10
  for (let i = 0; i < numberOfAtoms; i++) {
    var atom = document.createElement("atom")
    atom.className = "atom"
    atoms.push(atom)
    world9.appendChild(atom)
    atoms[i].size = lively.getExtent(atoms[i]).x
    atoms[i].position = lively.pt(i * 20, i*20)
    lively.setPosition(atoms[i], lively.pt(atoms[i].position.x - atoms[i].size / 2 , atoms[i].position.y - atoms[i].size / 2))
    atoms[i].movementVector = lively.pt(1, i / 10)
  }
    
  while (lively.isInBody(atom)) {
  
    for (let k = 0; k < numberOfAtoms; k++) {
    
        atoms[k].position.x += atoms[k].movementVector.x
        atoms[k].position.y += atoms[k].movementVector.y
        
        lively.setPosition(atoms[k], lively.pt(atoms[k].position.x, atoms[k].position.y))

        if (atoms[k].position.x > worldWidth - atoms[k].size || atoms[k].position.x < 0) {
          atoms[k].movementVector = lively.pt(-atoms[k].movementVector.x, atoms[k].movementVector.y)
        }

        if (atoms[k].position.y > worldWidth - atoms[k].size || atoms[k].position.y < 0) {
          atoms[k].movementVector = lively.pt(atoms[k].movementVector.x, -atoms[k].movementVector.y)
        }         
    }
    detectCollision(atoms)
    await lively.sleep(10)
  }

})()

""
</script>
