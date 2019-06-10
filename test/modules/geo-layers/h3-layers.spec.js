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

import test from 'tape-catch';
import {h3ToGeoBoundary, h3ToGeo} from 'h3-js';
import {experimental} from '@deck.gl/core';
const {count} = experimental;
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {H3HexagonLayer, H3ClusterLayer} from '@deck.gl/geo-layers';
import {scalePolygon, normalizeLongitudes} from '@deck.gl/geo-layers/h3-layers/h3-hexagon-layer';
import data from 'deck.gl-test/data/h3-sf.json';

const SAMPLE_PROPS = {
  data,
  getHexagon: d => d.hexagons[0]
};

test('H3HexagonLayer', t => {
  const testCases = generateLayerTests({
    Layer: H3HexagonLayer,
    sampleProps: SAMPLE_PROPS,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      t.is(subLayer.props.stroked, layer.props.stroked, 'stroked prop is forwarded');

      if (layer._shouldUseHighPrecision()) {
        t.ok(subLayer.constructor.layerName, 'PolygonLayer', 'renders polygon layer');
      } else {
        t.ok(subLayer.constructor.layerName, 'ColumnLayer', 'renders column layer');
      }
    }
  });

  testLayer({Layer: H3HexagonLayer, testCases, onError: t.notOk});

  t.end();
});

test('H3HexagonLayer#mergeTriggers', t => {
  testLayer({
    Layer: H3HexagonLayer,
    onError: t.notOk,
    testCases: [
      {
        props: Object.assign({}, SAMPLE_PROPS, {highPrecision: true}),
        onAfterUpdate({layer}) {
          t.equal(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            1,
            'With no other triggers, should use coverage as trigger'
          );
        }
      },
      {
        updateProps: {
          coverage: 0
        },
        onAfterUpdate({layer}) {
          t.equal(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            0,
            'SubLayer update trigger should be updated to new coverage value'
          );
        }
      },
      {
        updateProps: {
          updateTriggers: {getHexagon: 0}
        },
        onAfterUpdate({layer}) {
          t.deepEqual(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            {getHexagon: 0, coverage: 0},
            'SubLayer update trigger should be merged correctly'
          );
        }
      },
      {
        updateProps: {
          updateTriggers: {getHexagon: ['A', 1]}
        },
        onAfterUpdate({layer}) {
          t.deepEqual(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            {0: 'A', 1: 1, coverage: 0},
            'SubLayer update trigger should be merged correctly with Array'
          );
        }
      },
      {
        updateProps: {
          coverage: 0.75,
          updateTriggers: {getHexagon: {a: 'abc'}}
        },
        onAfterUpdate({layer}) {
          t.deepEqual(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            {a: 'abc', coverage: 0.75},
            'SubLayer update trigger should be merged correctly with Object'
          );
        }
      }
    ]
  });
  t.end();
});

test('H3HexagonLayer#scalePolygon', t => {
  const TEST_CASES = [
    {
      coverage: 0,
      verify: (vertices, hexId) => {
        const [lat, lng] = h3ToGeo(hexId);
        return vertices.every(vertex => vertex[0] === lng || vertex[1] === lat);
      }
    },
    {
      coverage: 1,
      verify: (vertices, hexId) => {
        const expectedVertices = h3ToGeoBoundary(hexId, true);
        return vertices.every(
          (vertex, i) =>
            vertex[0] === expectedVertices[i][0] || vertex[1] === expectedVertices[i][1]
        );
      }
    },
    {
      coverage: 0.5,
      verify: (vertices, hexId) => {
        const [lat, lng] = h3ToGeo(hexId);
        const end = h3ToGeoBoundary(hexId, true);

        return vertices.every(
          (vertex, i) =>
            vertex[0] === 0.5 * (lng + end[i][0]) || vertex[1] === 0.5 * (lat + end[i][1])
        );
      }
    }
  ];
  const HEXID = '88283082e1fffff';

  for (const testCase of TEST_CASES) {
    const vertices = h3ToGeoBoundary(HEXID, true);
    scalePolygon(HEXID, vertices, testCase.coverage);
    t.deepEqual(vertices[0], vertices[vertices.length - 1], 'first and last vertices should match');
    t.ok(
      testCase.verify(vertices, HEXID),
      `vertices should match for coverage: ${testCase.coverage}`
    );
  }
  t.end();
});

test('H3HexagonLayer#normalizeLongitudes', t => {
  const TEST_CASES = [
    {
      vertices: [[-180, 30], [90, 76], [180, -90], [-110, -21]],
      expected: [[-180, 30], [-270, 76], [-180, -90], [-110, -21]],
      info: 'Vertices should get normalized with first vertex longitude',
      refLng: null
    },
    {
      vertices: [[-180, 30], [90, 76], [180, -90], [-110, -21]],
      expected: [[180, 30], [90, 76], [180, -90], [250, -21]],
      refLng: 180,
      info: 'Vertices should get normalized with reference longitude'
    },
    {
      hexId: '88283082e1fffff',
      info: 'Vertices should get normalized with first vertex longitude',
      refLng: null
    },
    {
      hexId: '88283082e1fffff',
      info: 'Vertices should get normalized for longitude 1',
      refLng: 1
    },
    {
      hexId: '88283082e1fffff',
      info: 'Vertices should get normalized for longitude 98',
      refLng: 98
    },
    {
      hexId: '88283082e1fffff',
      info: 'Vertices should get normalized for longitude 170',
      refLng: 170
    },
    {
      hexId: '88283082e1fffff',
      info: 'Vertices should get normalized with first vertex longitude',
      refLng: -70
    },
    {
      hexId: '88283082e1fffff',
      info: 'Vertices should get normalized with first vertex longitude',
      refLng: -150
    }
  ];
  for (const testCase of TEST_CASES) {
    let {vertices, refLng} = testCase;
    const {expected, hexId} = testCase;
    vertices = vertices || h3ToGeoBoundary(hexId, true);
    normalizeLongitudes(vertices, refLng);
    if (expected) {
      t.deepEqual(
        vertices,
        expected,
        `Vertices should get normailized for ${refLng ? refLng : 'first vertex'}`
      );
    }
    refLng = refLng || vertices[0][0];
    t.ok(
      !vertices.find(vertex => refLng - vertex[0] > 180 || refLng - vertex[0] < -180),
      `vertices should get normaized for ${refLng}`
    );
  }
  t.end();
});

test('H3ClusterLayer', t => {
  const testCases = generateLayerTests({
    Layer: H3ClusterLayer,
    sampleProps: {
      data,
      getHexagons: d => d.hexagons
      // getElevation: d => d.size
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      t.ok(layer.state.polygons.length >= count(layer.props.data), 'polygons are generated');
    }
  });

  testLayer({Layer: H3ClusterLayer, testCases, onError: t.notOk});

  t.end();
});
