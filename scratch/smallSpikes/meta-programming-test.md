<button id="notifyButton">Click me</button>

```javascript
class TestClass {
  constructor(button) {
    button.addEventListener("click", () => {
      this.runMethod(this.notify)
    })
  }
  
  runMethod(method) {
    method()
  }
  
  notify() {
    lively.notify("Meta works")
  }
}

let button = lively.query(this, "#notifyButton")
let test = new TestClass(button)
```

<script>

class TestClass {
  constructor(button) {
    button.addEventListener("click", () => {
      this.runMethod(this.notify)
    })
  }
  
  runMethod(method) {
    method()
  }
  
  notify() {
    lively.notify("Meta works")
  }
}

let button = lively.query(this, "#notifyButton")
let test = new TestClass(button)

</script>