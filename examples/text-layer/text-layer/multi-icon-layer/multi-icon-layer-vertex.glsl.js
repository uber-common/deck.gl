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

export default `\
#define SHADER_NAME multi-icon-layer-vertex-shader

attribute vec2 positions;

attribute vec3 instancePositions;
attribute float instanceSizes;
attribute float instanceAngles;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceIconFrames;
attribute float instanceColorModes;
attribute vec2 instanceOffsets;
attribute float instanceLetterIndexInString;
attribute float instanceStringLength;

uniform vec2 viewportSize;
uniform float sizeScale;
uniform vec2 iconsTextureDim;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;

// rotation should factor in the aspect ratio
vec2 rotate_by_angle(vec2 vertex, float angle, float aspectRatio) {
  float angle_radian = angle * PI / 180.0;
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  float aspectRatioInverse = aspectRatio == 0.0 ? 1.0 : 1.0 / aspectRatio;
  mat2 rotationMatrix = mat2(
    cos_angle,
    - aspectRatioInverse * sin_angle,
    aspectRatio * sin_angle,
    cos_angle
  );
  return rotationMatrix * vertex;
}

// calculate horizontal shift of each letter
vec2 getShift(float instanceLetterIndexInString, float instanceStringLength) {
  // calculate the middle index of the string
  float midIndex = (instanceStringLength - 1.0) / 2.0;
  // fix padding for now, can be changed to a user-defined param
  float padding = 0.1;
  float shift = (instanceLetterIndexInString - midIndex) * (1.0 + padding);
  return vec2(shift, 0.0);
}

void main(void) {
  vec2 iconSize = instanceIconFrames.zw;
  vec2 iconSize_clipspace = iconSize / viewportSize * 2.0;
  // scale icon height to match instanceSize
  float instanceScale = iconSize.y == 0.0 ? 0.0 : instanceSizes / iconSize.y;

  vec3 center = project_position(instancePositions);
  vec2 vertex = (positions / 2.0 + instanceOffsets);
  vertex += getShift(instanceLetterIndexInString, instanceStringLength);

  float aspectRatio = viewportSize.x == 0.0 ? 1.0 : viewportSize.y / viewportSize.x;
  vertex *= iconSize_clipspace;
  vertex = rotate_by_angle(vertex, instanceAngles, aspectRatio) * sizeScale * instanceScale;
  vertex.y *= -1.0;

  gl_Position = project_to_clipspace(vec4(center, 1.0)) + vec4(vertex, 0.0, 0.0);

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / iconsTextureDim;

  vTextureCoords.y = 1.0 - vTextureCoords.y;

  vColor = instanceColors / 255.;
  picking_setPickingColor(instancePickingColors);

  vColorMode = instanceColorModes;
}
`;
