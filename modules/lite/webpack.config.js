/* global process */
const {resolve} = require('path');
const webpack = require('webpack');

const PACKAGE_ROOT = resolve(__dirname, '.');
const ROOT = resolve(PACKAGE_ROOT, '../..');
const CORE_VERSION = require(resolve(ROOT, 'node_modules/@deck.gl/core/package.json')).version;

const config = {
  resolve: {
    alias: {
      '@deck.gl/core': resolve(ROOT, 'node_modules/@deck.gl/core/src')
    }
  },

  module: {
    rules: [
      {
        // Compile ES2015 using babel
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/
      }
    ]
  }
};

const devConfig = Object.assign({}, config, {
  entry: resolve(PACKAGE_ROOT, 'test/index.js'),

  mode: 'development',

  devServer: {
    contentBase: resolve(PACKAGE_ROOT, 'test')
  },

  plugins: [
    new webpack.DefinePlugin({
      __MAPBOX_TOKEN__: JSON.stringify(process.env.MapboxAccessToken) // eslint-disable-line
    })
  ]
});

const prodConfig = Object.assign({}, config, {
  entry: resolve(PACKAGE_ROOT, 'src/index.js'),

  mode: 'production',

  output: {
    libraryTarget: 'umd',
    path: resolve(PACKAGE_ROOT, 'dist'),
    filename: 'deckgl.min.js'
  },

  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(CORE_VERSION)
    })
  ],

  devtool: ''
});

module.exports = env => (env ? devConfig : prodConfig);
