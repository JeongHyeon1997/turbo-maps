import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PublicShell } from '@/components/templates';
import { PageTitle, JsonLd } from '@/components/atoms';
import { ArticleMeta, ArticleSection } from '@/components/molecules';
import { ArticleFooter } from '@/components/organisms';
import { guides } from '@/content/guides';
import { SITE_URL } from '@/lib/site-url';
import { ogImage } from '@/lib/og-image';

// Public, static — reachable signed out (the `/guide` `PUBLIC_PREFIXES` entry
// covers `/guide/[slug]` too, see src/lib/supabase/middleware.ts) and rendered
// entirely from repo-local content (`src/content/guides.ts`); every article is
// prebuilt via `generateStaticParams` below, so this route needs no Supabase
// read at all (docs/plan/10-content.md A1). No fake cover image — DESIGN.md
// "장문 에디토리얼" hero decision — so `ogImage` always falls back to the brand
// default OG image (`ogImage(null, title)`, same as `/faq`/`/guide`).

interface PageParams {
  params: Promise<{ slug: string }>;
}

function findArticle(slug: string) {
  return guides.find((article) => article.slug === slug);
}

export function generateStaticParams() {
  return guides.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return {};

  const image = ogImage(null, article.title);

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/guide/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `${SITE_URL}/guide/${article.slug}`,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [image.url],
    },
  };
}

export default async function GuideArticlePage({ params }: PageParams) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  // `author` + `publisher.logo` are both required for Article rich-result
  // eligibility (Google's structured-data guidelines), not just recommended —
  // reviewer/uiux-reviewer flagged their absence. `publisher.logo.url` reuses
  // the same `SITE_URL` + `public/logo.png` pairing `og-image.ts` uses for the
  // brand default OG image, so it stays in lockstep with that asset.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    url: `${SITE_URL}/guide/${article.slug}`,
    author: { '@type': 'Organization', name: '위로그' },
    publisher: {
      '@type': 'Organization',
      name: '위로그',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };

  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-12 md:px-8 md:py-16">
        <JsonLd data={jsonLd} />

        <header className="flex flex-col gap-3 border-b border-divider pb-8">
          <p className="text-sm font-semibold text-brand">데이트 가이드</p>
          <PageTitle className="text-3xl md:text-4xl">{article.title}</PageTitle>
          <p className="text-base leading-relaxed text-text-secondary md:text-lg">
            {article.description}
          </p>
          <ArticleMeta publishedAt={article.publishedAt} tags={article.tags} />
        </header>

        {article.sections.map((section) => (
          <ArticleSection
            key={section.heading}
            heading={section.heading}
            paragraphs={section.paragraphs}
          />
        ))}

        <ArticleFooter currentSlug={article.slug} />
      </div>
    </PublicShell>
  );
}
