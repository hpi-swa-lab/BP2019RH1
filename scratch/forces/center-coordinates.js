export default class CenterCoordinatesForGroups {
  constructor(groups) {
    this.groups = groups
    this.centerCoordinatesForGroups = {}
    
    this._createCenterCoordinatesForGroups()
  }
  
  // ------------------------------------------
  // Public Methods
  // ------------------------------------------
  
  coordinatesForGroup(groupName) {
    return this.centerCoordinatesForGroups[groupName]
  }
  
  setCoordinatesForGroup(groupName, coordinates){
    this.centerCoordinatesForGroups[groupName] = coordinates;
  }
  
  getAllCenterCoordinatesWithGroups() {
    let coordinates = [];
    Object.keys(this.centerCoordinatesForGroups).forEach(group => {
      let coordinate = this.centerCoordinatesForGroups[group];
      coordinate['group'] = group;
      coordinate['is_center'] = true;
      coordinates.push(coordinate)
    })
    
    return coordinates;
  }
  
  // ------------------------------------------
  // Private Methods
  // ------------------------------------------
  
  _createCenterCoordinatesForGroups() {
    switch(this.groups.length) {
      case (2): {
        let centerCoordinates = this._centerCoordinatesFor2()
        this._buildCenterCoordinatesForGroup(centerCoordinates)
        break;
      }
      case (4): {
        let centerCoordinates = this._centerCoordinatesFor4()
        this._buildCenterCoordinatesForGroup(centerCoordinates)
        break;
      }
      case (8): {
        let centerCoordinates = this._centerCoordinatesFor8()
        this._buildCenterCoordinatesForGroup(centerCoordinates)
        break;
      }
      default:
        lively.notify('Please choose 2, 4 or 8 centers')
        break;
    }
  }
  
  _buildCenterCoordinatesForGroup(centerCoordinates) {
    this.groups.forEach( (group, idx) => {
        this.centerCoordinatesForGroups[group.name] = centerCoordinates[idx]
    })
  }
  
  _centerCoordinatesFor2() {
    let coordinateCenter1 = {x: 100, y: 0}
    let coordinateCenter2 = {x: 700, y: 0}
    return [coordinateCenter1, coordinateCenter2]
  }
  
  _centerCoordinatesFor4() {
    let coordinateCenter1 = {x: 0, y: 20}
    let coordinateCenter2 = {x: 400, y: 20}
    let coordinateCenter3 = {x: 800, y: 20}
    let coordinateCenter4 = {x: 400, y: 400}
    return [coordinateCenter1, 
            coordinateCenter2,
            coordinateCenter3, 
            coordinateCenter4]
  }
  
  _centerCoordinatesFor8() {
    let coordinateCenter1 = {x: 500, y: 400}
    let coordinateCenter5 = {x: 200, y: 400}
    let coordinateCenter3 = {x: 400, y: 300}
    let coordinateCenter4 = {x: 100, y: 200}
    let coordinateCenter7 = {x: 800, y: 700}
    let coordinateCenter6 = {x: 600, y: 200}
    let coordinateCenter2 = {x: 200, y: 600}
    let coordinateCenter8 = {x: 100, y: 400}
    return [coordinateCenter1, 
            coordinateCenter2,
            coordinateCenter3, 
            coordinateCenter4,
            coordinateCenter5, 
            coordinateCenter6,
            coordinateCenter7, 
            coordinateCenter8]
  }
}