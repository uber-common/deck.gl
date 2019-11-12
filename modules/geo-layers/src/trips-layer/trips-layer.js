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
import {createIterable, log} from '@deck.gl/core';

const defaultProps = {
  trailLength: {type: 'number', value: 120, min: 0},
  currentTime: {type: 'number', value: 0, min: 0},
  getTimestamps: {type: 'accessor', value: null}
};

export default class TripsLayer extends PathLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      // Timestamp of the vertex
      'vs:#decl': `\
uniform float trailLength;
attribute vec2 instanceTimestamps;
varying float vTime;
`,
      // Apply a small shift to battle z-fighting
      'vs:#main-end': `\
vTime = instanceTimestamps.x + (instanceTimestamps.y - instanceTimestamps.x) * vPathPosition.y / vPathLength;
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
      'fs:DECKGL_FILTER_COLOR': 'color.a *= 1.0 - (currentTime - vTime) / trailLength;'
    };
    return shaders;
  }

  initializeState(params) {
    super.initializeState(params);

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceTimestamps: {
        size: 2,
        update: this.calculateInstanceTimestamps
      }
    });
  }

  draw(params) {
    const {trailLength, currentTime} = this.props;

    params.uniforms = Object.assign({}, params.uniforms, {
      trailLength,
      currentTime
    });

    super.draw(params);
  }

  calculateInstanceTimestamps(attribute, {startRow, endRow}) {
    const {data, getTimestamps} = this.props;

    const {
      pathTesselator: {bufferLayout, instanceCount}
    } = this.state;
    const value = new Float32Array(instanceCount * 2);

    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    let i = 0;

    for (let objectIndex = 0; objectIndex < startRow; objectIndex++) {
      i += bufferLayout[objectIndex] * 2;
    }

    for (const object of iterable) {
      objectInfo.index++;

      const geometrySize = bufferLayout[objectInfo.index];
      const timestamps = getTimestamps(object, objectInfo);

      // Support for legacy use case is removed in v8.0
      // TODO - remove when all apps are updated
      log.assert(timestamps, 'TrisLayer: invalid timestamps');

      // For each line segment, we have [startTimestamp, endTimestamp]
      for (let j = 0; j < geometrySize; j++) {
        value[i++] = timestamps[j];
        value[i++] = timestamps[j + 1];
      }
    }
    attribute.constant = false;
    attribute.value = value;
  }
}

TripsLayer.layerName = 'TripsLayer';
TripsLayer.defaultProps = defaultProps;
