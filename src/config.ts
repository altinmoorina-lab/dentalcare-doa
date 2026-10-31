import Constants from "expo-constants";
import { Platform } from "react-native";

export const API_PORT = 4871;

const PRIVATE_HOST = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[?::1\]?|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[^.]+\.local)$/;

/**
 * `null` means "no reviews API": a deployed web build (e.g. on Vercel) without
 * EXPO_PUBLIC_API_URL. The app then keeps reviews in this browser's localStorage.
 */
function resolveApiUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (Platform.OS === "web") {
    const loc = typeof window !== "undefined" ? window.location : undefined;
    if (!loc || !PRIVATE_HOST.test(loc.hostname)) return null;
    return `${loc.protocol}//${loc.hostname}:${API_PORT}`;
  }

  // In Expo Go / dev builds the Metro host is the dev machine's LAN IP, which is
  // also where the API runs when started with `npm run dev`.
  const cfg = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    expoGoConfig?: { debuggerHost?: string };
  };
  const hostUri = cfg.expoConfig?.hostUri ?? cfg.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(":")[0];
  const isTunnel = !!host && /(exp\.direct|ngrok|loca\.lt|trycloudflare)/.test(host);
  if (host && !isTunnel) return `http://${host}:${API_PORT}`;

  return `http://${Platform.OS === "android" ? "10.0.2.2" : "localhost"}:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
