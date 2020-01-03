'use strict';

const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',

  context: __dirname,

  entry: {
    index: [
      './src/jmask.js',
    ],
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'jmask.js',
    library: 'jmask',
    libraryTarget: 'umd',
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
      }],
    }],
  },

  plugins: [new CleanWebpackPlugin()],

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
        },
      }),
    ],
  },

  stats: {
    children: false,
    entrypoints: true,
    env: true,
    modules: false,
  },
};
