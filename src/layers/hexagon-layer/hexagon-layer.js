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

import Layer from '../../layer';
import {Model, Program, Geometry, CylinderGeometry} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  instancePositions: {size: 2, '0': 'x', '1': 'y'},
  instanceElevations: {size: 1, '0': 'z'},
  instanceColors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'}
};

export default class HexagonLayer extends Layer {
  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */
  constructor(opts) {
    super({
      dotRadius: 10,
      elevation: 100,
      ...opts
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced(ATTRIBUTES, {
      instancePositions: {update: this.calculateInstancePositions},
      instanceElevations: {update: this.calculateInstanceElevations},
      instanceColors: {update: this.calculateInstanceColors}
    });

    this.calculateRadiusAndAngle();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged, viewportChanged, attributeManager} = this.state;

    if (dataChanged || viewportChanged) {
      this.calculateRadiusAndAngle();
    }
    if (dataChanged) {
      attributeManager.invalidateAll();
    }
  }

  getModel(gl) {
    const geometry = new CylinderGeometry({
      id: this.props.id,
      radius: 1,
      topRadius: 1,
      bottomRadius: 1,
      topCap: true,
      bottomCap: true,
      height: 1,
      nradial: 6,
      nvertical: 1
    });

    // const NUM_SEGMENTS = 6;
    // const PI2 = Math.PI * 2;

    // let vertices = [];
    // for (let i = 0; i < NUM_SEGMENTS; i++) {
    //   vertices = [
    //     ...vertices,
    //     Math.cos(PI2 * i / NUM_SEGMENTS),
    //     Math.sin(PI2 * i / NUM_SEGMENTS),
    //     0
    //   ];
    // }

    // const geometry = new Geometry({
    //   id: this.props.id,
    //   drawMode: 'TRIANGLE_FAN',
    //   vertices: new Float32Array(vertices)
    // });

    return new Model({
      program: new Program(gl, {
        vs: glslify('./hexagon-layer-vertex.glsl'),
        fs: glslify('./hexagon-layer-fragment.glsl'),
        id: 'hexagon'
      }),
      geometry,
      instanced: true
      // indexed: true
    });
  }

  calculateInstancePositions(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const hexagon of data) {
      value[i + 0] = hexagon.centroid.x;
      value[i + 1] = hexagon.centroid.y;
      i += size;
    }
  }

  calculateInstanceElevations(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const hexagon of data) {
      value[i + 0] = hexagon.elevation || 0;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const hexagon of data) {
      value[i + 0] = hexagon.color[0];
      value[i + 1] = hexagon.color[1];
      value[i + 2] = hexagon.color[2];
      i += 3;
    }
  }

  // TODO this is the only place that uses hexagon vertices
  // consider move radius and angle calculation to the shader
  calculateRadiusAndAngle() {
    const {data} = this.props;
    if (!data || data.length === 0) {
      return;
    }

    const vertices = data[0].vertices;
    const vertex0 = vertices[0];
    const vertex3 = vertices[3];

    // transform to space coordinates
    const spaceCoord0 = this.project({lat: vertex0[1], lon: vertex0[0]});
    const spaceCoord3 = this.project({lat: vertex3[1], lon: vertex3[0]});

    // distance between two close centroids
    const dx = spaceCoord0.x - spaceCoord3.x;
    const dy = spaceCoord0.y - spaceCoord3.y;
    const dxy = Math.sqrt(dx * dx + dy * dy);

    this.setUniforms({
      // Calculate angle that the perpendicular hexagon vertex axis is tilted
      angle: Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2,
      // Allow user to fine tune radius
      radius: dxy / 2 * Math.min(1, this.props.dotRadius),
      elevation: this.props.elevation
    });

  }

}
