import {CompositeLayer, COORDINATE_SYSTEM} from 'deck.gl';
import GraphLayer, {GRAPH_LAYER_IDS} from './graph-layer';

import LayoutD3 from './layout/layout-d3';

const defaultProps = {
  width: 640,
  height: 640,
  data: null,
  opacity: 1.0,
  layout: LayoutD3,
  projectionMode: COORDINATE_SYSTEM.IDENTITY,
  nodeIconAccessors: {}
};

/**
 * GraphLayoutLayer displays a force-directed network graph in deck.gl.
 * It accepts a list of nodes and a list of links,
 * processes them with a graph layout engine (default: LayoutD3),
 * and passes props and transformed data on to GraphLayer for rendering.
 */
export default class GraphLayoutLayer extends CompositeLayer {
  initializeState() {
    const {data, layoutAccessors} = this.props;
    const Layout = this.props.layout;
    this.state.layout = new Layout(Object.assign({data}, layoutAccessors));
  }

  updateState({oldProps, props, changeFlags}) {
    const {layout} = this.state;
    const data = props.data ? props.data[props.data.length - 1] : null;
    let layoutData;

    // If the data have changed, send to layout;
    // else just update layout in its current state.
    if (changeFlags.dataChanged) {
      layoutData = data;
    }

    const {layoutProps} = this.props;
    const {nodes, isUpdating} = layout.update(layoutData, layoutProps);
    if (isUpdating) {
      // update state only if layout is still running
      this.state.nodes = nodes;
      this.state.links = data ? data.links : undefined;
      // update timestamp for updateTriggers diff
      this.state.layoutTime = Date.now();
    }
  }

  getPickingInfo({info}) {
    const pickingInfo = [
      'index',
      'layer',
      'object',
      'picked',
      'x',
      'y'
    ].reduce((acc, k) => {
      acc[k] = info[k];
      return acc;
    }, {});

    // determine object type (node or link) based on picked layer
    if (!info.layer.context.lastPickedInfo) {
      pickingInfo.objectType = '';
    } else {
      const {id} = this.props;
      if (info.layer.context.lastPickedInfo.layerId === `${id}-graph-${GRAPH_LAYER_IDS.LINK}`) {
        pickingInfo.objectType = 'link';
      } else {
        pickingInfo.objectType = 'node';
      }
    }

    // find all links connected to picked node, or vice-versa
    const {nodes, links} = this.state;
    const {object} = pickingInfo;
    if (object) {
      if (pickingInfo.objectType === 'link') {
        pickingInfo.relatedObjects = nodes.filter(n =>
          n.id === object.source.id || n.id === object.target.id);
      } else if (pickingInfo.objectType === 'node') {
        pickingInfo.relatedObjects = links.filter(l =>
          l.source.id === object.id || l.target.id === object.id);
      }
    } else {
      pickingInfo.relatedObjects = [];
    }

    return pickingInfo;
  }

  finalizeLayer() {
    if (this.state.layout) {
      this.state.layout.dispose();
    }
  }

  renderLayers() {
    const {id} = this.props;
    const {nodes, links, layoutTime} = this.state;

    // base layer props
    const {opacity, visible} = this.props;

    // base layer handlers
    const {onHover, onClick, onDragMove, onDragEnd} = this.props;
    const pickable = Boolean(this.props.onHover || this.props.onClick);

    // viewport props
    const {projectionMode} = this.props;

    // base layer accessors
    const {linkAccessors, nodeAccessors, nodeIconAccessors} = this.props;

    return new GraphLayer(Object.assign(
      {
        id: `${id}-graph`,
        data: {
          nodes,
          links
        },
        layoutTime,

        opacity,
        pickable,
        visible,
        projectionMode,

        onHover,
        onClick,
        onDragMove,
        onDragEnd
      },

      // deconstruct these
      linkAccessors,
      nodeAccessors,

      // leave these accessors bundled in an object
      {nodeIconAccessors}
    ));
  }
}

GraphLayoutLayer.layerName = 'GraphLayoutLayer';
GraphLayoutLayer.defaultProps = defaultProps;
