import test from 'tape-catch';

import {MapView} from 'deck.gl';
import {shadow} from '@deck.gl/core/shaderlib';
import {Matrix4, Vector3} from 'math.gl';
import {PROJECT_COORDINATE_SYSTEM} from '@deck.gl/core/shaderlib/project/constants';

const TEST_CASE1 = [
  {
    xyz: [83095, 202499, 0],
    result: true
  },
  {
    xyz: [83094, 202499, 0],
    result: false
  },
  {
    xyz: [84056, 201943, 0],
    result: true
  },
  {
    xyz: [83730, 203113, 0],
    result: true
  },
  {
    xyz: [84056, 202043, 100],
    result: true
  },
  {
    xyz: [83730, 203113, 0],
    result: true
  },
  {
    xyz: [84271, 202801, 0],
    result: false
  }
];

const TEST_CASE2 = [
  {
    xyz: [-753, -194, 0],
    result: false
  },
  {
    xyz: [210, -749, 0],
    result: false
  },
  {
    xyz: [-117, 421, 0],
    result: true
  },
  {
    xyz: [423, 108, 0],
    result: true
  }
];

function insideClipSpace(xyz) {
  return (
    xyz[0] >= -1.0 &&
    xyz[0] <= 1.0 &&
    xyz[1] >= -1.0 &&
    xyz[1] <= 1.0 &&
    xyz[2] >= -1.0 &&
    xyz[2] <= 1.0
  );
}

test('shadow#getUniforms', t => {
  // LNG_LAT mode
  let viewport = new MapView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 10,
      bearing: -30,
      pitch: 40
    }
  });

  const viewMatrix = new Matrix4().lookAt({
    eye: new Vector3([-1, -1, -1]).negate()
  });

  let uniforms = shadow.getUniforms(
    {
      viewport,
      shadowMatrices: [viewMatrix],
      drawToShadowMap: true,
      dummyShadowMaps: [true]
    },
    {
      project_uCenter: [0, 0, 0, 0],
      project_uCoordinateSystem: PROJECT_COORDINATE_SYSTEM.LNG_LAT
    }
  );

  t.equal(uniforms.shadow_uLightCount, 1, `Shadow light count is correct!`);
  t.deepEqual(
    uniforms[`shadow_uProjectCenters[0]`],
    [0, 0, 0, 0],
    `Shadow projection center in LNG_LAT mode is correct!`
  );

  for (const value of TEST_CASE1) {
    const result = uniforms[`shadow_uViewProjectionMatrices[0]`].transformVector3(value.xyz);
    t.equal(
      insideClipSpace(result),
      value.result,
      `Shadow viewProjection matrix in LNG_LAT mode is correct!`
    );
  }

  // LNGLAT_AUTO_OFFSET mode
  viewport = new MapView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 15,
      bearing: -30,
      pitch: 40
    }
  });

  uniforms = shadow.getUniforms(
    {
      viewport,
      shadowMatrices: [viewMatrix],
      drawToShadowMap: true,
      dummyShadowMaps: [true]
    },
    {
      project_uCenter: [
        0.00019792175635302556,
        -0.00004773572436533868,
        1.3134969991051548,
        1.4999866483231017
      ]
    }
  );

  t.deepEqual(
    uniforms[`shadow_uProjectCenters[0]`].toArray(),
    [0.27978817346138385, 0.2796375220259506, 0.057706067456820165, 1.0000000000047367],
    `Shadow projection center in LNGLAT_AUTO_OFFSET mode is correct!`
  );

  for (const value of TEST_CASE2) {
    const result = uniforms[`shadow_uViewProjectionMatrices[0]`].transformVector3(value.xyz);
    const center = uniforms[`shadow_uProjectCenters[0]`];
    t.equal(
      insideClipSpace([
        (result[0] + center[0]) / center[3],
        (result[1] + center[1]) / center[3],
        (result[2] + center[2]) / center[3]
      ]),
      value.result,
      `Shadow viewProjection matrix in LNGLAT_AUTO_OFFSET mode is correct!`
    );
  }

  t.end();
});
