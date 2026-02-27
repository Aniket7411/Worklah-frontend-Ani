/**
 * Browser geolocation – user's current position. Ref: LOCATION_SETUP_GUIDE.md §2. No API key.
 */
import { useState, useEffect, useCallback } from "react";

export interface CurrentLocation {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useCurrentLocation(options?: { requestOnMount?: boolean }) {
  const { requestOnMount = true } = options ?? {};
  const [state, setState] = useState<CurrentLocation>({ latitude: null, longitude: null, error: null, loading: false });

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation is not supported", loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => setState({ latitude: position.coords.latitude, longitude: position.coords.longitude, error: null, loading: false }),
      (err) => setState({ latitude: null, longitude: null, error: err.message || "Could not get location", loading: false })
    );
  }, []);

  useEffect(() => {
    if (requestOnMount && state.latitude === null && state.longitude === null && !state.loading && !state.error) requestPosition();
  }, [requestOnMount, requestPosition]);

  return { ...state, requestPosition };
}

export default useCurrentLocation;
