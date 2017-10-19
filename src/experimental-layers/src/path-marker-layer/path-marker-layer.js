import {CompositeLayer, ScatterplotLayer} from 'deck.gl';
import PathOutlineLayer from '../path-outline-layer/path-outline-layer';
import MeshLayer from '../mesh-layer/mesh-layer';
import Arrow2DGeometry from './arrow-2d-geometry';

import createPathMarkers from './create-path-markers';
import {getClosestPointOnPolyline} from './polyline';

const DISTANCE_FOR_MULTI_ARROWS = 0.1;
const ARROW_HEAD_SIZE = 0.2;
const ARROW_TAIL_WIDTH = 0.05;
// const ARROW_CENTER_ADJUST = -0.8;

const DEFAULT_MARKER_LAYER = MeshLayer;

const DEFAULT_MARKER_LAYER_PROPS = {
  mesh: new Arrow2DGeometry({headSize: ARROW_HEAD_SIZE, tailWidth: ARROW_TAIL_WIDTH})
};

const defaultProps = Object.assign({}, PathOutlineLayer.defaultProps, {
  MarkerLayer: DEFAULT_MARKER_LAYER,
  markerLayerProps: DEFAULT_MARKER_LAYER_PROPS,

  sizeScale: 100,
  fp64: false,

  hightlightIndex: -1,
  highlightPoint: null,

  // getPath: x => x.path,
  // getColor: x => x.color,
  getDirection: x => x.direction,
  getMarkerPercentages: (object, {lineLength}) =>
   lineLength > DISTANCE_FOR_MULTI_ARROWS ? [0.25, 0.5, 0.75] : [0.5]
});

export default class PathMarkerLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      markers: [],
      mesh: new Arrow2DGeometry({headSize: ARROW_HEAD_SIZE, tailWidth: ARROW_TAIL_WIDTH}),
      closestPoint: null
    };
  }

  updateState({props, oldProps, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data, getPath, getDirection, getColor, getMarkerPercentages} = this.props;
      this.state.markers = createPathMarkers({
        data, getPath, getDirection, getColor, getMarkerPercentages
      });
      this._recalculateClosestPoint();
    }
    if (changeFlags.propsChanged) {
      if (props.point !== oldProps.point) {
        this._recalculateClosestPoint();
      }
    }
  }

  _recalculateClosestPoint() {
    const {highlightPoint, highlightIndex} = this.props;
    if (highlightPoint && highlightIndex >= 0) {
      const object = this.props.data[highlightIndex];
      const points = this.props.getPath(object);
      const {point} = getClosestPointOnPolyline({points, p: highlightPoint});
      this.state.closestPoints = [{
        position: point
      }];
    } else {
      this.state.closestPoints = [];
    }
  }

  getPickingInfo({info}) {
    return Object.assign(info, {
      // override object with picked feature
      object: (info.object && info.object.path) || info.object
    });
  }

  renderLayers() {
    const forwardProps = this.getBaseLayerProps();
    return [
      new PathOutlineLayer(Object.assign({}, this.props, {
        id: `${this.props.id}-paths`,
        fp64: this.props.fp64
      })),
      new this.props.MarkerLayer(Object.assign(forwardProps, this.props.markerLayerProps, {
        id: `${this.props.id}-markers`,
        data: this.state.markers,
        sizeScale: this.props.sizeScale,
        fp64: this.props.fp64,
        pickable: false,
        parameters: {
          blend: false,
          depthTest: false
        }
      })),
      this.state.closestPoints &&
      new ScatterplotLayer({
        id: `${this.props.id}-highlight`,
        data: this.state.closestPoints,
        fp64: this.props.fp64
      })
    ];
  }
}

PathMarkerLayer.layerName = 'PathMarkerLayer';
PathMarkerLayer.defaultProps = defaultProps;
