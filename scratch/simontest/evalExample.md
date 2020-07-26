### Evaluation Demo

```javascript {.evalExample}
let x = 5 + 6;
lively.query(this, '#demoParagraph').innerHTML = x;
```

Which will produce this...

<script>
import boundEval from "src/client/bound-eval.js";
debugger;
var source = lively.query(this, ".evalExample").textContent
boundEval(source, this).then(r => r.value)
</script>

<p id="demoParagraph"></p>