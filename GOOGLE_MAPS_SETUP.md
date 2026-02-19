# Google Maps API Key – Location & Address Autocomplete

The Admin Panel uses **Google Maps JavaScript API** and **Places API** for address autocomplete (e.g. HQ Address, Employer Address). Configure an API key and restrict it to avoid billing issues.

---

## STEP 1: Get API Key

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. **Create a new project** (or select an existing one).
3. **Enable these APIs:**
   - **Maps JavaScript API** – required for loading the Maps/Places script.
   - **Places API** – required for address autocomplete.
   - **Geocoding API** – optional; useful if you need lat/lng from addresses.
4. **Create credentials:**
   - Go to **APIs & Services → Credentials**.
   - Click **Create Credentials → API Key**.
   - Copy the API key (you will restrict it in the next step).

---

## STEP 2: Restrict the API Key (IMPORTANT)

Restricting the key limits where and which APIs can use it. **Do this to avoid unexpected billing.**

1. In **Credentials**, click your **API key** to edit it.
2. Under **Application restrictions**:
   - Choose **HTTP referrers (websites)**.
   - Add your allowed referrers, for example:
     - `http://localhost:*` (for local development)
     - `http://localhost:5173/*`
     - `https://your-admin-domain.com/*`
     - `https://*.your-domain.com/*`
3. Under **API restrictions**:
   - Choose **Restrict key**.
   - Select only:
     - **Maps JavaScript API**
     - **Places API**
     - **Geocoding API** (if you use it)
   - Do **not** leave the key unrestricted.
4. Save.

---

## STEP 3: Add the Key to the Project

1. Copy the project root `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. Restart the dev server (`npm run dev` or `yarn dev`) so Vite picks up the new env value.

---

## Behaviour in the App

- **If the key is set:** Address fields that use Places (e.g. Employer Address on Add Employer, HQ Address on Edit Employer) will show **Google Places autocomplete** (e.g. Singapore addresses).
- **If the key is missing or invalid:** Those fields fall back to **plain text input**; the app still works without autocomplete.

---

## Summary Checklist

| Step | Action |
|------|--------|
| 1 | Create project in Google Cloud Console |
| 2 | Enable **Maps JavaScript API** and **Places API** (Geocoding optional) |
| 3 | Create Credentials → API Key |
| 4 | Restrict key: **HTTP referrers** (your domain / localhost) |
| 5 | Restrict key: **APIs** → only Maps JavaScript API, Places API (and Geocoding if used) |
| 6 | Put key in `.env` as `VITE_GOOGLE_MAPS_API_KEY=...` |
| 7 | Restart dev server |

**Document version:** 1.0
