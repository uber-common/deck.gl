import {default as ScatterplotDemo} from './scatterplot';
import {default as ArcDemo} from './arc';
import {default as GridDemo} from './grid';
import {default as ChoroplethDemo} from './choropleth';
import {default as TripsDemo} from './trips';
import {default as PlotDemo} from './plot';

class HomeDemo extends TripsDemo {

  static get data() {
    return [
      {
        ...TripsDemo.data[0],
        url: 'data/trips-data-s.txt'
      },
      {
        ...TripsDemo.data[1],
        url: 'data/building-data-s.txt'
      }
    ];
  }

  static get viewport() {
    return {
      ...TripsDemo.viewport,
      longitude: -74.01,
      latitude: 40.707,
      zoom: 14,
      pitch: 40
    };
  }

}

export default {
  ScatterplotDemo,
  ArcDemo,
  GridDemo,
  ChoroplethDemo,
  TripsDemo,
  HomeDemo,
  PlotDemo
};
