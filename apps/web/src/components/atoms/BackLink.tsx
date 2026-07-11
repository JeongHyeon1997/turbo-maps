'use client';

import { useRouter } from 'next/navigation';

export interface BackLinkProps {
  /** Where to go when there's no browser history to return to (e.g. a bookmarked/direct link). */
  fallbackHref: string;
  children: React.ReactNode;
}

/**
 * "‹ back" control that returns to wherever the user actually came from
 * (browser history) instead of a hard-coded route, falling back to
 * `fallbackHref` when there isn't a prior entry to go back to.
 */
export function BackLink({ fallbackHref, children }: BackLinkProps) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref as Parameters<typeof router.push>[0]);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="w-fit rounded text-sm font-medium text-text-muted transition-colors duration-200 ease-out hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {children}
    </button>
  );
}
