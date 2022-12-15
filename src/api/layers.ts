import { Position } from 'geojson';
import { SkyLayer } from 'mapbox-gl';
import { LayerProps, SourceProps } from 'react-map-gl';

// layer styles

export const pointLayerStyle: LayerProps = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#f6f3ee',
    'circle-stroke-width': 2,
    'circle-stroke-color': 'black',
  },
};

export const definePointSource = (coordinates: Position): SourceProps => {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          properties: {},
        },
      ],
    },
  };
};

export const skyLayer: SkyLayer = {
  id: 'sky',
  type: 'sky',
  paint: {
    'sky-type': 'atmosphere',
    'sky-atmosphere-sun': [0.0, 0.0],
    'sky-atmosphere-sun-intensity': 15,
  },
};

export const skySource: SourceProps = {
  id: 'mapbox-dem',
  type: 'raster-dem',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14,
};

export const lineLayerStyle: LayerProps = {
  id: 'line',
  type: 'line',
  paint: { 'line-color': '#004225', 'line-width': 5 },
};

export const defineLineSource = (coordinates: Position[]): SourceProps => {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
          properties: {},
        },
      ],
    },
  };
};

export const animatedLineLayerStyle: LayerProps = {
  type: 'line',
  paint: {
    'line-color': '#f6f3ee',
    'line-width': 2,
  },
};

export const fogLayer = {
  range: [0.8, 8],
  color: '#dc9f9f',
  'horizon-blend': 0.5,
};
