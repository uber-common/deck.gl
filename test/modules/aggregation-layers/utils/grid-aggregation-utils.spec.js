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

import test from 'tape-catch';

import {alignToCell} from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/grid-aggregation-utils';

import GPUGridAggregator from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {pointToDensityGridData} from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/grid-aggregation-utils';

import {gl} from '@deck.gl/test-utils';
import {points, GridAggregationData} from 'deck.gl-test/data';

const getPosition = d => d.COORDINATES;
const gpuGridAggregator = new GPUGridAggregator(gl);

function filterEmptryChannels(inArray) {
  const outArray = [];
  for (let i = 0; i < inArray.length; i += 4) {
    outArray.push(inArray[i], inArray[i + 3]);
  }
  return outArray;
}

function compareArrays(t, name, cpu, gpu) {
  t.deepEqual(filterEmptryChannels(gpu), filterEmptryChannels(cpu), name);
}

test('GridAggregationUtils#alignToCell (CPU)', t => {
  t.equal(alignToCell(-3, 5), -5);
  t.equal(alignToCell(3, 5), 0);

  t.end();
});

test('GridAggregationUtils#pointToDensityGridData (CPU vs GPU)', t => {
  const opts = {
    data: points,
    getPosition,
    weightParams: {weight: {needMax: 1, needMin: 1, getWeight: x => 1}},
    gpuGridAggregator,
    aggregationFlags: {dataChanged: true},
    fp64: false // true // NOTE this test fails wihtout FP64 gpu aggregation.
  };
  const {attributes, vertexCount} = GridAggregationData.buildAttributes({
    data: opts.data,
    weights: opts.weightParams,
    getPosition: x => x.COORDINATES
  });
  const CELLSIZES = [500, 1000, 5000];
  for (const cellSizeMeters of CELLSIZES) {
    opts.cellSizeMeters = cellSizeMeters;
    opts.gpuAggregation = false;
    const cpuResults = pointToDensityGridData(Object.assign({}, opts, {attributes, vertexCount}));
    opts.gpuAggregation = true;
    const gpuResults = pointToDensityGridData(Object.assign({}, opts, {attributes, vertexCount}));

    compareArrays(
      t,
      `Cell aggregation data should match for cellSizeMeters:${cellSizeMeters}`,
      cpuResults.weights.weight.aggregationBuffer.getData(),
      gpuResults.weights.weight.aggregationBuffer.getData()
    );

    compareArrays(
      t,
      `Max data should match for cellSizeMeters:${cellSizeMeters}`,
      cpuResults.weights.weight.maxBuffer.getData(),
      gpuResults.weights.weight.maxBuffer.getData()
    );

    compareArrays(
      t,
      `Min data should match for cellSizeMeters:${cellSizeMeters}`,
      cpuResults.weights.weight.minBuffer.getData(),
      gpuResults.weights.weight.minBuffer.getData()
    );
  }

  t.end();
});
