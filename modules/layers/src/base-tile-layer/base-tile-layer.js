import {log} from '@deck.gl/core';
import {CompositeLayer} from '@deck.gl/core';
import GeoJsonLayer from '../geojson-layer/geojson-layer';
import Tileset2D, {STRATEGY_DEFAULT} from './utils/tileset-2d';

const defaultProps = {
  renderSubLayers: {type: 'function', value: props => new GeoJsonLayer(props), compare: false},
  getTileData: {type: 'function', value: ({x, y, z}) => Promise.resolve(null), compare: false},
  tileToBoundingBox: {type: 'function', value: (x, y, z) => null, compare: false},
  getTileIndices: {type: 'function', value: (viewport, maxZoom, minZoom) => [], compare: false},
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoad: {type: 'function', optional: true, value: null, compare: false},
  // eslint-disable-next-line
  onTileError: {type: 'function', value: err => console.error(err), compare: false},
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
  strategy: STRATEGY_DEFAULT
};

export default class BaseTileLayer extends CompositeLayer {
  initializeState() {
    if ('onViewportLoaded' in this.props) {
      log.removed('onViewportLoaded', 'onViewportLoad')();
    }

    this.state = {
      tiles: [],
      isLoaded: false
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, context, changeFlags}) {
    let {tileset} = this.state;
    const createTileCache =
      !tileset ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData));

    if (createTileCache) {
      const {
        getTileData,
        maxZoom,
        minZoom,
        maxCacheSize,
        strategy,
        getTileIndices,
        tileToBoundingBox
      } = props;
      if (tileset) {
        tileset.finalize();
      }
      tileset = new Tileset2D({
        getTileData,
        getTileIndices,
        tileToBoundingBox,
        maxSize: maxCacheSize,
        maxZoom,
        minZoom,
        strategy,
        onTileLoad: this._updateTileset.bind(this),
        onTileError: this._onTileError.bind(this)
      });
      this.setState({tileset});
    } else if (changeFlags.propsChanged) {
      // if any props changed, delete the cached layers
      this.state.tileset.tiles.forEach(tile => {
        tile.layer = null;
      });
    }

    if (createTileCache || changeFlags.viewportChanged) {
      this._updateTileset();
    }
  }

  _updateTileset() {
    const {tileset} = this.state;
    const {onViewportLoad} = this.props;
    const frameNumber = tileset.update(this.context.viewport);
    const {isLoaded} = tileset;

    const loadingStateChanged = this.state.isLoaded !== isLoaded;
    const tilesetChanged = this.state.frameNumber !== frameNumber;

    if (isLoaded && onViewportLoad && (loadingStateChanged || tilesetChanged)) {
      onViewportLoad(tileset.selectedTiles.map(tile => tile.data));
    }

    if (tilesetChanged) {
      // Save the tileset frame number - trigger a rerender
      this.setState({frameNumber});
    }
    // Save the loaded state - should not trigger a rerender
    this.state.isLoaded = isLoaded;
  }

  _onTileError(error) {
    this.props.onTileError(error);
    // errorred tiles should not block rendering, are considered "loaded" with empty data
    this._updateTileset();
  }

  getPickingInfo({info, sourceLayer}) {
    info.sourceLayer = sourceLayer;
    info.tile = sourceLayer.props.tile;
    return info;
  }

  renderLayers() {
    const {renderSubLayers, visible} = this.props;
    return this.state.tileset.tiles.map(tile => {
      // For a tile to be visible:
      // - parent layer must be visible
      // - tile must be visible in the current viewport
      const isVisible = visible && tile.isVisible;
      // cache the rendered layer in the tile
      if (!tile.layer) {
        tile.layer = renderSubLayers(
          Object.assign({}, this.props, {
            id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
            data: tile.data,
            visible: isVisible,
            tile
          })
        );
      } else if (tile.layer.props.visible !== isVisible) {
        tile.layer = tile.layer.clone({visible: isVisible});
      }
      return tile.layer;
    });
  }
}

BaseTileLayer.layerName = 'BaseTileLayer';
BaseTileLayer.defaultProps = defaultProps;
