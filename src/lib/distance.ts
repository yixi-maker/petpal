/**
 * Haversine formula - returns distance in meters between two coordinates.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Converts numeric distance (meters) to fuzzy display text.
 * Rules:
 *   < 200m     →  "200m 内"
 *   200m-1km   →  "约 XXXm" (round to nearest 50m)
 *   1km-5km    →  "约 X.Xkm"
 *   5km-20km   →  "同城 · XX区附近" (requires district param)
 *   > 20km     →  "同城"
 */
export function fuzzyDistanceText(meters: number, district?: string): string {
  if (meters < 200) {
    return '200m 内';
  }

  if (meters < 1000) {
    const rounded = Math.round(meters / 50) * 50;
    return `约 ${rounded}m`;
  }

  if (meters < 5000) {
    const km = Math.round((meters / 1000) * 10) / 10;
    return `约 ${km}km`;
  }

  if (meters < 20000) {
    if (district) {
      return `同城 · ${district}附近`;
    }
    return '同城';
  }

  return '同城';
}

/**
 * Simple geo prefix: truncate lat/lng to 1 decimal place (~11km grid)
 * for coarse city-level matching.
 */
export function geoPrefix(lat: number, lng: number): string {
  return `${lat.toFixed(1)},${lng.toFixed(1)}`;
}
