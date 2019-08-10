const path = require('path');
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  config.set({
    basePath: __dirname,

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: [],

    frameworks: ['chai', 'mocha', 'parcel', 'sinon'],

    reporters: ['spec', 'coverage'],

    files: [
      'tests/**/*.spec.js',
      'tests/**/*.e2e.js',
    ],

    exclude: [],

    preprocessors: {
      'tests/**/*.spec.js': ['parcel', 'sourcemap'],
      'tests/**/*.e2e.js': ['parcel', 'sourcemap'],
    },

    plugins: [
      'karma-coverage',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-parcel',
      'karma-sinon',
      'karma-sourcemap-loader',
      'karma-spec-reporter',
    ],

    coverageReporter: {
      dir: path.resolve(__dirname, 'coverage'),
      reporters: [
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'}
      ],
    },

    singleRun: true,

    concurrency: Infinity,

    customLaunchers: {
      ChromeWithoutSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ]
      }
    }
  })
};