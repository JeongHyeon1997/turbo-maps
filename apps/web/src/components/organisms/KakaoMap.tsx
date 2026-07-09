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
        // Clear any DOM the SDK attached from a previous init (effect re-run
        // because `markers` got a new array identity, or React StrictMode's
        // dev-only double-invoke). The SDK never removes its own tile/drag
        // layers on teardown, so without this, stale layers stack up in the
        // same container — the newest layer still renders and *looks* fine,
        // but overlapping stale layers can end up eating touch input (mouse
        // drag survives because Kakao continues it via document-level
        // mousemove regardless of which layer the mousedown landed on).
        ref.current.innerHTML = '';

        const seoul = new kakao.maps.LatLng(37.5665, 126.978);
        const first = markers[0] ? new kakao.maps.LatLng(markers[0].lat, markers[0].lng) : seoul;
        const map = new kakao.maps.Map(ref.current, {
          center: first,
          level: 5,
          // Explicit (not just relying on the SDK default) so panning/zoom
          // can't silently regress from a future SDK or config change —
          // mobile touch-drag depends on `draggable` being true.
          draggable: true,
          zoomable: true,
        });

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
      {/* Kakao's SDK owns all pointer/touch handling inside this div (pan +
          pinch-zoom) — intentionally no `touch-action` override here. Don't
          add `touch-none`/`touch-pan-y` on this node or any ancestor: the
          browser computes touch-action as the intersection across the whole
          ancestor chain, so a restrictive value set higher up (e.g. on a
          modal/bottom-sheet wrapper to block background scroll) would
          silently disable touch panning in here too, while mouse drag
          (which touch-action doesn't govern) keeps working — exactly the
          "mouse works, touch doesn't" split this component must avoid. */}
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
