// ─────────────────────────────────────────────────────────────────────────────
// Runtime config — reads from Expo public env variables with sensible fallbacks
// Set EXPO_PUBLIC_API_URL in your .env file (e.g. http://192.168.1.x:5001)
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.3:5001";

export const SOCKET_URL: string =
  process.env.EXPO_PUBLIC_SOCKET_URL ?? API_BASE_URL;

export const MAPS_API_KEY: string =
  process.env.EXPO_PUBLIC_MAPS_API_KEY ?? "";

export const ENV: "development" | "staging" | "production" =
  (process.env.EXPO_PUBLIC_ENV as "development" | "staging" | "production") ??
  "development";

export const IS_DEV = ENV === "development";
