export function getRandomInteger(min, max) {
      return Math.floor(Math.random() * (max - min)) + min
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}