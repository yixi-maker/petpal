/**
 * AMAP (高德地图) integration helpers.
 * Set NEXT_PUBLIC_AMAP_KEY and NEXT_PUBLIC_AMAP_SECURITY_JS_CODE
 * in .env.staging / .env.production to enable real maps.
 * When unconfigured, the app renders a placeholder map.
 */

export function getAmapKey(): string | null {
  return process.env.NEXT_PUBLIC_AMAP_KEY || null;
}

export function getAmapSecurityJsCode(): string | null {
  return process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE || null;
}

export function isMapAvailable(): boolean {
  return !!getAmapKey();
}

export function getAmapSdkUrl(): string | null {
  const key = getAmapKey();
  if (!key) return null;
  return `https://webapi.amap.com/maps?v=2.0&key=${key}`;
}
