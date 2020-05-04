export function getRandomInteger(min, max) {
      return Math.floor(Math.random() * (max - min)) + min
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function equalArrays(arrayA, arrayB) {
    if (arrayA.length !== arrayB.length) {
      return false
    }
  
    arrayA.forEach(element => {
      if (!arrayB.includes(element)) {
        return false
      }
    })
  
    arrayB.forEach(element => {
      if(!arrayA.includes(element)) {
        return false
      }
    })
  
    return true;
}

export function generate_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}