
<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# ColumnLayer

> This is the primitive layer rendered by [HexagonLayer](/docs/layers/hexagon-layer.md) after aggregation. Unlike the HexagonLayer, it renders one column for each data object.

The ColumnLayer can be used to render a heatmap of vertical cylinders. It renders a tesselated regular polygon centered at each given position (a "disk"), and extrude it in 3d.

```js
import DeckGL, {ColumnLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7], color: [255, 0, 0], elevation: 100},
   *   ...
   * ]
   */
  const layer = new ColumnLayer({
    id: 'column-layer',
    data,
    diskResolution: 12,
    radius: 500,
    angle: 0,
    extruded: true,
    getPosition: d => d.position,
    getColor: d => d.color,
    getElevation: d => d.elevation
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `diskResolution` (Number, optional)

* Default: `20`

The number of sides to render the disk as. The disk is a regular polygon that fits inside the given radius. A higher resolution will yield a smoother look close-up, but also need more resources to render.

##### `radius` (Number, optional)

* Default: `1000`

Disk radius in meters.

##### `angle` (Number, optional)

* Default: `0`

Disk rotation, counter-clockwise in degrees.

##### `offsest` ([Number, Number], optional)

* Default: `[0, 0]`

Disk offset from the position, relative to the radius. By default, the disk is centered at each position.

##### `coverage` (Number, optional)

* Default: `1`

Radius multiplier, between 0 - 1. The radius of the disk is calculated by
`coverage * radius`

##### `elevationScale` (Number, optional)

* Default: `1`

Column elevation multiplier. The elevation of column is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all hexagon elevations without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to extrude hexagon. If se to false, all hexagons will be set to flat.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.

### Data Accessors

##### `getPosition` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.position`

Method called to retrieve the position of each column, in `[x, y]`. An optional third component can be used to set the elevation of the bottom.

##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


## Source

[modules/layers/src/column-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/column-layer)

