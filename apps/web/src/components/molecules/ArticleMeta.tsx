import { Tag } from '@/components/atoms';
import { formatArticleDate } from '@/lib/format-date';

export interface ArticleMetaProps {
  publishedAt: string;
  /**
   * Tag chips to render alongside the date. Passed on the `/guide/[slug]`
   * detail header; omitted on `ArticleCard` (DESIGN.md "장문 에디토리얼"), which
   * already shows its own tag row above the title and would otherwise repeat it.
   */
  tags?: string[];
}

/** Article date (`<time dateTime>`) + optional tag chips — shared by the `/guide/[slug]` header and `ArticleCard`. */
export function ArticleMeta({ publishedAt, tags }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
      <time dateTime={publishedAt}>{formatArticleDate(publishedAt)}</time>
      {tags?.map((tag) => <Tag key={tag}>{tag}</Tag>)}
    </div>
  );
}
