/* global window,document */
/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {MapView, HexagonLayer} from 'deck.gl';
import {csv as requestCsv} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -1.4157267858730052,
  latitude: 52.232395363869415,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27.396674584323023
};

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const elevationScale = {min: 1, max: 50};

const defaultProps = {
  radius: 1000,
  upperPercentile: 100,
  coverage: 1
};

class App extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE,
      data: null,
      elevationScale: elevationScale.min
    };

    if (!window.demoLauncherActive) {
      requestCsv(DATA_URL, (error, response) => {
        if (!error) {
          const data = response.map(d => [Number(d.lng), Number(d.lat)]);
          this.setState({data});
        }
      });
    }

    this.startAnimationTimer = null;
    this.intervalTimer = null;

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._animate();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  render() {
    const {
      data = this.state.data,

      radius = 1000,
      coverage = 1,
      upperPercentile = 100,

      onViewStateChange = (({viewState}) => this.setState({viewState})),
      viewState = this.state.viewState,

      mapboxApiAccessToken = MAPBOX_TOKEN,
      mapStyle = "mapbox://styles/mapbox/dark-v9"
    } = this.props;

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 3000],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
      })
    ];

    return (
      <MapGL
        {...viewState}
        reuseMap
        onViewportChange={viewport => onViewStateChange({viewState: viewport})}
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapStyle={mapStyle}
        preventStyleDiffing={true}
      >

        <DeckGL
          layers={layers}
          views={new MapView({id: 'map'})}
          viewState={viewState}
          />;

      </MapGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
