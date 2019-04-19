# Sunlight (Experimental)

Sunlight is a directional light source simulating the sun. Sun position calculations are based on [article](http://aa.quae.nl/en/reken/zonpositie.html) and inspired by [SunCalc](https://www.npmjs.com/package/suncalc). 

## Usage 

Create an sun light source.

```js
import {_Sunlight as Sunlight} from '@deck.gl/core';

new Sunlight({
  timestamp: 1554927200000, 
  color: [255, 0, 0],
  intensity: 1
});
```

## constructor

The constructor for the `Sunlight` class. Use this to create a new `Sunlight`.

```js
const sunlight = new Sunlight({timestamp, color, intensity});
```

* `timestamp` - (*number*) - Unix timestamp in milliseconds.
* `color` - (*array*)  RGB color of sun light source, default value is `[255, 255, 255]`.
* `intensity` - (*number*) Strength of sun light source, default value is `1.0`.

## Source

[/modules/core/src/effects/lighting/sunlight.js](https://github.com/uber/deck.gl/tree/master/modules/core/src/effects/lighting/sunlight.js)
