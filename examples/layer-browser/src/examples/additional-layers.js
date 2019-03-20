/* global window */

import {
  SimpleMeshLayer,
  ScenegraphLayer,
  GreatCircleLayer,
  S2Layer,
  H3ClusterLayer,
  H3HexagonLayer
  // KMLLayer
} from 'deck.gl';

import {_GPUGridLayer as GPUGridLayer} from '@deck.gl/aggregation-layers';
import * as h3 from 'h3-js';

import {CylinderGeometry} from 'luma.gl';
import {GLTFParser} from '@loaders.gl/gltf';
import * as dataSamples from '../data-samples';

const SimpleMeshLayerExample = {
  layer: SimpleMeshLayer,
  props: {
    id: 'mesh-layer',
    data: dataSamples.points,
    texture: 'data/texture.png',
    mesh: new Promise(resolve => {
      resolve(
        new CylinderGeometry({
          radius: 1,
          topRadius: 1,
          bottomRadius: 1,
          topCap: true,
          bottomCap: true,
          height: 5,
          nradial: 20,
          nvertical: 1
        })
      );
    }),
    sizeScale: 40,
    getPosition: d => d.COORDINATES,
    getColor: d => [0, d.RACKS * 50, d.SPACES * 20],
    getTransformMatrix: d => [
      Math.random() * 7 + 1,
      0,
      0,
      0,
      0,
      Math.random() * 7 + 1,
      0,
      0,
      0,
      0,
      Math.random() * 7 + 1,
      0,
      0,
      0,
      Math.random() * 1000,
      1
    ]
  }
};

const ScenegraphLayerExample = {
  layer: ScenegraphLayer,
  initialize: () => {
    const url =
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
    window
      .fetch(url)
      .then(res => res.arrayBuffer())
      .then(data => {
        const gltfParser = new GLTFParser();
        ScenegraphLayerExample.props.gltf = gltfParser.parse(data);
      });
  },
  props: {
    id: 'scenegraph-layer',
    data: dataSamples.points,
    pickable: true,
    sizeScale: 1,
    getPosition: d => d.COORDINATES,
    getOrientation: d => [Math.random() * 360, Math.random() * 360, Math.random() * 360],
    getTranslation: d => [0, 0, Math.random() * 10000],
    getScale: [2, 4, 2]
  }
};

const GPUGridLayerExample = {
  layer: GPUGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'gpu-grid-layer',
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: false,
    getPosition: d => d.COORDINATES
  }
};

const GPUGridLayerPerfExample = (id, getData) => ({
  layer: GPUGridLayer,
  getData,
  props: {
    id: `gpuGridLayerPerf-${id}`,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: false,
    getPosition: d => d
  }
});

const GreatCircleLayerExample = {
  layer: GreatCircleLayer,
  getData: () => dataSamples.greatCircles,
  props: {
    id: 'greatCircleLayer',
    getSourcePosition: d => d.source,
    getTargetPosition: d => d.target,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    getStrokeWidth: 5,
    pickable: true
  }
};

const S2LayerExample = {
  layer: S2Layer,
  props: {
    data: dataSamples.s2cells,
    opacity: 0.6,
    getS2Token: f => f.token,
    getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128, 128],
    getElevation: f => Math.random() * 1000,
    pickable: true
  }
};

const H3ClusterLayerExample = {
  layer: H3ClusterLayer,
  props: {
    data: ['882830829bfffff'],
    getHexagons: d => h3.kRing(d, 6),
    getLineWidth: 100,
    stroked: true,
    filled: false
  }
};

const H3HexagonLayerExample = {
  layer: H3HexagonLayer,
  props: {
    data: h3.kRing('882830829bfffff', 4),
    getHexagon: d => d,
    getColor: (d, {index}) => [255, index * 5, 0],
    getElevation: d => Math.random() * 1000
  }
};

/* eslint-disable quote-props */
export default {
  'Mesh Layers': {
    SimpleMeshLayer: SimpleMeshLayerExample,
    ScenegraphLayer: ScenegraphLayerExample
  },
  'Geo Layers': {
    S2Layer: S2LayerExample,
    H3ClusterLayer: H3ClusterLayerExample,
    H3HexagonLayer: H3HexagonLayerExample,
    GreatCircleLayer: GreatCircleLayerExample
  },
  'Experimental Core Layers': {
    GPUGridLayer: GPUGridLayerExample,
    'GPUGridLayer (1M)': GPUGridLayerPerfExample('1M', dataSamples.getPoints1M),
    'GPUGridLayer (5M)': GPUGridLayerPerfExample('5M', dataSamples.getPoints5M)
  }
};
