# Hey

- einkaufen
- lernen
- staubsaugen
- haha
- geht das auch

<script>
import Files from "src/client/files.js"
var list = Array.from(this.parentElement.querySelectorAll("ul li")) 
list.length + " things to do..."


var md = lively.query(this, "lively-markdown");
Files.generateMarkdownFileListing(md.shadowRoot)
</script>