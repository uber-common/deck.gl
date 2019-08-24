/* eslint-disable */
// Entry point for local Jupyter notebook development
// Requires that `npx webpack-development
define(function() {
  'use strict';

  requirejs.config({
    map: {
      '*': {
        '@deck.gl/jupyter-widget': 'nbextension/pydeck/index'
      }
    },
    paths: {
      'nbextension/pydeck': 'http://localhost:8080',
      deckgl: 'https://cdn.jsdelivr.net/npm/deck.gl@~7.2.0/dist/dist.dev',
      mapboxgl: 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.1/mapbox-gl',
      h3: 'https://unpkg.com/h3-js@3.4.3/dist/h3-js.umd',
      S2: 'https://unpkg.com/s2-geometry@1.2.10/src/s2geometry'
    }
  });
  // Export the required load_ipython_extension function
  return {
    load_ipython_extension: function() {}
  };
});
