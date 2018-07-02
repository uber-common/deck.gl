<!-- INJECT:"ScreenGridLayerDemo" -->

# ScreenGridLayer

The Screen Grid Layer takes in an array of latitude and longitude
coordinated points, aggregates them into histogram bins and
renders as a grid. By default aggregation happens on GPU, aggregation falls back to CPU when browser doesn't support GPU Aggregation or when `gpuAggregation` prop is set to false.

```js
import DeckGL, {ScreenGridLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {SPACES: 4, COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new ScreenGridLayer({
    id: 'screen-grid-layer',
    data,
    pickable: false,
    opacity: 0.8,
    cellSizePixels: 50,
    minColor: [0, 0, 0, 0],
    maxColor: [0, 180, 0, 255],
    getPosition: d => d.COORDINATES,
    getWeight: d => d.SPACES,
    onHover: ({object}) => setTooltip('aggregated cell')
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

**Note:** The aggregation is done in screen space, so the data prop
needs to be reaggregated by the layer whenever the map is zoomed or panned.
This means that this layer is best used with small data set, however the
visuals when used with the right data set can be quite effective.

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSizePixels` (Number, optional)

* Default: `100`

Unit width/height of the bins.

##### `cellMarginPixels` (Number, optional) **NEW in 6.0**

* Default: `2`, gets clamped to [0, 5]

Cell margin size in pixels.

##### `minColor` (Number[4], optional)

* Default: `[0, 0, 0, 255]`

Expressed as an rgba array, minimal color that could be rendered by a tile. This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

##### `maxColor` (Number[4], optional)

* Default: `[0, 255, 0, 255]`

Expressed as an rgba array, maximal color that could be rendered by a tile.  This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

##### `colorDomain` (Array, optional) **EXPERIMENTAL**

* Default: `[1, max(weight)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to [1, max-of-all-cell-weights], You can control how the color of cells mapped
to value of its weight by passing in an arbitrary color domain. This property is extremely handy when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Array, optional) **EXPERIMENTAL**

* Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of colors formatted as `[[255, 255, 255, 255]]`. Default is
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

NOTE: `minColor` and `maxColor` take precedence over `colorDomain` and `colorRange`, to use `colorDomain` and `colorRange` do not provide `minColor` and `maxColor`.

##### `gpuAggregation` (bool, optional) **NEW in 6.0**

* Default: true

When set to true and browser supports GPU aggregation, aggregation is performed on GPU. GPU aggregation can be 10 to 20 times faster depending upon number of points and number of cells.

NOTE: GPU Aggregation requires WebGL2 support by the browser. When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.

### Data Accessors

##### `getPosition` (Function, optional)

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getWeight` (Function, optional)

* Default: `object => 1`

Method called to retrieve the weight of each object.

## Source

[modules/core/src/core-layers/screen-grid-layer](https://github.com/uber/deck.gl/tree/5.2-release/modules/core/src/core-layers/screen-grid-layer)
