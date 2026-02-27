# Location: Backend & Native – Single Reference

This document is the **single reference** for:
- **Backend:** what the API should support and whether any changes are needed.
- **Native app:** what to implement for address and current location so it works with the same backend.

The **admin panel (web)** already uses address autocomplete and can use current location; it sends the same payloads described below.

---

## 1. Do we need to update backend and native?

| Layer | Update needed? | Summary |
|-------|----------------|--------|
| **Backend** | **Only if** it does not yet accept the fields or endpoints below. Many backends already store address strings and optional lat/lng; distance filter is optional. | §2 |
| **Native** | **Yes**, if the app should support address search or “jobs near me”. Implement address autocomplete and geolocation, then call the same APIs as web. | §3 |

---

## 2. Backend

### 2.1 What the backend should accept (no change if already present)

**Address (stored as strings)**  
- Jobs: `location`, `locationDetails`, `outletAddress` (or from linked outlet: `outlet.address`).  
- Employers: `hqAddress`.  
- Outlets: `address` (or `outletAddress`).  
- Optional: `latitude`, `longitude` on job/outlet if you want to support distance search or maps later.

**Payload shape (examples)**  
- Create/update job: include `location` (required in many specs), `locationDetails`, and either `outletId` or `outletAddress`.  
- Create/update employer: `hqAddress`.  
- Create/update outlet: `address`.

No backend change is required if you already accept these string fields. Optionally, you can add `latitude` and `longitude` to job/outlet for future distance/map features.

### 2.2 Distance filter (optional backend feature)

If you want “jobs near me” (web or native):

**Endpoint (example):** `GET /jobs` or `GET /jobs/job-posts` (or your existing job list endpoint).

**Query or body (same contract for web and native):**

```json
{
  "lat": 1.3521,
  "lng": 103.8198,
  "range": 10
}
```

- `lat`, `lng`: user’s current position (required when distance filter is used).  
- `range`: distance in **km** (e.g. 2, 5, 10, 30, 80, 100, 150, 300).

Backend returns jobs within `range` km of `(lat, lng)`. If your backend already supports this, no change. If not, add this filter (e.g. geo query or Haversine) and document the same contract above.

### 2.3 Backend checklist

- [ ] Accept/store address strings: job `location` / `locationDetails` / `outletAddress`, employer `hqAddress`, outlet `address`.
- [ ] (Optional) Accept/store `latitude`, `longitude` on job or outlet.
- [ ] (Optional) Job list endpoint supports distance filter with `lat`, `lng`, `range` (same shape for web and native).

---

## 3. Native app

### 3.1 What to implement

Use the **same API contract** as web (same request/response shapes). Only the way you get address and coordinates changes.

| Feature | Web (admin / other web app) | Native (React Native / Expo) |
|--------|-----------------------------|------------------------------|
| **Address autocomplete** | Google Maps JavaScript API + Places (`@react-google-maps/api` or `use-places-autocomplete`) | Google Places SDK (Android/iOS) or e.g. `react-native-google-places-autocomplete` (separate native API key/config). |
| **Current location** | `navigator.geolocation.getCurrentPosition` | `expo-location` or `react-native-geolocation-service`; request location permission. |

### 3.2 Address flow (native)

1. User types in address field → show suggestions (Places SDK or `react-native-google-places-autocomplete`).  
2. On place select → get `formatted_address` and optionally `latitude`, `longitude`, `postal_code`, etc.  
3. Send to backend the **same fields** as web: e.g. `location` / `locationDetails` / `outletAddress` (string), and optionally `latitude`, `longitude` if your API accepts them.

No new backend contract; native just sends the same payloads.

### 3.3 Current location / “jobs near me” (native)

1. Request location permission (e.g. `expo-location` or `react-native-geolocation-service`).  
2. Get current position → `latitude`, `longitude`.  
3. Call job list API with the **same distance filter** as web:

```js
// Same shape as web
{ lat: latitude, lng: longitude, range: 10 }  // range in km
```

Backend already supports this if it supports the web distance filter; no separate “native” API.

### 3.4 Native checklist

- [ ] Add Google Places (or equivalent) for address autocomplete; on select, send same address/lat/lng fields as web.  
- [ ] Add geolocation (e.g. `expo-location`); on “Use my location” or similar, send `lat`, `lng` (and `range` if applicable) to the same job list endpoint as web.  
- [ ] Use same API base URL and auth as web (env/config).  
- [ ] Do **not** invent new query params; use the same `lat`, `lng`, `range` contract as in §2.2.

---

## 4. Single API contract (backend + web + native)

### 4.1 Create/update job (address)

- **Fields (examples):** `location`, `locationDetails`, `outletAddress` (or `outletId`). Optional: `latitude`, `longitude`.  
- **Same** for web admin and native (if native posts/edits jobs).

### 4.2 Create/update employer / outlet (address)

- **Employer:** `hqAddress`.  
- **Outlet:** `address` (or `outletAddress`).  
- **Same** for web and native.

### 4.3 List jobs with distance filter (optional)

- **Input:** `lat`, `lng`, `range` (km).  
- **Same** for web (browser geolocation) and native (expo-location or similar).  
- Backend returns jobs within `range` km of `(lat, lng)`.

---

## 5. Summary

| Question | Answer |
|----------|--------|
| **Update backend?** | Only if it doesn’t already accept the address fields (§2.1) or the distance filter (§2.2). If it does, no change. |
| **Update native?** | Yes, if you want address autocomplete or “jobs near me”: implement Places + geolocation and use the **same** API contract as web (§3, §4). |
| **Single doc for both?** | This document: backend (§2), native (§3), shared contract (§4). |

Use this as the single reference for backend and native; no separate backend-only or native-only location doc is required.
