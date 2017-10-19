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

import {log} from './utils';
import {drawPickingBuffer, getPixelRatio} from './draw-layers';
import assert from 'assert';

const EMPTY_PIXEL = new Uint8Array(4);

const NO_PICKED_OBJECT = {
  pickedColor: EMPTY_PIXEL,
  pickedLayer: null,
  pickedObjectIndex: -1
};

/* eslint-disable max-depth, max-statements */
// Pick the closest object at the given (x,y) coordinate
export function pickObject(gl, {
  layers,
  viewports,
  onViewportActive,
  pickingFBO,
  x,
  y,
  radius,
  mode,
  lastPickedInfo,
  useDevicePixelRatio
}) {
  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = getPixelRatio({useDevicePixelRatio});
  const deviceX = Math.round(x * pixelRatio);
  const deviceY = Math.round(gl.canvas.height - y * pixelRatio);
  const deviceRadius = Math.round(radius * pixelRatio);

  const deviceRect = getPickingRect({
    deviceX, deviceY, deviceRadius,
    deviceWidth: pickingFBO.width,
    deviceHeight: pickingFBO.height
  });

  const pickedColors = deviceRect && drawAndSamplePickingBuffer(gl, {
    layers,
    viewports,
    onViewportActive,
    useDevicePixelRatio,
    pickingFBO,
    deviceRect,
    redrawReason: mode
  });

  const pickInfo = (pickedColors && getClosestFromPickingBuffer(gl, {
    pickedColors,
    layers,
    deviceX,
    deviceY,
    deviceRadius,
    deviceRect
  })) || NO_PICKED_OBJECT;

  return processPickInfo({
    pickInfo, lastPickedInfo, mode, layers, viewports, x, y, deviceX, deviceY, pixelRatio
  });
}

function processPickInfo({
  pickInfo, lastPickedInfo, mode, layers, viewports, x, y, deviceX, deviceY, pixelRatio
}) {
  const {
    pickedColor,
    pickedLayer,
    pickedObjectIndex
  } = pickInfo;

  const affectedLayers = pickedLayer ? [pickedLayer] : [];

  if (mode === 'hover') {
    // only invoke onHover events if picked object has changed
    const lastPickedObjectIndex = lastPickedInfo.index;
    const lastPickedLayerId = lastPickedInfo.layerId;
    const pickedLayerId = pickedLayer && pickedLayer.props.id;

    // proceed only if picked object changed
    if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedObjectIndex) {
      if (pickedLayerId !== lastPickedLayerId) {
        // We cannot store a ref to lastPickedLayer in the context because
        // the state of an outdated layer is no longer valid
        // and the props may have changed
        const lastPickedLayer = layers.find(layer => layer.props.id === lastPickedLayerId);
        if (lastPickedLayer) {
          // Let leave event fire before enter event
          affectedLayers.unshift(lastPickedLayer);
        }
      }

      // Update layer manager context
      lastPickedInfo.layerId = pickedLayerId;
      lastPickedInfo.index = pickedObjectIndex;
    }
  }

  const viewport = getViewportFromCoordinates({viewports}); // TODO - add coords

  const baseInfo = createInfo([x, y], viewport);
  baseInfo.devicePixel = [deviceX, deviceY];
  baseInfo.pixelRatio = pixelRatio;

  // Use a Map to store all picking infos.
  // The following two forEach loops are the result of
  // https://github.com/uber/deck.gl/issues/443
  // Please be very careful when changing this pattern
  const infos = new Map();
  const unhandledPickInfos = [];

  affectedLayers.forEach(layer => {
    let info = Object.assign({}, baseInfo);

    if (layer === pickedLayer) {
      info.color = pickedColor;
      info.index = pickedObjectIndex;
      info.picked = true;
    }

    info = getLayerPickingInfo({layer, info, mode});

    // This guarantees that there will be only one copy of info for
    // one composite layer
    if (info) {
      infos.set(info.layer.id, info);
    }

    const pickingSelectedColor = pickedColor;
    const pickingSelectedColorValid = Boolean(
      layer.props.autoHighlight &&
      pickedLayer === layer &&
      pickingSelectedColor !== EMPTY_PIXEL
    );
    // Note: Auto highlighting only works for single model layers
    const pickingParameters = {
      pickingSelectedColor,
      pickingSelectedColorValid
    };

    for (const model of layer.getModels()) {
      model.updateModuleSettings(pickingParameters);
    }
  });

  infos.forEach(info => {
    let handled = false;
    // Per-layer event handlers (e.g. onClick, onHover) are provided by the
    // user and out of deck.gl's control. It's very much possible that
    // the user calls React lifecycle methods in these function, such as
    // ReactComponent.setState(). React lifecycle methods sometimes induce
    // a re-render and re-generation of props of deck.gl and its layers,
    // which invalidates all layers currently passed to this very function.

    // Therefore, per-layer event handlers must be invoked at the end
    // of this function. NO operation that relies on the states of current
    // layers should be called after this code.
    switch (mode) {
    case 'click': handled = info.layer.props.onClick(info); break;
    case 'hover': handled = info.layer.props.onHover(info); break;
    case 'query': break;
    default: throw new Error('unknown pick type');
    }

    if (!handled) {
      unhandledPickInfos.push(info);
    }
  });

  return unhandledPickInfos;
}

// Pick all objects within the given bounding box
export function pickVisibleObjects(gl, {
  layers,
  viewports,
  onViewportActive,
  pickingFBO,
  x,
  y,
  width,
  height,
  mode,
  useDevicePixelRatio
}) {

  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = getPixelRatio({useDevicePixelRatio});

  const deviceLeft = Math.round(x * pixelRatio);
  const deviceBottom = Math.round(gl.canvas.height - y * pixelRatio);
  const deviceRight = Math.round((x + width) * pixelRatio);
  const deviceTop = Math.round(gl.canvas.height - (y + height) * pixelRatio);

  const deviceRect = {
    x: deviceLeft,
    y: deviceTop,
    width: deviceRight - deviceLeft,
    height: deviceBottom - deviceTop
  };

  const pickedColors = drawAndSamplePickingBuffer(gl, {
    layers,
    viewports,
    onViewportActive,
    pickingFBO,
    useDevicePixelRatio,
    deviceRect,
    redrawReason: mode
  });

  const pickInfos = getUniquesFromPickingBuffer(gl, {pickedColors, layers});

  // Only return unique infos, identified by info.object
  const uniqueInfos = new Map();

  pickInfos.forEach(pickInfo => {
    const viewport = getViewportFromCoordinates({viewports}); // TODO - add coords
    let info = createInfo([pickInfo.x / pixelRatio, pickInfo.y / pixelRatio], viewport);
    info.devicePixel = [pickInfo.x, pickInfo.y];
    info.pixelRatio = pixelRatio;
    info.color = pickInfo.pickedColor;
    info.index = pickInfo.pickedObjectIndex;
    info.picked = true;

    info = getLayerPickingInfo({layer: pickInfo.pickedLayer, info, mode});
    if (!uniqueInfos.has(info.object)) {
      uniqueInfos.set(info.object, info);
    }
  });

  return Array.from(uniqueInfos.values());
}

// HELPER METHODS

// Indentifies which viewport, if any corresponds to x and y
// Returns first viewport if no match
// TODO - need to determine which viewport we are in
// TODO - document concept of "primary viewport" that matches all coords?
// TODO - static method on Viewport class?
function getViewportFromCoordinates({viewports}) {
  const viewport = viewports[0];
  return viewport;
}

// returns pickedColor or null if no pickable layers found.
function drawAndSamplePickingBuffer(gl, {
  layers,
  viewports,
  onViewportActive,
  useDevicePixelRatio,
  pickingFBO,
  deviceRect,
  redrawReason
}) {

  assert(deviceRect);
  assert((Number.isFinite(deviceRect.width) && deviceRect.width > 0), '`width` must be > 0');
  assert((Number.isFinite(deviceRect.height) && deviceRect.height > 0), '`height` must be > 0');

  const pickableLayers = layers.filter(layer => layer.isPickable());
  if (pickableLayers.length < 1) {
    return null;
  }

  drawPickingBuffer(gl, {
    layers,
    viewports,
    onViewportActive,
    useDevicePixelRatio,
    pickingFBO,
    deviceRect,
    redrawReason
  });

  // Read from an already rendered picking buffer
  // Returns an Uint8ClampedArray of picked pixels
  const {x, y, width, height} = deviceRect;
  const pickedColors = new Uint8Array(width * height * 4);
  pickingFBO.readPixels({x, y, width, height, pixelArray: pickedColors});
  return pickedColors;
}

// Calculate a picking rect centered on deviceX and deviceY and clipped to device
// Returns null if pixel is outside of device
function getPickingRect({deviceX, deviceY, deviceRadius, deviceWidth, deviceHeight}) {
  const valid =
    deviceX >= 0 &&
    deviceY >= 0 &&
    deviceX < deviceWidth &&
    deviceY < deviceHeight;

  // x, y out of bounds.
  if (!valid) {
    return null;
  }

  // Create a box of size `radius * 2 + 1` centered at [deviceX, deviceY]
  const x = Math.max(0, deviceX - deviceRadius);
  const y = Math.max(0, deviceY - deviceRadius);
  const width = Math.min(deviceWidth, deviceX + deviceRadius) - x + 1;
  const height = Math.min(deviceHeight, deviceY + deviceRadius) - y + 1;

  return {x, y, width, height};
}

/**
 * Pick at a specified pixel with a tolerance radius
 * Returns the closest object to the pixel in shape `{pickedColor, pickedLayer, pickedObjectIndex}`
 */
function getClosestFromPickingBuffer(gl, {
  pickedColors,
  layers,
  deviceX,
  deviceY,
  deviceRadius,
  deviceRect
}) {
  assert(pickedColors);
  let closestResultToCenter = NO_PICKED_OBJECT;

  // Traverse all pixels in picking results and find the one closest to the supplied
  // [deviceX, deviceY]
  let minSquareDistanceToCenter = deviceRadius * deviceRadius;
  let i = 0;

  for (let row = 0; row < deviceRect.height; row++) {
    for (let col = 0; col < deviceRect.width; col++) {
      // Decode picked layer from color
      const pickedLayerIndex = pickedColors[i + 3] - 1;

      if (pickedLayerIndex >= 0) {
        const dx = col + deviceRect.x - deviceX;
        const dy = row + deviceRect.y - deviceY;
        const d2 = dx * dx + dy * dy;

        if (d2 <= minSquareDistanceToCenter) {
          minSquareDistanceToCenter = d2;

          // Decode picked object index from color
          const pickedColor = pickedColors.slice(i, i + 4);
          const pickedLayer = layers[pickedLayerIndex];
          if (pickedLayer) {
            const pickedObjectIndex = pickedLayer.decodePickingColor(pickedColor);
            closestResultToCenter = {pickedColor, pickedLayer, pickedObjectIndex};
          } else {
            log.error(0, 'Picked non-existent layer. Is picking buffer corrupt?');
          }
        }
      }
      i += 4;
    }
  }

  return closestResultToCenter;
}
/* eslint-enable max-depth, max-statements */

/**
 * Examines a picking buffer for unique colors
 * Returns array of unique objects in shape `{x, y, pickedColor, pickedLayer, pickedObjectIndex}`
 */
function getUniquesFromPickingBuffer(gl, {pickedColors, layers}) {
  const uniqueColors = new Map();

  // Traverse all pixels in picking results and get unique colors
  if (pickedColors) {
    for (let i = 0; i < pickedColors.length; i += 4) {
      // Decode picked layer from color
      const pickedLayerIndex = pickedColors[i + 3] - 1;

      if (pickedLayerIndex >= 0) {
        const pickedColor = pickedColors.slice(i, i + 4);
        const colorKey = pickedColor.join(',');
        if (!uniqueColors.has(colorKey)) { // eslint-disable-line
          const pickedLayer = layers[pickedLayerIndex];
          if (pickedLayer) { // eslint-disable-line
            uniqueColors.set(colorKey, {
              pickedColor,
              pickedLayer,
              pickedObjectIndex: pickedLayer.decodePickingColor(pickedColor)
            });
          } else {
            log.error(0, 'Picked non-existent layer. Is picking buffer corrupt?');
          }
        }
      }
    }
  }

  return Array.from(uniqueColors.values());
}

function createInfo(pixel, viewport) {
  // Assign a number of potentially useful props to the "info" object
  return {
    color: EMPTY_PIXEL,
    layer: null,
    index: -1,
    picked: false,
    x: pixel[0],
    y: pixel[1],
    pixel,
    lngLat: viewport.unproject(pixel)
  };
}

// Walk up the layer composite chain to populate the info object
function getLayerPickingInfo({layer, info, mode}) {
  while (layer && info) {
    // For a composite layer, sourceLayer will point to the sublayer
    // where the event originates from.
    // It provides additional context for the composite layer's
    // getPickingInfo() method to populate the info object
    const sourceLayer = info.layer || layer;
    info.layer = layer;
    // layer.pickLayer() function requires a non-null ```layer.state```
    // object to funtion properly. So the layer refereced here
    // must be the "current" layer, not an "out-dated" / "invalidated" layer
    info = layer.pickLayer({info, mode, sourceLayer});
    layer = layer.parentLayer;
  }
  return info;
}
