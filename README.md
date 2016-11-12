<p align="right">
  <a href="https://npmjs.org/package/deck.gl">
    <img src="https://img.shields.io/npm/v/deck.gl.svg?style=flat-square" alt="version" />
  </a>
  <a href="https://travis-ci.org/uber/deck.gl">
    <img src="https://img.shields.io/travis/uber/deck.gl/master.svg?style=flat-square" alt="build" />
  </a>
  <a href="https://npmjs.org/package/deck.gl">
    <img src="https://img.shields.io/npm/dm/deck.gl.svg?style=flat-square" alt="downloads" />
  </a>
  <a href="http://starveller.sigsev.io/uber/deck.gl">
    <img src="http://starveller.sigsev.io/api/repos/uber/deck.gl/badge" alt="stars" />
  </a>
</p>

<h1 align="center">deck.gl | <a href="https://uber.github.io/deck.gl">Docs</a></h1>

<h5 align="center">A WebGL overlay suite for React providing a set of highly performant data visualization overlays</h5>

[![docs](http://i.imgur.com/mvfvgf0.jpg)](https://uber.github.io/deck.gl)

Provides tested, highly performant layers for data visualization
use cases, such as scatterplots, choropleths etc in 2 and 3 dimensions.


## Installation

```
npm install --save deck.gl
```
Note: deck.gl has a dependency on node version 0.12 or higher. If you use an older version, you can install a node version manager like nvm and use a separate shell to install and build deck.gl

Please refer to [this](https://github.com/creationix/nvm#installation) 
to install nvm, then you can run:
```
nvm install 0.12
```
It will use this node version automatically for your current shell.

## Example

```javascript
import DeckGL from 'deck.gl/react';
import {ArcLayer} from 'deck.gl';

const flights = new ArcLayer({
  id: 'flights',
  data: [] // Some flight points
});

<DeckGL width={1920} height={1080} layers={[flights]} />
```

Take a look at the [docs website](https://uber.github.io/deck.gl)
or browse the [docs folder](./docs).

## Developing

    npm install
    npm test
    npm start


#### Node Version Requirement

Building deck.gl from source has a dependency on node
version 0.12 or higher. If you use an older version, you can install
a node version manager like nvm and use a separate shell to install
and build deck.gl.

Please refer to [this](https://github.com/creationix/nvm#installation) 
to install nvm, then you can run:
```
nvm install 0.12
```
It will use this node version automatically for your current shell.

This is not an issue when installing deck.gl, only
when building it from source.

## Contributing

PRs and bug reports are welcome. Note that you once your PR is
about to be merged, your will be asked to register as a contributor
by filling in a short form.

## Data sources

[SF OpenData](https://data.sfgov.org)
[TLC Trip Record Data](http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml)
[Mapzen](https://mapzen.com/)
