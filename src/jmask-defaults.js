const KEY_CODE_ALT = 18;
const KEY_CODE_ARROW_DOWN = 40;
const KEY_CODE_ARROW_LEFT = 37;
const KEY_CODE_ARROW_RIGHT = 39;
const KEY_CODE_ARROW_UP = 38;
const KEY_CODE_CTRL = 17;
const KEY_CODE_HOME = 36;
const KEY_CODE_SHIFT = 16;
const KEY_CODE_TAB = 9;
const KEY_CODE_WINDOW_LEFT = 91;

const eventSupported = function (event) {
  let el = document.createElement('div');
  let supported;

  event = 'on' + event;
  supported = event in el;

  if (!supported) {
    el.setAttribute(event, 'return;');
    supported = typeof el[event] === 'function';
  }

  el = null;

  return supported;
};

const translations = {
  '0': {pattern: /\d/},
  '9': {pattern: /\d/, optional: true},
  '#': {pattern: /\d/, recursive: true},
  'A': {pattern: /[a-zA-Z0-9]/},
  'S': {pattern: /[a-zA-Z]/},
};

export {translations};

export default {
  // old versions of chrome dont work great with input event
  useInputEvent: !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent) && eventSupported('input'),
  keysExcluded: [
    KEY_CODE_ALT,
    KEY_CODE_ARROW_DOWN,
    KEY_CODE_ARROW_LEFT,
    KEY_CODE_ARROW_RIGHT,
    KEY_CODE_ARROW_UP,
    KEY_CODE_CTRL,
    KEY_CODE_HOME,
    KEY_CODE_SHIFT,
    KEY_CODE_TAB,
    KEY_CODE_WINDOW_LEFT,
  ],
  translations,
};
