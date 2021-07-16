# JMask - JavaScript Mask component

This package provides a mask component - a reworked version of
[jQuery-Mask-Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin), without jQuery (and any other dependency either).

## Installation

```bash
yarn add @cmath10/jmask
```

or

```bash
npm i @cmath10/jmask
```

## Usage

Basic example
```javascript
import JMask from '@cmath10/jmask'

// ...

const el = document.querySelector('input#phone')
const mask = new JMask(el, '+7-000-000-00-00')
```

JMask constructor arguments:

* `el` - `Element` - element which will be managed by the mask component;
* `mask` - `string` - mask to apply;
* `options` - `object` - optional argument, provides following options:
    * `clearIfNotMatch` - `boolean` - value from input element will be erased on focus loose, if it wasn't input fully
      according the specified mask, defaults to `false`;
    * `reverse` - `boolean` - if `true`, mask accounting starts with the last characters, which makes it convenient to
      enter, for example, financial values, defaults to `false`;
    * `keysExcluded` - `number[]` - an array of keycodes that will be excluded from accounting, needed for non-character
      keys so that they can be used as usual; by default excluded:
        * `alt` (both, left & right);
        * `ctrl` (both, left & right);
        * `home`;
        * `shift` (both, left & right);
        * `tab`;
        * `window` (left);
        * arrows;
    * `translations` - `object` - custom mask character definitions.
    
### Translations

By default, JMask uses translations:

* `0` - for digits [0-9], required, if `0` present in a mask, will reject any characters until a digit is entered;
* `9` - for digits [0-9], optional, if `9` present in a mask, digit could be skipped;
* `#` - for digits [0-9], allows you to enter digits in unlimited quantities;
* `A` - alphanumeric, [a-zA-Z0-9] - allows to enter one character from range [a-z] regardless of case or range [0-9];
* `S` - alphabetical, [a-zA-Z] - same as `A` but without digits.

Any other character (if no translation supplied for) considered as static - when entering reaches it, caret just will
be pushed forward to the next translatable. From the example above these are `+`, `7`, `-`, so you are able to enter a phone
number like `+7-913-815-12-22` by entering only `9138151222`

You could supply new translation by adding to the options an object like:
```javascript
{
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
}
```
Here the key is a character to translate and value is a translation config. Config contains:

* `pattern` - `RegExp` - pattern to restrict characters (allows entering only matched characters), required;
* `optional` - `bool` - if set, this character will be allowed to skip, defaults to `false`;
* `recursive` - `bool` - allows repeatable input, defaults to `false`;
* `fallback` - `string` - replacement, if entered character doesn't match the pattern and fallback id defined, component
  will use its value in masked string, defaults to `undefined`;

## Development
### Build requirements:

* NodeJS >= 12.x

### Setup

```bash
docker-compose run --rm node yarn install
```

### Tests
```bash
docker-compose run --rm node yarn test
```

### Visual testing

```bash
docker-compose run --rm node yarn build:dev
```

After webpack finishes its job, open in browser [sandbox/index.html](sandbox/index.html) to test component in action.
