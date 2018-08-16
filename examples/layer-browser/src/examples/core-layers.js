import {
  COORDINATE_SYSTEM,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  PointCloudLayer,
  ScreenGridLayer,
  IconLayer,
  GridCellLayer,
  GridLayer,
  HexagonCellLayer,
  HexagonLayer,
  GeoJsonLayer,
  PolygonLayer,
  PathLayer,
  TextLayer
  //  ContourLayer
} from 'deck.gl';

import ContourLayer from '@deck.gl/layers/contour-layer/contour-layer';

// Demonstrate immutable support
import * as dataSamples from '../data-samples';
import {parseColor, setOpacity} from '../utils/color';

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.0, 8000],
  ambientRatio: 0.3,
  diffuseRatio: 0.6,
  specularRatio: 0.4,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

const ArcLayerExample = {
  layer: ArcLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'arcLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    pickable: true
  }
};

const IconLayerExample = {
  layer: IconLayer,
  getData: () => dataSamples.points,
  props: {
    iconAtlas: 'data/icon-atlas.png',
    iconMapping: dataSamples.iconAtlas,
    sizeScale: 24,
    getPosition: d => d.COORDINATES,
    getColor: d => [64, 64, 72],
    getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
    getSize: d => (d.RACKS > 2 ? 2 : 1),
    opacity: 0.8,
    pickable: true
  }
};

const GeoJsonLayerExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.geojson,
  propTypes: {
    getLineDashArray: {type: 'compound', elements: ['lineDashSizeLine']},
    lineDashSizeLine: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('getLineDashArray', [newValue, 20 - newValue]);
      }
    }
  },
  props: {
    id: 'geojsonLayer',
    getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
    getFillColor: f => {
      const color = parseColor(f.properties.fill || f.properties['marker-color']);
      const opacity = (f.properties['fill-opacity'] || 1) * 255;
      return setOpacity(color, opacity);
    },
    getLineColor: f => {
      const color = parseColor(f.properties.stroke);
      const opacity = (f.properties['stroke-opacity'] || 1) * 255;
      return setOpacity(color, opacity);
    },
    getLineDashArray: f => [20, 0],
    getLineWidth: f => f.properties['stroke-width'],
    getElevation: f => 500,
    lineWidthScale: 10,
    lineWidthMinPixels: 1,
    pickable: true,
    fp64: true,
    lightSettings: LIGHT_SETTINGS
  }
};

const GeoJsonLayerExtrudedExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.choropleths,
  props: {
    id: 'geojsonLayer-extruded',
    getElevation: f => ((f.properties.ZIP_CODE * 10) % 127) * 10,
    getFillColor: f => [0, 100, (f.properties.ZIP_CODE * 55) % 255],
    getLineColor: f => [200, 0, 80],
    extruded: true,
    wireframe: true,
    pickable: true,
    lightSettings: LIGHT_SETTINGS
  }
};

const PolygonLayerExample = {
  layer: PolygonLayer,
  getData: () => dataSamples.polygons,
  propTypes: {
    getLineDashArray: {type: 'compound', elements: ['lineDashSizeLine']},
    lineDashSizeLine: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('getLineDashArray', [newValue, 20 - newValue]);
      }
    }
  },
  props: {
    getPolygon: f => f,
    getFillColor: f => [200 + Math.random() * 55, 0, 0],
    getLineColor: f => [0, 0, 0, 255],
    getLineDashArray: f => [20, 0],
    getWidth: f => 20,
    getElevation: f => Math.random() * 1000,
    opacity: 0.8,
    pickable: true,
    lineDashJustified: true,
    lightSettings: LIGHT_SETTINGS,
    elevationScale: 0.6
  }
};

const PathLayerExample = {
  layer: PathLayer,
  getData: () => dataSamples.zigzag,
  propTypes: {
    getDashArray: {type: 'compound', elements: ['dashSizeLine']},
    dashSizeLine: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('getDashArray', [newValue, 20 - newValue]);
      }
    }
  },
  props: {
    id: 'pathLayer',
    opacity: 0.6,
    getPath: f => f.path,
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    getDashArray: f => [20, 0],
    widthMinPixels: 1,
    pickable: true
  }
};

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'screenGridLayer',
    getPosition: d => d.COORDINATES,
    cellSizePixels: 40,
    minColor: [0, 0, 80, 0],
    maxColor: [100, 255, 0, 128],
    pickable: false
  }
};

const LineLayerExample = {
  layer: LineLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'lineLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
    pickable: true
  }
};

const LineLayerExampleNewCoords = {
  layer: LineLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'lineLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_EXPERIMENTAL
  }
};

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'scatterplotLayer',
    getPosition: d => d.COORDINATES,
    getColor: d => [255, 128, 0],
    getRadius: d => d.SPACES,
    opacity: 1,
    pickable: true,
    radiusScale: 30,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  }
};

const GridCellLayerExample = {
  layer: GridCellLayer,
  props: {
    id: 'gridCellLayer',
    data: dataSamples.worldGrid.data,
    cellSize: dataSamples.worldGrid.cellSize,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: d => [245, 166, d.value * 255, 255],
    getElevation: d => d.value * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

const ContourLayerExample = {
  layer: ContourLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'contourLayer',
    cellSize: 200,
    getPosition: d => d.COORDINATES,
    gpuAggregation: true,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 4},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 2},
      {threshold: 15, color: [0, 0, 255]}
    ]
  }
};

function getMean(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => accu + curr[key], 0) / filtered.length
    : null;
}

function getMax(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => (curr[key] > accu ? curr[key] : accu), -Infinity)
    : null;
}

// hexagon/grid layer compares whether getColorValue / getElevationValue has changed to
// call out bin sorting. Here we pass in the function defined
// outside props, so it doesn't create a new function on
// every rendering pass
function getColorValue(points) {
  return getMean(points, 'SPACES');
}

function getElevationValue(points) {
  return getMax(points, 'SPACES');
}

const GridLayerExample = {
  layer: GridLayer,
  props: {
    id: 'gridLayer',
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    getPosition: d => d.COORDINATES,
    getColorValue,
    getElevationValue,
    lightSettings: LIGHT_SETTINGS
  }
};

const HexagonCellLayerExample = {
  layer: HexagonCellLayer,
  props: {
    id: 'hexagonCellLayer',
    data: dataSamples.hexagons,
    hexagonVertices: dataSamples.hexagons[0].vertices,
    coverage: 1,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

const HexagonLayerExample = {
  layer: HexagonLayer,
  props: {
    id: 'HexagonLayer',
    data: dataSamples.points,
    extruded: true,
    pickable: true,
    radius: 1000,
    opacity: 1,
    elevationScale: 1,
    elevationRange: [0, 3000],
    coverage: 1,
    getPosition: d => d.COORDINATES,
    getColorValue,
    getElevationValue,
    lightSettings: LIGHT_SETTINGS
  }
};

const TextLayerExample = {
  layer: TextLayer,
  getData: () => dataSamples.texts,
  propTypes: {
    fontFamily: {
      name: 'fontFamily',
      type: 'category',
      value: ['Monaco', 'Helvetica', 'Garamond', 'Palatino', 'Courier', 'Courier New']
    }
  },
  props: {
    id: 'text-layer',
    sizeScale: 1,
    fontFamily: 'Monaco',
    getText: x => x.LOCATION_NAME,
    getPosition: x => x.COORDINATES,
    getColor: x => [153, 0, 0],
    getAngle: x => 30,
    getTextAnchor: x => 'start',
    getAlignmentBaseline: x => 'center',
    getPixelOffset: x => [10, 0]
  }
};

const TextLayer100KExample = {
  layer: TextLayer,
  getData: dataSamples.getPoints100K,
  props: {
    id: 'text-layer-100k',
    getText: x => 'X',
    getPosition: x => x,
    getColor: x => [0, 0, 200],
    sizeScale: 1
  }
};

// METER MODE EXAMPLES

const PointCloudLayerExample = {
  layer: PointCloudLayer,
  getData: dataSamples.getPointCloud,
  props: {
    id: 'pointCloudLayer-meters',
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color,
    opacity: 1,
    radiusPixels: 4,
    pickable: true,
    lightSettings: LIGHT_SETTINGS
  }
};

const PointCloudLayerExample2 = {
  layer: PointCloudLayer,
  getData: dataSamples.getPointCloud,
  props: {
    id: 'pointCloudLayer-lnglat',
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin,
    getPosition: d => [d.position[0] * 1e-5, d.position[1] * 1e-5, d.position[2]],
    getNormal: d => [d.normal[0] * 1e-5, d.normal[1] * 1e-5, d.normal[2]],
    getColor: d => d.color,
    opacity: 1,
    radiusPixels: 4,
    pickable: true,
    lightSettings: LIGHT_SETTINGS
  }
};

const PathLayerMetersExample = {
  layer: PathLayer,
  getData: () => dataSamples.meterPaths,
  props: {
    id: 'path-outline-layer-meter',
    opacity: 1.0,
    getColor: f => [255, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: false,
    strokeWidth: 5,
    widthScale: 10,
    autoHighlight: false,
    highlightColor: [255, 255, 255, 255],
    sizeScale: 200,
    rounded: false,
    getMarkerPercentages: () => [],
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin
  }
};

const LineLayerMillimetersExample = {
  layer: LineLayer,
  getData: () => dataSamples.milliMeterLines,
  props: {
    id: 'lineLayer',
    getColor: f => [Math.random() * 255, 0, 0],
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.milliMeterOrigin,
    strokeWidth: 20
  }
};

const PathLayerMillimetersFilteredExample = {
  layer: PathLayer,
  getData: () => dataSamples.milliMeterPathsFiltered,
  props: {
    id: 'pathLayer-meters-filtered',
    opacity: 0.6,
    getPath: f => f.path,
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.milliMeterOrigin
  }
};

const PathLayerMillimetersUnfilteredExample = {
  layer: PathLayer,
  getData: () => dataSamples.milliMeterPaths,
  props: {
    id: 'pathLayer-meters',
    opacity: 0.6,
    getPath: f => f.path,
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.milliMeterOrigin
  }
};

// PERF EXAMPLES

// perf test examples
const ScatterplotLayerPerfExample = (id, getData) => ({
  layer: ScatterplotLayer,
  getData,
  props: {
    id: `scatterplotLayerPerf-${id}`,
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5
  }
});

const ScatterplotLayer64PerfExample = (id, getData) => ({
  layer: ScatterplotLayer,
  getData,
  props: {
    id: `scatterplotLayer64Perf-${id}`,
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5,
    fp64: true
  }
});

function GeoJsonLayerPerfExample(id, getData) {
  return {
    layer: GeoJsonLayer,
    getData,
    props: {
      id: `geojsonlayerperf-${id}`,
      pointRadiusMinPixels: 4
    }
  };
}

const ScreenGridLayerPerfExample = (id, getData) => ({
  layer: ScreenGridLayer,
  getData,
  props: {
    id: `screenGridLayerPerf-${id}`,
    getPosition: d => d,
    cellSizePixels: 40,
    minColor: [0, 0, 80, 0],
    maxColor: [100, 255, 0, 128],
    pickable: false
  }
});

/* eslint-disable quote-props */
export default {
  'Core Layers - LngLat': {
    GeoJsonLayer: GeoJsonLayerExample,
    'GeoJsonLayer (Extruded)': GeoJsonLayerExtrudedExample,
    PolygonLayer: PolygonLayerExample,
    PathLayer: PathLayerExample,
    ScatterplotLayer: ScatterplotLayerExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    LineLayerNewCoords: LineLayerExampleNewCoords,
    IconLayer: IconLayerExample,
    GridCellLayer: GridCellLayerExample,
    GridLayer: GridLayerExample,
    ScreenGridLayer: ScreenGridLayerExample,
    HexagonCellLayer: HexagonCellLayerExample,
    HexagonLayer: HexagonLayerExample,
    TextLayer: TextLayerExample,
    ContourLayer: ContourLayerExample,
    'TextLayer (100K)': TextLayer100KExample
  },

  'Core Layers - Meter Offsets': {
    'PointCloudLayer (Meter offset)': PointCloudLayerExample,
    'PointCloudLayer (LngLat offset)': PointCloudLayerExample2,
    'Path Layer (Meters)': PathLayerMetersExample,
    'PathLayer (Mm Filtered: Zoom Map)': PathLayerMillimetersFilteredExample,
    'PathLayer (Mm Unfiltered: Zoom Map)': PathLayerMillimetersUnfilteredExample,
    'LineLayer (Mm - Zoom Map)': LineLayerMillimetersExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample('10M', dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample('100K', dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample('10M', dataSamples.getPoints10M),
    'GeoJsonLayer (1M Point features)': GeoJsonLayerPerfExample(
      '1M-point',
      dataSamples.getPointFeatures1M
    ),
    'GeoJsonLayer (100K MultiPoint features, 10 points per feature)': GeoJsonLayerPerfExample(
      '100K-multipoint',
      dataSamples.getMultiPointFeatures100K
    ),
    'ScreenGridLayer (1M)': ScreenGridLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScreenGridLayer (5M)': ScreenGridLayerPerfExample('5M', dataSamples.getPoints5M),
    'ScreenGridLayer (10M)': ScreenGridLayerPerfExample('10M', dataSamples.getPoints10M)
  }
};
