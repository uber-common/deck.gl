/* global document, google */
import {Deck} from '@deck.gl/core';

/**
 * Get a new deck instance
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 * @param [deck] (Deck) - a previously created instances
 */
export function createDeckInstance(map, overlay, deck) {
  if (deck) {
    if (deck.props.userData._googleMap === map) {
      return deck;
    }
    // deck instance was created for a different map
    destroyDeckInstance(deck);
  }

  const eventListeners = {
    click: null,
    mousemove: null,
    mouseout: null
  };

  deck = new Deck({
    canvas: createDeckCanvas(overlay),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    controller: false,
    userData: {
      _googleMap: map,
      _eventListeners: eventListeners
    }
  });

  // Register event listeners
  for (const eventType in eventListeners) {
    eventListeners[eventType] = map.addListener(eventType, evt =>
      handleMouseEvent(deck, eventType, evt)
    );
  }

  return deck;
}

function createDeckCanvas(overlay) {
  // google maps places overlays in a container anchored at the map center.
  // the container CSS is manipulated during dragging,
  // making it difficult for our canvas to sync with the map.
  // As a hack, we find that container and append our canvas as its sibling.
  let container = overlay.getPanes().overlayLayer;
  while (container && container.style.left !== '50%') {
    container = container.offsetParent;
  }
  container = container.offsetParent;

  const deckCanvas = document.createElement('canvas');
  Object.assign(deckCanvas.style, {
    // map container position is always non-static
    position: 'absolute',
    pointerEvents: 'none',
    left: 0,
    top: 0,
    zIndex: 1,
    width: '100%',
    height: '100%'
  });

  container.appendChild(deckCanvas);
  return deckCanvas;
}

/**
 * Safely remove a deck instance
 * @param deck (Deck) - a previously created instances
 */
export function destroyDeckInstance(deck) {
  const {_googleMap: map, _eventListeners: eventListeners} = deck.props.userData;

  // Unregister event listeners
  for (const eventType in eventListeners) {
    map.removeListener(eventListeners[eventType]);
  }

  deck.finalize();
}

/**
 * Get the current view state
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 */
export function getViewState(map, overlay) {
  const container = map.getDiv();
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Canvas position relative to draggable map's container depends on
  // overlayView's projection, not the map's. Have to use the center of the
  // map for this, not the top left, for the same reason as above.
  const projection = overlay.getProjection();

  const bounds = map.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const topRight = projection.fromLatLngToDivPixel(ne);
  const bottomLeft = projection.fromLatLngToDivPixel(sw);

  // Compute fractional zoom.
  const scale = (topRight.x - bottomLeft.x) / width;
  const zoom = Math.log2(scale) + map.getZoom() - 1;

  // Compute fractional center.
  const centerPx = new google.maps.Point(width / 2, height / 2);
  const centerContainer = projection.fromContainerPixelToLatLng(centerPx);
  const latitude = centerContainer.lat();
  const longitude = centerContainer.lng();

  return {
    zoom,
    pitch: map.getTilt(),
    latitude,
    longitude
  };
}

// Triggers picking on a mouse event
function handleMouseEvent(deck, type, event) {
  let callback;
  switch (type) {
    case 'click':
      callback = deck._onEvent;
      break;

    case 'mousemove':
      callback = deck._onPointerMove;
      break;

    case 'mouseout':
      callback = deck._onPointerLeave;
      break;

    default:
      return;
  }

  callback({
    type,
    offsetCenter: event.pixel,
    srcEvent: event
  });
}
