import test from 'tape-catch';
import {DataFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('DataFilterExtension#constructor', t => {
  let extension = new DataFilterExtension();
  t.is(extension.opts.filterSize, 1, 'Extension has filterSize');
  t.is(extension.opts.softMargin, false, 'Extension has softMargin');

  extension = new DataFilterExtension({filterSize: 3, softMargin: true});
  t.is(extension.opts.filterSize, 3, 'Extension has filterSize');
  t.is(extension.opts.softMargin, true, 'Extension has softMargin');

  t.throws(
    () => new DataFilterExtension({filterSize: 5}),
    /filterSize/,
    'should throw on invalid filterSize'
  );

  t.end();
});

test('DataFilterExtension', t => {
  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
          {position: [-122.454, 37.781], timestamp: 140, entry: 14475, exit: 5493}
        ],
        getPosition: d => d.position,
        getFilterValue: d => d.timestamp,
        filterRange: [80, 160],
        extensions: [new DataFilterExtension()]
      },
      onAfterUpdate: ({layer}) => {
        const {uniforms} = layer.state.model.program;
        t.is(uniforms.filter_min, 80, 'has correct uniforms');
        t.is(uniforms.filter_softMax, 160, 'has correct uniforms');
        t.is(uniforms.filter_enabled, true, 'has correct uniforms');
      }
    },
    {
      updateProps: {
        getFilterValue: d => [d.entry, d.exit],
        filterRange: [[10000, 20000], [0, 100000]],
        filterSoftRange: [[12000, 18000], [2000, 8000]],
        filterEnabled: false,
        filterTransformSize: true,
        extensions: [new DataFilterExtension({filterSize: 2, softMargin: true})]
      },
      onAfterUpdate: ({layer}) => {
        const {uniforms} = layer.state.model.program;
        t.deepEqual(uniforms.filter_min, [10000, 0], 'has correct uniforms');
        t.deepEqual(uniforms.filter_softMax, [18000, 8000], 'has correct uniforms');
        t.is(uniforms.filter_transformSize, false, 'has correct uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
