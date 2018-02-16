// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {createElement, cloneElement} from 'react';
import PropTypes from 'prop-types';
import autobind from './utils/autobind';
import {inheritsFrom} from '../core/utils/inherits-from';
import {Layer, experimental} from '../core';
const {Deck, log} = experimental;

const propTypes = Object.assign({}, Deck.propTypes, {
  viewports: PropTypes.array, // Deprecated
  viewport: PropTypes.object, // Deprecated

  // Viewport props (TODO - should only support these on the react component)
  longitude: PropTypes.number, // The longitude of the center of the map.
  latitude: PropTypes.number, // The latitude of the center of the map.
  zoom: PropTypes.number, // The tile zoom level of the map.
  bearing: PropTypes.number, // Specify the bearing of the viewport
  pitch: PropTypes.number, // Specify the pitch of the viewport
  altitude: PropTypes.number, // Altitude of camera. Default 1.5 "screen heights"
  position: PropTypes.array // Camera position for FirstPersonViewport
});

const defaultProps = Deck.defaultProps;

export default class DeckGL extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.children = [];
    autobind(this);
  }

  componentDidMount() {
    this.deck = new Deck(Object.assign({}, this.props, {canvas: this.overlay}));
    this._updateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._updateFromProps(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // TODO/ib - this needs to be moved into deck.js
    if (this.deck.transitionManager) {
      const transitionTriggered = this.deck.transitionManager.processViewportChange(nextProps);
      // Skip this render to avoid jump during viewport transitions.
      return !transitionTriggered;
    }
    return true;
  }

  componentWillUnmount() {
    this.deck.finalize();
  }

  // Public API

  queryObject(opts) {
    log.deprecated('queryObject', 'pickObject');
    return this.deck.pickObject(opts);
  }

  pickObject({x, y, radius = 0, layerIds = null}) {
    return this.deck.pickObject({x, y, radius, layerIds});
  }

  queryVisibleObjects(opts) {
    log.deprecated('queryVisibleObjects', 'pickObjects');
    return this.pickObjects(opts);
  }

  pickObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.deck.pickObjects({x, y, width, height, layerIds});
  }

  // Private Helpers

  // 1. Extract any JSX layers from the react children
  // 2. Handle any backwards compatiblity props for React layer
  // Needs to be called both from initial mount, and when new props arrive
  _updateFromProps(nextProps) {
    // Support old "geospatial view state as separate props" style (React only!)
    let {viewState} = nextProps;
    if (!viewState) {
      const {latitude, longitude, zoom, pitch, bearing} = nextProps;
      viewState = nextProps.viewState || {latitude, longitude, zoom, pitch, bearing};
    }

    // Support old `viewports` prop (React only!)
    const views =
      nextProps.views || nextProps.viewports || (nextProps.viewport && [nextProps.viewport]);
    if (nextProps.viewports) {
      log.deprecated('DeckGL.viewports', 'DeckGL.views');
    }
    if (nextProps.viewport) {
      log.deprecated('DeckGL.viewport', 'DeckGL.views');
    }

    // extract any deck.gl layers masquerading as react elements from props.children
    const {layers, children} = this._extractJSXLayers(nextProps.children);

    if (this.deck) {
      this.deck.setProps(
        Object.assign({}, nextProps, {
          views,
          viewState,
          // Avoid modifying layers array if no JSX layers were found
          layers: layers ? [...layers, ...nextProps.layers] : nextProps.layers
        })
      );
    }

    this.children = children;
  }

  // extracts any deck.gl layers masquerading as react elements from props.children
  _extractJSXLayers(children) {
    const reactChildren = []; // extract real react elements (i.e. not deck.gl layers)
    let layers = null; // extracted layer from react children, will add to deck.gl layer array

    React.Children.forEach(children, reactElement => {
      if (reactElement) {
        // For some reason Children.forEach doesn't filter out `null`s
        const LayerType = reactElement.type;
        if (inheritsFrom(LayerType, Layer)) {
          const layer = new LayerType(reactElement.props);
          layers = layers || [];
          layers.push(layer);
        } else {
          reactChildren.push(reactElement);
        }
      }
    });

    return {layers, children: reactChildren};
  }

  // Iterate over views and reposition children associated with views
  // TODO - Can we supply a similar function for the non-React case?
  _renderChildrenUnderViews(children) {
    // Flatten out nested views array
    const views = this.deck ? this.deck.getViewports() : [];

    // Build a view id to view index
    const viewMap = {};
    views.forEach(view => {
      if (view.id) {
        viewMap[view.id] = view;
      }
    });

    return children.map(
      // If child specifies props.viewId, position under view, otherwise render as normal
      (child, i) =>
        child.props.viewId || child.props.viewId ? this._positionChild({child, viewMap, i}) : child
    );
  }

  _positionChild({child, viewMap, i}) {
    const {viewId, viewportId} = child.props;
    if (viewportId) {
      log.deprecated('viewportId', 'viewId');
    }
    const view = viewMap[viewId || viewportId];

    // Drop (auto-hide) elements with viewId that are not matched by any current view
    if (!view) {
      return null;
    }

    // Resolve potentially relative dimensions using the deck.gl container size
    const {x, y, width, height} = view;

    // Clone the element with width and height set per view
    const newProps = Object.assign({}, child.props, {width, height});

    // Inject map properties
    // TODO - this is too react-map-gl specific
    Object.assign(newProps, view.getMercatorParams(), {
      visible: view.isMapSynched()
    });

    const clone = cloneElement(child, newProps);

    // Wrap it in an absolutely positioning div
    const style = {position: 'absolute', left: x, top: y, width, height};
    const key = `view-child-${viewId}-${i}`;
    return createElement('div', {key, id: key, style}, clone);
  }

  render() {
    // Render the background elements (typically react-map-gl instances)
    // using the view descriptors
    const children = this._renderChildrenUnderViews(this.children);

    // Render deck.gl as last child
    const {id, width, height, style} = this.props;
    const deck = createElement('canvas', {
      ref: c => (this.overlay = c),
      key: 'overlay',
      id,
      style: Object.assign({}, {position: 'absolute', left: 0, top: 0, width, height}, style)
    });
    children.push(deck);

    return createElement('div', {id: 'deckgl-wrapper', style: {width, height}}, children);
  }
}

DeckGL.propTypes = propTypes;
DeckGL.defaultProps = defaultProps;
