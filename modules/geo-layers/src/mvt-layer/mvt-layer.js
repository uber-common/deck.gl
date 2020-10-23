import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate, isURLTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';

const WORLD_SIZE = 512;

const defaultProps = {
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: null
};

async function fetchTileJSON(url) {
  try {
    return await load(url);
  } catch (error) {
    throw new Error(`An error occurred fetching TileJSON: ${error}`);
  }
}

export default class MVTLayer extends TileLayer {
  initializeState() {
    super.initializeState();
    this.setState({
      data: null,
      tileJSON: null
    });
  }

  get isLoaded() {
    return this.state.data && this.state.tileset && super.isLoaded;
  }

  updateState({props, oldProps, context, changeFlags}) {
    if (changeFlags.dataChanged) {
      this._updateTileData({props});
    }

    if (this.state.data) {
      super.updateState({props, oldProps, context, changeFlags});
    }
  }

  async _updateTileData({props}) {
    const {onDataLoad} = this.props;
    let {data} = props;
    let tileJSON = null;
    let {minZoom, maxZoom} = props;

    if (typeof data === 'string' && !isURLTemplate(data)) {
      this.setState({data: null, tileJSON: null});
      tileJSON = await fetchTileJSON(data);

      if (Number.isFinite(tileJSON.minzoom) && tileJSON.minzoom > minZoom) {
        minZoom = tileJSON.minzoom;
      }

      if (
        Number.isFinite(tileJSON.maxzoom) &&
        (!Number.isFinite(maxZoom) || tileJSON.maxzoom < maxZoom)
      ) {
        maxZoom = tileJSON.maxzoom;
      }

      if (onDataLoad) {
        onDataLoad(tileJSON);
      }
    } else if (data.tilejson) {
      tileJSON = data;
    }

    if (tileJSON) {
      data = tileJSON.tiles;
    }

    this.setState({data, tileJSON, minZoom, maxZoom});
  }

  renderLayers() {
    if (!this.state.data) return null;
    return super.renderLayers();
  }

  getTileData(tile) {
    const url = getURLFromTemplate(this.state.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    let options = this.getLoadOptions();
    options = {
      ...options,
      mvt: {
        ...(options && options.mvt),
        coordinates: this.context.viewport.resolution ? 'wgs84' : 'local',
        tileIndex: {x: tile.x, y: tile.y, z: tile.z}
      }
    };
    return load(url, MVTLoader, options);
  }

  renderSubLayers(props) {
    const {tile} = props;
    const worldScale = Math.pow(2, tile.z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * tile.x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

    const modelMatrix = new Matrix4().scale([xScale, yScale, 1]);

    props.autoHighlight = false;
    if (!this.context.viewport.resolution) {
      props.modelMatrix = modelMatrix;
      props.coordinateOrigin = [xOffset, yOffset, 0];
      props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
      props.extensions = [...(props.extensions || []), new ClipExtension()];
    }

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

    const isFeatureIdPresent =
      isFeatureIdDefined(hoveredFeatureId) || isFeatureIdDefined(highlightedFeatureId);

    if (!isFeatureIdPresent || !Array.isArray(data)) {
      return -1;
    }

    const featureIdToHighlight = isFeatureIdDefined(highlightedFeatureId)
      ? highlightedFeatureId
      : hoveredFeatureId;

    return data.findIndex(
      feature => getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight
    );
  }
}

function getFeatureUniqueId(feature, uniqueIdProperty) {
  if (uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }

  if ('id' in feature) {
    return feature.id;
  }

  return -1;
}

function isFeatureIdDefined(value) {
  return value !== undefined && value !== null && value !== '';
}

MVTLayer.layerName = 'MVTLayer';
MVTLayer.defaultProps = defaultProps;
