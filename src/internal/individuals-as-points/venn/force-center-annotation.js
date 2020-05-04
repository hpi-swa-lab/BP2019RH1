export default class Annotation {
  
  constructor(forceCenterThemeGroups) {
    this.forceCenterThemeGroups = forceCenterThemeGroups
    this.individuals = []
    this.hidden = true
    this.x = null
    this.y = null
    this.heading = this._generateHeading()
    this.contentItems = this._generateContent()
    this.html = this._generateHTML()
    
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
    this.forceCenterThemeGroups.forEach( forceCenterThemeGroup => {
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
    return content
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
    let annotationContentAsHTML = this._buildAnnotationContentParagraph()
    
    annotationRootAsHTML.appendChild(annotationHeadingAsHTML)
    annotationRootAsHTML.appendChild(annotationContentAsHTML)
    
    return annotationRootAsHTML
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
      padding: '8px',
      marginTop: '-20px',
      font: '10px sans-serif',
      background: 'rgba(100, 100, 100, 0.4)',
      zIndex: '100',
      visibility: 'hidden',
      borderRadius: "10px",
      maxHeight: '300px',
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
    let contentList = <ul ></ul>;
    contentList = this._appendThemesAsListItems(contentList)
    contentList.classList.add(...this._getBootstrapStylesForContentList())
    return contentList
  }
  
  _appendThemesAsListItems(contentList) {
    this.contentItems.forEach( contentItem => {
      let listItem = <li style="background-color: rgba(255, 255, 255, 0.4)"></li>;
      listItem.innerHTML = contentItem
      listItem.classList.add(...this._getBootstrapStylesForContentItem())
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