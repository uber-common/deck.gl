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

// NOTE: this is same as 'project' module except this is applied to fragment shader.

import fsfp32 from '../fs-fp32/fs-fp32';
import fsProjectShader from './fs-project.glsl';
import {getUniformsFromViewport} from './fs-viewport-uniforms';

const INITIAL_MODULE_OPTIONS = {};

function getUniforms(opts = INITIAL_MODULE_OPTIONS) {
  if (opts.viewport) {
    return getUniformsFromViewport(opts);
  }
  return {};
}

export default {
  name: 'fsproject',
  dependencies: [fsfp32],
  vs: null,
  fs: `${fsProjectShader}`,
  getUniforms,
  deprecations: [
    // Removed project uniforms
    {type: 'uniform float', old: 'projectionMode', new: 'project_uCoordinateSystem'},
    {type: 'uniform vec4', old: 'projectionCenter', new: 'project_uCenter'},
    {type: 'uniform vec2', old: 'projectionOrigin'},
    {type: 'uniform mat4', old: 'modelMatrix', new: 'project_uModelMatrix'},
    {type: 'uniform mat4', old: 'viewMatrix'},
    {type: 'uniform mat4', old: 'projectionMatrix', new: 'project_uViewProjectionMatrix'},
    {type: 'uniform vec3', old: 'projectionPixelsPerUnit', new: 'project_uPixelsPerUnit'},
    {type: 'uniform float', old: 'projectionScale', new: 'project_uScale'},
    {type: 'uniform vec2', old: 'viewportSize', new: 'project_uViewportSize'},
    {type: 'uniform float', old: 'devicePixelRatio', new: 'project_uDevicePixelRatio'},
    {type: 'uniform vec3', old: 'cameraPos', new: 'project_uCameraPosition'},

    // Deprecated project functions
    {type: 'function', old: 'scale', new: 'project_scale', deprecated: 1},
    {type: 'function', old: 'preproject', new: 'project_position', deprecated: 1},
    {type: 'function', old: 'project', new: 'project_to_clipspace', deprecated: 1}
  ]
};
