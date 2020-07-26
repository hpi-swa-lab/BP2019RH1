export default class Annotation {
  constructor(forceCenterThemeGroups) {
    this.forceCenterThemeGroups = forceCenterThemeGroups
    this.individuals = []
    this.hidden = false
    this.x = null
    this.y = null
    this.heading = this._generateHeading()
    //this.contentItems = this._generateContent()
    this.contentItems = []
    this.html = this._generateHTML()
    
    if (this.forceCenterThemeGroups.length > 1) {
      this._hide()
    }
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  updatePosition(forceCenterX, forceCenterY) {
    this._setPositionRelative(forceCenterX, forceCenterY)
  }
  
  toggle() {
    if(this.hidden) {
      this._show()
    } else {
      this._hide()
    }
  }
  
  removeHTML() {
    this.html.parentNode.removeChild(this.html)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _hide() {
    this.hidden = true
    this._setVisibilityToHidden()
  }
  
  _show() {
    this.hidden = false
    this._setVisibilityToVisibile()
  }
  
  _setPositionRelative(forceCenterX, forceCenterY) {
    this.html.style.left = (forceCenterX + 20) + "px"
    this.html.style.top =  (forceCenterY + 20) + "px"
  }
  
  _generateHeading() {
    let heading = ''
    let delimiter = ' & '
    this.forceCenterThemeGroups.forEach(forceCenterThemeGroup => {
      heading += forceCenterThemeGroup.name + delimiter
    })
    heading = this._removeLastCharacters(heading, delimiter.length)
    return heading
  }
  
  _generateContent() {
    let content = []
    this.forceCenterThemeGroups.forEach( forceCenterThemeGroup => {
      let themeGroupString = this._generateStringForThemeGroup(forceCenterThemeGroup)
      content.push(themeGroupString)
    })
    return this._filterEmptyString(content)
  }
  
  _filterEmptyString(content) {
    return content.filter(themeGroupString => themeGroupString.length)
  }
  
  _generateStringForThemeGroup(themeGroup) {
    let themeGroupString = ''
    let delimiter = ' or '
    themeGroup.themes.forEach( theme => {
      themeGroupString += theme + delimiter
    })
    themeGroupString = this._removeLastCharacters(themeGroupString, delimiter.length)
    return themeGroupString
  }
  
  _generateHTML() {
    let annotationRootAsHTML = this._buildAnnotationRootDiv();
    let annotationHeadingAsHTML = this._buildAnnotationHeadingParagraph()
    
    annotationRootAsHTML.appendChild(annotationHeadingAsHTML)
    
    if(this._annotationContentIsAvailable()) {
      let annotationContentAsHTML = this._buildAnnotationContentParagraph()
      annotationRootAsHTML.appendChild(annotationContentAsHTML)
    }
    
    return annotationRootAsHTML
  }
  
  _annotationContentIsAvailable() {
    return this.contentItems.length
  }
  
  _buildAnnotationRootDiv() {
    let rootDiv = <div></div>;
    Object.assign(rootDiv.style, this._getStylePropertiesForRootDiv())
    return rootDiv
  }
  
  _getStylePropertiesForRootDiv() {
    return {
      position: 'absolute',
      textAlign: 'center',
      width: 'auto',
      padding: '5px',
      marginTop: '-20px',
      font: '10px sans-serif',
      background: 'rgba(100, 100, 100, 0.5)',
      zIndex: '100',
      visibility: 'visible',
      borderRadius: "10px",
      color: "white"
    }
  }
    
  _getStylePropertiesForList() {
    return {
      textAlign: 'left',
      padding: '1px',
      font: '10px sans-serif',
      listStylePosition: "inside"
    }
  }
  
  _buildAnnotationHeadingParagraph() {
    let headingParagraph = <p></p>;
    headingParagraph.innerHTML = this.heading
    headingParagraph.classList.add(...this._getBootstrapStylesForHeading())
    return headingParagraph
  }
  
  _getBootstrapStylesForHeading() {
    return [
      "mb-0",
      "text-center",
      "font-weight-bold"
    ]
  }
  
  _buildAnnotationContentParagraph() {
    let contentList = <ul></ul>;
    contentList = this._appendThemesAsListItems(contentList)
    Object.assign(contentList.style, this._getStylePropertiesForList())
    //contentList.classList.add(...this._getBootstrapStylesForContentList())
    return contentList
  }
  
  _appendThemesAsListItems(contentList) {
    this.contentItems.forEach( contentItem => {
      let listItem = <li></li>;
      listItem.innerHTML = contentItem
      //listItem.classList.add(...this._getBootstrapStylesForContentItem())
      contentList.appendChild(listItem)
    })
    return contentList
  }
  
  _getBootstrapStylesForContentList() {
    return [
      'list-group'
    ]
  }
  
  _getBootstrapStylesForContentItem() {
    return [
      'list-group-item',
      'py-1'
    ]
  }
    
  // ------------------------------------------
  // Utils
  // ------------------------------------------
  
  _removeLastCharacters(text, numberOfCharacters) {
    return text.substring(0, text.length - numberOfCharacters);
  }
  
  _setVisibilityToVisibile() {
    this.html.style.visibility = 'visible'
  }
  
  _setVisibilityToHidden() {
    this.html.style.visibility = 'hidden'
  }
}