// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Layer} from '../../../lib';
import HexagonCellLayer from '../hexagon-cell-layer/hexagon-cell-layer';
import {log} from '../../../lib/utils';

import {quantizeScale, linearScale} from '../../../utils/scale-utils';
import {defaultColorRange} from '../../../utils/color-utils';
import {pointToHexbin} from './hexagon-aggregator';

const defaultProps = {
  colorDomain: null,
  colorRange: defaultColorRange,
  elevationDomain: null,
  elevationRange: [0, 1000],
  elevationScale: 1,
  radius: 1000,
  coverage: 1,
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: x => x.position,
  fp64: false
  //
};

function _needsReProjectPoints(oldProps, props) {
  return oldProps.radius !== props.radius;
}

function _getCountRange(hexagons) {
  return [
    Math.min.apply(null, hexagons.map(bin => bin.points.length)),
    Math.max.apply(null, hexagons.map(bin => bin.points.length))
  ];
}

export default class HexagonLayer extends Layer {
  constructor(props) {
    if (!props.radius) {
      log.once(0, 'PointDensityHexagonLayer: radius in meter is needed to aggregate points into ' +
        'hexagonal bins, Now using 1000 meter as default');

      props.radius = defaultProps.radius;
    }

    super(props);
  }

  initializeState() {
    this.state = {
      hexagons: [],
      countRange: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {hexagonAggregator} = this.props;
      const {viewport} = this.context;

      const hexagons = hexagonAggregator(this.props, viewport);
      const countRange = _getCountRange(hexagons);

      Object.assign(this.state, {hexagons, countRange});
    }
  }

  _onPickSubLayer(handler, info) {
    const pickedCell = info.picked && info.index > -1 ?
      this.state.hexagons[info.index] : null;

    Object.assign(info, {
      layer: this,
      picked: Boolean(pickedCell),
      // override object with picked cell
      object: pickedCell
    });

    return this.props[handler](info);
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const colorDomain = this.props.colorDomain || this.state.countRange;

    return quantizeScale(colorDomain, colorRange, cell.points.length);
  }

  _onGetSublayerElevation(cell) {
    const {elevationRange} = this.props;
    const elevationDomain = this.props.elevationDomain || [0, this.state.countRange[1]];
    return linearScale(elevationDomain, elevationRange, cell.points.length);
  }

  renderLayers() {
    const {id, radius, elevationScale, extruded, fp64} = this.props;

    // base layer props
    const {opacity, pickable, visible, projectionMode} = this.props;

    return new HexagonCellLayer({
      id: `${id}-hexagon-cell`,
      data: this.state.hexagons,
      radius,
      elevationScale,
      angle: Math.PI,
      extruded,
      fp64,
      opacity,
      pickable,
      visible,
      projectionMode,
      getColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      // Override user's onHover and onClick props
      onHover: this._onPickSubLayer.bind(this, 'onHover'),
      onClick: this._onPickSubLayer.bind(this, 'onClick'),
      updateTriggers: {
        getColor: {colorRange: this.props.colorRange},
        getElevation: {elevationRange: this.props.elevationRange}
      }
    });
  }
}

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;
