import { Tag, HeartRating } from '@/components/atoms';
import type { MockDateLog } from '@/lib/mock/date-logs';

function formatDate(iso: string) {
  // Parse the yyyy-mm-dd string directly — avoids timezone/locale drift that
  // would cause SSR/client hydration mismatches.
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${y}.${m}.${d}`;
}

/** One date-log entry in the feed: gradient cover + meta + places. */
export function DateLogCard({ log }: { log: MockDateLog }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div
        className="flex h-40 items-end bg-cover bg-center p-4"
        style={{
          backgroundImage: log.coverImage
            ? `url(${log.coverImage})`
            : `linear-gradient(135deg, ${log.cover[0]}, ${log.cover[1]})`,
        }}
      >
        <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {formatDate(log.date)}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-text-primary">{log.title}</h3>
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
