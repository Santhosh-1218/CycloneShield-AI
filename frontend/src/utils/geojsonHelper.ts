export function normalizeGeoJSON(input: any): { type: 'FeatureCollection'; features: any[] } {
  if (!input) {
    return { type: 'FeatureCollection', features: [] };
  }

  let raw = input;
  if (input.geojson) {
    raw = input.geojson;
  } else if (input.data && input.data.geojson) {
    raw = input.data.geojson;
  } else if (input.data && input.data.features) {
    raw = input.data;
  }

  if (raw && raw.type === 'FeatureCollection' && Array.isArray(raw.features)) {
    const validFeatures = raw.features.filter((f: any) => {
      return (
        f &&
        f.type === 'Feature' &&
        f.geometry &&
        f.geometry.type &&
        Array.isArray(f.geometry.coordinates)
      );
    });
    return {
      type: 'FeatureCollection',
      features: validFeatures
    };
  }

  if (raw && raw.type === 'Feature' && raw.geometry && Array.isArray(raw.geometry.coordinates)) {
    return {
      type: 'FeatureCollection',
      features: [raw]
    };
  }

  if (Array.isArray(raw)) {
    const validFeatures = raw.filter((f: any) => {
      return (
        f &&
        (f.type === 'Feature' || f.geometry) &&
        (f.geometry?.coordinates || f.coordinates)
      );
    });
    return {
      type: 'FeatureCollection',
      features: validFeatures.map((f: any) => {
        if (f.type === 'Feature') return f;
        return {
          type: 'Feature',
          geometry: f.geometry || { type: 'Point', coordinates: f.coordinates },
          properties: f.properties || {}
        };
      })
    };
  }

  return { type: 'FeatureCollection', features: [] };
}
