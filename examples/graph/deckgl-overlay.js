import React, {Component} from 'react';
import DeckGL, {OrthographicViewport} from 'deck.gl';
import GraphLayoutLayer from './graph-layer/graph-layout-layer';

export default class DeckGLOverlay extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {viewport, data} = this.props;

    if (!data) {
      return null;
    }

    const {width, height} = viewport;
    const {layoutProps, deckGLRef} = this.props;
    const {layoutAccessors, linkAccessors, nodeAccessors, nodeIconAccessors} = this.props;
    const {onHover, onClick} = this.props;
    const layer = new GraphLayoutLayer({
      id: 'graph-layout',
      data,
      layoutProps,

      layoutAccessors,
      linkAccessors,
      nodeAccessors,
      nodeIconAccessors,

      onHover,
      onClick
    });

    // recalculate viewport on container size change.
    const left = -width / 2;
    const bottom = -height / 2;
    const glViewport = new OrthographicViewport({width, height, left, bottom});

    // TODO: clean up viewport / glViewport
    return (
      <DeckGL
        ref={deckGLRef}
        width={width}
        height={height}
        viewport={glViewport}
        layers={ [layer] }
      />
    );
  }
}
