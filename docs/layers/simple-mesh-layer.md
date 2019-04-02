
<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/mesh--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/mesh-layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# SimpleMeshLayer

The `SimpleMeshLayer` renders a number of arbitrary geometries. For example, a fleet of 3d cars each with a position and an orientation over the map.

```js
import DeckGL from '@deck.gl/react';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry} from 'luma.gl'

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     position: [-122.45, 37.7],
   *     angle: 0,
   *     color: [255, 0, 0]
   *   },
   *   {
   *     position: [-122.46, 37.73],
   *     angle: 90,
   *     color: [0, 255, 0]
   *   },
   *   ...
   * ]
   */
  const layer = new SimpleMeshLayer({
    id: 'mesh-layer',
    data,
    texture: 'texture.png',
    mesh: new CubeGeometry()
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/mesh-layers
```

```js
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
new SimpleMeshLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/mesh-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.SimpleMeshLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Mesh

##### `mesh` (Geometry|Object|Promise)

The geometry to render for each data object.
Can be a luma.gl [Geometry](http://uber.github.io/luma.gl/#/documentation/api-reference/geometry) instance, or an object of attributes, or a `Promise` that resolves to one of the above.

The following attributes are expected:

- `positions` (Float32Array) - 3d vertex offset from the object center, in meters
- `normals` (Float32Array) - 3d nomals
- `texCoords` (Float32Array) - 2d texture coordinates


##### `texture` (Texture2D|Image|String, optional)

- Default `null`.

The texture of the geometries.
Can be either a luma.gl [Texture2D](http://uber.github.io/luma.gl/#/documentation/api-reference/texture-2) instance, an HTMLImageElement, or a url string to the texture image.

If `texture` is supplied, texture is used to render the geometries. Otherwise, object color obtained via the `getColor` accessor is used.


### Render Options

##### `sizeScale` (Number, optional)

- Default `1`.

Multiplier to scale each geometry by.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors


##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `object => object.position`

Method called to retrieve the center position for each object in the `data` stream.


##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `[0, 0, 0, 255]`

The color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range. Only used if `texture` is empty.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getOrientation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `[0, 0, 0]`

Object orientation defined as a vec3 of Euler angles, `[pitch, yaw, roll]` in degrees.

* If an array is provided, it is used as the orientation for all objects.
* If a function is provided, it is called on each object to retrieve its orientation.

##### `getScale` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `[1, 1, 1]`

Scaling factor on the mesh along each axis.

* If an array is provided, it is used as the scale for all objects.
* If a function is provided, it is called on each object to retrieve its scale.

##### `getTranslation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `[0, 0, 0]`

Translation of the mesh along each axis. Offset from the center position given by `getPosition`. `[x, y, z]` in meters.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

##### `getTransformMatrix` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `null`

Explicitly define a 4x4 column-major model matrix for the mesh. If provided, will override
`getOrientation`, `getScale`, `getTranslation`.

* If an array is provided, it is used as the transform matrix for all objects.
* If a function is provided, it is called on each object to retrieve its transform matrix.

## Source

[modules/mesh-layers/src/simple-mesh-layer](https://github.com/uber/deck.gl/tree/master/modules/mesh-layers/src/simple-mesh-layer)
