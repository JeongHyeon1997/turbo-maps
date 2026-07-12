import Link from 'next/link';
import { GuideStep } from '@/components/molecules';

// Copy is planner-authored (docs/plan/10-content.md A5) and verified against
// privacy/FAQ/0007 anonymization — do not edit wording here.
const STEPS = [
  {
    title: '1. 둘이 함께 시작하기',
    body: '카카오나 구글 계정으로 로그인하고, 초대 코드로 두 사람을 하나의 커플로 이어요. 연결되는 순간부터 모든 기록을 함께 보고 함께 남길 수 있어요.',
  },
  {
    title: '2. 그날을 기록하기',
    body: '다녀온 장소를 순서대로 담고 사진과 메모, 평점을 더해요. 이동한 경로까지 남기면 그날의 하루가 지도 위에 고스란히 그려져요.',
  },
  {
    title: '3. 언제든 다시 꺼내 보기',
    body: '쌓인 기록은 지도와 달력으로 한눈에 펼쳐져요. 문득 그날이 떠오를 때, 우리가 함께 걸은 발자취를 그대로 되짚어 볼 수 있어요.',
  },
  {
    title: '4. 원하면 살짝 나누기',
    body: '마음에 든 코스는 공개로 설정해 다른 커플과 나눌 수 있어요. 공개는 늘 선택이고, 나눠도 우리가 누구인지는 드러나지 않아요.',
  },
] as const;

/**
 * "사용 흐름" section (landing A5) — reuses `GuideStep` (07/guide) with a 4-step
 * condensed copy. Steps are ordered content, so the grid stays single-column through
 * `sm`/`md` (tablet) and only opens to `lg:grid-cols-2` (2×2) at `lg`+. This keeps the
 * tablet layout a 1-column stack, visually distinct from Features' 2-column tablet grid,
 * preserving section rhythm on adjacent sections (DESIGN.md "랜딩 보강 섹션" — 리듬 주의).
 */
export function LandingHowTo() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          위로그, 이렇게 시작해요
        </h2>
        <p className="text-text-secondary">
          복잡한 준비 없이, 오늘 다녀온 데이트부터 남겨 보세요.
        </p>
      </div>
      <ol className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {STEPS.map((step, i) => (
          <GuideStep key={step.title} index={i + 1} title={step.title} body={step.body} />
        ))}
      </ol>
      <p className="text-center text-sm text-text-secondary">
        각 단계를 더 자세히 보고 싶다면{' '}
        <Link
          href="/guide"
          className="text-brand underline underline-offset-2 hover:text-brand-pressed"
        >
          사용 가이드
        </Link>
        에서 차근차근 안내해 드려요.
      </p>
    </section>
  );
}
