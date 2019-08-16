import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {
  COORDINATE_SYSTEM,
  SimpleMeshLayer,
  OrbitView,
  SolidPolygonLayer,
  DirectionalLight,
  LightingEffect,
  AmbientLight
} from 'deck.gl';

import {OBJLoader} from '@loaders.gl/obj';
import {registerLoaders} from '@loaders.gl/core';

// Add the loaders that handle your mesh format here
registerLoaders([OBJLoader]);

const MESH_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/mesh/minicooper.obj';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 30,
  zoom: 0
};

const SAMPLE_DATA = (([xCount, yCount], spacing) => {
  const data = [];
  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      data.push({
        position: [(x - (xCount - 1) / 2) * spacing, (y - (yCount - 1) / 2) * spacing],
        color: [(x / (xCount - 1)) * 255, 128, (y / (yCount - 1)) * 255],
        orientation: [(x / (xCount - 1)) * 60 - 30, 0, -90]
      });
    }
  }
  return data;
})([10, 10], 120);

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-10, -2, -15],
  _shadow: true
});

const lightingEffect = new LightingEffect({ambientLight, dirLight});

const background = [
  [[-1000.0, -1000.0, -40], [1000.0, -1000.0, -40], [1000.0, 1000.0, -40], [-1000.0, 1000.0, -40]]
];

class Example extends PureComponent {
  render() {
    const layers = [
      new SimpleMeshLayer({
        id: 'mini-coopers',
        data: SAMPLE_DATA,
        mesh: MESH_URL,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getColor: d => d.color,
        getOrientation: d => d.orientation
      }),
      // only needed when using shadows - a plane for shadows to drop on
      new SolidPolygonLayer({
        id: 'background',
        data: background,
        opacity: 1,
        extruded: false,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPolygon: f => f,
        getFillColor: [0, 0, 0, 0]
      })
    ];

    return (
      <DeckGL
        views={
          new OrbitView({
            near: 0.1,
            far: 2
          })
        }
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        effects={[lightingEffect]}
      />
    );
  }
}

export function renderToDOM(container) {
  render(<Example />, container);
}
