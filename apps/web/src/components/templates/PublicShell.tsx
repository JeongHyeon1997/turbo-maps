import { LandingHeader, SiteFooter } from '@/components/organisms';

/**
 * Layout shell for logged-out surfaces: landing `/`, `/privacy`, `/terms`.
 * Unlike AppShell (signed-in nav + bottom tab bar), this only offers a login CTA.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
