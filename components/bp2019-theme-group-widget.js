import Morph from 'src/components/widgets/lively-morph.js'
import { assertListenerInterface } from '../src/internal/individuals-as-points/common/interfaces.js'
import { ThemeGroupAddedAction, ThemeGroupUpdatedAction, ThemeGroupRemovedAction} from '../src/internal/individuals-as-points/common/actions.js'
import { generateUUID } from "../src/internal/individuals-as-points/common/utils.js"


const COLOR_PICKER_BASE_ID = "theme-group-color-picker"

export default class ThemeGroupWidget extends Morph {
  async initialize() {
    this.name = "group"
    this.isGlobal = false
    this.listeners = []
    this.themeSelect = this.get('#theme-select')
    this.get('#add-theme-group').addEventListener('click', () => this._addThemeGroup()) 
    
    this.themeGroupList = this.get('#applied-theme-groups-container')
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  addListener(listener) {
    assertListenerInterface(listener)
    this.listeners.push(listener)
  }
  
  applyAction(action) {
    this._applyActionToAllListeners(action)
  }
  
  initializeWithData(themes) {
    this._setSelectionOptions(themes)
  }
  
  removeThemeGroupListItem(themeGroupListItem) {
    this.themeGroupList.removeChild(themeGroupListItem)
    this._applyThemeGroupRemoved(themeGroupListItem.uuid)
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _setSelectionOptions(data) {
    this._clearSelectOptions(this.themeSelect) 
    data.forEach( (attribute) => {
      this.themeSelect.appendChild(new Option(attribute)) 
    }) 
  }
  
   _clearSelectOptions(select) {
    while(select.options.length > 0) {
      select.options.remove(0) 
    }
  }
   
  async _addThemeGroup() {
    let themeGroupUUID = this._generateCSSValidUUID()
    let themes = this._getSelectedThemes()
    let themeGroupName = this._getThemeGroupName()

    let newThemeGroup = await this._addThemeGroupToList(themeGroupUUID, themes, themeGroupName)
    this._applyThemeGroupAdded(newThemeGroup)
  }
  
  _generateCSSValidUUID(){
    return "a" + generateUUID()
  }
  
  _getSelectedThemes() {
    let selectedThemes = [] 
    let availableOptionsCount = this.themeSelect.options.length 
    
    for(let i = 0; i < availableOptionsCount; i++){
      let option = this.themeSelect.options[i] 
      if(option.selected){
        selectedThemes.push(option.value) 
      }
    }
      
    return selectedThemes 
  }
  
  _getThemeGroupName() {
    return this.get('#theme-group-name').value
  }
  
  async _addThemeGroupToList(themeGroupUUID, themes, themeGroupName) {
    let themeGroup = await this._createThemeGroup(themeGroupUUID, themeGroupName, themes)
    this.themeGroupList.appendChild(themeGroup)
    return themeGroup
  }
  
  async _createThemeGroup(themeGroupUUID, themeGroupName, themes) {
    let themeGroupListItem = await lively.create("bp2019-theme-group-list-item-widget")
    
    themeGroupListItem.setUUID(themeGroupUUID)
    themeGroupListItem.setName(themeGroupName)
    themeGroupListItem.setThemes(themes)
    themeGroupListItem.setParent(this)
    
    return themeGroupListItem
  }
  
  _applyThemeGroupAdded(themeGroupListItem){
    let themeGroupAddedAction = this._createNewThemeGroupAddedAction(
      themeGroupListItem.uuid,
      themeGroupListItem.name,
      themeGroupListItem.themes,
      themeGroupListItem.color)
    
    this._applyActionToAllListeners(themeGroupAddedAction)
  }
  
  _createNewThemeGroupAddedAction(themeGroupUUID, themeGroupName, themes, color){
    let isGlobal = this.get('#is-global').checked
    
    return new ThemeGroupAddedAction(themeGroupUUID, themeGroupName, themes, isGlobal, color)
  }
 
  _applyThemeGroupRemoved(themeGroupUUID){
    let themeGroupRemovedAction = this._createNewThemeGroupRemovedAction(themeGroupUUID)
    this._applyActionToAllListeners(themeGroupRemovedAction)
  }
  
  _createNewThemeGroupRemovedAction(themeGroupUUID){
    let isGlobal = this.get('#is-global').checked
    
    return new ThemeGroupRemovedAction(themeGroupUUID, isGlobal)
  }
  
  _applyActionToAllListeners(themeGroupAction) {
    this.listeners.forEach(listener => {
      listener.applyAction(themeGroupAction)
    })
  }
  
}