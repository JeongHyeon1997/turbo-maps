import Link from 'next/link';
import { Button } from '@/components/atoms';
import { ArticleCard } from '@/components/molecules';
import { guides } from '@/content/guides';

export interface ArticleFooterProps {
  /** Excluded from "다른 가이드" so the current article never links to itself. */
  currentSlug: string;
}

const OTHER_GUIDES_LIMIT = 3;

/**
 * `/guide/[slug]` footer: "다른 가이드" (up to 3 other articles, single-column
 * stack — DESIGN.md "그리드 남발 금지") → a restrained `brand-soft` panel with
 * one sentence + one `Button` (never a marketing banner — "위로그 언급 절제"
 * quality principle, docs/plan/10-content.md) → a "가이드 목록으로" back link.
 */
export function ArticleFooter({ currentSlug }: ArticleFooterProps) {
  const others = guides.filter((article) => article.slug !== currentSlug).slice(0, OTHER_GUIDES_LIMIT);

  return (
    <footer className="flex flex-col gap-10 border-t border-divider pt-8">
      {others.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">다른 가이드</h2>
          <div className="flex flex-col gap-3">
            {others.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-6">
        <p className="text-sm leading-relaxed text-text-primary">
          위로그에서는 이런 코스를 직접 기록하고, 원할 때만 다른 커플들과 나눌 수 있어요.
        </p>
        <Button href="/login" variant="primary" size="md">
          로그인하고 시작하기
        </Button>
      </div>

      <Link
        href="/guide"
        className="inline-flex min-h-11 w-fit items-center rounded text-sm font-medium text-text-secondary transition-colors duration-200 ease-out hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span aria-hidden="true">‹ </span>가이드 목록으로
      </Link>
    </footer>
  );
}
