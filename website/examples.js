const {resolve} = require('path');

function makeExampleEntries(data, category) {
  return Object.keys(data).map(name => ({
    title: name,
    category,
    path: `examples/${data[name]}/`,
    image: `images/examples/${data[name]}.jpg`,
    componentUrl: resolve(`./src/examples/${data[name]}.js`)
  }));
}

const LAYER_EXAMPLES = {
  'ArcLayer': 'arc-layer',
  'GeoJsonLayer (Polygons)': 'geojson-layer-polygons',
  'GeoJsonLayer (Paths)': 'geojson-layer-paths',
  'HeatmapLayer': 'heatmap-layer',
  'HexagonLayer': 'hexagon-layer',
  'IconLayer': 'icon-layer',
  'LineLayer': 'line-layer',
  'PointCloudLayer': 'point-cloud-layer',
  'ScatterplotLayer': 'scatterplot-layer',
  'ScreenGridLayer': 'screen-grid-layer',
  'TerrainLayer': 'terrain-layer',
  'TextLayer': 'text-layer',
  'TileLayer': 'tile-layer',
  'Tile3DLayer': 'tile-3d-layer',
  'TripsLayer': 'trips-layer',
  '3D Plot': 'plot'
};

const EXTENSION_EXAMPLES = {
  'BrusingExtension': 'brushing-extension',
  'DataFilterExtension': 'data-filter-extension'
};

module.exports = [].concat(
  makeExampleEntries(LAYER_EXAMPLES, 'Layers'),
  makeExampleEntries(EXTENSION_EXAMPLES, 'Extensions'),
  {
    title: 'Playground',
    category: 'Declarative',
    path: 'playground',
    image: 'images/examples/playground.jpg'
  }
);
