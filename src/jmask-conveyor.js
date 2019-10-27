export default class JMaskConveyor {
  constructor (value, reverse) {
    this._value = value;
    this._reverse = reverse;
    this._offset = reverse ? -1 : 1;
    this._first = reverse ? value.length - 1 : 0;
    this._last = reverse ? 0 : value.length - 1;
    this._position = this._first;
  }

  forward () {
    this._position += this._offset;
  }

  back () {
    this._position -= this._offset;
  }

  get char () {
    return this._value.charAt(this._position);
  }

  get last () {
    return this._last;
  }

  get position () {
    return this._position;
  }

  set position (position) {
    this._position = position;
  }

  get offset () {
    return this._offset;
  }

  get finished () {
    return this._reverse ? this._position <= -1 : this._position >= this._value.length;
  }
}
