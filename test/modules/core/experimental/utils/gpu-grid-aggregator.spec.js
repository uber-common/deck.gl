import test from 'tape-catch';
import {_GPUGridAggregator as GPUGridAggregator} from '@deck.gl/core';
import {gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl/test/data';

const {fixture, fixtureWorldSpace} = GridAggregationData;

test('GPUGridAggregator#GPU', t => {
  const sa = new GPUGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: true, projectPoints: true}));
  const maxCountBufferData = result.maxCountBuffer.getData();
  t.equal(maxCountBufferData[0], 3, 'total count should match');
  t.equal(maxCountBufferData[1], 5, 'total weight should match');
  t.equal(maxCountBufferData[3], 4, 'max weight should match');
  t.end();
});

const {generateRandomGridPoints} = GridAggregationData;
test('GPUGridAggregator#CPU', t => {
  const sa = new GPUGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: false, projectPoints: true}));

  const maxCountBufferData = result.maxCountBuffer.getData();
  t.equal(maxCountBufferData[0], 3, 'total count should match');
  t.equal(maxCountBufferData[1], 5, 'total weight should match');
  t.equal(maxCountBufferData[3], 4, 'max weight should match');
  t.end();
});

test('GPUGridAggregator#CompareCPUandGPU', t => {
  const sa = new GPUGridAggregator(gl);
  const pointsData = generateRandomGridPoints(5000);
  let result = sa.run(Object.assign({}, fixture, {useGPU: false, projectPoints: true}, pointsData));
  const cpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };
  result = sa.run(Object.assign({}, fixture, {useGPU: true, projectPoints: true}, pointsData));
  const gpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };

  // Compare aggregation details for each grid-cell, total count and max count.
  t.deepEqual(gpuResults, cpuResults, 'cpu and gpu results should match');
  t.end();
});

test('GPUGridAggregator worldspace aggregation #CompareCPUandGPU', t => {
  const sa = new GPUGridAggregator(gl);
  let result = sa.run(Object.assign({}, fixtureWorldSpace, {useGPU: false, projectPoints: false}));
  const cpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };
  result = sa.run(
    // NOTE: 64-bit aggregation fails on Intel GPUs.
    Object.assign({}, fixtureWorldSpace, {useGPU: true, projectPoints: false, fp64: false})
  );
  const gpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };

  t.deepEqual(gpuResults, cpuResults, 'cpu and gpu results should match');
  t.end();
});
