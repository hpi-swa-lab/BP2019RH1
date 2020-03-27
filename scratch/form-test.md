<style>
#wrapper {
    width: 1600px;
    height: 720px;
}
.canvas {
    width: 1280px;
    height: 720px;
    border: 1px solid black;
}
.controlPane {
    width: 300px;
    height: 720px;
    border: 1px solid black;
}
.left {
  float: left
}
.right {
  float: right
}
</style>

<div id="wrapper">
  <div class="left">
    <div class="canvas" id="canvas_0"></div>
  </div>
  <div class="right controlPane">
    <form id="grouping_form">
      <div>
        <text>Gender</text>
          <label>
            <input type="checkbox" id="gender_x_0" name="gender_x_0" value="true">
            x
          </label>
          <label>
            <input type="checkbox" id="gender_y_0" name="gender_y_0" value="true">
            y
          </label> 
      </div>
    </form>
    <button id="apply_grouping">Apply Grouping</button>
  </div>
</div>

<script>

let form = lively.query(this, "#grouping_form")
lively.query(this, "#apply_grouping").addEventListener("click", () => {console.log(form.gender_y_0.value)})

</script>