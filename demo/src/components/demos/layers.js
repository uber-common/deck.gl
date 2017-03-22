import createLayerDemoClass from './layer-base';

import {
  ScatterplotLayer,
  LineLayer,
  ArcLayer,
  PathLayer,
  IconLayer,
  ScreenGridLayer,
  GridLayer,
  HexagonLayer,
  PolygonLayer,
  GeoJsonLayer
} from 'deck.gl';

import {colorToRGBArray} from '../../utils/format-utils';

export const ScatterplotLayerDemo = createLayerDemoClass({
  Layer: ScatterplotLayer,
  dataUrl: 'data/bart-stations.json',
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    opacity: 0.8,
    radiusScale: 10,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getColor: d => [255, 140, 0]
  }
});

export const ArcLayerDemo = createLayerDemoClass({
  Layer: ArcLayer,
  dataUrl: 'data/bart-segments.json',
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    strokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: d => [Math.sqrt(d.outbound), 140, 0]
  }
});

export const LineLayerDemo = createLayerDemoClass({
  Layer: LineLayer,
  dataUrl: 'data/bart-segments.json',
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    strokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0]
  }
});

export const PathLayerDemo = createLayerDemoClass({
  Layer: PathLayer,
  dataUrl: 'data/bart-lines.json',
  formatTooltip: d => d.name,
  props: {
    pickable: true,
    widthScale: 20,
    getPath: d => d.path,
    getWidth: d => 5,
    getColor: d => colorToRGBArray(d.color)
  }
});

export const IconLayerDemo = createLayerDemoClass({
  Layer: IconLayer,
  dataUrl: 'data/bart-stations.json',
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    iconAtlas: 'images/icon-atlas.png',
    iconMapping: {
      "marker": {
        "x": 0,
        "y": 0,
        "width": 128,
        "height": 128,
        "anchorY": 128,
        "mask": true
      }
    },
    sizeScale: 15,
    getPosition: d => d.coordinates,
    getIcon: d => 'marker',
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0]
  }
});

export const ScreenGridLayerDemo = createLayerDemoClass({
  Layer: ScreenGridLayer,
  dataUrl: 'data/sf-bike-parking.json',
  formatTooltip: d => 'aggregated cell',
  props: {
    pickable: false,
    opacity: 0.8,
    cellSizePixels: 50,
    minColor: [0, 0, 0, 0],
    maxColor: [0, 180, 0, 255],
    getPosition: d => d.COORDINATES,
    getWeight: d => d.SPACES
  }
});

export const GridLayerDemo = createLayerDemoClass({
  Layer: GridLayer,
  dataUrl: 'data/sf-bike-parking.json',
  formatTooltip: d => d,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const HexagonLayerDemo = createLayerDemoClass({
  Layer: HexagonLayer,
  dataUrl: 'data/sf-bike-parking.json',
  formatTooltip: d => d,
  props: {
    pickable: true,
    extruded: true,
    radius: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const PolygonLayerDemo = createLayerDemoClass({
  Layer: PolygonLayer,
  dataUrl: 'data/sf-highrise.json',
  formatTooltip: d => `Height: ${d.height}m`,
  props: {
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    getPolygon: d => d.polygon,
    getElevation: d => d.height,
    getFillColor: d => [128, 128, 128]
  }
});

export const GeoJsonLayerDemo = createLayerDemoClass({
  Layer: GeoJsonLayer,
  dataUrl: 'data/sf-open-space.geo.json',
  formatTooltip: d => d,
  props: {
    pickable: true,
    stroked: true,
    filled: true
  }
});
