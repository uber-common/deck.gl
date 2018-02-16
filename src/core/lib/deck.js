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

import LayerManager from '../lib/layer-manager';
import EffectManager from '../experimental/lib/effect-manager';
import Effect from '../experimental/lib/effect';

import WebMercatorViewport from '../viewports/web-mercator-viewport';
import ViewportControls from '../controllers/viewport-controls';
import TransitionManager from '../lib/transition-manager';

import {EventManager} from 'mjolnir.js';
import {GL, AnimationLoop, createGLContext, setParameters} from 'luma.gl';

import PropTypes from 'prop-types';
import assert from 'assert';

const PREFIX = '-webkit-';
const CURSOR = {
  GRABBING: `${PREFIX}grabbing`,
  GRAB: `${PREFIX}grab`,
  POINTER: 'pointer'
};

/* global document */

function noop() {}

const propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array, // Array can contain falsy values
  views: PropTypes.array, // Array can contain falsy values
  viewState: PropTypes.object,
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  layerFilter: PropTypes.func,
  glOptions: PropTypes.object,
  gl: PropTypes.object,
  pickingRadius: PropTypes.number,
  onWebGLInitialized: PropTypes.func,
  onBeforeRender: PropTypes.func,
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  useDevicePixels: PropTypes.bool,

  // Controller props
  controls: PropTypes.object,
  viewportState: PropTypes.func,
  state: PropTypes.object,

  // Accessor that returns a cursor style to show interactive state
  getCursor: PropTypes.func,

  // Debug props
  debug: PropTypes.bool,
  drawPickingColors: PropTypes.bool
};

const defaultProps = Object.assign({}, TransitionManager.defaultProps, {
  id: 'deckgl-overlay',
  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  gl: null,
  layers: [],
  effects: [],
  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixels: true,

  // Controller props
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
  getCursor: ({isDragging}) => (isDragging ? CURSOR.GRABBING : CURSOR.GRAB),

  // Debug props
  debug: false,
  drawPickingColors: false
});

// TODO - should this class be joined with `LayerManager`?
export default class Deck {
  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.eventManager = null;
    this.effectManager = null;
    this.transitionManager = new TransitionManager(this.props);
    this.viewports = [];

    // Bind methods
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);

    this.canvas = this._createCanvas(props);
    this.controls = this._createControls(props);
    this.animationLoop = this._createAnimationLoop(props);

    this.setProps(props);

    this.animationLoop.start();
  }

  setProps(props) {
    props = Object.assign({}, this.props, props);
    this.props = props;

    // TODO - unify setParameters/setOptions/setProps etc naming.
    this._setLayerManagerProps(props);
    this._setControlProps(props);
    const {useDevicePixels, autoResizeDrawingBuffer} = props;
    this.animationLoop.setViewParameters({useDevicePixels, autoResizeDrawingBuffer});
  }

  finalize() {
    this.animationLoop.stop();
    this.animationLoop = null;

    if (this.layerManager) {
      this.layerManager.finalize();
      this.layerManager = null;
    }
  }

  // Public API

  getSize() {
    return {
      width: this.props.width || 100,
      height: this.props.height || 100
    };
  }

  pickObject({x, y, radius = 0, layerIds = null}) {
    const selectedInfos = this.layerManager.pickObject({x, y, radius, layerIds, mode: 'query'});
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  pickObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.layerManager.pickObjects({x, y, width, height, layerIds});
  }

  getViewports() {
    return this.layerManager ? this.layerManager.getViewports() : [];
  }

  // Private Methods

  // canvas, either string, canvas or `null`
  _createCanvas(props) {
    let canvas = props.canvas;

    // TODO EventManager should accept element id
    if (typeof canvas === 'string') {
      /* global document */
      canvas = document.getElementById(canvas);
      assert(canvas);
    }

    if (!canvas) {
      const {id, width, height, style} = props;
      canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.width = width;
      canvas.height = height;
      canvas.style = style;

      const parent = props.parent || document.body;
      parent.appendChild(canvas);
    }

    return canvas;
  }

  _createControls(props) {
    this.eventManager = new EventManager(this.canvas);

    // If props.controls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    let controls = props.controls;
    if (props.viewportState) {
      controls = new ViewportControls(props.viewportState, props);
    }
    if (controls) {
      controls.setOptions(
        Object.assign({}, props, props.viewState, {
          onStateChange: this._onInteractiveStateChange.bind(this),
          eventManager: this.eventManager
        })
      );
    }
    return controls;
  }

  _setControlProps(props) {
    if (this.controls) {
      this.controls.setOptions(Object.assign({}, props, props.viewState));
    }
  }

  _createAnimationLoop(props) {
    const {width, height, gl, glOptions, debug, useDevicePixels, autoResizeDrawingBuffer} = props;

    return new AnimationLoop({
      width,
      height,
      useDevicePixels,
      autoResizeDrawingBuffer,
      onCreateContext: opts =>
        gl || createGLContext(Object.assign({}, glOptions, {canvas: this.canvas, debug})),
      onInitialize: this._onRendererInitialized,
      onRender: this._onRenderFrame,
      onBeforeRender: props.onBeforeRender,
      onAfterRender: props.onAfterRender
    });
  }

  _setLayerManagerProps(props) {
    if (!this.layerManager) {
      return;
    }

    const {
      width,
      height,
      views,
      viewState,
      layers,
      pickingRadius,
      onLayerClick,
      onLayerHover,
      useDevicePixels,
      drawPickingColors,
      layerFilter
    } = props;

    // Update viewports (creating one if not supplied)
    let viewports = props.viewports || props.viewport;
    if (!views && !viewports) {
      // TODO - old param style, move this default handling to React component
      const {latitude, longitude, zoom, pitch, bearing} = props;
      viewports = [
        new WebMercatorViewport({width, height, latitude, longitude, zoom, pitch, bearing})
      ];
    }

    // If more parameters need to be updated on layerManager add them to this method.
    this.layerManager.setParameters({
      width,
      height,
      views,
      viewState,
      layers,
      useDevicePixels,
      drawPickingColors,
      layerFilter,
      pickingRadius,
      onLayerClick,
      onLayerHover
    });
  }

  // Callbacks

  _onRendererInitialized({gl, canvas}) {
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthTest: true,
      depthFunc: GL.LEQUAL
    });

    this.props.onWebGLInitialized(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager(gl, {eventManager: this.eventManager});

    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});

    for (const effect of this.props.effects) {
      this.effectManager.addEffect(effect);
    }

    this.setProps(this.props);
  }

  _onRenderFrame({gl}) {
    // Update layers if needed (e.g. some async prop has loaded)
    this.layerManager.updateLayers();

    const redrawReason = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redrawReason) {
      return;
    }

    this.props.onBeforeRender({gl}); // TODO - should be called by AnimationLoop
    this.layerManager.drawLayers({
      pass: 'screen',
      redrawReason,
      // Helps debug layer picking, especially in framebuffer powered layers
      drawPickingColors: this.props.drawPickingColors
    });
    this.props.onAfterRender({gl}); // TODO - should be called by AnimationLoop
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.state.isDragging = isDragging;
      this.canvas.style.cursor = this.props.getCursor({isDragging});
    }
  }
}

Deck.propTypes = propTypes;
Deck.defaultProps = defaultProps;
