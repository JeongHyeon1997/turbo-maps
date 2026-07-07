import { DateLogCard } from '@/components/molecules';
import type { MockDateLog } from '@/lib/mock/date-logs';

export interface DateLogFeedProps {
  logs: MockDateLog[];
  /** Passed through to each `DateLogCard` — base path for the detail link (`/logs` by default, `/explore` for public feeds). */
  hrefBase?: string;
  /** Passed through to each `DateLogCard` — see its doc for when to render non-linkable. */
  linkable?: boolean;
}

/** Responsive feed: 1 column on mobile, 2–3 columns on larger screens. */
export function DateLogFeed({ logs, hrefBase, linkable = true }: DateLogFeedProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {logs.map((log) => (
        <DateLogCard key={log.id} log={log} hrefBase={hrefBase} linkable={linkable} />
      ))}
    </div>
  );
}
