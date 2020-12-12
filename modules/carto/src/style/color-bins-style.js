import {scaleThreshold} from 'd3-scale';
import getPalette, {NULL_COLOR} from './palette';
import {assert, getAttrValue} from './utils';

export default function colorBins({attr, domain, colors, nullColor = NULL_COLOR}) {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers');
  assert(
    typeof colors === 'string' || Array.isArray(colors),
    'Expected "colors" to be an array of numbers or a CARTOColors string'
  );

  const palette = typeof colors === 'string' ? getPalette(colors, domain.length) : colors;
  const color = scaleThreshold()
    .domain(domain)
    .range(palette);

  return d => {
    const value = getAttrValue(attr, d);
    return Number.isFinite(value) ? color(value) : nullColor;
  };
}
