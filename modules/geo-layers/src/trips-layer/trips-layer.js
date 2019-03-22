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

import {PathLayer} from '@deck.gl/layers';

const defaultProps = {
  trailLength: {type: 'number', value: 120, min: 0},
  currentTime: {type: 'number', value: 0, min: 0}
};

export default class TripsLayer extends PathLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      // Timestamp of the vertex
      'vs:#decl': `\
uniform float trailLength;
varying float vTime;
`,
      // Remove the z component (timestamp) from position
      'vec3 pos = lineJoin(prevPosition, currPosition, nextPosition);': 'pos.z = 0.0;',
      // Apply a small shift to battle z-fighting
      'vs:#main-end': `\
float shiftZ = mod(instanceEndPositions.z, trailLength) * 1e-4;
gl_Position.z += shiftZ;
vTime = instanceStartPositions.z + (instanceEndPositions.z - instanceStartPositions.z) * vPathPosition.y / vPathLength;
`,
      'fs:#decl': `\
uniform float trailLength;
uniform float currentTime;
varying float vTime;
`,
      // Drop the segments outside of the time window
      'fs:#main-start': `\
if(vTime > currentTime || vTime < currentTime - trailLength) {
  discard;
}
`,
      // Fade the color (currentTime - 100%, end of trail - 0%)
      'gl_FragColor = vColor;': 'gl_FragColor.a *= 1.0 - (currentTime - vTime) / trailLength;'
    };
    return shaders;
  }

  draw(params) {
    const {trailLength, currentTime} = this.props;

    params.uniforms = Object.assign({}, params.uniforms, {
      trailLength,
      currentTime
    });

    super.draw(params);
  }
}

TripsLayer.layerName = 'TripsLayer';
TripsLayer.defaultProps = defaultProps;
