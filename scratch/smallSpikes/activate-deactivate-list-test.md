<bp2019-activate-deactivate-list-widget id="list"></bp2019-activate-deactivate-list-widget>

<script>

class Listener {
  constructor() {}

  onItemsActivated(activatedItems) {
    lively.notify("activated: " + activatedItems)
  }
  
  onItemsDeactivated(deactivatedItems) {
    lively.notify("deactivated: " + deactivatedItems)
  }
}

let activeItems = ["item 1", "item 2", "item 3", "item 4", "item 5", "item 6", "item 7"]
let inactiveItems = ["item 8", "item 9"]

let listener = new Listener()

let list = lively.query(this, "#list")

list.addListener(listener)
list.setActiveItems(activeItems)
list.setInactiveItems(inactiveItems)

</script>