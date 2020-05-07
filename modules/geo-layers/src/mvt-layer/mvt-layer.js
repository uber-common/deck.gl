import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';

const WORLD_SIZE = 512;

const defaultProps = {
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: {type: 'number', value: -1}
};

export default class MVTLayer extends TileLayer {
  getTileData(tile) {
    const url = getURLFromTemplate(this.props.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    return load(url, MVTLoader, this.getLoadOptions());
  }

  renderSubLayers(props) {
    const {tile} = props;
    const worldScale = Math.pow(2, tile.z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * tile.x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

    const modelMatrix = new Matrix4().translate([xOffset, yOffset, 0]).scale([xScale, yScale, 1]);

    props.autoHighlight = false;
    props.modelMatrix = modelMatrix;
    props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
    props.extensions = [...(props.extensions || []), new ClipExtension()];

    return super.renderSubLayers(props);
  }

  onHover(info, pickingEvent) {
    const {uniqueIdProperty, autoHighlight} = this.props;

    if (autoHighlight) {
      const {hoveredFeatureId} = this.state;
      const hoveredFeature = info.object;
      let newHoveredFeatureId;

      if (hoveredFeature) {
        newHoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniqueIdProperty);
      }

      if (hoveredFeatureId !== newHoveredFeatureId) {
        this.setState({hoveredFeatureId: newHoveredFeatureId});
      }
    }

    return super.onHover(info, pickingEvent);
  }

  getHighlightedObjectIndex(tile) {
    const {hoveredFeatureId} = this.state;
    const {uniqueIdProperty, highlightedFeatureId} = this.props;
    const {data} = tile;

    const isFeatureIdPresent = hoveredFeatureId >= 0 || highlightedFeatureId >= 0;
    if (!isFeatureIdPresent || !Array.isArray(data)) {
      return -1;
    }

    const featureIdToHighlight =
      highlightedFeatureId >= 0 ? highlightedFeatureId : hoveredFeatureId;

    return data.findIndex(
      feature => getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight
    );
  }
}

function getFeatureUniqueId(feature, uniqueIdProperty) {
  if (uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }

  if (feature.id) {
    return feature.id;
  }

  return -1;
}

MVTLayer.layerName = 'MVTLayer';
MVTLayer.defaultProps = defaultProps;
