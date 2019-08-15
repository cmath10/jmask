const translation = {
  '0': {pattern: /\d/},
  '9': {pattern: /\d/, optional: true},
  '#': {pattern: /\d/, recursive: true},
  'A': {pattern: /[a-zA-Z0-9]/},
  'S': {pattern: /[a-zA-Z]/},
};

export {translation};

export default {
  translation,
};