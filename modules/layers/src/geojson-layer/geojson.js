// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Replacement for the external assert method to reduce bundle size
// Since GeoJSON format issues are common to users we do show messages in
// this case
export default function assert(condition, message) {
  if (!condition) {
    throw new Error(`deck.gl: ${message}`);
  }
}

/**
 * "Normalizes" complete or partial GeoJSON data into iterable list of features
 * Can accept GeoJSON geometry or "Feature", "FeatureCollection" in addition
 * to plain arrays and iterables.
 * Works by extracting the feature array or wrapping single objects in an array,
 * so that subsequent code can simply iterate over features.
 *
 * @param {object} geojson - geojson data
 * @param {Object|Array} data - geojson object (FeatureCollection, Feature or
 *  Geometry) or array of features
 * @return {Array|"iteratable"} - iterable list of features
 */
export function getGeojsonFeatures(geojson) {
  // If array, assume this is a list of features
  if (Array.isArray(geojson)) {
    return geojson;
  }

  assert(geojson.type, 'GeoJSON does not have type');

  switch (geojson.type) {
    case 'GeometryCollection':
      assert(Array.isArray(geojson.geometries), 'GeoJSON does not have geometries array');
      return geojson.geometries.map(geometry => ({geometry}));
    case 'Feature':
      // Wrap the feature in a 'Features' array
      return [geojson];
    case 'FeatureCollection':
      // Just return the 'Features' array from the collection
      assert(Array.isArray(geojson.features), 'GeoJSON does not have features array');
      return geojson.features;
    default:
      // Assume it's a geometry, we'll check type in separateGeojsonFeatures
      // Wrap the geometry object in a 'Feature' object and wrap in an array
      return [{geometry: geojson}];
  }
}

// Linearize
export function separateGeojsonFeatures(features) {
  const pointFeatures = [];
  const lineFeatures = [];
  const polygonFeatures = [];
  const polygonOutlineFeatures = [];

  // Store a mapping of index within each feature type to the index of the feature within `features`
  const pointFeatureIndexes = [];
  const lineFeatureIndexes = [];
  const polygonFeatureIndexes = [];
  const polygonOutlineFeatureIndexes = [];

  for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
    const feature = features[featureIndex];

    assert(feature && feature.geometry, 'GeoJSON does not have geometry');

    const {
      geometry: {type, coordinates},
      properties
    } = feature;
    checkCoordinates(type, coordinates);

    // Split each feature, but keep track of the source feature and index (for Multi* geometries)
    switch (type) {
      case 'Point':
        pointFeatures.push(feature);
        pointFeatureIndexes.push(featureIndex);
        break;
      case 'MultiPoint':
        coordinates.forEach(point => {
          pointFeatures.push({
            geometry: {type: 'Point', coordinates: point},
            properties,
            __deckSourceFeature: feature
          });
          pointFeatureIndexes.push(featureIndex);
        });
        break;
      case 'LineString':
        lineFeatures.push(feature);
        lineFeatureIndexes.push(featureIndex);
        break;
      case 'MultiLineString':
        // Break multilinestrings into multiple lines with same properties
        coordinates.forEach(path => {
          lineFeatures.push({
            geometry: {type: 'LineString', coordinates: path},
            properties,
            __deckSourceFeature: feature
          });
          lineFeatureIndexes.push(featureIndex);
        });
        break;
      case 'Polygon':
        polygonFeatures.push(feature);
        polygonFeatureIndexes.push(featureIndex);

        // Break polygon into multiple lines with same properties
        coordinates.forEach(path => {
          polygonOutlineFeatures.push({
            geometry: {type: 'LineString', coordinates: path},
            properties,
            __deckSourceFeature: feature
          });
          polygonOutlineFeatureIndexes.push(featureIndex);
        });
        break;
      case 'MultiPolygon':
        // Break multipolygons into multiple polygons with same properties
        coordinates.forEach(polygon => {
          polygonFeatures.push({
            geometry: {type: 'Polygon', coordinates: polygon},
            properties,
            __deckSourceFeature: feature
          });
          polygonFeatureIndexes.push(featureIndex);

          // Break polygon into multiple lines with same properties
          polygon.forEach(path => {
            polygonOutlineFeatures.push({
              geometry: {type: 'LineString', coordinates: path},
              properties,
              __deckSourceFeature: feature
            });
            polygonOutlineFeatureIndexes.push(featureIndex);
          });
        });
        break;
      default:
    }
  }

  return {
    pointFeatures,
    lineFeatures,
    polygonFeatures,
    polygonOutlineFeatures,
    pointFeatureIndexes,
    lineFeatureIndexes,
    polygonFeatureIndexes,
    polygonOutlineFeatureIndexes
  };
}

/**
 * Simple GeoJSON validation util. For perf reasons we do not validate against the full spec,
 * only the following:
   - geometry.type is supported
   - geometry.coordinate has correct nesting level
 */
const COORDINATE_NEST_LEVEL = {
  Point: 1,
  MultiPoint: 2,
  LineString: 2,
  MultiLineString: 3,
  Polygon: 3,
  MultiPolygon: 4
};

function checkCoordinates(type, coordinates) {
  let nestLevel = COORDINATE_NEST_LEVEL[type];

  assert(nestLevel, `Unknown GeoJSON type ${type}`);

  while (coordinates && --nestLevel > 0) {
    coordinates = coordinates[0];
  }
  assert(coordinates && Number.isFinite(coordinates[0]), `${type} coordinates are malformed`);
}
