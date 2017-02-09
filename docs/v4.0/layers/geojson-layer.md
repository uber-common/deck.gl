# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive polygons, lines and points.

    import {GeoJsonLayer} from 'deck.gl';

## Base-Layer Properties

Inherits from all [Base Layer properties](/docs/layers/base-layer.md):

#### `data`

* By supplying a GeoJson `FeatureCollection` you can render multiple polygons
  and lines.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.

    data: {
      "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [102.0, 0.5]
            },
            "properties": {
              "color": [255, 0, 0, 255],
              "prop1": {"application": "defined"}
            }
          },
          ...
        ]
      }
    }

#### `onHover` (Function, optional)

Provides selected feature (and properties) along with mouse event when a
GeoJson feature is hovered.

#### `onClick` (Function, optional)

Provides selected feature (and properties) along with mouse event when a
GeoJson feature is clicked.


## Layer-specific Accessors

### `getPointColor`
### `getPointSize`

### `getStrokeColor`
### `getStrokeWidth`

### `getFillColor`
### `getHElevation`

#### `getColor` (Function, optional)

The fill color for the polygon

#### `getElevation` (Function, optional)

- Default: `object => object.elevation`

Method called to retrieve the elevation of each object's polygon.

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

## Layer-specific Properties


#### `drawPoints` (Boolean, optional)

Draw Point features if true.


#### `drawLines` (Boolean, optional)

Draw LineString and MultiLineString features if true.


#### `drawPolygons` (Boolean, optional)

Draw outlines of Polygon and MultiPolygon features if true.


#### `fillPolygons` (Boolean, optional)

Fill areas of Polygon and MultiPolygon features if true.


#### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features in 3D if true.


#### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.
