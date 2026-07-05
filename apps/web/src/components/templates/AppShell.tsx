import { AppHeader, BottomNav } from '@/components/organisms';

/**
 * Responsive app shell.
 * - mobile: single narrow column + fixed bottom tab bar
 * - desktop: full-width header nav + wide centered content area
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
