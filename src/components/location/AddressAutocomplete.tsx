import React, { useRef, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";

export interface AddressResult {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (result: AddressResult) => void;
  placeholder?: string;
  country?: string;
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
  id?: string;
}

const libraries: ("places")[] = ["places"];

function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]) {
  let city: string | undefined, state: string | undefined, postalCode: string | undefined;
  for (const c of components) {
    if (c.types.includes("postal_code")) postalCode = c.long_name;
    if (c.types.includes("administrative_area_level_1")) state = c.long_name;
    if (c.types.includes("locality")) city = c.long_name;
    else if (c.types.includes("postal_town")) city = city || c.long_name;
    else if (c.types.includes("administrative_area_level_2")) city = city || c.long_name;
  }
  return { city, state, postalCode };
}

export function AddressAutocomplete(props: AddressAutocompleteProps) {
  const {
    value,
    onChange,
    onPlaceSelect,
    placeholder = "Start typing address...",
    country = "sg",
    disabled = false,
    className,
    multiline = false,
    rows = 2,
    id,
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey || "", libraries });

  const defaultClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none";

  // Use Places Autocomplete whenever script + key are ready.
  // Even if multiline is requested, we still attach autocomplete to a single-line input element,
  // so that Google can render its dropdown suggestions correctly below the field.
  const usePlacesAutocomplete = isLoaded && !loadError && !!apiKey;

  useEffect(() => {
    if (!usePlacesAutocomplete || !inputRef.current) return;

    const timeoutId = window.setTimeout(() => {
      if (!inputRef.current || typeof google === "undefined" || !google.maps?.places?.Autocomplete) return;
      if (autocompleteInstanceRef.current) return;

      try {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: country.toLowerCase() },
          types: ["address"],
          fields: ["formatted_address", "geometry", "address_components"],
        });
        const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) return;
          const lat =
            typeof place.geometry.location.lat === "function"
              ? place.geometry.location.lat()
              : (place.geometry.location as unknown as { lat: number }).lat;
          const lng =
            typeof place.geometry.location.lng === "function"
              ? place.geometry.location.lng()
              : (place.geometry.location as unknown as { lng: number }).lng;
          const address = place.formatted_address || "";
          const parsed =
            place.address_components?.length ? parseAddressComponents(place.address_components) : {};
          onChange(address);
          onPlaceSelect?.({ address, latitude: lat, longitude: lng, ...parsed });
        });
        autocompleteInstanceRef.current = autocomplete;
        listenerRef.current = listener;
      } catch {
        autocompleteInstanceRef.current = null;
        listenerRef.current = null;
      }
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
      if (listenerRef.current && typeof google !== "undefined" && google.maps?.event) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      autocompleteInstanceRef.current = null;
    };
  }, [usePlacesAutocomplete, country, onChange, onPlaceSelect]);

  if (loadError || !apiKey) {
    if (multiline)
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={className ?? defaultClass}
          id={id}
        />
      );
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className ?? defaultClass}
        id={id}
      />
    );
  }

  if (!isLoaded) {
    const fallbackClass = className ?? defaultClass;
    if (multiline)
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={fallbackClass}
          id={id}
        />
      );
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={fallbackClass}
        id={id}
      />
    );
  }

  const inputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    disabled,
    className: className ?? defaultClass,
    id,
  };

  // When Places is available, always use a single-line input with autocomplete attached.
  if (usePlacesAutocomplete) {
    return <input ref={inputRef} type="text" {...inputProps} />;
  }

  // Fallback: plain textarea or input without Places.
  if (multiline) {
    return <textarea {...inputProps} rows={rows} />;
  }

  return <input type="text" {...inputProps} />;
}

export default AddressAutocomplete;
