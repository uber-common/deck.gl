import {GeoJsonLayerDemo} from 'website-components/doc-demos/layers';

<GeoJsonLayerDemo />

<p class="badges">
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org) formatted data and
renders it as interactive polygons, lines and points.

GeoJsonLayer is a [CompositeLayer](/docs/api-reference/core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';

function App({data, viewState}) {
  /**
   * Data format:
   * Valid GeoJSON object
   */
  const layer = new GeoJsonLayer({
    id: 'geojson-layer',
    data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: [160, 160, 180, 200],
    getLineColor: d => colorToRGBArray(d.properties.color),
    getRadius: 100,
    getLineWidth: 1,
    getElevation: 30
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && (object.properties.name || object.properties.station)} />;
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
import {GeoJsonLayer} from '@deck.gl/layers';
new GeoJsonLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.GeoJsonLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/core/layer.md) and [CompositeLayer](/docs/api-reference/core/composite-layer.md) properties.

##### `data`

The `GeoJSONLayer` accepts any of the following formats passed to the `data` prop:

* A valid GeoJSON `FeatureCollection`, `Feature`, `Geometry` or `GeometryCollection` object.
* An array of GeoJSON `Feature` objects.

### Render Options

Inherits from all [Base Layer properties](/docs/api-reference/core/layer.md),
however, the `data` prop is interpreted slightly more flexibly to accommodate
pure GeoJson "payloads".

##### `filled` (Boolean, optional)

* Default: `true`

Whether to draw filled polygons (solid fill). Note that for each polygon,
only the area between the outer polygon and any holes will be filled. This
prop is effective only when the polygon is NOT extruded.

##### `stroked` (Boolean, optional)

* Default: `true`

Whether to draw an outline around polygons (solid fill). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.

##### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features along the z-axis if set to
true. The height of the drawn features is obtained using the `getElevation` accessor.

* Default: `false`

##### `wireframe` (Boolean, optional)

* Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Remarks:

* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.
* This is only effective if the `extruded` prop is set to true.

##### `lineWidthUnits` (String, optional)

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `lineWidthScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The line width multiplier that multiplied to all lines, including the `LineString`
and `MultiLineString` features and also the outline for `Polygon` and `MultiPolygon`
features if the `stroked` attribute is true.

##### `lineWidthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum line width in pixels.

##### `lineWidthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels.

##### `lineCapRounded` (Boolean, optional)

* Default: `false`

Type of line caps. If `true`, draw round caps. Otherwise draw square caps.

##### `lineJointRounded` (Boolean, optional)

* Default: `false`

Type of line joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `lineMiterLimit` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all polygon elevation without updating the data.

##### `pointRadiusUnits` (String, optional)

* Default: `'meters'`

The units of the point radius, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `pointRadiusScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

A global radius multiplier for all points.

##### `pointRadiusMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum radius in pixels.

##### `pointRadiusMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels.

##### `material` (Object, optional)

* Default: `true`

This is an object that contains material props for [lighting effect](/docs/api-reference/core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](/docs/developer-guide/using-lighting.md#constructing-a-material-instance) for configurable settings.

### Data Accessors

##### `getLineColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the line color for all features.
* If a function is provided, it is called on each feature to retrieve its line color.

##### `getFillColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The solid color of the polygon and point features of a GeoJson.
Format is `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.


* If an array is provided, it is used as the fill color for all features.
* If a function is provided, it is called on each feature to retrieve its fill color.

Note: This accessor is only called for `Polygon` and `MultiPolygon` and `Point` features.

##### `getRadius` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The radius of `Point` and `MultiPoint` feature. In units specified by `pointRadiusUnits` (default meters).

* If a number is provided, it is used as the radius for all point features.
* If a function is provided, it is called on each point feature to retrieve its radius.

##### `getLineWidth` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The width of line string and/or the outline of polygon for a GeoJson feature, depending on its type. In units specified by `lineWidthUnits` (default meters).

* If a number is provided, it is used as the line width for all features.
* If a function is provided, it is called on each feature to retrieve its line width.

Note: This accessor is called for `LineString` and `MultiLineString`
features. It is called for `Polygon` and `MultiPolygon` features if the
`stroked` attribute is true.

##### `getElevation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

* If a number is provided, it is used as the elevation for all polygon features.
* If a function is provided, it is called on each polygon feature to retrieve its elevation.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.


## Sub Layers

The GeoJsonLayer renders the following sublayers:

* `polygons-fill` - a [SolidPolygonLayer](/docs/api-reference/layers/solid-polygon-layer.md) rendering all the `Polygon` and `MultiPolygon` features.
* `polygons-stroke` - a [PathLayer](/docs/api-reference/layers/path-layer.md) rendering the outline of all the `Polygon` and `MultiPolygon` features. Only rendered if `stroked: true` and `extruded: false`.
* `linestrings` - a [PathLayer](/docs/api-reference/layers/path-layer.md) rendering all the `LineString` and `MultiLineString` features.
* `points` - a [ScatterplotLayer](/docs/api-reference/layers/scatterplot-layer.md) rendering all the `Point` and `MultiPoint` features.


## Remarks

* Geometry transition can be enabled with `props.transitions: {geometry: <transition_settings>}`.
* By supplying a GeoJson `FeatureCollection` you can render multiple polygons,
  lines and points.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.

## Source

[modules/layers/src/geojson-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/geojson-layer)
