/* global window */
import {
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  GridLayer
} from '../src';

import {
  ScatterplotLayer64,
  ArcLayer64,
  ChoroplethLayer64
} from '../src/layers/fp64';

import {
  HexagonLayer,
  EnhancedChoroplethLayer,
  PointCloudLayer,
  VoronoiLayer
} from '../src/layers/samples';

export function ArcLayerExample(props) {
  const {mapViewState, arcs} = props;

  return new ArcLayer({
    id: props.id || 'arcLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: arcs,
    strokeWidth: props.arcStrokeWidth || 1,
    isPickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });
}

export function ChoroplethLayerContourExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: props.id || 'choroplethContourLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.8,
    drawContour: true
  });
}

export function ChoroplethLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: props.id || 'choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.01,
    isPickable: true,
    onHover: props.onChoroplethHovered,
    onClick: props.onChoroplethClicked
  });
}

export function GridLayerExample(props) {
  const {mapViewState, points} = props;

  return new GridLayer({
    id: props.id || 'gridLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    isPickable: false,
    opacity: 0.06,
    data: points
  });
}

export function LineLayerExample(props) {
  const {mapViewState, lines} = props;

  return new LineLayer({
    id: props.id || 'lineLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: lines,
    strokeWidth: props.lineStrokeWidth || 1,
    isPickable: true,
    onHover: props.onLineHovered,
    onClick: props.onLineClicked
  });
}

export function ScatterplotLayerExample(props) {
  const {mapViewState, points} = props;

  return new ScatterplotLayer({
    id: props.id || 'scatterplotLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: points,
    opacity: 0.5,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

export function ScatterplotLayerMeterExample(props) {
  const {mapViewState} = props;

  return new ScatterplotLayer({
    id: props.id || 'scatterplotLayer-meters',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    projectionMode: 2,
    projectionCenter: [mapViewState.longitude, mapViewState.latitude],
    data: [
      {position: [0, 0]},
      {position: [20, 20]},
      {position: [100, 100]},
      {position: [-50, 200]},
      {position: [1000, 1000]}
    ],
    opacity: 0.5,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

// 64 BIT LAYER EXAMPLES

export function ScatterplotLayer64Example(props) {
  const {mapViewState, points} = props;

  return new ScatterplotLayer64({
    id: props.id || 'scatterplotLayer64',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: points,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

export function ArcLayer64Example(props) {
  const {mapViewState, arcs} = props;

  return new ArcLayer64({
    id: props.id || 'arcLayer64',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: arcs,
    strokeWidth: props.arcStrokeWidth || 1,
    isPickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });
}

export function ChoroplethLayer64ContourExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer64({
    id: props.id || 'choroplethContourLayer64',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.8,
    drawContour: true
  });
}

export function ChoroplethLayer64SolidExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: props.id || 'choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.01,
    isPickable: true,
    onHover: props.onChoroplethHovered,
    onClick: props.onChoroplethClicked
  });
}

// SAMPLE LAYER EXAMPLES

export function EnhancedChoroplethLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new EnhancedChoroplethLayer({
    id: props.id || 'enhanced-choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.01,
    isPickable: true,
    onHover: props.onChoroplethHovered,
    onClick: props.onChoroplethClicked
  });
}

export function PointCloudLayerExample(props) {
  const {mapViewState, points} = props;

  return new PointCloudLayer({
    id: props.id || 'experimentalScatterplotLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: points,
    opacity: 0.5,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

export function HexagonLayerExample(props) {
  const {mapViewState, hexData} = props;

  return new HexagonLayer({
    id: props.id || 'hexagonLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: hexData,
    opacity: 0.5,
    elevation: 200,
    isPickable: true,
    onHover: props.onHexagonHovered,
    onClick: props.onHexagonClicked
  });
}

export function HexagonLayerSelectionExample(props) {
  const {mapViewState} = props;
  const {selectedHexagons} = props;

  return new HexagonLayer({
    id: props.id || 'hexagonSelectionLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: selectedHexagons,
    opacity: 0.1,
    elevation: 200,
    isPickable: false
  });
}

// let points100K = null;
export function VoronoiLayerExample(props) {
  const {mapViewState, points} = props;

  return new VoronoiLayer({
    id: props.id || 'voronoiLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: points,
    opacity: 1
  });
}

// Returns new array N times larger than input array
// filled with duplicate elements
// Avoids Array.concat (which generates temporary huge arrays)
// Avoids Array.push (which keeps reallocating the array)
function duplicateArray(array, N = 10) {
  const length = array.length;
  const newArray = Array(N * length);
  for (let i = 0; i < N; ++i) {
    for (let j = 0; j < array.length; ++j) {
      newArray[i * length + j] = array[j];
    }
  }
  return newArray;
}

function makePoints(N = 1e6, color = [88, 220, 124]) {
  const center = [
    -122.42694203247012,
    37.751537058389985
  ];
  const spread = 2;

  const points = Array(N);
  for (let i = 0; i < N; ++i) {
    points[i] = {
      position: [
        center[0] + (Math.random() - 0.5) * spread,
        center[1] + (Math.random() - 0.5) * spread,
        0.0
      ],
      color,
      radius: Math.random() + 0.5
    };
  }
  return points;
}

let points1M = null;
function make1MPoints() {
  points1M = points1M || makePoints(1e6);
  return {points: points1M, isPickable: false};
}

let points10M = null;
function make10MPoints() {
  points10M = points10M || duplicateArray(makePoints(1e6, [124, 200, 10]), 10);
  // Too slow
  // points10M = makePoints(1e7, [124, 88, 220]);
  return {points: points10M, isPickable: false};
}

let points100K = null;
function make100KPoints() {
  points100K = points100K || makePoints(1e5);
  return {points: points100K, isPickable: false};
}

export default {
  'Core Layers': {
    ArcLayer: ArcLayerExample,
    'ChoroplethLayer (Solid)': ChoroplethLayerExample,
    'ChoroplethLayer (Contour)': ChoroplethLayerContourExample,
    GridLayer: GridLayerExample,
    LineLayer: LineLayerExample,
    ScatterplotLayer: ScatterplotLayerExample,
    'ScatterplotLayer (meters)': ScatterplotLayerMeterExample
  },

  '64-bit Layers': {
    ScatterplotLayer64: ScatterplotLayer64Example,
    ArcLayer64: ArcLayer64Example,
    'ChoroplethLayer64 (Solid)': ChoroplethLayer64SolidExample,
    'ChoroplethLayer64 (Contour)': ChoroplethLayer64ContourExample,
  },

  'Sample Layers': {
    HexagonLayer: HexagonLayerExample,
    'HexagonLayer (selection)': HexagonLayerSelectionExample,
    EnhancedChoroplethLayer: EnhancedChoroplethLayerExample,
    PointCloudLayer: PointCloudLayerExample,
    VoronoiLayer: VoronoiLayerExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': [ScatterplotLayerExample, make1MPoints],
    'ScatterplotLayer 10M': [ScatterplotLayerExample, make10MPoints],
    'ScatterplotLayer64 100K': [ScatterplotLayer64Example, make100KPoints],
    'ScatterplotLayer64 1M': [ScatterplotLayer64Example, make1MPoints],
    'ScatterplotLayer64 10M': [ScatterplotLayer64Example, make10MPoints]
  }
};

export const DEFAULT_ACTIVE_LAYERS = {
  VoronoiLayer: true
  // 'ChoroplethLayer (Contour)': true,
  // ScatterplotLayer: true
  // 'ScatterplotLayer64 10M': true
};
