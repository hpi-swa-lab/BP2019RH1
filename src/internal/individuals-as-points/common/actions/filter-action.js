export default class FilterAction {
  constructor(attribute, values, isGlobal) {
    this.isGlobal = isGlobal;
    this.attribute = attribute;
    this.values = values;
  }
}