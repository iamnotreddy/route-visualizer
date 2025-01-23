import { useEffect, useRef, useState } from 'react';
import Map, {
  Layer,
  MapRef,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import {
  findInitialViewState,
  splashRouteCoordinates,
} from '@/helpers/initialValues';
import {
  animatedLineLayerStyle,
  defineLineSource,
  mapConfig,
  skyLayerStyle,
  skySource,
} from '@/helpers/layers';
import { useSplashAnimation } from '@/components/hooks/useSplashAnimation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/Dialog';

import { InfoModal } from '@/components/InfoModal';

export default function SignInPage() {
  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    animatedLineCoordinates: splashAnimationedCoordinates,
    handleRouteControl: splashHandleRouteControl,
    currentFrame: splashCurrentFrame,
  } = useSplashAnimation(mapRef, 'playing', splashRouteCoordinates);

  const [viewState, setViewState] = useState<ViewState>(
    findInitialViewState(splashRouteCoordinates)
  );

  const handleMoveEvent = (e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  };

  useEffect(() => {
    setDialogOpen(true);
  }, []);

  // record viewState as camera pans around route

  return (
    <div className='relative flex max-h-screen w-full'>
      <div className='flex-grow-0'>
        <Map
          {...viewState}
          ref={mapRef}
          {...mapConfig}
          onMove={handleMoveEvent}
        >
          {/* layer to style sky */}
          <Source {...skySource}>
            <Layer {...skyLayerStyle} />
          </Source>

          {/* animated coordinates for the splash route */}
          {splashAnimationedCoordinates && (
            <Source {...defineLineSource(splashAnimationedCoordinates)}>
              <Layer {...animatedLineLayerStyle} />
            </Source>
          )}
        </Map>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Explore the adventures the world has to offer.
            </DialogTitle>
            <DialogDescription>
              <InfoModal />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <input
        className='hidden w-1/2 rounded-xl border-2 border-black bg-slate-100 py-2 px-4 hover:scale-y-125'
        ref={sliderRef}
        type='range'
        min={0}
        max={splashRouteCoordinates ? splashRouteCoordinates.length - 1 : 0}
        value={splashCurrentFrame}
        onChange={splashHandleRouteControl}
      />
    </div>
  );
}

export async function getServerSideProps() {
  // Pass the static splashRouteCoordinates to the component as a prop.
  return {
    props: {
      splashRouteCoordinates,
    },
  };
}
