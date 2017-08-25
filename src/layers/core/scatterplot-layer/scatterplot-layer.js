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

import {Layer} from '../../../lib';
import {COORDINATE_SYSTEM} from '../../../lib';
import {get} from '../../../lib/utils';
import {fp64ify, enable64bitSupport} from '../../../lib/utils/fp64';
import {GL, Model, Geometry} from 'luma.gl';

import vs from './scatterplot-layer-vertex.glsl';
import vs64 from './scatterplot-layer-vertex-64.glsl';
import fs from './scatterplot-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  radiusScale: 1,
  radiusMinPixels: 0, //  min point radius in pixels
  radiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels
  strokeWidth: 1,
  outline: false,
  fp64: false,

  getPosition: x => x.position,
  getRadius: x => x.radius || 1,
  getColor: x => x.color || DEFAULT_COLOR
};

export default class ScatterplotLayer extends Layer {
  getShaders(id) {
    const {shaderCache} = this.context;
    return enable64bitSupport(this.props) ?
      {vs: vs64, fs, modules: ['project64', 'picking'], shaderCache} :
      {vs, fs, modules: ['picking'], shaderCache}; // 'project' module added by default.
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});

    /* eslint-disable max-len */
    /* deprecated props check */
    this._checkRemovedProp('radius', 'radiusScale');
    this._checkRemovedProp('drawOutline', 'outline');

    ScatterplotLayer.getAttributeManager(this.state.attributeManager);
  }

  updateAttribute({props, oldProps, changeFlags}) {
    if (props.fp64 !== oldProps.fp64) {
      const {attributeManager} = this.state;
      attributeManager.enable('instancePositions64xyLow',
        props.fp64 && props.projectionMode === COORDINATE_SYSTEM.LNGLAT);
      // TODO - this invalidation should not be needed???
      attributeManager.invalidateAll();
    }
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});
  }

  draw({uniforms}) {
    const {radiusScale, radiusMinPixels, radiusMaxPixels, outline, strokeWidth} = this.props;
    this.state.model.render(Object.assign({}, uniforms, {
      outline: outline ? 1 : 0,
      strokeWidth,
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels
    }));
  }

  _getModel(gl) {
    // a square that minimally cover the unit circle
    const positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

    return new Model(gl, Object.assign(this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        positions: new Float32Array(positions)
      }),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));
  }
}

ScatterplotLayer.layerName = 'ScatterplotLayer';
ScatterplotLayer.defaultProps = defaultProps;

// ATTRIBUTE MANAGEMENT

const calculateInstancePositions = ({value}, {props}) => {
  const {data, getPosition} = props;
  let i = 0;
  for (const point of data) {
    const position = getPosition(point);
    value[i++] = get(position, 0);
    value[i++] = get(position, 1);
    value[i++] = get(position, 2) || 0;
  }
};

const calculateInstancePositions64xyLow = ({value}, {props}) => {
  const {data, getPosition} = props;
  let i = 0;
  for (const point of data) {
    const position = getPosition(point);
    value[i++] = fp64ify(get(position, 0))[1];
    value[i++] = fp64ify(get(position, 1))[1];
  }
};

const calculateInstanceRadius = ({value}, {props}) => {
  const {data, getRadius} = props;
  let i = 0;
  for (const point of data) {
    const radius = getRadius(point);
    value[i++] = isNaN(radius) ? 1 : radius;
  }
};

const calculateInstanceColors = ({value}, {props}) => {
  const {data, getColor} = props;
  let i = 0;
  for (const point of data) {
    const color = getColor(point) || DEFAULT_COLOR;
    value[i++] = get(color, 0);
    value[i++] = get(color, 1);
    value[i++] = get(color, 2);
    value[i++] = isNaN(get(color, 3)) ? 255 : get(color, 3);
  }
};

ScatterplotLayer.getAttributeManager = attributeManager => {
  return Layer.getAttributeManager(attributeManager || 'scatterplot-attributes')
  .addInstanced({
    /* eslint-disable max-len */
    instancePositions: {size: 3, accessor: 'getPosition', update: calculateInstancePositions},
    instancePositions64xyLow: {size: 2, accessor: 'getPosition', update: calculateInstancePositions64xyLow},
    instanceRadius: {size: 1, accessor: 'getRadius', defaultValue: 1, update: calculateInstanceRadius},
    instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: calculateInstanceColors}
    /* eslint-enable max-len */
  });
};
