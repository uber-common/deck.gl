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
import project from '../../shaderlib/project';

export default `\
#define SHADER_NAME scatterplot-layer-vertex-shader

${project}

attribute vec3 positions;
attribute vec4 instancePositions;
attribute vec3 instanceColors;
attribute vec3 instancePickingColors;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixUncentered;
uniform float opacity;
uniform float radius;
uniform float renderPickingBuffer;

varying vec4 vColor;

void main(void) {
  // For some reason, need to add one to elevation to show up in untilted mode
  vec3 center = vec3(projectAndCenter(instancePositions.xy), instancePositions.z + 1.0);
  vec3 vertex = positions * radius * instancePositions.w;
  gl_Position = projectionMatrixUncentered * vec4(center, 1.0) +
                projectionMatrixUncentered * vec4(vertex, 0.0);

  vec4 color = vec4(instanceColors / 255.0, opacity);
  vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);
}
`;
