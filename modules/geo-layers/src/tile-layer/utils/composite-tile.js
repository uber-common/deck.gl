export default class CompositeTile {
  constructor({tileset = [], zoomLevel}) {
    this.tileset = tileset;
    this.zoomLevel = zoomLevel;

    this.data = [];
    this.combinedData = [];

    // Remember to refresh aggregation when any tile loads its data
    this.waitForDataInTiles(this.tileset);
    // Perform aggregation
    // this.combineTiles();
  }

  getData() {
    if (this.data.length) {
      return this.data.flat();
    }

    return Promise.all(this.tileset.map(tile => tile.data)).then(allData =>
      allData.flat()
    );
  }

  waitForDataInTiles(pendingTiles) {
    pendingTiles.forEach(pendingTile => {
      const tileData = pendingTile.data;
      const dataStillPending = Boolean(tileData.then);

      if (!dataStillPending) {
        this.data.push(tileData);
        return;
      }

      tileData.then(loadedData => {
        this.data.push(loadedData);
      });
    });
  }
}
