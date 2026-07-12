import Link from 'next/link';

// Copy is planner-authored (docs/plan/10-content.md A4) and verified against
// privacy/FAQ/0007 anonymization — do not edit wording here.
const PRINCIPLES = [
  {
    title: '기본은 우리 둘만',
    body: '남긴 기록은 연결된 두 사람만 볼 수 있어요. 따로 설정하지 않는 한 다른 누구에게도 열리지 않아요.',
  },
  {
    title: '공개는 언제나 선택',
    body: '나누고 싶은 코스만 직접 공개로 설정할 수 있어요. 공개하지 않은 기록은 그대로 두 사람의 것으로 남아요.',
  },
  {
    title: '공개해도 지켜지는 것',
    body: '코스를 공개해도 메모와 나머지 사진, 이동 경로선, 그리고 작성자가 누구인지는 드러나지 않아요.',
  },
] as const;

/**
 * "프라이버시 철학" section (landing A4) — closing trust panel. Filled `brand-soft`
 * panel (single soft-fill emphasis, no border/shadow) with paragraph-form copy rather
 * than a card grid: Features + HowTo are already card grids, so a third grid would flatten
 * the rhythm, and a philosophy/promise reads better as prose than as feature bullets
 * (DESIGN.md "랜딩 보강 섹션").
 */
export function LandingPrivacy() {
  return (
    <section className="rounded-2xl bg-brand-soft p-8 md:p-10">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          두 사람만의 기록이, 언제나 먼저예요
        </h2>
        <div className="flex flex-col gap-3">
          <p className="text-base leading-relaxed text-text-secondary">
            함께한 순간을 남기고 싶은데, 그게 꼭 모두에게 보여야 할 필요는 없잖아요. 위로그는 그
            마음에서 시작했어요. 두 사람의 데이트와 사진, 메모는 오롯이 두 사람만의 것으로 두는 걸
            가장 중요하게 생각합니다.
          </p>
          <p className="text-base leading-relaxed text-text-secondary">
            기록은 기본적으로 연결된 두 사람에게만 보여요. 다른 이용자에게 공개할지는 온전히
            여러분의 선택이고, 공개하기로 한 순간에도 지켜야 할 것은 지키도록 설계했어요.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title}>
              <p className="font-semibold text-text-primary">{principle.title}</p>
              <p className="text-text-secondary">{principle.body}</p>
            </li>
          ))}
        </ul>
        <p className="text-center text-sm text-text-secondary">
          자세한 내용은{' '}
          <Link
            href="/privacy"
            className="text-brand underline underline-offset-2 hover:text-brand-pressed"
          >
            개인정보처리방침
          </Link>
          에서 투명하게 확인하실 수 있어요.
        </p>
      </div>
    </section>
  );
}
