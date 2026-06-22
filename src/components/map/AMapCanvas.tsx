'use client';

import { useEffect, useRef, useState } from 'react';
import { getAmapKey, getAmapSecurityJsCode } from '@/lib/map-provider';
import { MapPlaceholder } from './MapPlaceholder';

interface AMapCanvasProps {
  places: Array<{ id: number; name: string; lng: number; lat: number; type?: string }>;
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
            mapStyle: 'amap://styles/fresh',
            showLabel: true,
            features: ['bg', 'road', 'point'],
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
              content: createMarkerContent(place.type, selectedPlaceId === place.id),
              offset: new (AMap.Pixel as new (x: number, y: number) => unknown)(-18, -42),
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
          const fitView = (mapInstance as {
            setFitView?: (overlays?: unknown[], immediately?: boolean, avoid?: number[], maxZoom?: number) => void;
          }).setFitView;
          if (fitView && newMarkers.length > 1) {
            fitView.call(mapInstance, newMarkers, false, [70, 70, 260, 70], 14);
          }
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
    <div className="relative h-full w-full min-h-[300px] overflow-hidden bg-[#EAF6F4]">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_0%,transparent_54%,rgba(242,248,246,0.54)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F2F8F6]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F2F8F6]/76 to-transparent" />
    </div>
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

function createMarkerContent(type: string | undefined, selected: boolean): string {
  const labelMap: Record<string, string> = {
    HOSPITAL: '医',
    PARK: '园',
    MALL: '商',
    CAFE: '咖',
    RESTAURANT: '餐',
    GROOMING: '洗',
    BOARDING: '宿',
  };
  const label = labelMap[type || ''] || '地';
  const background = selected
    ? 'linear-gradient(145deg,#10504B,#1D8A80)'
    : 'linear-gradient(145deg,rgba(255,255,255,0.96),rgba(232,247,244,0.92))';
  const color = selected ? '#FFFFFF' : '#10504B';
  const ring = selected ? 'rgba(29,138,128,0.22)' : 'rgba(16,80,75,0.12)';
  const shadow = selected
    ? '0 16px 34px rgba(16,80,75,0.34)'
    : '0 14px 30px rgba(16,80,75,0.20)';

  return `
    <div style="
      position:relative;
      width:36px;
      height:42px;
      transform:translateZ(0);
    ">
      <div style="
        position:absolute;
        left:3px;
        top:0;
        width:30px;
        height:30px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:16px;
        border:2px solid rgba(255,255,255,0.92);
        background:${background};
        color:${color};
        box-shadow:${shadow};
        font-size:13px;
        font-weight:700;
        line-height:1;
      ">${label}</div>
      <div style="
        position:absolute;
        left:13px;
        top:26px;
        width:10px;
        height:10px;
        transform:rotate(45deg);
        border-right:2px solid rgba(255,255,255,0.92);
        border-bottom:2px solid rgba(255,255,255,0.92);
        background:${selected ? '#1D8A80' : 'rgba(232,247,244,0.96)'};
        box-shadow:7px 7px 18px rgba(16,80,75,0.14);
      "></div>
      <div style="
        position:absolute;
        left:-2px;
        top:-5px;
        width:40px;
        height:40px;
        border-radius:999px;
        background:${ring};
        filter:blur(1px);
        z-index:-1;
      "></div>
    </div>
  `;
}

// Type declaration for AMap on window
declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap?: unknown;
  }
}
