import {
  initializeResources,
  createOrResizeFramebuffer,
  initializeDeckGL
} from './commons';

import {withParameters, Framebuffer} from '@luma.gl/core';

export default function loadArcGISDeckLayerView2D(BaseLayerViewGL2D) {
  return BaseLayerViewGL2D.createSubclass({
    properties: {
      handles: {},
      uTexture: {},
      vertexBuffer: {},
      indexBuffer: {},
      program: {},
      deckgl: {},
      fboWidth: {},
      fboHeight: {},
      texture: {},
      deckFbo: {}
    },

    initializeResources,
    createOrResizeFramebuffer,
    initializeDeckGL,

    // Attach is called as soon as the layer view is ready to start rendering.
    attach() {
      // We use a full-screen quad and shaders to composite the frame rendered
      // with deck.gl on top of the MapView. Composition uses the MapView context.
      const gl = this.context;

      this.initializeResources(gl);
      // eslint-disable-next-line
      const dpr = window.devicePixelRatio;
      this.deckFbo = new Framebuffer(gl, {
        width: Math.round(this.view.state.size[0] * dpr),
        height: Math.round(this.view.state.size[1] * dpr)
      });
      this.initializeDeckGL(gl);

      // When the layer.layers collection changes, the new list of
      // layers must be set on the deck.gl instance.
      this.handles.add([
        this.layer.deckLayers.on('change', () => {
          this.redraw();
        })
      ]);

      // We need to start drawing the deck.gl layer immediately.
      this.redraw();
    },

    // This method is called whenever the deck.gl layer changes and must be
    // displayed.
    redraw() {
      const layers = this.layer.deckLayers.items;

      this.deckgl.setProps({
        layers: layers.slice()
      });

      // We need to tell the layer view that it must redraw itself.
      this.requestRender();
    },

    // Called when the layer must be destroyed.
    detach() {
      this.handles.removeAll();

      this.deckgl = null;

      if (this.model) {
        this.model.delete();
      }

      if (this.buffer) {
        this.buffer.delete();
      }

      if (this.deckFbo) {
        this.deckFbo.delete();
      }
    },

    // Called every time that the layer view must be rendered.
    render(renderParameters) {
      const gl = renderParameters.context;
      const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      // eslint-disable-next-line
      const dpr = window.devicePixelRatio;
      this.createOrResizeFramebuffer(
        gl,
        Math.round(this.view.state.size[0] * dpr),
        Math.round(this.view.state.size[1] * dpr)
      );

      // The view state must be kept in-sync with the MapView of the ArcGIS API.
      const state = renderParameters.state;

      this.deckgl.setProps({
        viewState: {
          latitude: this.view.center.latitude,
          longitude: this.view.center.longitude,
          zoom: this.view.featuresTilingScheme.scaleToLevel(state.scale),
          bearing: -state.rotation,
          pitch: 0
        }
      });

      // We redraw the deck immediately.
      this.deckgl.redraw(true);

      // We overlay the texture on top of the map using the full-screen quad.
      withParameters(
        gl,
        {
          blend: true,
          blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
          framebuffer: screenFbo,
          viewport: [
            0,
            0,
            Math.round(this.view.state.size[0] * dpr),
            Math.round(this.view.state.size[1] * dpr)
          ]
        },
        () => {
          this.model.setUniforms({u_texture: this.deckFbo}).draw();
        }
      );
    }
  });
}
