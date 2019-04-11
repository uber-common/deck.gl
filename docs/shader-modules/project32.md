# project32 (Shader Module)

The `project32` shader module is an extension of the [project](/docs/shader-modules/project.md) shader module that adds some projection utilities.

## GLSL Functions

### project_position_to_clipspace

32 bit implementation of the `project_position_to_clipspace` interface.

```glsl
vec4 project_position_to_clipspace(vec3 position, vec2 position64xyLow, vec3 offset)
vec4 project_position_to_clipspace(vec3 position, vec2 position64xyLow, vec3 offset, out vec4 commonPosition)
```

Parameters:

* `position` - vertex position in the layer's coordinate system.
* `position64xyLow` - always ignored
* `offset` - offset from the coordinate, in common space
* `commonPosition` - projected position in the common space

Returns:
Projected position in the clipspace.
