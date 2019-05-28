import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from 'deck.gl';
import {AmbientLight, DirectionalLight, LightingEffect} from '@deck.gl/core';
import {PhongMaterial} from '@luma.gl/core';

import ShadowPolygonLayer from './shadow-polygon-layer';
import ShadowEffect from './shadow-effect/shadow-effect';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 2.0,
  direction: [10, -20, -30]
});

const lightingEffect = new LightingEffect({ambientLight, dirLight});

const material = new PhongMaterial({
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
});

const shadowEffect = new ShadowEffect({shadowColor: [2, 0, 5, 200]});

const landCover = [[[-74.0, 40.7], [-74.02, 40.7], [-74.02, 40.72], [-74.0, 40.72]]];

export const INITIAL_VIEW_STATE = {
  longitude: -74.01,
  latitude: 40.706,
  zoom: 15.5,
  pitch: 45,
  bearing: 0
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this._deck = null;
  }

  _renderLayers() {
    const {data = DATA_URL} = this.props;

    return [
      new ShadowPolygonLayer({
        id: 'buildings',
        data,
        opacity: 1,
        extruded: true,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: [74, 80, 87],
        material,
        castShadow: true
      }),
      new ShadowPolygonLayer({
        id: 'land',
        data: landCover,
        opacity: 1,
        extruded: false,
        getPolygon: f => f,
        getFillColor: [0, 0, 0, 0]
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        ref={ref => {
          this._deck = ref && ref.deck;
        }}
        layers={this._renderLayers()}
        effects={[lightingEffect, shadowEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
