import { Button } from '@/components/atoms';

/** Marketing hero shown to logged-out visitors on `/`. Warm gradient built from brand/surface tokens. */
export function LandingHero() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-background to-brand/10 px-6 py-16 text-center md:px-12 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">We Log</p>
      <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-text-primary md:text-5xl">
        우리가 함께한 순간을,
        <br className="hidden md:block" /> 지도 위에 기록해요
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
        커플이 함께 다닌 데이트·맛집·경로를 기록하고 함께 되돌아보는 공간이에요.
      </p>
      <div className="mt-8 flex justify-center">
        <Button href="/login" variant="primary">
          로그인하고 시작하기
        </Button>
      </div>
    </section>
  );
}
