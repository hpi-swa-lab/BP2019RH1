export class Filterer {
  
  constructor(attributes) {
    this.attributes = attributes
    this.currentFilters = {}
    this.attributes.forEach((attribute) => this.currentFilters[attribute] = [])
    
    this.activeFilterExpr = (point) => {
      let currentFilterExpr = true
      for (let [key, value] of Object.entries(this.currentFilters)) {
        value.forEach(value => currentFilterExpr = currentFilterExpr && point[key] != value )
      }
      return currentFilterExpr
    };
  }
  
  initFilterSelectBoxes(containerElement, data, world, drawPoints) {
    
    for (let attribute of this.attributes) {
      
      let uniqueValues = [...new Set(data.map( item => 
          { if (item[attribute] instanceof Array) {
              return item[attribute].sort().join(","); // set only works on objects and primitives
            } else {
              return item[attribute];
          }}
      ))]

      let filterElement = <div></div>
      let textElement = <div></div>
      let selectElement = <select></select>
      let buttonElement = <button>Filter!</button>

      uniqueValues.sort()
      
      filterElement.id = "filter-" + attribute
      selectElement.id = "filter-" + attribute + "-select"
      buttonElement.id = "filter-" + attribute + "-button"
      textElement.innerHTML = attribute + ": "

      for (let value of uniqueValues) {
        selectElement.options[selectElement.options.length] = new Option(value)
      }
      
      filterElement.appendChild(textElement)
      filterElement.appendChild(selectElement)
      filterElement.appendChild(buttonElement)
      
      containerElement.appendChild(filterElement)


      buttonElement.addEventListener("click", () => {

        let value = selectElement.options[selectElement.selectedIndex].value

        if (!this.currentFilters[attribute].includes(value)) {
          this.addFilterAndFilterButton(attribute, value, containerElement, drawPoints)
        }

        drawPoints()
      })
    }
  }
  
  addFilterAndFilterButton(attribute, value, filterBar, drawPoints) {
    let newFilterName = <button></button>

    this.currentFilters[attribute].push(value);

    newFilterName.innerHTML = attribute + ": " + value
    newFilterName.setAttribute("value", value)

    newFilterName.addEventListener("click", () => {
      this.currentFilters[attribute] = this.currentFilters[attribute].filter(filter => filter != newFilterName.getAttribute("value"))
      drawPoints()
      filterBar.removeChild(newFilterName)
    })

    filterBar.appendChild(newFilterName)
  }
  
  getFilteredData(points) {
    return points.filter(this.activeFilterExpr)
  }
}