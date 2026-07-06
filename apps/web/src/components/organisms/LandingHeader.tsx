import { Logo, Button } from '@/components/atoms';

/** Minimal top bar for logged-out pages (landing + policy pages) — logo + login CTA only. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-divider bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Logo />
        <Button href="/login" variant="primary">
          로그인
        </Button>
      </div>
    </header>
  );
}
