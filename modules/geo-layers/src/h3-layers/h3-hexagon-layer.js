import {h3ToGeoBoundary, h3GetResolution, h3ToGeo, geoToH3} from 'h3-js';
import {CompositeLayer, createIterable} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = h3ToGeo(hexagonId);
  return [lng, lat];
}

const defaultProps = {
  getHexagon: {type: 'accessor', value: x => x.hexagon}
};

/**
 * A subclass of HexagonLayer that uses H3 hexagonIds in data objects
 * rather than centroid lat/longs. The shape of each hexagon is determined
 * based on a single "center" hexagon, which can be selected by passing in
 * a center lat/lon pair. If not provided, the map center will be used.
 *
 * Also sets the `hexagonId` field in the onHover/onClick callback's info
 * objects. Since this is calculated using math, hexagonId will be present
 * even when no corresponding hexagon is in the data set. You can check
 * index !== -1 to see if picking matches an actual object.
 */
export default class H3HexagonLayer extends CompositeLayer {
  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggers && changeFlags.updateTriggers.getHexagon)
    ) {
      let resolution = -1;
      const {iterable, objectInfo} = createIterable(props.data);
      for (const object of iterable) {
        objectInfo.index++;
        const sampleHex = props.getHexagon(object, objectInfo);
        resolution = h3GetResolution(sampleHex);
        break;
      }
      this.setState({resolution, vertices: null});
    }
    if (changeFlags.viewportChanged) {
      this._updateVertices(this.context.viewport);
    }
  }

  _updateVertices(viewport) {
    const {resolution, centerHex} = this.state;
    if (resolution < 0) {
      return;
    }
    const hex = geoToH3(viewport.latitude, viewport.longitude, resolution);
    if (centerHex === hex) {
      return;
    }

    const {pixelsPerMeter} = viewport.distanceScales;

    let vertices = h3ToGeoBoundary(hex, true);
    const [centerLat, centerLng] = h3ToGeo(hex);

    const [centerX, centerY] = viewport.projectFlat([centerLng, centerLat]);
    vertices = vertices.map(p => {
      const worldPosition = viewport.projectFlat(p);
      worldPosition[0] = (worldPosition[0] - centerX) / pixelsPerMeter[0];
      worldPosition[1] = (worldPosition[1] - centerY) / pixelsPerMeter[1];
      return worldPosition;
    });

    this.setState({centerHex: hex, vertices});
  }

  renderLayers() {
    const {data, getHexagon, updateTriggers} = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);

    return new SubLayerClass(
      this.props,
      this.getSubLayerProps({
        id: 'hexagon-cell',
        updateTriggers
      }),
      {
        data,
        diskResolution: 6,
        radius: 1,
        vertices: this.state.vertices,
        getPosition: getHexagonCentroid.bind(null, getHexagon)
      }
    );
  }
}

H3HexagonLayer.defaultProps = defaultProps;
H3HexagonLayer.layerName = 'H3HexagonLayer';
