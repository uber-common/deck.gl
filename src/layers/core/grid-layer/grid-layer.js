// Copyright (c) 2015 Uber Technologies, Inc.
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

import {BaseLayer} from '../../../lib';
import {Model, Program, Geometry, glGetDebugInfo} from 'luma.gl';
const glslify = require('glslify');

export default class GridLayer extends BaseLayer {
  /**
   * @classdesc
   * GridLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.unitWidth - width of the unit rectangle
   * @param {number} opts.unitHeight - height of the unit rectangle
   */
  constructor(opts) {
    super({
      unitWidth: 100,
      unitHeight: 100,
      ...opts
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceColors: {size: 4, update: this.calculateInstanceColors}
    });

    this.updateCell();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const cellSizeChanged =
      newProps.unitWidth !== oldProps.unitWidth ||
      newProps.unitHeight !== oldProps.unitHeight;

    if (cellSizeChanged || this.state.viewportChanged) {
      this.updateCell();
    }
  }

  getModel(gl) {
    let intel_ifdef = '';

    if (glGetDebugInfo(gl).vendor.match(/Intel/)) {
      intel_ifdef += '#define INTEL_WORKAROUND 1\n';
    }

    return new Model({
      program: new Program(gl, {
        vs: intel_ifdef + glslify('./grid-layer-vertex.glsl'),
        fs: glslify('./grid-layer-fragment.glsl'),
        id: 'grid'
      }),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'TRIANGLE_FAN',
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      }),
      isInstanced: true
    });
  }

  updateCell() {
    const {width, height, unitWidth, unitHeight} = this.props;

    const numCol = Math.ceil(width * 2 / unitWidth);
    const numRow = Math.ceil(height * 2 / unitHeight);
    this.setState({
      numCol,
      numRow,
      numInstances: numCol * numRow
    });

    const {attributeManager} = this.state;
    attributeManager.invalidateAll();

    const MARGIN = 2;
    const scale = new Float32Array([
      unitWidth - MARGIN * 2,
      unitHeight - MARGIN * 2,
      1
    ]);
    this.setUniforms({scale});

  }

  calculateInstancePositions(attribute, numInstances) {
    const {unitWidth, unitHeight, width, height} = this.props;
    const {numCol} = this.state;
    const {value, size} = attribute;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = x * unitWidth - width;
      value[i * size + 1] = y * unitHeight - height;
      value[i * size + 2] = 0;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, unitWidth, unitHeight, width, height} = this.props;
    const {numCol, numRow} = this.state;
    const {value, size} = attribute;

    value.fill(0.0);

    for (const point of data) {
      const pixel = this.project([point.position.x, point.position.y]);
      const colId = Math.floor((pixel[0] + width) / unitWidth);
      const rowId = Math.floor((pixel[1] + height) / unitHeight);
      if (colId < numCol && rowId < numRow) {
        const i4 = (colId + rowId * numCol) * size;
        value[i4 + 2] = value[i4 + 0] += 1;
        value[i4 + 1] += 5;
        value[i4 + 3] = 0.6;
      }
    }

    this.setUniforms({maxCount: Math.max(...value)});
  }

}
