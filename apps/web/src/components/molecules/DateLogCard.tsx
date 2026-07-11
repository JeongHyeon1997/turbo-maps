import Link from 'next/link';
import { Tag, HeartRating, CoverFallback } from '@/components/atoms';
import type { MockDateLog } from '@/lib/mock/date-logs';
import { formatLogDate } from '@/lib/format-date';

export interface DateLogCardProps {
  log: MockDateLog;
  /**
   * Base path the card links to (`${hrefBase}/${log.id}`). The signed-in home
   * feed links to the couple-scoped `/logs/[id]`; public contexts (explore,
   * the logged-out landing preview) pass `/explore` so cards open the
   * anon-safe public detail page instead. Defaults to `/logs`.
   */
  hrefBase?: string;
  /** Renders as a plain (non-linking) card when explicitly set to `false`. Defaults to `true`. */
  linkable?: boolean;
}

function CardBody({ log }: { log: MockDateLog }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 ease-out hover:border-border-strong">
      <div className="relative flex h-40 items-end p-4">
        {log.coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${log.coverImage})` }}
          />
        ) : (
          <CoverFallback className="absolute inset-0" />
        )}
        <span className="relative rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {formatLogDate(log.date)}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-text-primary">{log.title}</h3>
          <HeartRating value={log.rating} />
        </div>

        {log.memo && <p className="text-sm leading-relaxed text-text-secondary">{log.memo}</p>}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {log.places.map((p) => (
            <Tag key={p.name}>
              {p.name} · {p.category}
            </Tag>
          ))}
        </div>

        {log.author && <p className="pt-1 text-xs text-text-muted">by {log.author}</p>}
      </div>
    </article>
  );
}

/** One date-log entry in the feed: gradient cover + meta + places. Links to `${hrefBase}/[id]` unless `linkable={false}`. */
export function DateLogCard({ log, hrefBase = '/logs', linkable = true }: DateLogCardProps) {
  if (!linkable) {
    return <CardBody log={log} />;
  }

  return (
    <Link
      href={`${hrefBase}/${log.id}` as React.ComponentProps<typeof Link>['href']}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <CardBody log={log} />
    </Link>
  );
}
