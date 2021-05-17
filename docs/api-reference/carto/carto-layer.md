

# CartoLayer

`CartoLayer` is the layer to visualize data using the CARTO Maps API. You can apply custom SQL with moderately sized datasets (< 50 MB) and visualize really large datasets (up to billions of features) using pre-generated tilesets.

```js
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials} from '@deck.gl/carto';

setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public'
});

function App({viewState}) {
  const layer = new CartoLayer({
    type: MAP_TYPES.SQL,
    data: 'SELECT * FROM world_population_2015',
    pointRadiusMinPixels: 2,
    getLineColor: [0, 0, 0, 0.75],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  })

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {CartoLayer} from '@deck.gl/carto';
new CartoLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.5.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.5.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.5.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.5.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.5.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.5.0/dist.min.js"></script>
```

```js
new deck.carto.CartoLayer({});
```


## Properties

This layer allows to work with the different CARTO Maps API versions (v1, v2 and v3). When using version v1 and v2, the layer always works with vector tiles so it inherits all properties from [`MVTLayer`](/docs/api-reference/geo-layers/mvt-layer.md). When using v3, the layer works with vector tiles if the `type` property is `MAP_TYPES.TILESET` and with GeoJSON data if the `type` is `MAP_TYPES.SQL` or `MAP_TYPES.TABLE`. In the latter case, the layer inherits all properties from [`GeoJsonLayer`](/docs/api-reference/layers/geojson-layer.md).

##### `data` (String)

Required. Either a SQL query or a name of dataset/tileset.

##### `type` (String)

Required. Data type. Possible values are:

- `MAP_TYPES.SQL`, if `data` is a SQL query. For API v2, it is possible to indicate the dataset name in the `data` parameter.
- `MAP_TYPES.TABLE`, if `data` is a dataset name. Only compatible with API v3.
- `MAP_TYPES.TILESET`, if `data` is a tileset name. Not compatible with API v1.

##### `provider` (String)

Required when `apiVersion` is `API_VERSIONS.V3`. Provider where the data is stored. Possible values are:

- `PROVIDERS.BIGQUERY`
- `PROVIDERS.POSTGRES`
- `PROVIDERS.REDSHIFT`
- `PROVIDERS.SNOWFLAKE`

##### `connection` (String)

Required when apiVersion is `API_VERSIONS.V3`. Name of the connection in the CARTO workspace.

##### `SubLayer` (String)

Optional. Layer to use for rendering. 

Default: 

- `MVTLayer` when `type` is `MAP_TYPES.TILESET`. Not all the deck.gl layers are compatible with vector tiles.
- `GeoJsonLayer` when type is `MAP_TYPES.SQL` or `MAP_TYPES.TABLE`

##### `format` (String)

Optional when `apiVersion` is `API_VERSIONS.V3`, ignored for `API_VERSIONS.V1` and `API_VERSIONS.V2`. Data format for features. Possible values are:

- `FORMATS.GEOJSON`
- `FORMATS.TILEJSON`
 
Default: 

- `FORMATS.TILEJSON` when `apiVersion` is `API_VERSIONS.V1` or `API_VERSIONS.V2` or when `apiVersion` is `API_VERSIONS.V3` and `type` is `MAP_TYPES.TILESET`
- `FORMATS.GEOJSON` when `apiVersion` is `API_VERSIONS.V3` and `type` is `MAP_TYPES.SQL` or `MAP_TYPES.TABLE`. If the output size from the Maps API is > 50 MB, an error will be thrown. In that case, you need to pre-generate a tileset if you want to visualize this dataset.

##### `uniqueIdProperty` (String)

* Default: `cartodb_id`

Optional. A string pointing to a unique attribute at the result of the query. A unique attribute is needed for highlighting with vector tiles when a feature is split across two or more tiles.

##### `credentials` (Object)

Optional. Object with the configuration to connect with CARTO.

* Default:

```js
{
  apiVersion: API_VERSIONS.V2,
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  tenant: 'gcp-us-east1.app.carto.com',
  sqlUrl: `https://{user}.carto.com/api/v2/sql`
}
```

### Callbacks

#### `onDataLoad` (Function, optional)

`onDataLoad` is called when the request to the CARTO tiler was completed successfully.

* Default: `tilejson => {}`

Receives arguments:

* `tilejson` (Object) - the response from the tiler service

##### `onDataError` (Function, optional)

`onDataError` is called when the request to the CARTO tiler failed. By default the Error is thrown.

* Default: `null`

Receives arguments:

* `error` (`Error`)

## Source

[modules/carto/src/layers/carto-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-layer.js)
