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

export const currentPointStyle: LayerProps = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#3770E0',
    'circle-stroke-width': 1,
    'circle-stroke-color': 'white',
  },
};

export const startPointStyle: LayerProps = {
  id: 'startPoint',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#097200',
    'circle-stroke-width': 2,
    'circle-stroke-color': 'white',
  },
};

export const endPointStyle: LayerProps = {
  id: 'endPoint',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#6F1400',
    'circle-stroke-width': 2,
    'circle-stroke-color': 'white',
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

export const skyLayerStyle: SkyLayer = {
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

export const getPolylineLayerStyle = (index?: number): LayerProps => {
  if (index) {
    return {
      id: `polyline-layer${index}`,
      type: 'line',
      paint: {
        'line-color': '#ea5f94',
        'line-width': 2,
        'line-opacity': 0.5,
      },
    };
  }

  return {
    id: `polyline-layer`,
    type: 'line',
    paint: {
      'line-color': '#ea5f94',
      'line-width': 2,
      'line-opacity': 0.5,
    },
  };
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
    'line-color': '#fa8775',
    'line-width': 4,
  },
};

export const defineLineLayerStyle = (
  animationState: 'paused' | 'playing'
): LayerProps => {
  return {
    type: 'line',
    paint: {
      'line-color': '#6c5dd2',
      'line-width': 3,
      'line-opacity': animationState === 'playing' ? 0.55 : 1,
    },
  };
};

export const singleLineLayerStyle: LayerProps = {
  type: 'line',
  paint: {
    'line-color': '#6c5dd2',
    'line-width': 3,
    'line-opacity': 0.8,
  },
};

export const fogLayer = {
  range: [0.8, 8],
  color: '#dc9f9f',
  'horizon-blend': 0.5,
};
