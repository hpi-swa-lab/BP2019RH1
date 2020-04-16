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