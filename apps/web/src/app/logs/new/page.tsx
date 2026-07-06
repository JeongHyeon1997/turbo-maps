'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { KakaoMap, PlaceSearch, type KakaoPlace, type MapMarker } from '@/components/organisms';
import { RatingInput } from '@/components/atoms';
import { PhotoThumb } from '@/components/molecules';

interface Selected extends KakaoPlace {
  rating: number;
}

export default function NewLogPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Set default date on the client only — using new Date() during SSR would
  // mismatch the client on hydration.
  const [date, setDate] = useState('');
  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
    // Redirect to login if not signed in (don't let the form fill then fail).
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login');
    });
  }, [supabase, router]);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [places, setPlaces] = useState<Selected[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPickCover = (file: File | null) => {
    setCover(file);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const onPickPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setPhotos((prev) => [...prev, ...list]);
    setPhotoPreviews((prev) => [...prev, ...list.map((f) => URL.createObjectURL(f))]);
  };
  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const markers: MapMarker[] = places.map((p) => ({ lat: p.lat, lng: p.lng, name: p.name }));

  const addPlace = (p: KakaoPlace) => {
    if (places.some((x) => x.kakaoPlaceId === p.kakaoPlaceId)) return;
    setPlaces((prev) => [...prev, { ...p, rating: 0 }]);
  };
  const removePlace = (id: string) => setPlaces((prev) => prev.filter((p) => p.kakaoPlaceId !== id));
  const setRating = (id: string, rating: number) =>
    setPlaces((prev) => prev.map((p) => (p.kakaoPlaceId === id ? { ...p, rating } : p)));

  const save = async () => {
    setError(null);
    if (places.length === 0) return setError('장소를 하나 이상 추가해주세요.');
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // Ensure the user has a couple (auto-create a pending one if solo).
      let { data: couple } = await supabase
        .from('couples')
        .select('id')
        .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
        .maybeSingle();
      if (!couple) {
        const { data: created, error: cErr } = await supabase
          .from('couples')
          .insert({ created_by: user.id, partner_a: user.id })
          .select('id')
          .single();
        if (cErr) throw cErr;
        couple = created;
      }

      // Upsert each place (dedupe by kakao id) → collect place ids.
      const placeIds: string[] = [];
      for (const p of places) {
        const { data: pl, error: pErr } = await supabase
          .from('places')
          .upsert(
            {
              kakao_place_id: p.kakaoPlaceId,
              name: p.name,
              category: p.category ?? null,
              address: p.address ?? null,
              lat: p.lat,
              lng: p.lng,
            },
            { onConflict: 'kakao_place_id' },
          )
          .select('id')
          .single();
        if (pErr) throw pErr;
        placeIds.push(pl.id);
      }

      // Upload cover photo to the user's folder (matches storage RLS).
      let coverPath: string | null = null;
      if (cover) {
        const safe = cover.name.replace(/[^\w.-]/g, '_');
        coverPath = `${user.id}/${crypto.randomUUID()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from('date-photos')
          .upload(coverPath, cover, { upsert: true, contentType: cover.type });
        if (upErr) throw upErr;
      }

      // Upload gallery photos (best-effort — keep whichever succeed, note failures).
      const photoPaths: string[] = [];
      let photoUploadFailures = 0;
      for (const file of photos) {
        const safe = file.name.replace(/[^\w.-]/g, '_');
        const path = `${user.id}/${crypto.randomUUID()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from('date-photos')
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) {
          photoUploadFailures += 1;
        } else {
          photoPaths.push(path);
        }
      }

      const { data: log, error: lErr } = await supabase
        .from('date_logs')
        .insert({
          couple_id: couple!.id,
          author_id: user.id,
          date,
          title: title || null,
          memo: memo || null,
          cover_photo_path: coverPath,
          visibility: isPublic ? 'public' : 'private',
        })
        .select('id')
        .single();
      if (lErr) throw lErr;

      const { error: dlpErr } = await supabase.from('date_log_places').insert(
        places.map((p, i) => ({
          date_log_id: log.id,
          place_id: placeIds[i],
          visit_order: i,
          rating: p.rating || null,
        })),
      );
      if (dlpErr) throw dlpErr;

      await supabase
        .from('routes')
        .insert({ date_log_id: log.id, coordinates: places.map((p) => ({ lat: p.lat, lng: p.lng })) });

      if (photoPaths.length > 0) {
        const { error: photosErr } = await supabase.from('date_log_photos').insert(
          photoPaths.map((path, i) => ({
            date_log_id: log.id,
            storage_path: path,
            sort_order: i,
          })),
        );
        if (photosErr) throw photosErr;
      }

      if (photoUploadFailures > 0) {
        setError(`사진 ${photoUploadFailures}장 업로드에 실패했어요. 나머지 기록은 저장되었습니다.`);
        setSaving(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (e) {
      setError((e as Error).message ?? '저장 중 오류가 발생했어요.');
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text-primary">데이트 기록</h1>
        <button onClick={() => router.push('/')} className="text-sm text-text-muted">
          취소
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-secondary">날짜</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-secondary">제목</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 연남동 나들이"
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">대표 사진</span>
        <label className="flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface">
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="대표 사진 미리보기" className="h-40 w-full object-cover" />
          ) : (
            <span className="py-10 text-sm text-text-muted">사진 추가 (선택)</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickCover(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">사진</span>
        <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-6 text-sm text-text-muted">
          사진 추가 (여러 장 선택 가능)
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPickPhotos(e.target.files)}
          />
        </label>
        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photoPreviews.map((src, i) => (
              <PhotoThumb key={src} src={src} onRemove={() => removePhoto(i)} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">방문한 곳</span>
        <PlaceSearch onSelect={addPlace} />
        {places.length > 0 && (
          <ul className="flex flex-col gap-2">
            {places.map((p, i) => (
              <li
                key={p.kakaoPlaceId}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">
                      {i + 1}. {p.name}
                    </span>
                    {p.address && <span className="text-xs text-text-muted">{p.address}</span>}
                  </div>
                  <button
                    onClick={() => removePlace(p.kakaoPlaceId)}
                    className="text-xs text-text-muted"
                  >
                    삭제
                  </button>
                </div>
                <RatingInput value={p.rating} onChange={(v) => setRating(p.kakaoPlaceId, v)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {places.length > 0 && <KakaoMap markers={markers} />}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-secondary">메모</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="그날의 기억을 적어보세요"
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </label>

      <label className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <span className="flex flex-col">
          <span className="text-sm font-medium text-text-primary">탐색에 공개</span>
          <span className="text-xs text-text-muted">
            다른 커플이 장소·평점을 볼 수 있어요 (개인 메모는 비공개)
          </span>
        </span>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-5 w-5 accent-brand"
        />
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? '저장 중…' : '기록 저장'}
      </button>
    </main>
  );
}
