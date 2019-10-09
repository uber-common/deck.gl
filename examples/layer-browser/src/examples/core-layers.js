import {experimental} from '@deck.gl/core';

import {
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  // PointCloudLayer,
  BitmapLayer,
  IconLayer,
  ColumnLayer,
  GeoJsonLayer,
  PolygonLayer,
  WBOITLayer,
  PathLayer,
  TextLayer
} from '@deck.gl/layers';

import {
  CPUGridLayer,
  HexagonLayer,
  ContourLayer,
  ScreenGridLayer
} from '@deck.gl/aggregation-layers';

const {flattenVertices} = experimental;

// Demonstrate immutable support
import * as dataSamples from '../data-samples';
import {parseColor, setOpacity} from '../utils/color';

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

const ArcLayerExample = {
  layer: ArcLayer,
  getData: () => dataSamples.routes,
  propTypes: {
    getHeight: {
      type: 'number',
      max: 10
    },
    getTilt: {
      type: 'number',
      min: -90,
      max: 90
    }
  },
  props: {
    id: 'arcLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    getHeight: d => 1,
    getTilt: d => 0,
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

const IconLayerAutoPackingExample = {
  layer: IconLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'icon-layer-auto-packing',
    sizeScale: 24,
    getPosition: d => d.COORDINATES,
    getColor: d => [64, 64, 72],
    getIcon: d => {
      if (d.PLACEMENT === 'SW') {
        return {
          url: 'data/icon-marker.png',
          width: 64,
          height: 64,
          anchorY: 64,
          mask: true
        };
      }
      return {
        id: 'warning',
        url: 'data/icon-warning.png',
        width: 128,
        height: 128,
        anchorY: 128,
        mask: false
      };
    },
    getSize: d => {
      return d.RACKS > 2 ? 2 : 1;
    },
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
    pickable: true
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
    pickable: true
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
    getLineWidth: f => 20,
    getElevation: f => Math.random() * 1000,
    opacity: 0.8,
    pickable: true,
    lineDashJustified: true,
    elevationScale: 0.6
  }
};

const PolygonLayerBinaryExample = {
  ...PolygonLayerExample,
  getData: () =>
    dataSamples.polygons.map(polygon => {
      // Convert each polygon from an array of points to an array of numbers
      return flattenVertices(polygon, {dimensions: 2});
    }),
  props: {
    ...PolygonLayerExample.props,
    getPolygon: d => d,
    positionFormat: 'XY'
  }
};

const WBOITLayerExample = {
  layer: WBOITLayer,
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
    getLineWidth: f => 20,
    getElevation: f => Math.random() * 1000,
    opacity: 0.3,
    pickable: false,
    lineDashJustified: true,
    elevationScale: 0.6,
    stroked: false,
    extruded: true
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

const PathLayerBinaryExample = {
  ...PathLayerExample,
  getData: () =>
    dataSamples.zigzag.map(({path}) => {
      // Convert each path from an array of points to an array of numbers
      return flattenVertices(path, {dimensions: 2});
    }),
  props: {
    ...PathLayerExample.props,
    getPath: d => d,
    positionFormat: 'XY'
  }
};

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'screenGridLayer',
    getPosition: d => d.COORDINATES,
    cellSizePixels: 40,
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

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'scatterplotLayer',
    getPosition: d => d.COORDINATES,
    getFillColor: d => [255, 128, 0],
    getLineColor: d => [0, 128, 255],
    getRadius: d => d.SPACES,
    opacity: 1,
    pickable: true,
    radiusScale: 30,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  }
};

const ColumnLayerExample = {
  layer: ColumnLayer,
  props: {
    id: 'columnLayer',
    data: dataSamples.worldGrid.data,
    extruded: true,
    pickable: true,
    radius: 100,
    opacity: 1,
    getFillColor: d => [245, 166, d.value * 255, 255],
    getElevation: d => d.value * 5000
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

const ContourLayerBandsExample = {
  layer: ContourLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'contourLayer',
    cellSize: 200,
    getPosition: d => d.COORDINATES,
    gpuAggregation: true,
    contours: [
      {threshold: [1, 5], color: [255, 0, 0]},
      {threshold: [5, 15], color: [0, 255, 0]},
      {threshold: [15, 1000], color: [0, 0, 255]}
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

const CPUGridLayerExample = {
  layer: CPUGridLayer,
  props: {
    id: 'gridLayer',
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    getPosition: d => d.COORDINATES,
    getColorValue: points => getMean(points, 'SPACES'),
    getElevationValue: points => getMax(points, 'SPACES')
  }
};

/*
const ColumnLayerExample = {
  layer: ColumnLayer,
  props: {
    id: 'ColumnLayer',
    data: dataSamples.hexagons,
    radius: 100,
    diskResolution: 6,
    coverage: 1,
    extruded: true,
    pickable: true,
    opacity: 1,
    getPosition: d => d.centroid,
    getColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value * 5000
  }
};
*/

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
    getColorValue: points => getMean(points, 'SPACES'),
    getElevationValue: points => getMax(points, 'SPACES')
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
    },
    fontWeight: {
      type: 'category',
      max: 100,
      value: [
        'normal',
        'bold',
        'bolder',
        'lighter',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900'
      ]
    },
    fontSettings: {
      type: 'compound',
      elements: ['fontSize', 'buffer', 'sdf', 'radius', 'cutoff']
    },
    fontSize: {
      type: 'number',
      max: 100,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, fontSize: newValue});
      }
    },
    buffer: {
      type: 'number',
      max: 100,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, buffer: newValue});
      }
    },
    sdf: {
      type: 'boolean',
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, sdf: newValue});
      }
    },
    radius: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, radius: newValue});
      }
    },
    cutoff: {
      type: 'number',
      max: 1,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, cutoff: newValue});
      }
    },
    getTextAnchor: {
      name: 'textAnchor',
      type: 'category',
      value: ['start', 'middle', 'end']
    }
  },
  props: {
    id: 'textgetAnchorX-layer',
    sizeScale: 1,
    fontFamily: 'Monaco',
    fontSettings: {},
    autoHighlight: true,
    pickable: true,
    highlightColor: [0, 0, 128, 128],
    getText: x => `${x.LOCATION_NAME}\n${x.ADDRESS}`,
    getPosition: x => x.COORDINATES,
    getColor: x => [153, 0, 0],
    getAngle: x => 30,
    getTextAnchor: x => 'start',
    getAlignmentBaseline: x => 'center',
    getPixelOffset: x => [10, 0]
  }
};

const BitmapLayerExample = {
  layer: BitmapLayer,
  props: {
    id: 'bitmap-layer',
    image: 'data/sf-districts.png',
    bounds: [-122.519, 37.7045, -122.355, 37.829]
  }
};

/* eslint-disable quote-props */
export default {
  'Core Layers - LngLat': {
    GeoJsonLayer: GeoJsonLayerExample,
    'GeoJsonLayer (Extruded)': GeoJsonLayerExtrudedExample,
    PolygonLayer: PolygonLayerExample,
    'PolygonLayer (Flat)': PolygonLayerBinaryExample,
    WBOITLayer: WBOITLayerExample,
    PathLayer: PathLayerExample,
    'PathLayer (Flat)': PathLayerBinaryExample,
    ScatterplotLayer: ScatterplotLayerExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    IconLayer: IconLayerExample,
    'IconLayer (auto packing)': IconLayerAutoPackingExample,
    TextLayer: TextLayerExample,
    BitmapLayer: BitmapLayerExample,
    ColumnLayer: ColumnLayerExample,
    CPUGridLayer: CPUGridLayerExample,
    ScreenGridLayer: ScreenGridLayerExample,
    HexagonLayer: HexagonLayerExample,
    ContourLayer: ContourLayerExample,
    'ContourLayer (Bands)': ContourLayerBandsExample
  }
};
