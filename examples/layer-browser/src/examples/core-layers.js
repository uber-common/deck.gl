import {
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
  PathLayer
} from 'deck.gl';

// Demonstrate immutable support
import {experimental} from 'deck.gl';
const {get} = experimental;

import dataSamples from '../immutable-data-samples';
import {parseColor, setOpacity} from '../utils/color';

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.00, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.6,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
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
    getIcon: d => get(d, 'PLACEMENT') === 'SW' ? 'marker' : 'marker-warning',
    getSize: d => get(d, 'RACKS') > 2 ? 2 : 1,
    opacity: 0.8,
    pickable: true
  }
};

const GeoJsonLayerExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.geojson,
  props: {
    id: 'geojsonLayer',
    getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
    getFillColor: f => {
      const color = parseColor(f.properties.fill || f.properties['marker-color']);
      const opacity = (f.properties['fill-opacity'] || 1) * 255;
      return setOpacity(color, opacity);
    },
    getColor: f => {
      const color = parseColor(f.properties.stroke);
      const opacity = (f.properties['stroke-opacity'] || 1) * 255;
      return setOpacity(color, opacity);
    },
    getWidth: f => f.properties['stroke-width'],
    getHeight: f => Math.random() * 1000,
    widthScale: 10,
    widthMinPixels: 1,
    pickable: true
  }
};

const GeoJsonLayerExtrudedExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.choropleths,
  props: {
    id: 'geojsonLayer-extruded',
    getHeight: f => get(f, 'properties.ZIP_CODE') * 10 % 127 * 10,
    getFillColor: f => [0, 255, get(f, 'properties.ZIP_CODE') * 23 % 100 + 155],
    getColor: f => [200, 0, 80],
    drawPolygons: true,
    extruded: true,
    wireframe: true,
    pickable: true
  }
};

const PolygonLayerExample = {
  layer: PolygonLayer,
  getData: () => dataSamples.polygons,
  props: {
    getPolygon: f => f,
    getFillColor: f => [Math.random() % 256, 0, 0],
    getColor: f => [0, 0, 0, 255],
    getWidth: f => 20,
    getHeight: f => Math.random() * 1000,
    opacity: 0.8,
    pickable: true
  }
};

const PathLayerExample = {
  layer: PathLayer,
  getData: () => dataSamples.zigzag,
  props: {
    id: 'pathLayer',
    opacity: 0.6,
    getPath: f => get(f, 'path'),
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    strokeMinWidth: 1,
    pickable: true
  }
};

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'screenGridLayer',
    getPosition: d => get(d, 'COORDINATES'),
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
    getSourcePosition: d => get(d, 'START'),
    getTargetPosition: d => get(d, 'END'),
    getColor: d => get(d, 'SERVICE') === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    pickable: true
  }
};

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'scatterplotLayer',
    getPosition: d => get(d, 'COORDINATES'),
    getColor: d => [255, 128, 0],
    getRadius: d => get(d, 'SPACES'),
    opacity: 0.5,
    pickable: true,
    radiusScale: 30,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  }
};

const PointCloudLayerExample = {
  layer: PointCloudLayer,
  getData: dataSamples.getPointCloud,
  props: {
    id: 'pointCloudLayer',
    outline: true,
    projectionMode: 2,
    positionOrigin: dataSamples.positionOrigin,
    getPosition: d => get(d, 'position'),
    getNormal: d => get(d, 'normal'),
    getColor: d => get(d, 'color'),
    opacity: 1,
    radius: 4,
    pickable: true
  }
};

const GridCellLayerExample = {
  layer: GridCellLayer,
  props: {
    id: 'gridCellLayer',
    data: dataSamples.worldGrid.data,
    latOffset: dataSamples.worldGrid.latOffset,
    lonOffset: dataSamples.worldGrid.lonOffset,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: g => [245, 166, get(g, 'value') * 255, 255],
    getElevation: h => get(h, 'value') * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

const GridLayerExample = {
  layer: GridLayer,
  propTypes: {
    cellSize: {type: 'number', min: 0, max: 1000}
  },
  props: {
    id: 'gridLayer',
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    getPosition: d => get(d, 'COORDINATES'),
    lightSettings: LIGHT_SETTINGS
  }
};

const HexagonCellLayerExample = {
  layer: HexagonCellLayer,
  propTypes: {
    coverage: {type: 'number', min: 0, max: 1}
  },
  props: {
    id: 'hexagonCellLayer',
    data: dataSamples.hexagons,
    hexagonVertices: dataSamples.hexagons[0].vertices,
    coverage: 1,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: h => [48, 128, get(h, 'value') * 255, 255],
    getElevation: h => get(h, 'value') * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

const HexagonLayerExample = {
  layer: HexagonLayer,
  propTypes: {
    coverage: {type: 'number', min: 0, max: 1},
    radius: {type: 'number', min: 0, max: 3000}
  },
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
    getPosition: d => get(d, 'COORDINATES'),
    lightSettings: LIGHT_SETTINGS
  }
};

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

/* eslint-disable quote-props */
export default {
  'Core Layers': {
    'GeoJsonLayer': GeoJsonLayerExample,
    'GeoJsonLayer (Extruded)': GeoJsonLayerExtrudedExample,
    PolygonLayer: PolygonLayerExample,
    PathLayer: PathLayerExample,
    ScatterplotLayer: ScatterplotLayerExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    IconLayer: IconLayerExample,
    GridCellLayer: GridCellLayerExample,
    GridLayer: GridLayerExample,
    ScreenGridLayer: ScreenGridLayerExample,
    HexagonCellLayer: HexagonCellLayerExample,
    HexagonLayer: HexagonLayerExample,
    PointCloudLayer: PointCloudLayerExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample('10M', dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample('100K', dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample('10M', dataSamples.getPoints10M)
  }
};
