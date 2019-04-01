// This file contains webpack configuration settings that allow
// examples to be built against the deck.gl source code in this repo instead
// of building against their installed version of deck.gl.
//
// This enables using the examples to debug the main deck.gl library source
// without publishing or npm linking, with conveniences such hot reloading etc.

// avoid destructuring for older Node version support
const resolve = require('path').resolve;

const ROOT_DIR = resolve(__dirname, '..');
const LIB_DIR = resolve(__dirname, '..');

const ALIASES = require('ocular-dev-tools/config/ocular.config')({
  root: resolve(__dirname, '..')
}).aliases;

// Support for hot reloading changes to the deck.gl library:
function makeLocalDevConfig(EXAMPLE_DIR = LIB_DIR, linkToLuma) {
  const LUMA_LINK_ALIASES = {
    '@luma.gl/constants': `${ROOT_DIR}/../luma.gl/modules/constants/src`,
    '@luma.gl/core': `${ROOT_DIR}/../luma.gl/modules/core/src`,
    '@luma.gl/debug': `${ROOT_DIR}/../luma.gl/modules/debug/src`,
    '@luma.gl/webgl': `${ROOT_DIR}/../luma.gl/modules/webgl/src`,
    '@luma.gl/webgl-state-tracker': `${ROOT_DIR}/../luma.gl/modules/webgl-state-tracker/src`,
    '@luma.gl/webgl2-polyfill': `${ROOT_DIR}/../luma.gl/modules/webgl2-polyfill/src`,
    '@luma.gl/shadertools': `${ROOT_DIR}/../luma.gl/modules/shadertools/src`
  };
  const LUMA_LOCAL_ALIASES = {
    '@luma.gl/core': `${ROOT_DIR}/node_modules/@luma.gl/core`,
    '@luma.gl/webgl': `${ROOT_DIR}/node_modules/@luma.gl/webgl`,
    '@luma.gl/webgl-state-tracker': `${ROOT_DIR}/node_modules/@luma.gl/webgl-state-tracker`,
    '@luma.gl/webgl2-polyfill': `${ROOT_DIR}/node_modules/@luma.gl/webgl2-polyfill`,
    '@luma.gl/shadertools': `${ROOT_DIR}/node_modules/@luma.gl/shadertools`
  };

  const LUMA_ALIASES = linkToLuma ? LUMA_LINK_ALIASES : LUMA_LOCAL_ALIASES;
  // console.warn(JSON.stringify(LUMA_ALIASES, null, 2)); // uncomment to debug config
  // require('fs').writeFileSync('/tmp/ocular.log', JSON.stringify(config, null, 2));

  return {
    // TODO - Uncomment when all examples use webpack 4 for faster bundling
    // mode: 'development',

    // suppress warnings about bundle size
    devServer: {
      stats: {
        warnings: false
      }
    },

    devtool: 'source-map',

    node: {
      fs: 'empty'
    },

    resolve: {
      // mainFields: ['esnext', 'module', 'main'],

      alias: Object.assign({}, ALIASES, LUMA_ALIASES, {
        // Use luma.gl installed in parallel with deck.gl
        // Important: ensure shared dependencies come from the main node_modules dir
        // Versions will be controlled by the deck.gl top level package.json
        'math.gl': resolve(LIB_DIR, './node_modules/math.gl'),
        'viewport-mercator-project': resolve(LIB_DIR, './node_modules/viewport-mercator-project'),
        seer: resolve(LIB_DIR, './node_modules/seer'),
        react: resolve(LIB_DIR, './node_modules/react')
      })
    },
    module: {
      rules: [
        {
          // Unfortunately, webpack doesn't import library sourcemaps on its own...
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        },
        {
          // Compile source using buble
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env']
          },
          include: [`${ROOT_DIR}/modules`, `${ROOT_DIR}/../luma.gl/modules`]
        }
      ]
    }
  };
}

function addLocalDevSettings(config, exampleDir, linkToLuma) {
  const LOCAL_DEV_CONFIG = makeLocalDevConfig(exampleDir, linkToLuma);
  config = Object.assign({}, LOCAL_DEV_CONFIG, config);
  config.resolve = Object.assign({}, LOCAL_DEV_CONFIG.resolve, config.resolve || {});
  config.resolve.alias = config.resolve.alias || {};
  Object.assign(config.resolve.alias, LOCAL_DEV_CONFIG.resolve.alias);

  config.module = config.module || {};
  Object.assign(config.module, {
    rules: (config.module.rules || []).concat(LOCAL_DEV_CONFIG.module.rules)
  });
  return config;
}

module.exports = (config, exampleDir) => env => {
  // npm run start-local now transpiles the lib
  if (!env) {
    return config;
  }

  if (env.local) {
    config = addLocalDevSettings(config, exampleDir, env['local-luma']);
  }

  // npm run start-es6 does not transpile the lib
  if (env && env.es6) {
    config = addLocalDevSettings(config, exampleDir, env['local-luma']);
  }

  if (env && env.production) {
    config.mode = 'production';
  }

  // console.warn(JSON.stringify(config, null, 2)); // uncomment to debug config
  return config;
};
