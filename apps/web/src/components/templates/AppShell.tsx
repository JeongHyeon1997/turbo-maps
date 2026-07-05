import { AppHeader } from '@/components/organisms';

/**
 * Responsive app shell.
 * - mobile: single narrow column (phone-like)
 * - desktop: full-width header + wide centered content area for grids
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
