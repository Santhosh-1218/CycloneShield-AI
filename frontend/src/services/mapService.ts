export interface MapProviderConfig {
  name: string;
  styleUrl: string | any;
  attribution: string;
  maxZoom: number;
}

export const MAP_PROVIDERS: Record<string, MapProviderConfig> = {
  osmStandard: {
    name: 'OpenStreetMap Standard',
    styleUrl: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  openFreeMapLiberty: {
    name: 'OpenFreeMap Liberty (Vector)',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a> Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  },
  mapLibreDemo: {
    name: 'MapLibre Demo Style',
    styleUrl: 'https://demotiles.maplibre.org/style.json',
    attribution: '© <a href="https://maplibre.org/">MapLibre</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }
};

export const DEFAULT_MAP_PROVIDER = MAP_PROVIDERS.osmStandard;
