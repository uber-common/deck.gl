/* load data samples for display */
import allPoints from '../data/sf.bike.parking.json';
import {pointGrid} from './utils';
import {pointsToWorldGrid} from './utils/grid-aggregator';

import {default as choropleths} from '../data/sf.zip.geo.json';
import {default as geojson} from '../data/sample.geo.json';
import {default as hexagons} from '../data/hexagons.json';
import {default as routes} from '../data/sfmta.routes.json';
import {default as trips} from '../data/trips.json';
import {default as iconAtlas} from '../data/icon-atlas.json';

export {choropleths};
export {geojson};
export {hexagons};
export {routes};
export {trips};
export {iconAtlas};

export const points = allPoints;
export const positionOrigin = [-122.45, 37.75, 0];

export const worldGrid = pointsToWorldGrid(points, 0.5);

export const zigzag = [
  {
    path: new Array(12).fill(0).map((d, i) => [
      positionOrigin[0] + i * i * 0.001,
      positionOrigin[1] + Math.cos(i * Math.PI) * 0.2 / (i + 4)
    ])
  }
];

// Extract simple/complex polygons arrays from geojson
export const polygons = choropleths.features
  .map(choropleth => choropleth.geometry.coordinates);

// time consuming - only generate on demand

let _pointCloud = null;
export function getPointCloud() {
  if (!_pointCloud) {
    const RESOLUTION = 100;
    const R = 1000;
    _pointCloud = [];

    // x is longitude, from 0 to 360
    // y is latitude, from -90 to 90
    for (let yIndex = 0; yIndex <= RESOLUTION; yIndex++) {
      const y = (yIndex / RESOLUTION - 1 / 2) * Math.PI;
      const cosy = Math.cos(y);
      const siny = Math.sin(y);
      // need less samples at high latitude
      const xCount = Math.floor(cosy * RESOLUTION * 2) + 1;

      for (let xIndex = 0; xIndex < xCount; xIndex++) {
        const x = xIndex / xCount * Math.PI * 2;
        const cosx = Math.cos(x);
        const sinx = Math.sin(x);

        _pointCloud.push({
          position: [cosx * R * cosy, sinx * R * cosy, (siny + 1) * R],
          normal: [cosx * cosy, sinx * cosy, siny],
          color: [(siny + 1) * 128, (cosy + 1) * 128, 0]
        });
      }
    }
  }
  return _pointCloud;
}

let _points100K = null;
export function getPoints100K() {
  _points100K = _points100K || pointGrid(1e5, [-122.6, 37.6, -122.2, 37.9]);
  return _points100K;
}

let _points1M = null;
export function getPoints1M() {
  _points1M = _points1M || pointGrid(1e6, [-122.6, 37.6, -122.2, 37.9]);
  return _points1M;
}

let _points10M = null;
export function getPoints10M() {
  _points10M = _points10M || pointGrid(1e7, [-122.6, 37.6, -122.2, 37.9]);
  return _points10M;
}
