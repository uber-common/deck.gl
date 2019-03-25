<!-- INJECT:"PolygonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# H3ClusterLayer

The `H3ClusterLayer` renders regions represented by hexagon sets from the [H3](https://uber.github.io/h3/) geospatial indexing system.

`H3ClusterLayer` is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {H3ClusterLayer} from '@deck.gl/geo-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     name: 'Downtown',
   *     hexagonIds: [
   *       '882830829bfffff',
   *       '8828308299fffff',
   *       '8828308291fffff',
   *       '8828308293fffff',
   *       '882830874dfffff',
   *       '88283095a7fffff',
   *       '88283095a5fffff'
         ],
   *     population: 4780
   *   },
   *   ...
   * ]
   */
  const layer = new H3ClusterLayer({
    id: 'h3-cluster-layer',
    data,
    stroked: true,
    filled: true,
    extruded: false,
    pickable: true,
    getHexagons: d => d.hexagonIds,
    getLineWidth: 30,
    getLineColor: [0, 0, 0],
    getFillColor: d => [d.population / 10000 * 255, 255, 0],
    onHover: ({object, x, y}) => {
      const tooltip = `${object.name}\nPopulation: ${object.population}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {H3ClusterLayer} from '@deck.gl/geo-layers';
new H3ClusterLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.H3ClusterLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md), [CompositeLayer](/docs/api-reference/composite-layer.md), and [PolygonLayer](/docs/layers/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getHexagons` (Function, optional)

Method called to retrieve the hexagon cluster from each object, as an array of [H3](https://uber.github.io/h3/) hexagon indices. These hexagons are joined into polygons that represent the geospatial outline of the cluster.


## Sub Layers

The `H3ClusterLayer` renders the following sublayers:

* `cluster-region` - a [PolygonLayer](/docs/layers/column-layer.md) rendering all clusters.


## Source

[modules/geo-layers/src/h3-layers/h3-cluster-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-cluster-layer.js)

