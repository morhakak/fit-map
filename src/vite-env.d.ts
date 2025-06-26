/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_DATA_API_BASE: string;
  readonly VITE_DATA_API_SOURCE_ID: string;
  readonly VITE_NOMINATIM_API_BASE: string;
  readonly VITE_OSM_USER_AGENT: string;
}
