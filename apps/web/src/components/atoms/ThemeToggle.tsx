'use client';

import { useEffect, useState } from 'react';
import { applyTheme, readStoredTheme, storeTheme, type ThemePreference } from '@/lib/theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: '시스템 테마' },
  { value: 'light', label: '라이트 테마' },
  { value: 'dark', label: '다크 테마' },
];

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20h8M12 17v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" stroke="none">
      <path d="M20.5 14.7A8.5 8.5 0 1110.3 3.5a7 7 0 0010.2 11.2z" />
    </svg>
  );
}

const ICONS: Record<ThemePreference, React.ReactNode> = {
  system: <SystemIcon />,
  light: <SunIcon />,
  dark: <MoonIcon />,
};

/**
 * 3-way (system/light/dark) segmented control. Reads/writes `localStorage` and
 * flips `<html class="dark">` — see `lib/theme.ts`. Renders a neutral,
 * non-interactive shell until mounted so SSR markup never has to guess which
 * option is "active" (that guess is exactly what the `<head>` FOUC script
 * already resolved visually, just not into React state yet).
 */
export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPref(readStoredTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(pref);
    storeTheme(pref);
  }, [pref, mounted]);

  // Keep following the OS while "system" is selected (live toggle, no reload).
  useEffect(() => {
    if (!mounted || pref !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mounted, pref]);

  if (!mounted) {
    return <div className="h-8 w-[84px] rounded-full bg-surface-alt" aria-hidden="true" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="테마 선택"
      className="inline-flex items-center gap-0.5 rounded-full bg-surface-alt p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = pref === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            onClick={() => setPref(opt.value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              active
                ? 'bg-surface text-brand shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {ICONS[opt.value]}
          </button>
        );
      })}
    </div>
  );
}
