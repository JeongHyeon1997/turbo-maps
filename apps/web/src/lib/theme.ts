/**
 * 3-way theme (system / light / dark) — `.dark` on `<html>`, driven by
 * `localStorage` + `prefers-color-scheme`. Tailwind is configured with
 * `darkMode: 'class'` (see tailwind.config.ts) and the `.dark` CSS-variable
 * overrides are injected by @maps/tokens (see css-vars.ts) — this file only
 * owns the runtime toggle logic, never raw color values.
 */

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'welog-theme';

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** Whether `.dark` should be active for a given preference right now. */
export function resolveIsDark(pref: ThemePreference): boolean {
  return pref === 'dark' || (pref === 'system' && systemPrefersDark());
}

/** Flips `<html class="dark">` to match the resolved preference. No-op during SSR. */
export function applyTheme(pref: ThemePreference): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolveIsDark(pref));
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

export function storeTheme(pref: ThemePreference): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, pref);
}

/**
 * Inline script source, run from `<head>` before first paint (FOUC guard) —
 * reads `localStorage` synchronously and flips `.dark` before React hydrates.
 * Kept as a plain string (no module imports) because it must run standalone,
 * ahead of any bundle; the storage key is interpolated from the constant above
 * so it can't drift, but the 'light'/'dark'/'system' literals below are
 * hand-kept in lockstep with `ThemePreference` — this snippet can't import types.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var v=localStorage.getItem(k);var d=v==='dark'||(v!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
