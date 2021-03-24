'use strict'

const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',

  context: __dirname,

  entry: {
    index: [
      'core-js/es/array',
      'core-js/es/promise',
      './index.js',
    ],
  },

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './build'),
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      }],
    }],
  },

  plugins: [new CleanWebpackPlugin()],

  devtool: 'source-map',

  stats: {
    children: false,
    entrypoints: true,
    env: true,
    modules: false,
  },
}
