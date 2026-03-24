/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin including `/api` prefix (see REACT_ADMIN_API.md). Example: `https://api.example.com/api` */
  readonly VITE_API_URL?: string;
  /** Alias for `VITE_API_URL` — same semantics. */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}
