<style>
/* Style the tab */
 .tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

/* Style the buttons that are used to open the tab content */
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  background-color: #ccc;
}

/* Style the tab content */
.tabcontent {
  display: none;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none;
} 

#menu-space {
  width: 300px;
}
</style>

<div id="menu-space">
  <!-- Tab links -->
  <div class="tab">
      <button class="tablinks london">London</button>
      <button class="tablinks paris">Paris</button>
      <button class="tablinks tokyo">Tokyo</button>
  </div>

  <!-- Tab content -->
  <div id="London" class="tabcontent">
      <h3>London</h3>
      <p>London is the capital city of England.</p>
  </div>

  <div id="Paris" class="tabcontent">
      <h3>Paris</h3>
      <p>Paris is the capital of France.</p>
  </div>

  <div id="Tokyo" class="tabcontent">
      <h3>Tokyo</h3>
      <p>Tokyo is the capital of Japan.</p>
  </div>

</div>

<script>
var world = this;

lively.query(this, ".london").addEventListener("click", (evt) => {
  debugger;
  openCity(evt, "london");
})

function openCity(evt, cityName) {
    debugger;
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = lively.queryAll(world, ".tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = lively.queryAll(world, ".tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    lively.queryAll(world, "#" + cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }
</script>