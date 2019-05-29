<!-- INJECT:"GPUGridLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# GPUGridLayer

The GPUGridLayer renders a grid heatmap based on an array of points.
It takes the constant cell size, aggregates input points in world space (lng/lat space).The color
and height of the cell is a linear function of number of points it contains.

GPUGridLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {GPUGridLayer} from '@deck.gl/aggregation-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new GPUGridLayer({
    id: 'gpu-grid-layer',
    gpuAggregation: true,
    data,
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.position.join(', ')}\nCount: ${object.count}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

**Note:** The `GPUGridLayer` at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.

**Note:** This layer is similar to [CPUGridLayer](/docs/layers/cpu-grid-layer.md) but supports aggregation on GPU when possible. Check below for more detailed differences of this layer compared to `CPUGridLayer`.


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {GPUGridLayer} from '@deck.gl/aggregation-layers';
new GPUGridLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck._GPUGridLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

##### `cellSize` (Number, optional)

* Default: `1000`

Size of each cell in meters

##### `colorRange` (Array, optional)

* Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used. By default `colorRange` is set to
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `coverage` (Number, optional)

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The final size of cell
is calculated by `coverage * cellSize`. Note: coverage does not affect how points
are binned. Coverage are linear based.

##### `elevationDomain` (Array, optional)

* Default: `[0, max(count)]`

Elevation scale input domain, default is set to the extent of point counts in each cell.

##### `elevationRange` (Array, optional)

* Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional)

* Default: `1`

Cell elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`.
`elevationScale` is a handy property to scale all cells without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cell will be flat.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `gpuAggregation` (bool, optional)

* Default: true

When set to true and browser supports GPU aggregation, aggregation is performed on GPU. GPU aggregation can be 2 to 3 times faster depending upon number of points and number of cells.

**Note:** GPU Aggregation requires WebGL2. When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.

**Note:** GPU Aggregation is faster only when using large data sets (point count is more than 500K), for smaller data sets GPU Aggregation could be potentially slower than CPU Aggregation.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.

##### `getColorWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `point => 1`

`getColorWeight` is the accessor function to get the weight of a point used to calcuate the color value for a cell.
It takes the data prop array element and returns the weight, for example, to use `SPACE` field, `getColorWeight` should be set to `point => point.SPACES`.
By default `getColorWeight` returns `1`.

Note: similar to `getColorValue`, grid layer compares whether `getColorWeight` has changed to recalculate the value for each bin that its color based on.


##### `colorAggregation` (String, optional)

* Default: 'SUM'

`colorAggregation` defines, operation used to aggregate all data point weights to calculate a cell's color value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

Note: `getColorWeight` and `colorAggregation` together define how color value of cell is determined, same can be done by setting `getColorValue` prop. But to enable gpu aggregation, former props must be provided instead of later.


##### `getElevationWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `point => 1`

`getElevationWeight` is the accessor function to get the weight of a point used to calcuate the elevation value for a cell.
It takes the data prop array element and returns the weight, for example, to use `SPACE` field, `getElevationWeight` should be set to `point => point.SPACES`.
By default `getElevationWeight` returns `1`.

Note: similar to `getElevationValue`, grid layer compares whether `getElevationWeight` has changed to recalculate the value for each bin that its color based on.


##### `elevationAggregation` (String, optional)

* Default: 'SUM'

`elevationAggregation` defines, operation used to aggregate all data point weights to calculate a cell's elevation value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

Note: `getElevationWeight` and `elevationAggregation` together define how elevation value of cell is determined, same can be done by setting `getColorValue` prop. But to enable gpu aggregation, former props must be provided instead of later.


## Differences compared to CPUGridLayer

### Unsupported props

Due to the nature of GPU Aggregation implementation following CPUGridLayer props are not supported by this layer.

`upperPercentile` `lowerPercentile` `elevationUpperPercentile`, `elevationLowerPercentile`, `getColorValue`, `getElevationValue`, `onSetColorDomain` and `onSetElevationDomain`

Instead of `getColorValue`, `getColorWeight` and `colorAggregation` should be used. Instead of `getElevationValue`, `getElevationWeight` and `elevationAggregation` should be used. There is no alternate for all other unsupported props, if they are needed `CPUGridLayer` should be used instead of this layer.

### Picking

When picking mode is `hover`, only the elevation value, color value of selected cell are included in picking result. Array of all points that aggregated into that cell is not provided. For all other modes, picking results match with `CPUGridLayer`, for these cases data is aggregated on CPU to provide array of all points that aggregated to the cell.


## Source

[modules/aggregation-layers/src/gpu-grid-layer](https://github.com/uber/deck.gl/tree/master/modules/aggregation-layers/src/gpu-grid-layer)
