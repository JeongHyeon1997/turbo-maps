'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar, Button } from '@/components/atoms';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — mirrors the bucket's server-side file_size_limit (0010).
const BUCKET = 'avatars';

export interface AvatarUploaderProps {
  userId: string;
  nickname: string;
  /** OAuth-synced avatar (kakao/google), kept as the permanent fallback. */
  avatarUrl: string | null;
  /** User's own upload; null/undefined means "use avatarUrl". */
  customAvatarUrl: string | null | undefined;
}

/** Extracts the storage path from a public `avatars` bucket URL, for best-effort cleanup on revert/replace. */
function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : null;
}

/**
 * Profile avatar card: preview (custom → OAuth → initials, via the shared `Avatar`
 * atom) + "사진 변경" file picker + "카카오/구글 사진으로 되돌리기" (only shown once a
 * custom avatar is set). Uploads straight to Supabase Storage/`profiles` from the
 * browser — no server route, folder-scoped RLS does the guarding (docs/plan/11).
 *
 * Degrades safely if `profiles.custom_avatar_url` doesn't exist yet on the live DB
 * (migration `0010` pending apply): the update call just fails and surfaces the
 * error below instead of crashing the page.
 */
export function AvatarUploader({ userId, nickname, avatarUrl, customAvatarUrl }: AvatarUploaderProps) {
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(customAvatarUrl ?? avatarUrl ?? null);
  const [hasCustom, setHasCustom] = useState(Boolean(customAvatarUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File | null) => {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('5MB 이하의 이미지만 업로드할 수 있어요.');
      return;
    }

    setBusy(true);
    try {
      const safe = file.name.replace(/[^\w.-]/g, '_');
      const path = `${userId}/${crypto.randomUUID()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ custom_avatar_url: publicUrl })
        .eq('id', userId);
      if (updateErr) {
        // The profile row still points elsewhere — drop the object we just
        // uploaded so a failing update (e.g. 0010 not applied yet) doesn't
        // leak one orphan per attempt.
        void supabase.storage.from(BUCKET).remove([path]);
        throw updateErr;
      }

      // Best-effort cleanup of the replaced custom object — repeated "사진 변경"
      // would otherwise pile up orphans. `pathFromPublicUrl` returns null for
      // non-bucket URLs (OAuth CDN), so only our own objects ever get removed.
      const replaced = hasCustom && preview ? pathFromPublicUrl(preview) : null;
      if (replaced) void supabase.storage.from(BUCKET).remove([replaced]);

      setPreview(publicUrl);
      setHasCustom(true);
      router.refresh();
    } catch (e) {
      setError((e as Error).message || '업로드 중 오류가 발생했어요.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const revert = async () => {
    setError(null);
    setBusy(true);
    const previousCustomUrl = preview;
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ custom_avatar_url: null })
        .eq('id', userId);
      if (updateErr) throw updateErr;

      setPreview(avatarUrl ?? null);
      setHasCustom(false);
      router.refresh();

      // Best-effort cleanup of the now-orphaned object — failure here is fine,
      // the profile row is already reverted.
      if (previousCustomUrl) {
        const path = pathFromPublicUrl(previousCustomUrl);
        if (path) void supabase.storage.from(BUCKET).remove([path]);
      }
    } catch (e) {
      setError((e as Error).message || '되돌리는 중 오류가 발생했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar initial={nickname.slice(0, 1)} imageUrl={preview} name={nickname} size={64} />
      <div className="flex flex-col gap-2">
        <label
          aria-disabled={busy}
          className={`inline-flex h-11 w-fit items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors duration-200 ease-out focus-within:outline-none focus-within:ring-2 focus-within:ring-brand ${
            busy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-surface-alt'
          }`}
        >
          {busy ? '처리 중…' : '사진 변경'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label="프로필 사진 변경"
            className="sr-only"
            disabled={busy}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </label>

        {hasCustom && (
          <Button variant="ghost" size="md" fullWidth={false} disabled={busy} onClick={revert}>
            카카오/구글 사진으로 되돌리기
          </Button>
        )}

        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
