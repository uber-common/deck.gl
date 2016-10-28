// Copyright (c) 2016 Uber Technologies, Inc.
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
import {assembleShaders} from '../../../shader-utils';
import {Model, Program, Geometry} from 'luma.gl';
import {fp64ify} from '../../../lib/utils/fp64';

const glslify = require('glslify');
const DEFAULT_COLOR = [255, 0, 255];

const defaultGetPosition = x => x.position;
const defaultGetRadius = x => x.radius;
const defaultGetColor = x => x.color || DEFAULT_COLOR;

export default class ScatterplotLayer extends Layer {
  /*
   * @classdesc
   * ScatterplotLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius
   */
  constructor({
    getPosition = defaultGetPosition,
    getRadius = defaultGetRadius,
    getColor = defaultGetColor,
    ...props
  }) {
    super({
      getPosition,
      getRadius,
      getColor,
      ...props
    });
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced({
      instancePositionsFP64: {size: 4, update: this.calculateInstancePositions},
      instanceRadius: {size: 1, update: this.calculateInstanceRadius},
      layerHeight: {size: 2, update: this.calculateLayerHeight},
      instanceColors: {size: 3, update: this.calculateInstanceColors}
    });
  }

  getModel(gl) {
    const NUM_SEGMENTS = 16;
    const PI2 = Math.PI * 2;

    let positions = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions = [
        ...positions,
        Math.cos(PI2 * i / NUM_SEGMENTS),
        Math.sin(PI2 * i / NUM_SEGMENTS),
        0
      ];
    }

    return new Model({
      id: this.props.id,
      program: new Program(gl, assembleShaders(gl, {
        vs: glslify('./scatterplot-layer-vertex.glsl'),
        fs: glslify('./scatterplot-layer-fragment.glsl'),
        fp64: true,
        project64: true
      })),
      geometry: new Geometry({
        drawMode: 'TRIANGLE_FAN',
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
  }

  draw({uniforms}) {
    this.calculateZoomRadius();
    this.state.model.render({
      ...uniforms,
      zoomRadiusFP64: this.state.zoomRadiusFP64
    });
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      [value[i + 0], value[i + 1]] = fp64ify(position[0]);
      [value[i + 2], value[i + 3]] = fp64ify(position[1]);
      i += size;
    }
  }

  calculateLayerHeight(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      [value[i + 0], value[i + 1]] = fp64ify(position[2]);
      i += size;
    }
  }

  calculateInstanceRadius(attribute) {
    const {data, getRadius} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const radius = getRadius(point) || 1;
      value[i + 0] = radius;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      i += size;
    }
  }

  calculateZoomRadius() {
    // use radius if specified

    const pixel0 = this.projectFlat([-122, 37.5]);
    const pixel1 = this.projectFlat([-122, 37.5002]);

    const dx = pixel0[0] - pixel1[0];
    const dy = pixel0[1] - pixel1[1];

    const radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
    this.state.zoomRadiusFP64 = fp64ify(radius);
  }
}
