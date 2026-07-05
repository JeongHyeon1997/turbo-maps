import { Button } from '@/components/atoms';

/** Soft prompt shown on the feed when the user hasn't connected a partner yet. */
export function ConnectBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-bold text-text-primary">파트너와 연결해요</p>
        <p className="text-xs text-text-secondary">
          초대코드를 주고받으면 함께 기록을 쌓을 수 있어요.
        </p>
      </div>
      <Button href="/couple/connect" variant="primary">
        연결하기
      </Button>
    </div>
  );
}
