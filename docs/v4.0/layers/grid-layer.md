# GridLayer

The GridLayer can render a grid-based heatmap.
It takes the constant width / height of all cells and top-left coordinate of
each cell. The grid cells can be given a height using the getHeight accessor.


<div align="center">
  <img height="300" src="/demo/src/static/images/grid-layer.png" />
</div>

    import {GridLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer Accessors

##### `getPosition` (Function, optional)

- Default: `cell => cell.position`

Method called to retrieve the top left corner of each cell.
Expecting [lon, lat].

##### `getElevation` (Function, optional)

- Default: `cell => cell.elevation`

Method called to retrieve the elevation of each cell.
Expecting a number, 1 unit approximate to 100 meter

##### `getColor` (Function, optional)

- Default: `cell => cell.color`

Method called to retrieve the rgba color of each cell. Expecting [r, g, b, a].
If the alpha is not provided, it will be set to `255`.


## Layer-specific Properties

##### `latOffset` (Number, optional)

- Default: `0.0089`

Latitude increment of each cell

##### `lonOffset` (Number, optional)

- Default: `0.0113`

Longitude increment of each cell

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to enable grid elevation. If se to false, all grid will be flat.

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.
