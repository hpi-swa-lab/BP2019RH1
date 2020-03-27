Gender: <select id="x_axis_grouping_select"></select>
<button id="x_axis_grouping_button">Group</button>

<script>
let districtNames = ["a", "b", "c"]
var select = lively.query(this, "#x_axis_grouping_select");
for (let district of districtNames) {
    select.options[select.options.length] = new Option(district);
}

lively.query(this, "#x_axis_grouping_button").addEventListener("click", () => {
  console.log(select.options[select.selectedIndex].value)
})

</script>