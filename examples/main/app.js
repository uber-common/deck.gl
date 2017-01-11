/* global window, document */
import 'babel-polyfill';

import {ReflectionEffect} from 'deck.gl/experimental';
import DeckGL, {autobind} from 'deck.gl/react';

import {Matrix4} from 'luma.gl';

import React from 'react';
import ReactDOM from 'react-dom';
import MapboxGLMap from 'react-map-gl';
import {FPSStats} from 'react-stats';

import LayerInfo from './layer-info';
import LayerSelector from './layer-selector';
import LayerControls from './layer-controls';
import LAYER_CATEGORIES, {DEFAULT_ACTIVE_LAYERS} from './layer-examples';

/* eslint-disable no-process-env */
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || // eslint-disable-line
  'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

// ---- View ---- //
class App extends React.Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {
      mapViewState: {
        latitude: 37.751537058389985,
        longitude: -122.42694203247012,
        zoom: 11.5,
        pitch: 30,
        bearing: 0
      },
      activeExamples: DEFAULT_ACTIVE_LAYERS,
      hoveredItem: null,
      clickedItem: null,
      settings: {
        separation: 0,
        rotationZ: 0,
        rotationX: 0
      }
    };

    this._effects = [new ReflectionEffect()];
  }

  componentWillMount() {
    this._onResize();
    window.addEventListener('resize', this._onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
  }

  _onViewportChanged(mapViewState) {
    if (mapViewState.pitch > 60) {
      mapViewState.pitch = 60;
    }
    this.setState({mapViewState});
  }

  _onItemHovered(info) {
    this.setState({hoveredItem: info});
  }

  _onItemClicked(info) {
    this.setState({clickedItem: info});
  }

  _onToggleLayer(exampleName) {
    const {activeExamples} = this.state;
    activeExamples[exampleName] = !activeExamples[exampleName];
    this.setState({activeExamples});
  }

  _onWebGLInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onSettingsChange(settings) {
    this.setState({settings});
  }

  _renderExampleLayer(example, index) {
    const {layer: Layer, props, getData} = example;

    if (props.pickable) {
      Object.assign(props, {
        onHover: this._onItemHovered,
        onClick: this._onItemClicked
      });
    }

    if (getData) {
      Object.assign(props, getData());
    }

    Object.assign(props, {
      modelMatrix: this._getModelMatrix(index, props.projectionMode === 2)
    });

    return new Layer(props);
  }

  _renderExamples() {
    let index = 1;
    const layers = [];
    for (const categoryName of Object.keys(LAYER_CATEGORIES)) {
      for (const exampleName of Object.keys(LAYER_CATEGORIES[categoryName])) {

        // An example is a function that returns a DeckGL layer instance
        if (this.state.activeExamples[exampleName]) {
          const example = LAYER_CATEGORIES[categoryName][exampleName];
          layers.push(this._renderExampleLayer(example, index++));
        }
      }
    }
    return layers;
  }

  _getModelMatrix(index, offsetMode) {
    const {settings: {separation, rotationZ, rotationX}} = this.state;
    // const {mapViewState: {longitude, latitude}} = this.props;
    // const modelMatrix = new Matrix4().fromTranslation([0, 0, 1000 * index * separation]);
    const modelMatrix = new Matrix4()
      .fromTranslation([0, 0, 1000 * index * separation]);
    if (offsetMode) {
      modelMatrix.rotateZ(index * rotationZ * Math.PI);
      modelMatrix.rotateX(index * rotationX * Math.PI);
    }
    return modelMatrix;
  }

  _renderOverlay() {
    const {width, height, mapViewState} = this.state;

    return (
      <DeckGL
        id="default-deckgl-overlay"
        width={width}
        height={height}
        debug
        {...mapViewState}
        onWebGLInitialized={ this._onWebGLInitialized }
        layers={this._renderExamples()}
        effects={this._effects}
      />
    );
  }

  _renderMap() {
    const {width, height, mapViewState} = this.state;
    return (
      <MapboxGLMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        width={width}
        height={height}
        perspectiveEnabled
        { ...mapViewState }
        onChangeViewport={this._onViewportChanged}>
        { this._renderOverlay() }
        <FPSStats isActive/>
      </MapboxGLMap>
    );
  }

  render() {
    const {settings, hoveredItem, clickedItem} = this.state;

    return (
      <div>
        { this._renderMap() }
        <div id="control-panel">
          <LayerSelector { ...this.state }
            examples={LAYER_CATEGORIES}
            onChange={this._onToggleLayer}/>
          <LayerControls
            settings={settings}
            onSettingsChange={this._onSettingsChange}/>
        </div>
        <LayerInfo hoveredItem={hoveredItem} clickedItem={clickedItem} />
      </div>
    );
  }
}

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(<App />, container);
