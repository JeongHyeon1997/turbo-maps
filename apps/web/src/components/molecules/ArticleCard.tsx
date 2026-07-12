import Link from 'next/link';
import { Tag } from '@/components/atoms';
import { ArticleMeta } from './ArticleMeta';
import type { GuideArticle } from '@/content/guides';

export interface ArticleCardProps {
  article: Pick<GuideArticle, 'slug' | 'title' | 'description' | 'publishedAt' | 'tags'>;
}

/**
 * One `/guide/[slug]` article entry — used in the `/guide` index list and in
 * `ArticleFooter`'s "다른 가이드". Text-only, no cover image (DESIGN.md "장문
 * 에디토리얼" — the article has no image slot to fill, so a fake tinted cover
 * would read as a broken placeholder). Single-emphasis border, same recipe as
 * `PlaceCard`/`RegionCard` (no shadow, no double emphasis).
 */
export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/guide/${article.slug}` as React.ComponentProps<typeof Link>['href']}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <article className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 ease-out hover:border-border-strong dark:border-border-strong">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <h3 className="text-lg font-bold tracking-tight text-text-primary">{article.title}</h3>
        <p className="line-clamp-2 text-sm text-text-secondary">{article.description}</p>
        <ArticleMeta publishedAt={article.publishedAt} />
      </article>
    </Link>
  );
}
