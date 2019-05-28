import {_LayersPass as LayersPass} from '@deck.gl/core';
import {Framebuffer, Texture2D, Renderbuffer, withParameters} from '@luma.gl/core';

export default class ShadowPass extends LayersPass {
  constructor(gl) {
    super(gl);

    // The shadowMap texture
    this.shadowMap = new Texture2D(gl, {
      width: 1,
      height: 1,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
        [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      }
    });

    this.depthBuffer = new Renderbuffer(gl, {
      format: gl.DEPTH_COMPONENT16,
      width: 1,
      height: 1
    });

    this.fbo = new Framebuffer(gl, {
      id: 'shadowmap',
      width: 1,
      height: 1,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: this.shadowMap,
        // Depth attachment has to be specified for depth test to work
        [gl.DEPTH_ATTACHMENT]: this.depthBuffer
      }
    });
    this.props.pixelRatio = 2;
  }

  render(params) {
    const target = this.fbo;

    withParameters(
      this.gl,
      {
        depthRange: [0, 1],
        depthTest: true,
        blend: false,
        clearColor: [1, 1, 1, 1]
      },
      () => {
        const viewport = params.viewports[0];
        const width = viewport.width * this.props.pixelRatio;
        const height = viewport.height * this.props.pixelRatio;
        if (width !== target.width || height !== target.height) {
          // this.shadowMap.resize({width, height});
          target.resize({width, height});
        }

        super.render(Object.assign(params, {outputBuffer: target}));
        // this.target.generateMipmap();
      }
    );
  }

  shouldDrawLayer(layer) {
    return layer.props.castShadow;
  }

  getModuleParameters(layer, effects, effectProps) {
    const moduleParameters = Object.assign(Object.create(layer.props), {
      viewport: layer.context.viewport,
      pickingActive: 1,
      drawToShadowMap: true,
      devicePixelRatio: this.props.pixelRatio
    });
    for (const effect of effects) {
      Object.assign(moduleParameters, effect.getParameters(layer));
    }
    return moduleParameters;
  }

  delete() {
    if (this.fbo) {
      this.fbo.delete();
      this.fbo = null;
    }

    if (this.shadowMap) {
      this.shadowMap.delete();
      this.shadowMap = null;
    }

    if (this.depthBuffer) {
      this.depthBuffer.delete();
      this.depthBuffer = null;
    }
  }
}
