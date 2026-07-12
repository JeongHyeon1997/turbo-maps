'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applyTheme, readStoredTheme, storeTheme, type ThemePreference } from '@/lib/theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: '시스템 테마' },
  { value: 'light', label: '라이트 테마' },
  { value: 'dark', label: '다크 테마' },
];

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20h8M12 17v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
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
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" stroke="none">
      <path d="M20.5 14.7A8.5 8.5 0 1110.3 3.5a7 7 0 0010.2 11.2z" />
    </svg>
  );
}

/** Small affordance on the mobile trigger signalling "taps open a menu" (vs. the old cycle button). */
function CaretIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Marks the currently-selected option inside the popover menu. */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<ThemePreference, React.ReactNode> = {
  system: <SystemIcon />,
  light: <SunIcon />,
  dark: <MoonIcon />,
};

const PREF_LABEL: Record<ThemePreference, string> = {
  system: '시스템 테마',
  light: '라이트 테마',
  dark: '다크 테마',
};

/**
 * 3-way (system/light/dark) theme control, rendered as two responsive variants that share
 * state: the full **segmented control** on desktop (`md+`, always expanded — a 3-segment pill
 * already shows what's selected/available) and a **trigger + anchored popover** on mobile
 * (`< md`). The compact single-button cycle that shipped in 07 overflowed 320px if grown inline
 * and hid state behind a blind tap-to-cycle gesture; the popover keeps the header width fixed
 * (overlay, not inline growth) while making the label + checkmark explicit
 * (DESIGN.md "ThemeToggle — 확장형 3-way", 2026-07-12).
 *
 * Reads/writes `localStorage` and flips `<html class="dark">` — see `lib/theme.ts`. Renders a
 * neutral, non-interactive shell (for both variants) until mounted so SSR markup never has to
 * guess which option is "active" (that guess is exactly what the `<head>` FOUC script already
 * resolved visually, just not into React state yet).
 *
 * Desktop segments are a **44×44 touch target** each (DESIGN.md accessibility floor) — the icon
 * itself stays small and centered, the button hit-area is what's enlarged. Uses `role="group"` +
 * `aria-pressed` per-button (a plain toggle group) rather than a `radiogroup`/roving-tabindex
 * pattern, since a 3-item segmented control reads and operates more simply as independent
 * pressable toggles than as ARIA radios needing arrow-key navigation.
 *
 * The mobile popover, by contrast, *is* a `role="menu"` of `menuitemradio`s with roving
 * Up/Down-arrow focus, because it only reveals on demand and needs the fuller ARIA menu
 * semantics (closes on outside tap / Escape / tab-out) that a toggle group doesn't.
 */
export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const closeAndFocusTrigger = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Shared "did this event happen outside the trigger/menu" check for both close-on-outside
  // effects below (pointer taps and focus moving away via Tab).
  const isOutside = useCallback((target: Node) => {
    return !menuRef.current?.contains(target) && !triggerRef.current?.contains(target);
  }, []);

  // Entrance transition: mount collapsed (opacity-0 scale-95), then flip to the settled state
  // two frames later so the CSS transition always has something to animate from — a single rAF
  // can still land in the same paint as the initial styles on some browsers and get skipped.
  // Closing is an instant unmount (menuitemradios must not be tab-reachable while hidden).
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open]);

  // Outside-tap close + tab-out close, sharing the isOutside check above.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (isOutside(event.target as Node)) setOpen(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open, isOutside]);

  // Focus the currently-active option as soon as the popover opens, and make it the sole
  // roving-tabindex stop (the other two options become tabIndex=-1 — see the item map below).
  useEffect(() => {
    if (!open) return;
    const activeIndex = OPTIONS.findIndex((opt) => opt.value === pref);
    const index = activeIndex >= 0 ? activeIndex : 0;
    setFocusedIndex(index);
    itemRefs.current[index]?.focus();
  }, [open, pref]);

  if (!mounted) {
    return (
      <>
        {/* Compact mobile shell: 44×44 trigger button. */}
        <div className="h-11 w-11 rounded-full bg-surface-alt md:hidden" aria-hidden="true" />
        {/* Desktop shell: 3 × 44px buttons + 2 × 2px gaps + 2 × 2px padding = 140×48. */}
        <div
          className="hidden h-12 w-[140px] rounded-full bg-surface-alt md:block"
          aria-hidden="true"
        />
      </>
    );
  }

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocusTrigger();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + delta + OPTIONS.length) % OPTIONS.length;
      setFocusedIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <>
      <div className="relative md:hidden">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`테마 선택, 현재 ${PREF_LABEL[pref]}`}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center gap-0.5 rounded-full bg-surface-alt text-text-secondary transition-all duration-200 ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {ICONS[pref]}
          <CaretIcon />
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="테마 선택"
            onKeyDown={handleMenuKeyDown}
            className={`absolute right-0 top-full z-20 mt-2 min-w-[180px] origin-top-right rounded-2xl bg-surface p-1 shadow-lg transition duration-200 ease-out motion-reduce:scale-100 motion-reduce:transition-opacity dark:border dark:border-border-strong ${
              entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {OPTIONS.map((opt, index) => {
              const active = pref === opt.value;
              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onFocus={() => setFocusedIndex(index)}
                  onClick={() => {
                    setPref(opt.value);
                    closeAndFocusTrigger();
                  }}
                  className={`flex w-full min-h-11 items-center gap-2 rounded-xl px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    active
                      ? 'text-brand'
                      : 'text-text-secondary hover:bg-surface-alt'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center">{ICONS[opt.value]}</span>
                  <span className="flex-1 text-sm">{opt.label}</span>
                  {active && <CheckIcon />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        role="group"
        aria-label="테마 선택"
        className="hidden items-center gap-0.5 rounded-full bg-surface-alt p-0.5 md:inline-flex"
      >
        {OPTIONS.map((opt) => {
          const active = pref === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              aria-label={opt.label}
              onClick={() => setPref(opt.value)}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
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
    </>
  );
}
