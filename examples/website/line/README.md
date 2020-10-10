This is a minimal standalone version of the LineLayer example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

To see the base map, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.js`.

Other options can be found at [using with Mapbox GL](../../../docs/get-started/using-with-mapbox-gl.md).

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with webpack
npm start
```

### Data format

Sample data is stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/line), showing flight paths near the Heathrow Airport, captured via [the OpenSky Network](https://opensky-network.org/). [Airports data source](http://www.naturalearthdata.com/)

To use your own data, check out
the [documentation of LineLayer](../../../docs/api-reference/layers/line-layer.md).
