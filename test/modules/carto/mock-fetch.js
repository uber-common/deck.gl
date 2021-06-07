/* global global, window */
const _global = typeof global !== 'undefined' ? global : window;

export const TILEJSON_RESPONSE = {
  tilejson: '2.2.0',
  tiles: ['https://xyz.com/{z}/{x}/{y}']
};

const GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [-6.7531585693359375, 37.57505900514996]
      }
    }
  ]
};

export const MAPS_API_V1_RESPONSE = {
  metadata: {
    tilejson: {
      vector: TILEJSON_RESPONSE
    }
  }
};

export function mockFetchMapsV1() {
  const fetch = _global.fetch;
  _global.fetch = url =>
    Promise.resolve({
      json: () => MAPS_API_V1_RESPONSE,
      ok: true
    });
  return fetch;
}

export function mockFetchMapsV2() {
  const fetch = _global.fetch;
  _global.fetch = url => {
    return Promise.resolve({
      json: () => TILEJSON_RESPONSE,
      ok: true
    });
  };
  return fetch;
}

export function mockFetchMapsV3() {
  const fetch = _global.fetch;
  _global.fetch = url => {
    return Promise.resolve({
      json: () => {
        if (url.indexOf('format=tilejson') !== -1) {
          return TILEJSON_RESPONSE;
        }
        if (url.indexOf('format=geojson') !== -1) {
          return GEOJSON;
        }

        if (url.indexOf('tileset') !== -1) {
          return {
            tilejson: {
              url: ['https://xyz.com?format=tilejson']
            }
          };
        }
        if (url.indexOf('query') !== -1 || url.indexOf('table')) {
          return {
            geojson: {
              url: ['https://xyz.com?format=geojson']
            }
          };
        }
        return null;
      },
      ok: true
    });
  };
  return fetch;
}

export function restoreFetch(fetch) {
  _global.fetch = fetch;
}
