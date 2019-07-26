// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';
import {Layer} from '@deck.gl/core';
import vs from './triangle-layer-vertex.glsl';
import fs from './triangle-layer-fragment.glsl';

const defaultProps = {
  count: 0, // number of triangles to be rendered
  texture: null
};

export default class TriangleLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: ['project32']};
  }

  initializeState() {
    const {gl} = this.context;
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, noAlloc: true},
      texCoords: {size: 2, noAlloc: true}
    });
    this.setState({
      model: this._getModel(gl)
    });
  }

  updateState(opts) {
    super.updateState(opts);

    if (opts.changeFlags.dataChanged) {
      const attributeManager = this.getAttributeManager();
      attributeManager.invalidateAll();
    }
  }

  _getModel(gl) {
    const {count} = this.props;

    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          vertexCount: count
        }),
        shaderCache: this.context.shaderCache
      })
    );
  }

  draw({uniforms}) {
    const {model} = this.state;
    const {texture, maxTexture, colorTexture, opacityFactor} = this.props;
    model.setUniforms({texture, maxTexture, colorTexture, opacityFactor}).draw();
  }
}

TriangleLayer.layerName = 'TriangleLayer';
TriangleLayer.defaultProps = defaultProps;
