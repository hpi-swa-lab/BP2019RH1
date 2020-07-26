import Morph from 'src/components/widgets/lively-morph.js'
import { ThemeGroupUpdatedAction } from "../src/internal/individuals-as-points/common/actions.js"

import { THEME_GROUP_COLOR_TRANSPARENCY } from "../src/internal/individuals-as-points/venn/venn-diagram.js"

export default class ThemeGroupListItem extends Morph {
  async initialize() {
    this.colorPicker = this.get('#theme-group-color')
    this.heading = this.get("#theme-group-name")
    this.themesList = this.get('#theme-group-themes')
    this.removeButton = this.get('#theme-group-remove')
    this.editButton = this.get('#theme-group-edit')
    this.rootContainer = this.get('#root-container')
    
    this._initializeCallbacks()
    this._initializeColor()
    
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  setParent(parent) {
    this.parent = parent
  }
  
  setUUID(uuid) {
    this.uuid = uuid
  }
  
  setName(name) {
    this.name = name
    this._updateHTMLWithName(name)
  }
  
  setThemes(themes) {
    this.themes = themes
    this._updateHTMLWithThemes(themes)
  }
  
  updateName(name) {
    this.name = name
    this._updateHTMLWithName(name)
    this._applyUpdate()
  }
  
  updateThemes(themes) {
    this.themes = themes
    this._updateHTMLWithThemes(themes)
    this._applyUpdate()
  }
  
  getColor() {
    return this.colorPicker.value
  }
  
  setColor(color) {
    this.colorPicker.value = color
    this._updateColor()
  }

  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _initializeColor(){
     this.color = this.colorPicker.value
    this.rootContainer.style.backgroundColor = this.color + THEME_GROUP_COLOR_TRANSPARENCY
  }
  
  _initializeCallbacks() {
    this.colorPicker.addEventListener(
      "change", () => this._updateColor())
    this.removeButton.addEventListener(
      "click", () => this._removeSelf())
    this.editButton.addEventListener(
      "click", () => this._editSelf())
  }
  
  _updateHTMLWithName(name) {
    this.heading.innerHTML = name
  }
  
  _updateHTMLWithThemes(themes) {
    this._clearCurrentThemes()
    this._addNewThemes(themes)
  }
  
  _clearCurrentThemes() {
    let themeItems = this.themesList.querySelectorAll("li")
    for(let index=0; index<themeItems.length; index++){
      let themeItem = themeItems[index]
      this.themesList.removeChild(themeItem)
    }
  }
  
  _addNewThemes(themes) {
    themes.forEach(theme => {
      let themeItem = <li class="list-group-item py-1"></li>;
      themeItem.innerHTML = theme
      this.themesList.appendChild(themeItem)
    })
  }
  
  _updateColor() {
    this.color = this.colorPicker.value
    this.rootContainer.style.backgroundColor = this.color + THEME_GROUP_COLOR_TRANSPARENCY
    this._applyUpdate()
  }
  
  _removeSelf(){
    this.parent.removeThemeGroupListItem(this)
  }
  
  _editSelf() {
    this.parent.editThemeGroupListItem(this)
  }
  
  _applyUpdate() {
    let updatedAction = this._createThemeGroupUpdatedAction()
    this.parent.applyAction(updatedAction)
  }
  
  _createThemeGroupUpdatedAction() {
    return new ThemeGroupUpdatedAction(
      this.uuid,
      this.name,
      this.themes,
      false,
      this.color)
  }
  
}