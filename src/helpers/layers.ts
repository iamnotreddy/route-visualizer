import { Position } from 'geojson';
import { SkyLayer } from 'mapbox-gl';
import { LayerProps, SourceProps } from 'react-map-gl';

// map config
export const mapConfig = {
  mapStyle: 'mapbox://styles/iamnotreddy/cl8mi1thc003914qikp84oo8l',
  terrain: { source: 'mapbox-dem', exaggeration: 4 },
  mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_KEY,
  maxPitch: 85,
  style: { width: '100vw', height: '100vh' },
};

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

export const startPointLayerStyle: LayerProps = {
  id: 'startPoint',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#097200',
    'circle-stroke-width': 2,
    'circle-stroke-color': 'black',
  },
};

export const endPointLayerStyle: LayerProps = {
  id: 'endPoint',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#FF8700',
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
  type: 'line',
  paint: { 'line-color': '#004225', 'line-width': 10 },
};

export const polylineLayerStyle: LayerProps = {
  id: 'polyline',
  type: 'line',
  paint: {
    'line-color': '#004225',
    'line-width': 3,
  },
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
    'line-color': 'red',
    'line-width': 4,
  },
};

export const singleLineLayerStyle: LayerProps = {
  type: 'line',
  paint: {
    'line-color': 'black',
    'line-width': 4,
  },
};

export const fogLayer = {
  range: [0.8, 8],
  color: '#dc9f9f',
  'horizon-blend': 0.5,
};
