export default class JMaskBuffer {
  constructor (reverse) {
    this._chars = []
    this._reverse = reverse
  }

  get reverse () {
    return this._reverse
  }

  get length () {
    return this._chars.length
  }

  add (char) {
    if (this._reverse) {
      this._chars.unshift(char)
    } else {
      this._chars.push(char)
    }
  }

  push (char) {
    this._chars.push(char)
  }

  toString () {
    return this._chars.join('')
  }
}
