import { FeatureCard } from '@/components/molecules';

const FEATURES = [
  {
    icon: '📔',
    title: '기록',
    description: '방문한 장소와 사진, 메모, 평점을 남겨 그날을 오래 기억해요.',
  },
  {
    icon: '🗺️',
    title: '지도',
    description: '함께 다녀온 모든 장소를 하나의 지도 위에서 한눈에 봐요.',
  },
  {
    icon: '🧭',
    title: '경로',
    description: '그날 걸었던 동선을 좌표로 남겨 발자취를 그대로 되짚어요.',
  },
  {
    icon: '💛',
    title: '함께 되돌아보기',
    description: '커플이 함께 쌓아온 기록을 언제든 다시 꺼내 보며 추억해요.',
  },
] as const;

/** "기능 소개" section — 4-up feature grid on the landing page. */
export function LandingFeatures() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
        위로그와 함께라면
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
