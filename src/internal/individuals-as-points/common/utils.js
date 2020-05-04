export function getRandomInteger(min, max) {
      return Math.floor(Math.random() * (max - min)) + min
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function equalArrays(arrayA, arrayB) {
  let result = true
  
  if (arrayA.length != arrayB.length) {
    result = false
  }

  arrayA.forEach(element => {
    if (!arrayB.includes(element)) {
      result = false
    }
  })

  arrayB.forEach(element => {
    if(!arrayA.includes(element)) {
      result = false
    }
  })
  
  return result
}

export function generateUUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}