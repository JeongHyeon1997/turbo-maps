/**
 * mobile ThemeProvider — RN has no CSS, so light/dark is a JS context swap
 * instead of the web's `.dark` class toggle (see docs/plan/09-mobile.md
 * "기술 결정 사항" #5). Consumes the SAME semantic layer as web
 * (`@maps/tokens` `theme.color` / `theme.colorDark`) — only the delivery
 * mechanism differs.
 *
 * Storage key mirrors the web app (`apps/web/src/lib/theme.ts` THEME_STORAGE_KEY)
 * so the "welog-theme" name stays consistent across platforms, even though the
 * storage backend (AsyncStorage vs localStorage) differs.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '@maps/tokens';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'welog-theme';

/** Resolved semantic color object — same keys as `theme.color` / `theme.colorDark`. */
export type ResolvedColors = typeof theme.color;

interface ThemeContextValue {
  /** User-selected preference (may be 'system'). */
  mode: ThemeMode;
  /** Whether dark colors are actually active right now (mode resolved against the OS setting). */
  isDark: boolean;
  /** The resolved semantic color object — `theme.color` (light) or `theme.colorDark` (dark). */
  colors: ResolvedColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load the persisted preference once on mount (falls back to 'system' — the
  // initial state already is — while the read resolves).
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (!cancelled && isThemeMode(stored)) {
        setModeState(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = isDark ? theme.colorDark : theme.color;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, colors, setMode }),
    [mode, isDark, colors, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
