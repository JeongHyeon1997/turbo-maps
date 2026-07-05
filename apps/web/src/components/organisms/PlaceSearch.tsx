'use client';

import { useState } from 'react';
import { loadKakao } from '@/lib/kakao/loader';

export interface KakaoPlace {
  kakaoPlaceId: string;
  name: string;
  category?: string;
  address?: string;
  lat: number;
  lng: number;
}

/** Kakao keyword place search. Calls onSelect when a result is picked. */
export function PlaceSearch({ onSelect }: { onSelect: (p: KakaoPlace) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setSearching(true);
    const kakao = await loadKakao();
    const places = new kakao.maps.services.Places();
    places.keywordSearch(q, (data: Record<string, string>[], status: string) => {
      setSearching(false);
      if (status === kakao.maps.services.Status.OK) {
        setResults(
          data.map((d) => ({
            kakaoPlaceId: d.id ?? '',
            name: d.place_name ?? '',
            category: d.category_group_name || undefined,
            address: d.road_address_name || d.address_name || undefined,
            lat: parseFloat(d.y ?? '0'),
            lng: parseFloat(d.x ?? '0'),
          })),
        );
      } else {
        setResults([]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
          placeholder="장소 검색 (예: 연남동 카페)"
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={search}
          className="rounded-xl bg-surface-alt px-4 py-2.5 text-sm font-semibold text-text-primary"
        >
          검색
        </button>
      </div>

      {searching && <p className="px-1 text-xs text-text-muted">검색 중…</p>}

      {results.length > 0 && (
        <ul className="flex max-h-56 flex-col divide-y divide-divider overflow-y-auto rounded-xl border border-border">
          {results.map((r) => (
            <li key={r.kakaoPlaceId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setResults([]);
                  setQ('');
                }}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-surface"
              >
                <span className="text-sm font-medium text-text-primary">
                  {r.name}
                  {r.category ? <span className="text-text-muted"> · {r.category}</span> : null}
                </span>
                {r.address && <span className="text-xs text-text-muted">{r.address}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
