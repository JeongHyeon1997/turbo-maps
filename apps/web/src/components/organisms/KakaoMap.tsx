'use client';

import { useEffect, useRef, useState } from 'react';
import { accentPalette } from '@maps/tokens';
import { loadKakao } from '@/lib/kakao/loader';

export interface MapMarker {
  lat: number;
  lng: number;
  name?: string;
}

/** Kakao map rendering visited-place markers and (optionally) the route line. */
export function KakaoMap({
  markers,
  height = 260,
  route = true,
}: {
  markers: MapMarker[];
  height?: number;
  route?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    loadKakao()
      .then((kakao) => {
        if (cancelled || !ref.current) return;
        const seoul = new kakao.maps.LatLng(37.5665, 126.978);
        const first = markers[0] ? new kakao.maps.LatLng(markers[0].lat, markers[0].lng) : seoul;
        const map = new kakao.maps.Map(ref.current, { center: first, level: 5 });

        const bounds = new kakao.maps.LatLngBounds();
        const path: unknown[] = [];
        markers.forEach((m) => {
          const pos = new kakao.maps.LatLng(m.lat, m.lng);
          new kakao.maps.Marker({ map, position: pos, title: m.name });
          path.push(pos);
          bounds.extend(pos);
        });
        if (route && path.length > 1) {
          new kakao.maps.Polyline({
            map,
            path,
            strokeWeight: 4,
            strokeColor: accentPalette.coral,
            strokeOpacity: 0.9,
          });
        }
        if (markers.length > 0) map.setBounds(bounds);
        setStatus('ready');
      })
      .catch(() => {
        // SDK failed to load (missing key / domain not registered / network).
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [markers, route, height]);

  return (
    <div
      style={{ width: '100%', height }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface-alt"
    >
      <div ref={ref} className="h-full w-full" />
      {status !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-text-secondary">
          {status === 'error'
            ? '지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
            : '지도를 불러오는 중…'}
        </div>
      )}
    </div>
  );
}
