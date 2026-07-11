export interface ExplorePreviewProps {
  children: React.ReactNode;
}

/**
 * "공개 코스 미리보기" section chrome for the landing page. Content (real cards or a
 * fallback empty state) is passed in as children — see `/` page for the data fetch,
 * which degrades gracefully until anon read RLS lands (public-surface plan, 2단계).
 */
export function ExplorePreview({ children }: ExplorePreviewProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          공개된 데이트 코스 둘러보기
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          다른 커플이 공개한 기록을 미리 만나보세요.
        </p>
      </div>
      {children}
    </section>
  );
}
