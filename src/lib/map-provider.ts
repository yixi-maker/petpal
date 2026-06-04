/**
 * Get the AMAP (高德地图) JS API key from environment.
 * Uses NEXT_PUBLIC_AMAP_KEY so it is available in client bundles as well.
 */
export function getAmapKey(): string | null {
  return process.env.NEXT_PUBLIC_AMAP_KEY || null;
}

/**
 * Whether AMAP integration is configured (key is present).
 * When false, the app renders a placeholder map.
 */
export function isMapAvailable(): boolean {
  return !!getAmapKey();
}

/**
 * AMAP JS SDK loader URL for the configured key.
 * Returns null when no key is set.
 */
export function getAmapSdkUrl(): string | null {
  const key = getAmapKey();
  if (!key) return null;
  return `https://webapi.amap.com/maps?v=2.0&key=${key}`;
}
