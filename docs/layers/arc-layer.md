<p align="right">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="64-bit" />
</p>

# Arc Layer

The Arc Layer renders raised arcs joining pairs of source and target points,
specified as latitude/longitude coordinates.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-arc.jpg" />
</div>

    import {ArcLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `strokeWidth` (Number, optional)

- Default: `1`

The stroke width used to draw each arc. Unit in pixels.

## Accessors

##### `getSourcePosition` (Function, optional)

- Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` (Function, optional)

- Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getSourceColor` (Function, optional)

- Default: `object => object.color`

Method called to determine the rgba color of the source. If the alpha parameter
is not provided, it will be set to `255`.

If the method does not return a value for the given object, fallback to `[0, 0, 0, 255]`.

##### `getTargetColor` (Function, optional)

- Default `object => object.color`

Method called to determine the rgba color of the source.
* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to `[0, 0, 255, 255]`.
