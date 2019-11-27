# Debugging

deck.gl provides support for debugging applications and layers, which includes:

* deck.gl logging
* luma.gl debugging support
* The Seer Chrome Extension


## deck.gl logging

deck.gl (and luma.gl) are based on the probe.gl debugging library, providing user configurable console logging with advanced functions like the ability to log images and tables etc to the console.

In your browser console, select the priority you would like:

```js
deck.log.enable()
deck.log.priority = 2
```

| Log level | Description |
| ---       | --- |
| 0         | Critical logs only |
| 1         | Logs the reason for redraws and picking operations |
| 2         | Logs layer updates |
| 3+        | Additional logging around layer lifecycle, prop diffing etc |


## WebGL debugging using luma.gl

For lower level debugging, including debugging of layer rendering and picking, deck.gl is built on luma.gl which has extensive debugging and instrumentation support for WebGL level code and GPU input values (shader uniforms and attributes). To enable debug logging simply issue the following commands in your browser console:

```js
luma.log.enable()
luma.log.priority = 2
```

The following features are abailable:

* Automatic sanity checks are performed on uniforms and attributes. Passing an `undefined` value to a uniform is a common JavaScript mistake that will immediately generate a descriptive exception in deck.gl. This can be tracked from the console output.

* The `Deck` class and `DeckGL` react component have a debug flag which instructs luma.gl to instruments the gl context (with a performance cost) which allows tracing all WebGL call errors, see below on luma debug priority levels. It also generates exceptions immediately when a WebGL operation fails, allowing you to pinpoint exactly where in the code the issue happened. Due to the asynchronous nature of the GPU, some WebGL execution errors are surfaced and caught later than the calls that generate them.

In the browser console, setting `luma.log.priority` to various values will enable increasing levels of debugging.

| Log level | Description |
| ---       | --- |
| 0         | Critical logs only |
| 1         | Minimal logging    |
| 2 and 3   | Will display all uniforms and attributes before each draw call, allowing you to be confident in what values your shaders are actually working on. |
| 4         | Will trace every single gl call.
