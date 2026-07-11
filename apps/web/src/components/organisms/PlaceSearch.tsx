'use client';

import { useState } from 'react';
import { loadKakao } from '@/lib/kakao/loader';
import { TextField } from '@/components/atoms';

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
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!q.trim()) return;
    setSearching(true);
    setSearched(false);
    setError(null);
    try {
      const kakao = await loadKakao();
      const places = new kakao.maps.services.Places();
      places.keywordSearch(q, (data: Record<string, string>[], status: string) => {
        setSearching(false);
        setSearched(true);
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
    } catch {
      setSearching(false);
      setSearched(true);
      setResults([]);
      setError('검색 기능을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <TextField
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSearched(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
          placeholder="장소 검색 (예: 연남동 카페)"
          aria-label="장소 검색"
          className="flex-1"
        />
        <button
          type="button"
          onClick={search}
          className="h-14 shrink-0 rounded-lg bg-surface-alt px-4 text-sm font-semibold text-text-primary transition-all duration-200 ease-out hover:bg-border-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.97]"
        >
          검색
        </button>
      </div>

      {searching && <p className="px-1 text-xs text-text-muted">검색 중…</p>}

      {!searching && error && <p className="px-1 text-xs text-danger">{error}</p>}

      {!searching && !error && searched && results.length === 0 && (
        <p className="px-1 text-xs text-text-muted">검색 결과가 없어요. 다른 검색어로 시도해보세요.</p>
      )}

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
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors duration-200 ease-out hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
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
