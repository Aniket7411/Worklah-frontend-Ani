# Location Fetch & Add – Setup Guide

This document describes how location is **fetched** (user’s current position) and **added** (address search/autocomplete) in this project, so you can reuse it in another project.

---

## 1. Address search & add (Google Places Autocomplete)

Addresses are added via **Google Places Autocomplete**: user types an address, selects a suggestion, and the app gets full address, coordinates, and parsed fields (city, state, postcode).

### 1.1 Package

```bash
npm install @react-google-maps/api
```

- **Package:** `@react-google-maps/api` (version `^2.20.6` in this project)
- **Used for:** `useLoadScript` and `Autocomplete` (Places only; no map required)

### 1.2 API key

- **Service:** Google Maps Platform → **Places API** (and **Maps JavaScript API** for the script).
- **Key used in this project:**  
  `AIzaSyDqtaMGsIB-4GbnBjdpfzNTlEBXviBd3zM`  
  (stored in `src/components/mapsearch/index.jsx`; better to move to env in a new project.)

**Get a key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project.
3. Enable **Maps JavaScript API** and **Places API**.
4. Create an API key under **APIs & Services → Credentials**.
5. (Recommended) Restrict the key by HTTP referrer for your domains.

**Use via environment variable (recommended for other projects):**

- In `.env`:
  ```env
  REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
  ```
- In code:
  ```js
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  ```

### 1.3 Component usage

The reusable component lives in:

- **Path:** `src/components/mapsearch/index.jsx`

**Props:**

| Prop            | Type     | Description |
|-----------------|----------|-------------|
| `setJobDetails` | function | Callback that receives the parsed address and coordinates. |
| `type`          | string   | One of: `"job"`, `"course"`, `"employerProfile"`, `"employeeProfile"`. Changes which fields are passed to `setJobDetails`. |
| `jobDetails`    | object   | Optional; used for placeholder (e.g. current job location). |

**Load script (inside the component):**

```js
const { isLoaded, loadError } = useLoadScript({
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // or process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  libraries: ["places"],
});
```

**Autocomplete options:**

```js
options={{
  componentRestrictions: { country: "UK" },
  types: ["address"],
}}
```

- `country: "UK"` restricts suggestions to the United Kingdom. Omit or change for other countries.
- `types: ["address"]` restricts to address-like results. Alternatives: `["geocode"]` for broader location types.

**What the component returns via `setJobDetails`:**

From the selected place it reads:

- `place.geometry.location` → **latitude**, **longitude**
- `place.formatted_address` → full **address** string
- `place.address_components` → **postal_code**, **locality** (city), **administrative_area_level_1** (state)

So after selection you get at least:

- `address` / `location` / `jobAddress` (formatted address)
- `latitude`, `longitude`
- `city` (from locality/postal_town/administrative_area_level_2)
- `state` (from administrative_area_level_1)
- `postalCode` (from postal_code)

Exact field names depend on `type` (job, course, employerProfile, employeeProfile); see `mapsearch/index.jsx` for the exact shape for each type.

### 1.4 Example: using the component in another project

```jsx
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

// Minimal usage: one input that fills address + lat/lng
const { isLoaded, loadError } = useLoadScript({
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  libraries: ["places"],
});

const autocompleteRef = useRef(null);
const [address, setAddress] = useState({ address: "", latitude: null, longitude: null });

const onPlaceChanged = () => {
  const place = autocompleteRef.current?.getPlace?.() || {};
  if (!place.geometry || !place.address_components) return;
  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
  setAddress({
    address: place.formatted_address || "",
    latitude: lat,
    longitude: lng,
  });
};

if (loadError) return <div>Error loading maps</div>;
if (!isLoaded) return <div>Loading...</div>;

return (
  <Autocomplete
    onLoad={(ref) => (autocompleteRef.current = ref)}
    onPlaceChanged={onPlaceChanged}
    options={{ componentRestrictions: { country: "UK" }, types: ["address"] }}
  >
    <input
      type="text"
      placeholder="Enter address"
      className="w-full border rounded p-2"
    />
  </Autocomplete>
);
```

---

## 2. User’s current location (browser geolocation)

The **current position** (latitude/longitude) is obtained with the browser’s Geolocation API. No API key is required.

### 2.1 Where it’s used

- **Find Jobs:** `src/pages/FindJobs/index.jsx` – to filter jobs by distance from the user.
- **Courses:** `src/pages/courses/index.jsx` – same idea for course listings.

### 2.2 How it’s implemented

**State:**

```js
const [location, setLocation] = useState({
  latitude: null,
  longitude: null,
});
```

**Request position (e.g. in `useEffect`):**

```js
if (location.latitude === null && location.longitude === null && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (err) => {
      setError(err.message);
      // Optional: toast or message asking user to enable location
    }
  );
}
```

**Notes:**

- Requires **HTTPS** (or localhost) in production.
- User must grant location permission when prompted.
- No API key; purely browser API.

### 2.3 How coordinates are sent to the backend

In **Find Jobs**, jobs are fetched with a distance filter:

**Endpoint:** `GET /jobs/job-posts/`

**Query params (relevant part):**

```js
distanceRange: location.latitude && location.longitude && distanceRange
  ? { lat: location.latitude, lng: location.longitude, range: distanceRange }
  : undefined
```

- `lat`, `lng`: user’s current position.
- `range`: distance in km (e.g. 2, 5, 10, 30, 80, 100, 150, 300).

So in another project, if your backend supports “jobs within X km of (lat, lng)”, you can send the same shape: `{ lat, lng, range }`.

---

## 3. Checklist for applying in another project

**Address add (Google Places):**

1. Install: `npm install @react-google-maps/api`
2. Create a key in Google Cloud; enable **Maps JavaScript API** and **Places API**
3. Add key to env: `REACT_APP_GOOGLE_MAPS_API_KEY=...`
4. Copy or adapt `src/components/mapsearch/index.jsx`, or use the minimal Autocomplete example above
5. Adjust `componentRestrictions` and `types` if you need a different country or place type

**Current location (geolocation):**

1. Use `navigator.geolocation.getCurrentPosition` (no key)
2. Store `latitude` and `longitude` in state
3. Send them to your backend in whatever format it expects (e.g. `{ lat, lng, range }` for distance filter)

**Key reference:**

| Purpose              | Key / API              | Where to set |
|----------------------|------------------------|--------------|
| Address autocomplete | Google Maps/Places key  | `.env`: `REACT_APP_GOOGLE_MAPS_API_KEY` |
| Current location     | None (browser API)     | —            |

---

## 4. Files reference (this project)

| File | Role |
|------|------|
| `src/components/mapsearch/index.jsx` | Google Places Autocomplete; address add and lat/lng/city/state/postcode |
| `src/pages/AddJobdetails/index.jsx`  | Uses MapSearch for job location (`type="job"`) |
| `src/pages/userprofile/index.jsx`   | Uses MapSearch for user address (`type="employeeProfile"`) |
| `src/pages/personalinfo/index.jsx`  | Uses MapSearch for employer address (`type="employerProfile"`) |
| `src/pages/newcourse/index.jsx`     | Uses MapSearch for course address (`type="course"`) |
| `src/pages/FindJobs/index.jsx`      | Browser geolocation + `distanceRange` in job list API |
| `src/pages/courses/index.jsx`       | Browser geolocation + distance filter for courses |

**Admin panel (this repo):** Use `VITE_GOOGLE_MAPS_API_KEY` in `.env`; optional reusable components: `src/components/location/AddressAutocomplete.tsx` (Places), `src/hooks/useCurrentLocation.ts` (geolocation). See §5 for Native.

**Single reference for Backend + Native:** See **`LOCATION_BACKEND_AND_NATIVE.md`** for what the backend must support, what native must implement, and the shared API contract.

---

## 5. Using location in a Native app (React Native / mobile)

**Do you need to use this in Native as well?**  
Yes, if your native app needs address search or current location. The web setup above is for browsers only. In a native app you use different APIs:

| Feature | Web (this guide) | Native (React Native / Expo) |
|--------|------------------|------------------------------|
| **Address autocomplete** | Google Maps JavaScript API + Places | Google Places SDK + e.g. `react-native-google-places-autocomplete` (native API key). |
| **Current location** | Browser `navigator.geolocation` | `expo-location` or `react-native-geolocation-service`; request permission. |

Your backend (e.g. distance filter with `{ lat, lng, range }`) can stay the same; only the client that sends coordinates changes from browser to native.

If you want, the next step can be a small copy-paste component and `.env.example` tailored for your other project’s stack.
