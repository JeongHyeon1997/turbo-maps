import { DateLogCard } from '@/components/molecules';
import type { MockDateLog } from '@/lib/mock/date-logs';

export interface DateLogFeedProps {
  logs: MockDateLog[];
  /** Passed through to each `DateLogCard` — see its doc for why public feeds set this `false`. */
  linkable?: boolean;
}

/** Responsive feed: 1 column on mobile, 2–3 columns on larger screens. */
export function DateLogFeed({ logs, linkable = true }: DateLogFeedProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {logs.map((log) => (
        <DateLogCard key={log.id} log={log} linkable={linkable} />
      ))}
    </div>
  );
}
