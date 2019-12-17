// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import AggregationLayer from './aggregation-layer';
import GPUGridAggregator from './utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION, getValueFunc} from './utils/aggregation-operation-utils';
import {Buffer} from '@luma.gl/core';
import {log, COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {getBoundingBox, alignToCell} from './utils/grid-aggregation-utils';
import BinSorter from './utils/bin-sorter';
import {pointToDensityGridDataCPU, getGridOffset} from './cpu-grid-layer/grid-aggregator';

export default class GridAggregationLayer extends AggregationLayer {
  initializeState({aggregationProps, getCellSize}) {
    const {gl} = this.context;
    super.initializeState(aggregationProps);
    this.setState({
      // CPU aggregation results
      layerData: {},
      gpuGridAggregator: new GPUGridAggregator(gl, {id: `${this.id}-gpu-aggregator`}),
      cpuGridAggregator: pointToDensityGridDataCPU
    });
  }

  updateState(opts) {
    // get current attributes
    super.updateState(opts);

    this.updateAggregationFlags(opts);
    // update bounding box and cellSize
    this._updateProjectionParams(opts);

    let aggregationDirty = false;
    const {needsReProjection, gpuAggregation} = this.state;
    const needsReAggregation = this.isAggregationDirty(opts);
    if (this.getNumInstances() <= 0) {
      return;
    }
    // CPU aggregation is two steps
    // 1. Create bins (based on cellSize and position) 2. Aggregate weights for each bin
    // For GPU aggregation both above steps are combined into one step

    // step-1
    if (needsReProjection || (gpuAggregation && needsReAggregation)) {
      this._updateAccessors(opts);
      this._resetResults();
      this._updateAggregation(opts);
      aggregationDirty = true;
    }
    // step-2 (Applicalbe for CPU aggregation only)
    if (!gpuAggregation && (aggregationDirty || needsReAggregation)) {
      this._resetResults();
      this._updateWeightBins();
      this._uploadAggregationResults();
      aggregationDirty = true;
    }

    this.setState({aggregationDirty});
  }

  finalizeState() {
    const {count} = this.state.weights;
    if (count && count.aggregationBuffer) {
      count.aggregationBuffer.delete();
    }
    const {gpuGridAggregator} = this.state;
    if (gpuGridAggregator) {
      gpuGridAggregator.delete();
    }
    super.finalizeState();
  }

  // Must be implemented by subclasses
  updateAggregationFlags(opts) {
    // Sublayers should implement this method.
    log.assert(false);
  }

  // Methods that can be overriden by subclasses for customizations

  allocateResources(numRow, numCol) {
    if (this.state.numRow !== numRow || this.state.numCol !== numCol) {
      const {count} = this.state.weights;
      const dataBytes = numCol * numRow * 4 * 4;
      if (count.aggregationBuffer) {
        count.aggregationBuffer.delete();
      }
      count.aggregationBuffer = new Buffer(this.context.gl, {
        byteLength: dataBytes,
        accessor: {
          size: 4,
          type: GL.FLOAT,
          divisor: 1
        }
      });
    }
  }

  updateResults({aggregationData, maxMinData, maxData, minData}) {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = aggregationData;
      count.maxMinData = maxMinData;
      count.maxData = maxData;
      count.minData = minData;
    }
  }

  updateWeightParams(opts) {
    const {getWeight, aggregation} = opts.props;
    const {count} = this.state.weights;
    count.getWeight = getWeight;
    count.operation = AGGREGATION_OPERATION[aggregation];
  }

  updateShaders(shaders) {
    if (this.state.gpuAggregation) {
      this.state.gpuGridAggregator.updateShaders(shaders);
    }
  }

  // Private

  _alignBoundingBox(opts) {
    const {screenSpaceAggregation, boundingBox, gridOffset} = this.state;
    const {coordinateSystem} = opts.props;
    let worldOrigin;
    if (screenSpaceAggregation) {
      return;
    }

    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.DEFAULT: // TODO: should we check viewport type for geospatial type?
      case COORDINATE_SYSTEM.LNGLAT:
      case COORDINATE_SYSTEM.LNGLAT_DEPRECATED:
        worldOrigin = [-180, -90]; // Origin used to define grid cell boundaries
        break;
      case COORDINATE_SYSTEM.IDENTITY:
        const {width, height} = this.context.viewport;
        worldOrigin = [-width / 2, -height / 2]; // Origin used to define grid cell boundaries
        break;
      default:
        // Currently other coordinate systems not supported/verified.
        log.assert(false);
    }

    const {xMin, yMin} = boundingBox;
    boundingBox.xMin = alignToCell(xMin - worldOrigin[0], gridOffset.xOffset) + worldOrigin[0];
    boundingBox.yMin = alignToCell(yMin - worldOrigin[1], gridOffset.yOffset) + worldOrigin[1];
  }

  // eslint-disable-next-line
  _updateProjectionParams(opts) {
    const {viewport} = this.context;
    const {dataChanged, cellSizeChanged, screenSpaceAggregation} = this.state;
    if (dataChanged && !screenSpaceAggregation) {
      const boundingBox = getBoundingBox(this.getAttributes(), this.getNumInstances());
      this.setState({boundingBox});
    }
    if (dataChanged || cellSizeChanged) {
      // for grid contour layers transform cellSize from meters to lng/lat offsets
      const gridOffset = this._getGridOffset(opts);
      this.setState({gridOffset});

      this._alignBoundingBox(opts);
      let {width, height} = viewport;
      let cellOffset = [0, 0];
      let projectPoints = false;
      let translation = [0, 0];
      let scaling = [0, 0, 0]; // [x, y, z] : x,y represent scaling in x and y and z > 0 implies scaling enabled otherwise not

      if (screenSpaceAggregation) {
        projectPoints = true;
        scaling = [viewport.width / 2, -viewport.height / 2, 1];
        translation = [1, -1];
      } else {
        const {xMin, yMin, xMax, yMax} = this.state.boundingBox;
        width = xMax - xMin + gridOffset.xOffset;
        height = yMax - yMin + gridOffset.yOffset;

        // Setup translations so that every point is in +ve range
        cellOffset = [-1 * xMin, -1 * yMin];
        translation = [-1 * xMin, -1 * yMin];
        projectPoints = false;
      }
      const numCol = Math.ceil(width / gridOffset.xOffset);
      const numRow = Math.ceil(height / gridOffset.yOffset);
      this.allocateResources(numRow, numCol);
      this.setState({
        translation,
        scaling,
        projectPoints,
        width,
        height,
        cellOffset,
        numCol,
        numRow
      });
    }
  }

  _updateAggregation(opts) {
    const {
      cpuGridAggregator,
      gpuGridAggregator,
      gridOffset,
      cellOffset,
      translation,
      scaling,
      width,
      height,
      boundingBox,
      projectPoints,
      gpuAggregation,
      numCol,
      numRow
    } = this.state;
    const {props} = opts;
    const {viewport} = this.context;
    const attributes = this.getAttributes();
    const vertexCount = this.getNumInstances();

    if (!gpuAggregation) {
      const result = cpuGridAggregator(props, {
        gridOffset,
        projectPoints,
        attributes,
        viewport,
        cellOffset,
        boundingBox
      });
      this.setState({
        layerData: result
      });
    } else {
      const {weights} = this.state;
      gpuGridAggregator.run({
        weights,
        cellSize: [gridOffset.xOffset, gridOffset.yOffset],
        width,
        height,
        numCol,
        numRow,
        translation,
        scaling,
        vertexCount,
        projectPoints,
        attributes,
        moduleSettings: this.getModuleSettings()
      });
    }
  }

  _updateWeightBins() {
    const {getValue} = this.state;

    const sortedBins = new BinSorter(this.state.layerData.data || [], {getValue});
    this.setState({sortedBins});
  }

  _uploadAggregationResults() {
    const {numCol, numRow} = this.state;
    const {data} = this.state.layerData;
    const {aggregatedBins, minValue, maxValue, totalCount} = this.state.sortedBins;

    const ELEMENTCOUNT = 4;
    const aggregationSize = numCol * numRow * ELEMENTCOUNT;
    const aggregationData = new Float32Array(aggregationSize).fill(0);
    for (const bin of aggregatedBins) {
      const {lonIdx, latIdx} = data[bin.i];
      const {value, counts} = bin;
      const cellIndex = (lonIdx + latIdx * numCol) * ELEMENTCOUNT;
      aggregationData[cellIndex] = value;
      aggregationData[cellIndex + ELEMENTCOUNT - 1] = counts;
    }
    const maxMinData = new Float32Array([maxValue, 0, 0, minValue]);
    const maxData = new Float32Array([maxValue, 0, 0, totalCount]);
    const minData = new Float32Array([minValue, 0, 0, totalCount]);
    this.updateResults({aggregationData, maxMinData, maxData, minData});
  }

  _getGridOffset(opts) {
    const {cellSize, boundingBox} = this.state;
    if (opts.props.coordinateSystem === COORDINATE_SYSTEM.IDENTITY) {
      return {xOffset: cellSize, yOffset: cellSize};
    }
    return getGridOffset(boundingBox, cellSize);
  }

  _resetResults() {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }

  _updateAccessors(opts) {
    if (this.state.gpuAggregation) {
      this.updateWeightParams(opts);
    } else {
      this._updateGetValueFuncs(opts);
    }
  }

  _updateGetValueFuncs({oldProps, props, changeFlags}) {
    const {getValue} = this.state;
    if (
      !getValue ||
      oldProps.aggregation !== props.aggregation ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getWeight))
    ) {
      this.setState({getValue: getValueFunc(props.aggregation, props.getWeight)});
    }
  }
}

GridAggregationLayer.layerName = 'GridAggregationLayer';
