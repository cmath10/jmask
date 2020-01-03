# JMask - JavaScript Mask component

## Project build requirements:

* NodeJS >= 8.16.x

## Project setup

```bash
$ npm install
```

## Tests

Under Chromium headless:
```bash
$ npm run test
```

Under concrete browser (available testing via network):
```bash
$ npm run test:capture
```

To see code coverage report, open in browser `coverage/lcov-report/index.html`

## Visual testing

```bash
$ npm run build:dev
```

After webpack finishes its job, open in browser [sandbox/index.html](sandbox/index.html) to test component in action.

## Docker

Build image (if it is not built yet):
```bash
$ make docker-build
```
 
Run container:
```bash
$ bash console.sh
```
