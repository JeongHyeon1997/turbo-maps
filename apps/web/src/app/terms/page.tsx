import type { Metadata } from 'next';
import { PublicShell } from '@/components/templates';
import { PolicyDocument } from '@/components/organisms';
import { PolicySection, PolicyList } from '@/components/molecules';

export const metadata: Metadata = { title: '이용약관' };

export default function TermsPage() {
  return (
    <PublicShell>
      <PolicyDocument
        title="이용약관"
        intro={
          '본 약관은 We Log(이하 "서비스")의 이용과 관련하여 서비스와 이용자 간의 권리·의무 및 책임' +
          ' 사항을 규정합니다.'
        }
        effectiveDate="2026년 7월 6일"
      >
        <PolicySection title="1. 서비스의 정의">
          <p>
            We Log는 커플이 함께 방문한 장소(맛집·카페·데이트 스팟), 그날의 이동 경로, 사진·메모·평점을
            기록하고 함께 되돌아볼 수 있도록 돕는 데이트 기록 서비스입니다.
          </p>
        </PolicySection>

        <PolicySection title="2. 계정 및 로그인">
          <p>이용자는 카카오 또는 구글 소셜 로그인(SSO)을 통해 서비스에 가입·로그인합니다.</p>
          <p>
            이용자는 본인의 계정 정보를 안전하게 관리할 책임이 있으며, 계정을 통해 발생한 활동에 대한
            책임은 이용자 본인에게 있습니다.
          </p>
          <p>타인의 계정을 도용하거나 부정하게 이용해서는 안 됩니다.</p>
        </PolicySection>

        <PolicySection title="3. 이용자 콘텐츠">
          <p>
            이용자가 서비스에 등록한 사진, 메모, 장소, 경로 등의 콘텐츠에 대한 권리는 이용자 본인에게
            있습니다.
          </p>
          <p>
            이용자는 서비스가 해당 콘텐츠를 서비스 제공·표시(예: 커플 간 공유, 이용자가 공개로 설정한
            경우 탐색 화면 노출)에 필요한 범위 내에서 이용하는 것에 동의합니다.
          </p>
          <p>이용자는 다음과 같은 콘텐츠를 등록해서는 안 됩니다:</p>
          <PolicyList
            items={[
              '법령을 위반하거나 범죄와 관련된 콘텐츠',
              '타인의 저작권, 초상권, 개인정보 등 권리를 침해하는 콘텐츠',
              '음란, 폭력적이거나 타인에게 혐오감을 주는 콘텐츠',
              '허위 정보 또는 타인을 사칭하는 콘텐츠',
            ]}
          />
          <p>
            위 사항을 위반한 콘텐츠에 대한 책임은 이를 등록한 이용자에게 있으며, 서비스는 필요한 경우
            해당 콘텐츠를 삭제하거나 이용을 제한할 수 있습니다.
          </p>
        </PolicySection>

        <PolicySection title="4. 서비스의 변경 및 중단">
          <p>
            서비스는 운영상·기술상의 필요에 따라 제공 내용의 전부 또는 일부를 변경하거나 중단할 수
            있습니다.
          </p>
          <p>
            서비스 점검, 장애, 천재지변 등 불가피한 사유가 있는 경우 사전 또는 사후에 이를 이용자에게
            공지합니다.
          </p>
        </PolicySection>

        <PolicySection title="5. 면책">
          <p>
            서비스는 무료로 제공되며, 천재지변, 제3자 서비스(로그인 제공자, 지도, 클라우드 인프라
            등)의 장애, 이용자의 귀책 사유로 인해 발생한 손해에 대해 관련 법령이 허용하는 범위 내에서
            책임을 지지 않습니다.
          </p>
          <p>지도·장소 정보 등 제3자로부터 제공되는 데이터의 정확성에 대해서는 보증하지 않습니다.</p>
          <p>
            이용자가 등록한 콘텐츠로 인해 발생하는 분쟁 및 손해에 대한 책임은 해당 이용자에게
            있습니다.
          </p>
        </PolicySection>

        <PolicySection title="6. 약관의 변경">
          <p>
            서비스는 필요 시 본 약관을 개정할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 효력이
            발생합니다. 변경 후에도 서비스를 계속 이용하는 경우 개정 약관에 동의한 것으로 봅니다.
          </p>
        </PolicySection>

        <PolicySection title="7. 준거법 및 분쟁 해결">
          <p>본 약관은 대한민국 법령에 따라 해석되고 적용됩니다.</p>
          <p>서비스 이용과 관련하여 발생한 분쟁에 대해서는 관련 법령에 정한 절차에 따릅니다.</p>
        </PolicySection>

        <PolicySection title="8. 문의">
          <p>
            약관과 관련한 문의는{' '}
            <a href="mailto:ojh@pitin-ev.com" className="text-brand underline underline-offset-2">
              ojh@pitin-ev.com
            </a>{' '}
            으로 연락해 주시기 바랍니다.
          </p>
        </PolicySection>
      </PolicyDocument>
    </PublicShell>
  );
}
