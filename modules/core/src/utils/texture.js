import {Texture2D} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

// Track the textures that are created by us. They need to be released when they are no longer used.
const internalTextures = {};

export function createTexture(layer, image) {
  const gl = layer.context && layer.context.gl;
  if (!gl) {
    return null;
  }
  let texture = null;
  if (image instanceof Texture2D) {
    return image;
  } else if (image) {
    // Image, ImageData, ImageData, HTMLCanvasElement, HTMLVideoElement, ImageBitmap
    texture = new Texture2D(gl, {
      data: image,
      parameters: {...DEFAULT_TEXTURE_PARAMETERS, ...layer.props.textureParameters}
    });
    // Track this texture
    internalTextures[texture.id] = true;
  }
  return texture;
}

export function destroyTexture(texture) {
  if (!texture || !(texture instanceof Texture2D)) {
    return;
  }
  if (internalTextures[texture.id]) {
    texture.delete();
    delete internalTextures[texture.id];
  }
}
