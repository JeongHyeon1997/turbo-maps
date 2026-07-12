import type { Metadata } from 'next';
import { PublicShell } from '@/components/templates';
import { PageTitle, Button } from '@/components/atoms';
import { ArticleCard, GuideStep } from '@/components/molecules';
import { guides } from '@/content/guides';
import { guideSteps } from '@/content/guide';
import { SITE_URL } from '@/lib/site-url';
import { ogImage } from '@/lib/og-image';

const TITLE = '가이드';
const DESCRIPTION =
  '데이트 코스를 짜는 요령부터 위로그 사용법까지, 커플의 하루를 더 풍성하게 만드는 이야기를 모았어요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guide' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/guide`,
    images: [ogImage(null, TITLE)],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImage(null, TITLE).url],
  },
};

// Public, static — reachable signed out (`/guide` is a `PUBLIC_PREFIXES` entry, see
// src/lib/supabase/middleware.ts) and lists entirely from repo-local content
// (`src/content/guides.ts` + `src/content/guide.ts`), so it needs no Supabase read
// (docs/plan/10-content.md A1/A2). Two-section reframing — editorial "데이트 가이드"
// articles above (the primary entry point) and the product "위로그 사용법" steps
// below as a secondary section — per DESIGN.md "장문 에디토리얼" / "/guide 인덱스
// 재구성" (no new route — 07's "라우트 최소화" 방침 유지, one page/two sections).

export default function GuidePage() {
  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-5 py-12 md:px-8 md:py-16">
        <header className="flex flex-col gap-3 border-b border-divider pb-8">
          <PageTitle className="text-2xl md:text-3xl">{TITLE}</PageTitle>
          <p className="text-sm leading-relaxed text-text-secondary">{DESCRIPTION}</p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">데이트 가이드</h2>
          <div className="flex flex-col gap-3">
            {guides.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-divider pt-8">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">위로그 사용법</h2>
          <ol className="flex flex-col gap-4">
            {guideSteps.map((step, i) => (
              <GuideStep key={step.title} index={i + 1} title={step.title} body={step.body} />
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/login" variant="primary">
              로그인하고 시작하기
            </Button>
            <Button href="/explore" variant="ghost">
              둘러보기
            </Button>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
