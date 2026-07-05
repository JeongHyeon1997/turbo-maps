'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    let cancelled = false;
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
            strokeColor: '#E8635C',
            strokeOpacity: 0.9,
          });
        }
        if (markers.length > 0) map.setBounds(bounds);
      })
      .catch(() => {
        /* SDK/domain not configured — map just stays blank */
      });
    return () => {
      cancelled = true;
    };
  }, [markers, route, height]);

  return (
    <div
      ref={ref}
      style={{ width: '100%', height }}
      className="overflow-hidden rounded-2xl border border-border bg-surface-alt"
    />
  );
}
