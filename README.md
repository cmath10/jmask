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

The package ships both ESM and CommonJS entry points via `exports`.

## Usage

Basic example
```javascript
import { mask, unmask } from '@cmath10/jmask'

// ...

const el = document.querySelector('input#phone')
const destroy = mask(el, '+7-000-000-00-00')

// later
destroy()
unmask(el)
```

`mask()` arguments:

* `el` - `Element` - element which will be managed by the mask component;
* `mask` - `string` - mask to apply;
* `options` - `object` - optional argument, provides following options:
    * `clearIfNotMatch` - `boolean` - value from input element will be erased on focus loose, if it wasn't input fully
      according the specified mask, defaults to `false`;
    * `reverse` - `boolean` - if `true`, mask accounting starts with the last characters, which makes it convenient to
      enter, for example, financial values, defaults to `false`;
    * `exclude` - `string[]` - an array of keys that will be excluded from accounting, needed for non-character
      keys so that they can be used as usual; by default excluded:
        * `alt` (both, left & right);
        * `backspace`
        * `ctrl` (both, left & right);
        * `home`;
        * `shift` (both, left & right);
        * `tab`;
        * `window` (left);
        * arrows;
    * `descriptors` - `object` - custom mask character definitions.
    
`mask()` returns a cleanup function. You can also call `unmask(el)` directly for idempotent teardown.

### Descriptors

By default, JMask uses descriptors:

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

* NodeJS >= 20.19.x

### Setup

```bash
yarn install
```

### Tests
```bash
yarn test
```

### Typecheck

```bash
yarn typecheck
make typecheck
```

### Coverage

Run unit, E2E, and merged V8 coverage reports:

```bash
yarn coverage
```

Run only one suite:

```bash
yarn coverage:unit
yarn coverage:e2e
```

Run the same checks inside containers via `make`:

```bash
make test
make test-e2e
make coverage
```

### E2E tests

Run the Vitest + Playwright suite locally:

```bash
yarn test:e2e
```

Run the same suite inside containers:

```bash
make test-e2e
```

## Release

Run the `Release` workflow from GitHub Actions and choose the release type:

```bash
auto | patch | minor | major
```

The workflow creates the release commit, pushes the tag, runs the checks, builds the package, and publishes it to npm through Trusted Publishing without npm tokens. The trusted publisher must be configured on npm for the exact workflow filename `release.yml`.

### Visual testing

```bash
yarn sandbox:serve
```
