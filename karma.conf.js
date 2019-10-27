const path = require('path');
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  config.set({
    autoWatch: false,
    basePath: __dirname,
    browsers: [],
    colors: true,
    concurrency: Infinity,
    coverageReporter: {
      dir: path.resolve(__dirname, 'coverage'),
      reporters: [
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'},
      ],
    },
    customLaunchers: {
      ChromeWithoutSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    },
    exclude: [],
    files: [
      'tests/**/*.spec.js',
      'tests/**/*.e2e.js',
    ],
    frameworks: ['chai', 'mocha', 'sinon'],
    logLevel: config.LOG_INFO,
    plugins: [
      'karma-chai',
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-mocha',
      'karma-sinon',
      'karma-sourcemap-loader',
      'karma-spec-reporter',
      'karma-webpack',
    ],
    port: 9876,
    preprocessors: {
      'tests/**/*.spec.js': ['webpack', 'sourcemap'],
      'tests/**/*.e2e.js': ['webpack', 'sourcemap'],
    },
    reporters: ['spec', 'coverage'],
    singleRun: true,
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      entry: {
        'core-js': [
          'core-js/es/array',
          'core-js/es/object',
          'core-js/es/promise',
        ],
      },
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              cacheDirectory: true,
              sourceMaps: true,
            },
          }],
        }],
      },
      resolve: {
        alias: {
          src: path.resolve(__dirname, 'src'),
          vue$: 'vue/dist/vue.esm.js',
        },
      },
    },
    webpackMiddleware: {
      noInfo: true,
    },
  });
};
