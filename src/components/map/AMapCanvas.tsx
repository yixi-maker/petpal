'use client';

import { useEffect, useRef, useState } from 'react';
import { getAmapKey, getAmapSecurityJsCode } from '@/lib/map-provider';
import { MapPlaceholder } from './MapPlaceholder';

interface AMapCanvasProps {
  places: Array<{ id: number; name: string; lng: number; lat: number }>;
  city?: string;
  onPlaceClick?: (placeId: number) => void;
  selectedPlaceId?: number;
  zoom?: number;
}

export function AMapCanvas({ places, city, onPlaceClick, selectedPlaceId, zoom }: AMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [loadError, setLoadError] = useState(false);

  const key = getAmapKey();
  const securityJsCode = getAmapSecurityJsCode();

  useEffect(() => {
    if (!key || !containerRef.current) {
      setLoadError(true);
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      try {
        // Set security config before loading SDK
        if (securityJsCode && typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>)._AMapSecurityConfig = {
            securityJsCode,
          };
        }

        // Dynamic load AMAP SDK
        await loadAmapSdk(key);

        if (cancelled || !containerRef.current) return;

        const AMap = (window as unknown as Record<string, unknown>).AMap as Record<string, unknown> | undefined;
        if (!AMap) {
          setLoadError(true);
          return;
        }

        // Determine center from places or default to city center
        let center: [number, number] = [116.397428, 39.90923]; // default: Beijing
        if (places.length > 0) {
          center = [places[0].lng, places[0].lat];
        } else if (city === '上海') {
          center = [121.473701, 31.230416];
        } else if (city === '深圳') {
          center = [114.057868, 22.543099];
        }

        const mapInstance = new (AMap.Map as new (el: string | HTMLElement, opts: Record<string, unknown>) => unknown)(
          containerRef.current,
          {
            zoom: zoom || 13,
            center,
            resizeEnable: true,
          }
        );
        mapRef.current = mapInstance;

        // Add markers for each place
        const MarkerCls = (AMap.Marker as new (opts: Record<string, unknown>) => unknown) || null;
        if (MarkerCls && places.length > 0) {
          const newMarkers = places.map((place) => {
            const marker = new (AMap.Marker as new (opts: Record<string, unknown>) => unknown)({
              position: [place.lng, place.lat],
              title: place.name,
              icon: selectedPlaceId === place.id
                ? 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
                : 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
              offset: new (AMap.Pixel as new (x: number, y: number) => unknown)(-12, -32),
            });

            if (onPlaceClick) {
              (marker as { on: (event: string, cb: () => void) => void }).on('click', () => {
                onPlaceClick(place.id);
              });
            }

            (mapInstance as { add: (m: unknown) => void }).add(marker);
            return marker;
          });
          markersRef.current = newMarkers;
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      // Cleanup markers
      const map = mapRef.current as { remove?: (m: unknown) => void; destroy?: () => void } | null;
      const markers = markersRef.current;
      if (map && markers) {
        markers.forEach((m) => {
          try { map.remove?.(m); } catch { /* ignore */ }
        });
      }
      if (map) {
        try { map.destroy?.(); } catch { /* ignore */ }
      }
    };
  }, [key, securityJsCode, city, places, onPlaceClick, selectedPlaceId, zoom]);

  if (!key || loadError) {
    return <MapPlaceholder />;
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px]" />
  );
}

// ---- AMAP SDK dynamic loader ----

const amapLoadPromise = new Map<string, Promise<void>>();

function loadAmapSdk(key: string): Promise<void> {
  const existing = amapLoadPromise.get(key);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).AMap) {
      resolve();
      return;
    }

    // Check if script already loading
    const existingScript = document.querySelector(`script[src*="webapi.amap.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('AMap SDK load failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AMap SDK load failed'));
    document.head.appendChild(script);
  });

  amapLoadPromise.set(key, promise);
  return promise;
}

// Type declaration for AMap on window
declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap?: unknown;
  }
}
