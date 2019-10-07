# Dies ist eine Überschrift

## A Button

<script>
var button = <button>Hello</button>
button
</script>

## A Text Editor

<script>
var comp;
(async () => {
  comp = await (<lively-code-mirror></lively-code-mirror>)
  comp.value  = "// this is some text"
  lively.setExtent(comp, lively.pt(800,300))
  return comp
})()
</script>


## A Barchart


<script>
var comp;
(async () => {
  comp = await (<d3-barchart></d3-barchart>)
  lively.setExtent(comp, lively.pt(300,300))
  comp.config({
      color(d) {
        if (!this.colorGen) {
          this.colorGen = d3.scaleOrdinal(d3.schemeCategory10);
        }
        
        return this.colorGen(d.label)
      }
    });
    comp.setData([
      {label: "a", x0: 0,  x1: 14, 
       children: [
         {label: "a1", x0: 4,  x1: 8},
         {label: "a2", x0: 8,  x1: 12},
        ]}, 
      {label: "b", x0: 3, x1: 8}, 
      {label: "c", x0: 5, x1: 15}, 
      {label: "d", x0: 2, x1: 16}, 
      {label: "e", x0: 0, x1: 23}, 
      {label: "f", x0: 10, x1: 42, 
        children: [
         {label: "f1", x0: 11,  x1: 16},
         {label: "f2", x0: 18,  x1: 40},
        ]}
    ])
    comp.updateViz() 
  
  return comp
})()
</script>

