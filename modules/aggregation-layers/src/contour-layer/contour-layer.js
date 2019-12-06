// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

import {equals} from 'math.gl';
import {LineLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {generateContours} from './contour-utils';
import {log} from '@deck.gl/core';

import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION} from '../utils/aggregation-operation-utils';
import GridAggregationLayer from '../grid-aggregation-layer';

const DEFAULT_COLOR = [255, 255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: x => 1},
  gpuAggregation: true,
  aggregation: 'SUM',

  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD}],

  zOffset: 0.005
};

// props , when changed requires re-aggregation
const AGGREGATION_PROPS = ['aggregation', 'getWeight'];

export default class ContourLayer extends GridAggregationLayer {
  initializeState() {
    super.initializeState({aggregationProps: AGGREGATION_PROPS});
    this.setState({
      contourData: {},
      weights: {
        count: {
          size: 1,
          operation: AGGREGATION_OPERATION.SUM
        }
      }
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition'},
      // this attribute is used in gpu aggregation path only
      count: {size: 3, accessor: 'getWeight'}
    });
  }

  updateState(opts) {
    super.updateState(opts);
    let contoursChanged = false;
    const {oldProps, props} = opts;
    const {aggregationDirty} = this.state;

    if (oldProps.contours !== props.contours || oldProps.zOffset !== props.zOffset) {
      contoursChanged = true;
      this._updateThresholdData(opts.props);
    }

    if (this.getNumInstances() > 0 && (aggregationDirty || contoursChanged)) {
      this._generateContours();
    }
  }

  renderLayers() {
    const {contourSegments, contourPolygons} = this.state.contourData;

    const LinesSubLayerClass = this.getSubLayerClass('lines', LineLayer);
    const BandsSubLayerClass = this.getSubLayerClass('bands', SolidPolygonLayer);

    // Contour lines layer
    const lineLayer =
      contourSegments &&
      contourSegments.length > 0 &&
      new LinesSubLayerClass(
        {
          widthUnits: 'pixels'
        },
        this.getSubLayerProps({
          id: 'contour-line-layer'
        }),
        {
          data: this.state.contourData.contourSegments,
          getSourcePosition: d => d.start,
          getTargetPosition: d => d.end,
          getColor: this._onGetSublayerColor.bind(this),
          getWidth: this._onGetSublayerStrokeWidth.bind(this)
        }
      );

    // Contour bands layer
    const bandsLayer =
      contourPolygons &&
      contourPolygons.length > 0 &&
      new BandsSubLayerClass(
        this.getSubLayerProps({
          id: 'contour-solid-polygon-layer'
        }),
        {
          data: this.state.contourData.contourPolygons,
          getPolygon: d => d.vertices,
          getFillColor: this._onGetSublayerColor.bind(this)
        }
      );

    return [lineLayer, bandsLayer];
  }

  // Aggregation Overrides

  updateAggregationFlags({props, oldProps}) {
    const cellSizeChanged = oldProps.cellSize !== props.cellSize;
    let gpuAggregation = props.gpuAggregation;
    if (this.state.gpuAggregation !== props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.gl)) {
        log.warn('GPU Grid Aggregation not supported, falling back to CPU')();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    // Consider switching between CPU and GPU aggregation as data changed as it requires
    // re aggregation.
    const dataChanged = this.state.dataChanged || gpuAggregationChanged;
    this.setState({
      dataChanged,
      cellSizeChanged,
      cellSize: props.cellSize,
      needsReProjection: dataChanged || cellSizeChanged,
      gpuAggregation
    });
  }

  // Private (Contours)

  _generateContours() {
    const {numCol, numRow, boundingBox, gridOffset, thresholdData} = this.state;
    const {count} = this.state.weights;
    let {aggregationData} = count;
    if (!aggregationData) {
      aggregationData = count.aggregationBuffer.getData();
      count.aggregationData = aggregationData;
    }

    const {cellWeights} = GPUGridAggregator.getCellData({countsData: aggregationData});
    const contourData = generateContours({
      thresholdData,
      cellWeights,
      gridSize: [numCol, numRow],
      gridOrigin: [boundingBox.xMin, boundingBox.yMin],
      cellSize: [gridOffset.xOffset, gridOffset.yOffset]
    });

    // contourData contains both iso-lines and iso-bands if requested.
    this.setState({contourData});
  }

  _updateThresholdData(props) {
    const {contours, zOffset} = props;
    const count = contours.length;
    const thresholdData = new Array(count);
    for (let i = 0; i < count; i++) {
      const {threshold, zIndex} = contours[i];
      thresholdData[i] = {
        threshold,
        zIndex: zIndex || i,
        zOffset
      };
    }
    this.setState({thresholdData});
  }

  // Private (Sublayers)

  _onGetSublayerColor(element) {
    // element is either a line segment or polygon
    const {contours} = this.props;
    let color = DEFAULT_COLOR;
    contours.forEach(data => {
      if (equals(data.threshold, element.threshold)) {
        color = data.color || DEFAULT_COLOR;
      }
    });
    return color;
  }

  _onGetSublayerStrokeWidth(segment) {
    const {contours} = this.props;
    let strokeWidth = DEFAULT_STROKE_WIDTH;
    // Linearly searches the contours, but there should only be few contours
    contours.some(contour => {
      if (contour.threshold === segment.threshold) {
        strokeWidth = contour.strokeWidth || DEFAULT_STROKE_WIDTH;
        return true;
      }
      return false;
    });
    return strokeWidth;
  }

  _shouldRebuildContours({oldProps, props}) {
    if (
      !oldProps.contours ||
      !oldProps.zOffset ||
      oldProps.contours.length !== props.contours.length ||
      oldProps.zOffset !== props.zOffset
    ) {
      return true;
    }
    const oldThresholds = oldProps.contours.map(x => x.threshold);
    const thresholds = props.contours.map(x => x.threshold);

    return thresholds.some((_, i) => !equals(thresholds[i], oldThresholds[i]));
  }
}

ContourLayer.layerName = 'ContourLayer';
ContourLayer.defaultProps = defaultProps;
