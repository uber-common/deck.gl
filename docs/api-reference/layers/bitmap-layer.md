import {BitmapLayerDemo} from 'website-components/doc-demos/layers';

<BitmapLayerDemo />

# BitmapLayer

The BitmapLayer renders a bitmap at specified boundaries.

```js
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';

function App({data, viewState}) {
  const layer = new BitmapLayer({
    id: 'bitmap-layer',
    bounds: [-122.5190, 37.7045, -122.355, 37.829],
    image: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png'
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {BitmapLayer} from '@deck.gl/layers';
new BitmapLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.BitmapLayer({});
```


## Properties

### Data

##### `image` (String|Texture2D|Image|HTMLCanvasElement|HTMLVideoElement|ImageBitmap)

- Default `null`.

The image to display. If a string is supplied, it is interpreted as a URL or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).

##### `bounds` (Array)

Supported formats:

- Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
- Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`. Each position could optionally contain a third component `z`.

`left` and `right` refers to the world longitude/x at the corresponding side of the image.
`top` and `bottom` refers to the world latitude/y at the corresponding side of the image.

##### `textureParameters` (Object)

Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter).

If not specified, the layer uses the following defaults to create a linearly smoothed texture from `image`:

```js
{
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
}
```

For example, to remove smoothing and achieve a pixelated appearance:

```js
import GL from '@luma.gl/constants';

new BitmapLayer({
  ...
  textureParameters: {
    [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
    [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
  }
})
```

This prop is only used when `image` initially loads or changes.

### Render Options

##### `desaturate` (Number) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `0`

The desaturation of the bitmap. Between `[0, 1]`. `0` being the original color and `1` being grayscale.

##### `transparentColor` (Array) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `[0, 0, 0, 0]`

The color to use for transparent pixels, in `[r, g, b, a]`. Each component is in the `[0, 255]` range.

##### `tintColor` (Array) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `[255, 255, 255]`

The color to tint the bitmap by, in `[r, g, b]`. Each component is in the `[0, 255]` range.


## Source

[modules/layers/src/bitmap-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/bitmap-layer)
