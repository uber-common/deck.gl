<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-yes-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# FirstPersonView Class

The [`FirstPersonView`] class is a subclass of [View](/docs/api-reference/viewport.md) that describes a "camera" placed at the exact position specified by the `viewState`, looking **towards** the direction and orientation specified by the application.

This is in contrast with e.g. [ThirdPersonView](/docs/api-reference/viewport.md) where the camera will be created at a distance from and looking **at** the specified position.

To render, a `FirstPersonView` needs to be combined with a `viewState` object with the following parameters:

* `longitude`
* `latitude`
* `position` (`Number[3]`) - meter offsets of the camera from the lng-lat anchor point.
* `bearing` (`Number`, optional) - bearing angle in degrees. Default `0` (north).
* `pitch` (`Number`, optional) - pitch angle in degrees. Default `0` (horizontal).
- `maxPitch` (`Number`, optional) - max pitch angle. Default `90` (up).
- `minPitch` (`Number`, optional) - min pitch angle. Default `-90` (down).

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Constructor

```js
new FirstPersonView({...});
```

`FirstPersonView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.

## Methods

Inherits all [View methods](/docs/api-reference/viewport.md#methods).


## Source

[modules/core/src/views/first-person-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/first-person-view.js)
