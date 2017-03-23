```
import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {scaleQuantile} from 'd3-scale';

const inFlowColors = [[255, 255, 204], [199, 233, 180], [127, 205, 187], [65, 182, 196], [29, 145, 192], [34, 94, 168], [12, 44, 132]];

const outFlowColors = [[255,255,178], [254,217,118], [254,178,76], [253,141,60], [252,78,42], [227,26,28], [177,0,38]];

const colorRamp = inFlowColors.slice().reverse().concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class ArcDemo extends Component {
  constructor(props) {
    super(props);
    this.state = this._updateFlows(props);
  }

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    if (data && data !== this.props.data) {
      this.setState(this._updateFlows(nextProps));
    }
  }

  _updateFlows(props, selectedFeature) {
    const {data} = props;

    if (!data || !data.length) {
      return {};
    }
    const {features} = data[0];
    selectedFeature = selectedFeature || features[362];

    const {flows, centroid, name} = selectedFeature.properties;
    const arcs = [];

    for (let toId in flows) {
      const f = features[toId];
      arcs.push({
        source: centroid,
        target: f.properties.centroid,
        value: flows[toId]
      });
    }

    const scale = scaleQuantile()
      .domain(arcs.map(a => Math.abs(a.value)))
      .range(inFlowColors.map((c, i) => i));
    arcs.forEach(a => {
      a.gain = Math.sign(a.value);
      a.quantile = scale(Math.abs(a.value));
    });

    this.props.onStateChange({sourceName: name});

    return {arcs, scale, selectedFeature};
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onClickFeature({object}) {
    if (this.state.selectedFeature !== object) {
      this.setState(this._updateFlows(this.props, object));
    }
  }

  render() {
    const {viewport, params, data} = this.props;
    const {arcs} = this.state;

    if (!data) {
      return null;
    }

    const layers = [
      new GeoJsonLayer({
        id: 'choropleth',
        data: data[0],
        stroked: false,
        filled: true,
        getFillColor: () => [0, 0, 0, 0],
        onClick: this._onClickFeature.bind(this),
        pickable: true
      }),
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
        getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
        strokeWidth: params.lineWidth.value
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}

```
