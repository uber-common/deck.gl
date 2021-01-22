/* eslint-disable */
import React, {useState, useRef} from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, MVTLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import {debounce} from 'debounce';
// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
const INITIAL_VIEW_STATE = {
  latitude: 41.850033,
  longitude: -87.6500523,
  zoom: 2,
  bearing: 0,
  pitch: 0
};
const onViewportChange = e => {
  const features = e.getRenderedFeatures();
  console.log(features);
};
function Root() {
  const mapRef = useRef(null);
  const onClick = info => {
    console.log('Clicked object', info.object, info.object.properties.name);
    if (info.object) {
      alert(info.object.properties.name);
    }
  };
  const onMapLoad = () => {
    mapRef.current.getMap().showTileBoundaries = true;
  };
  return (
    <DeckGL controller={true} initialViewState={INITIAL_VIEW_STATE} style={{overflow: 'hidden'}}>
      <StaticMap
        mapStyle={'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'}
        onLoad={onMapLoad}
        ref={mapRef}
      />
      <MVTLayer
        id="test"
        data={
          // 'https://maps-api-v2.us.carto.com/user/public/tilejson/sql/postgres/ne_50m_admin_0_countries'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/multipolygon'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/ne_50m_rivers_lake_centerlines'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/lineas_metro'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/natural_earth_geography_glo_ports_410'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/ne_50m_admin_1_states'
          'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/do_usa_county'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/carto_geography_usa_censustract_2015'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/carto_geography_usa_zcta5_2015'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/carto_geography_usa_blockgroup_2015'
        }
        filled={true}
        pointRadiusMinPixels={2}
        pointRadiusScale={2000}
        getRadius={f => 11 - f.properties.scalerank}
        // getFillColor={f => [
        //   f.properties.cartodb_id * 3,
        //   f.properties.cartodb_id * 3,
        //   f.properties.cartodb_id * 3
        // ]}
        getLineColor={[0, 255, 0]}
        lineWidthMinPixels={0.5}
        pickable={true}
        autoHighlight={true}
        onClick={onClick}
        uniqueIdProperty={'cartodb_id'}
        // binary={false}
        // onViewportChange={debounce(onViewportChange, 400)}
        // maxFeatures={1000}
      />
    </DeckGL>
  );
}
/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));