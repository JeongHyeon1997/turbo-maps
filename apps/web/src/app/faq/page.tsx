import type { Metadata } from 'next';
import { PublicShell } from '@/components/templates';
import { PageTitle, JsonLd } from '@/components/atoms';
import { FaqItem } from '@/components/molecules';
import { faqs } from '@/content/faq';
import { SITE_URL } from '@/lib/site-url';
import { ogImage } from '@/lib/og-image';

const TITLE = '자주 묻는 질문';
const DESCRIPTION =
  '위로그 이용, 요금, 로그인, 커플 연결, 공개 범위, 데이터 보관과 삭제까지 자주 묻는 질문을 모았어요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/faq`,
    images: [ogImage(null, TITLE)],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImage(null, TITLE).url],
  },
};

// Public, static — reachable signed out (`/faq` is a `PUBLIC_PREFIXES` entry, see
// src/lib/supabase/middleware.ts) and lists entirely from repo-local content
// (`src/content/faq.ts`), so it needs no Supabase read (docs/plan/10-content.md A3).

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-12 md:px-8 md:py-16">
        <JsonLd data={jsonLd} />

        <header className="flex flex-col gap-3 border-b border-divider pb-8">
          <PageTitle className="text-2xl md:text-3xl">{TITLE}</PageTitle>
          <p className="text-sm leading-relaxed text-text-secondary">{DESCRIPTION}</p>
        </header>

        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
