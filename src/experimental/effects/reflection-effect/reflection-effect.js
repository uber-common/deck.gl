/* global window */
import {GL, Framebuffer, Model, Geometry} from 'luma.gl';
import {assembleShaders} from '../../../shader-utils';
import {Effect} from '../../lib';
import {readFileSync} from 'fs';
import {join} from 'path';
import {WebMercatorViewport} from 'viewport-mercator-project';

/*
 * This should be made a subclass of a more general effect class once other
 * effects are implemented.
 */

export default class ReflectionEffect extends Effect {
  constructor(reflectivity = 0.2) {
    super();
    this.reflectivity = reflectivity;
    this.framebuffer = null;
    this.setNeedsRedraw();
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './reflection-effect-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './reflection-effect-fragment.glsl'), 'utf8')
    };
  }

  initialize({gl, layerManager}) {
    this.model = new Model({
      gl,
      ...assembleShaders(gl, this.getShaders()),
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      })
    });
    this.framebuffer = new Framebuffer(gl);

  }

  preDraw({gl, layerManager}) {
    const {viewport} = layerManager.context;
    /*
     * the renderer already has a reference to this, but we don't have a reference to the renderer.
     * when we refactor the camera code, we should make sure we get a reference to the renderer so
     * that we can keep this in one place.
     */
    const dpi = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.framebuffer.resize({width: dpi * viewport.width, height: dpi * viewport.height});
    const pitch = viewport.pitch;
    this.framebuffer.bind();
    /* this is a huge hack around the existing viewport class.
     * TODO in the future, once we implement bona-fide cameras, we really need to fix this.
     */
    layerManager.setViewport(new WebMercatorViewport({
      ...viewport,
      pitch: -180 - pitch
    }));
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    layerManager.drawLayers();
    layerManager.setViewport(viewport);
    this.framebuffer.unbind();
  }

  draw({gl, layerManager}) {
    this.model.render({
      reflectionTexture: this.framebuffer.texture,
      reflectivity: this.reflectivity
    });
  }

  finalize({gl, layerManager}) {
    /* TODO: Free resources? */
  }
}
