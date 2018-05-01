# RFC Directory (deck.gl)

Implementation of non-trivial new deck.gl features should typically be started off with the creation of an RFC (Request for Comments) to make sure we have a complete story. It also allow the bigger team (as well as the community) to comment and contribute insights.

| RFC Status       | Description |
| ---              | --- |
| **Proposed**     | Call for an RFC to be written |
| **Draft**        | Work-in-progress, not ready for formal review |
| **Pre-Approved** | No major initial objections, draft pre-approved for prototyping |
| **Review**       | Ready for formal review |
| **Approved**     | Approved, ready for implementation |
| **Experimental** | Approved, implemented as experimental API |
| **Implemented**  | Approved and implemented (as officially supported API) |
| **Deferred**     | Review uncovered reasons not to proceed at this time |
| **Rejected**     | Review uncovered reasons not to proceed |


## Reviews

The core developers will review RFCs (and of course, comments from the community are always welcome). Recommended review criteria are being documented in [RFC Review Guidelines](../common/RFC-REVIEW-GUIDELINES.md).


## Longer-Terms RFCs

These are early ideas not yet associated with any release.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Reviewed/Deferred** | | | |
| [**Off-thread attribute generation**](v6.0/off-thread-attribute-generation.md) | @pessimistress | **Deferred** | Generate attributes off-thread (to avoid locking the main thread). Deferred due to issues with supporting the more general use cases. **dataUrl RFC** has been broken out. |
| | | | |
| **WIP/Draft** | | | |
| [**Projection Mode Improvements**](vNext/projection-mode-improvements-rfc.md) | @ibgreen @pessimistress | **Draft** | Improvements to projection system |
| [**Composite Layer Customization**](vNext/composite-layer-customization-rfc.md) | @ibgreen | **Draft** | Improvements to customizing composite layers |
| | | | |
| **Effects** | | | |
| **[Effects Manager](v6.0/effects-manager-rfc.md)** | @1chandu @ibgreen | Draft | Official support for effects (shadows, reflections, better lighting, postprocessing, framebuffer composition etc).  |
| **[Render Layer to Texture](v6.0/render-layer-to-texture-rfc.md)** | TBD | Proposed | Allow layers to render to texture and then use texture in subsequent layers.  |


## v6.0 RFCs

Early directions for v6.0. Also see luma.gl RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Animation** | | | |
| [**Property Animation**](v6.0/property-animation-rfc.md) | @ibgreen | Draft | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| [**Expose Layer AttributeManager**](v6.0/expose-attribute-manager.md) | @ibgreen | **Review** | simplifies pregenerating attributes in apps for fast animation. |
| | | | |
| **Internals** | | | |
| [**PropTypes**](v6.0/prop-types-rfc.md) | @ibgreen | **Review** | Validate e.g ranges for numeric attributes, support animation/auto-interpolation. |
| | | | |
| [**Reduce Distribution Size**](v6.0/reduce-distribution-size-rfc.md) | @ibgreen | **Review** | **Hygiene** Reduce size of distribution and the bundle size of apps consuming deck.gl |
| [**Reduce Repository Size**](v6.0/reduce-repo-size-rfc.md) | @ibgreen | **Draft** | **Hygiene** Reduce size of deck.gl github repository |
| | | | |
| [**Unified ViewState**](v6.0/view-state-rfc.md) | @ibgreen | **Draft** | Controversial proposal for an even more Unified View/Controller Architecture. Will likely be deferred. Review again after other related RFCs have been approved/implemented |

Possible other animation related RFCs:
- integration with event handling (enter leave triggers for animations)


## v5.3 RFCs

These RFCs are under consideration for v5.3.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Per-View Controllers**](v6.0/per-view-controllers-rfc.md) | @ibgreen | **Draft** | Support one controller per view in multi-view apps |
| [**Auto Controls**](v5.3/auto-controls-rfc.md) | @ibgreen | **Review** | Allow deck.gl to be used without an `onViewStateChange` callback. |
| [**Async Layer Props**](v5.3/async-props-rfc.md) | @pessimistress & @ibgreen | **Review** | `Layer.data` can be a URL string, and layer asynchronously downloads and displays the data. |
| [**Picking Occluded Ojects**](v5.3/picking-overlapping-objects-rfc.md) | @ibgreen @georgios-uber | **draft** | Allow partial updates of vertex attributes to support high-performance editing. |
| [**Partial Updates**](v5.3/partial-updates-rfc.md) | @ibgreen @georgios-uber | **draft** | Allow partial updates of vertex attributes to support high-performance editing. |
| [**Constant Accessor**](v5.3/constant-accessor-rfc.md) | @pessimistress | **draft** | Allow users to supply constant attributes directly instead of using an accessor. |



## v5.2 RFCs

These RFCs were implemented in v5.2.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**New View Classes**](v5.2/view-class-rfc.md) | @ibgreen @pessimistress | **Implemented** | Official API for multi-view support, replacing the v5.0 experimental API |
| [**Unified 32 and 64 bit Projection API**](v5.2/unified-32-and-64-bit-project-api-rfc.md) | @ibgreen | **Implemented** | |


## v5.1 RFCs

These RFCs were implemented in v5.1.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Animation** | | | |
| [**Attribute Animation**](v5.1/attribute-animation-rfc.md) | @pessimistress | **Implemented** | Automatically interpolate between two copies of a vertex attributes |


## v5.0 RFCs

These RFCs were implemented in v5.0. Also see luma.gl RFCs.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Animation** | | | |
| [**Auto Highlighting**](v5.0/auto-highlighting-rfc.md) | @ibgreen @1chandu | **Implemented** | Auto highlight hovered object via `picking` module |
| | | | |
| **Viewports and Controllers** | | | |
| [**First Person Geospatial Viewport**](v5.0/first-person-mercator-viewport-rfc.md) | @ibgreen | **Experimental** | Geospatially enable all viewports, add FirstPersonViewport for hybrid apps. |
| [**Multiple Viewports**](v5.0/multi-viewport-rfc.md) | @ibgreen | **Experimental** | Support for multiple viewports |
| [**Viewport Transitions**](v5.0/viewport-animation-rfc.md) | @1chandu | **Experimental** | Animate Viewport changes ("fly to" effect) through interpolation of Viewport props. (Also used in react-map-gl v3.2). |
| [**Break out EventManager**](v5.0/break-out-event-manager-rfc.md) | @ibgreen | **Implemented** | Break out event manager module (mjolnir.js) |
| | | | |
| **luma.gl RFCs** | | | |
| **Break out Math Module** | @ibgreen | **Implemented** | Break out luma.gl math module (math.gl) |


## v4.1 RFCs

These RFCs were implemented in v4.1.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Picking Improvements**](v4.1/picking-improvements-rfc.md) | @shaojingli | "Direction" RFC | Outlines a number of improvements to picking |
| [**Event Handling**](v4.1/event-handling-rfc.md) | Many authors | **Implemented** | Attempt to define enduring event handling architecture |


## v4.0 RFCs

These RFCs were implemented in v4.0.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Non-Geospatial Viewports**](v4.0/non-geospatial-viewports-rfc.md) | @ibgreen @gnavvy | **Implemented** | Support for non-geospatial viewports |
| [**Composite Layer Prop Forwarding**](v4.0/composite-layer-prop-forwarding-rfc.md) | @shaojingli | **Implemented** | Conventions for prop forwarding |
