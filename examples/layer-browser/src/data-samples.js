/* load data samples for display */
import allPoints from '../data/sf.bike.parking.json';
import {pointGrid} from './utils';
import {pointsToWorldGrid} from './utils/grid-aggregator';

export {default as choropleths} from '../data/sf.zip.geo.json';
export {default as geojson} from '../data/sample.geo.json';
export {default as hexagons} from '../data/hexagons.json';
export {default as routes} from '../data/sfmta.routes.json';
export {default as trips} from '../data/trips.json';
export {default as iconAtlas} from '../data/icon-atlas.json';

export const points = allPoints;
export const positionOrigin = [-122.45, 37.75, 0];

export const worldGrid = pointsToWorldGrid(points, 0.5);

export const zigzag = [
  {path: (new Array(12)).fill(0).map(
    (d, i) => [
      positionOrigin[0] + i * i * 0.001,
      positionOrigin[1] + Math.cos(i * Math.PI) * 0.2 / (i + 4)
    ])
  }
];

// time consuming - only generate on demand

let _pointCloud = null;
export function getPointCloud() {
  if (!_pointCloud) {
    _pointCloud = pointGrid(
      2e4,
      [0, -Math.PI / 2, Math.PI * 2, Math.PI / 2],
      true
    ).map(([x, y]) => {
      const R = 1000;
      const cosx = Math.cos(x);
      const sinx = Math.sin(x);
      const cosy = Math.cos(y);
      const siny = Math.sin(y);

      return {
        position: [cosx * R * cosy, sinx * R * cosy, (siny + 1) * R],
        normal: [cosx * cosy, sinx * cosy, siny],
        color: [(siny + 1) * 128, (cosy + 1) * 128, 0]
      };
    });
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
