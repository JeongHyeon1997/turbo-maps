import type { Metadata } from 'next';
import { PublicShell } from '@/components/templates';
import { PolicyDocument } from '@/components/organisms';
import { PolicySection, PolicyList } from '@/components/molecules';

export const metadata: Metadata = { title: '개인정보처리방침' };

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PolicyDocument
        title="개인정보처리방침"
        intro={
          'We Log(이하 "서비스")는 이용자의 개인정보를 소중하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. ' +
          '본 방침은 서비스가 어떤 정보를 어떻게 수집·이용·보관·파기하는지, 그리고 이용자가 가진 권리를 설명합니다.'
        }
        effectiveDate="2026년 7월 6일"
      >
        <PolicySection title="1. 수집하는 개인정보 항목">
          <p>서비스는 다음 정보를 수집합니다.</p>
          <PolicyList
            items={[
              <>
                소셜 로그인(SSO) 계정 정보: 카카오 또는 구글 계정으로 로그인할 때 해당 제공자로부터
                전달받는 이메일 주소, 닉네임(이름), 프로필 이미지.
              </>,
              <>
                이용자가 직접 등록하는 콘텐츠: 방문한 장소 정보, 데이트 기록, 사진, 메모, 평점, 이동
                경로(좌표) 등 이용자가 서비스에 입력·업로드하는 모든 기록.
              </>,
              <>커플 연결 정보: 커플 연결을 위한 초대 코드 및 연결된 상대방 계정과의 관계 정보.</>,
              <>
                자동 수집 정보: 서비스 이용 과정에서 쿠키, 접속 로그, 기기·브라우저 정보 등이 자동으로
                생성·수집될 수 있습니다.
              </>,
            ]}
          />
        </PolicySection>

        <PolicySection title="2. 개인정보의 이용 목적">
          <PolicyList
            items={[
              '회원 식별 및 로그인 인증',
              '커플 단위의 데이트·장소·경로 기록 저장 및 제공',
              '지도 표시 및 위치 기반 기능 제공',
              '서비스 운영, 개선, 오류 대응 및 문의 응대',
              '관련 법령에 따른 의무 이행',
            ]}
          />
        </PolicySection>

        <PolicySection title="3. 개인정보의 보관 및 파기">
          <p>서비스는 이용자가 회원 자격을 유지하는 동안 개인정보를 보관합니다.</p>
          <p>
            이용자가 회원 탈퇴를 하거나 삭제를 요청하는 경우, 관련 법령에서 별도 보관을 요구하는
            경우를 제외하고 지체 없이 해당 정보를 파기합니다.
          </p>
          <p>전자적 파일 형태의 정보는 복구가 불가능한 방법으로 삭제합니다.</p>
        </PolicySection>

        <PolicySection title="4. 개인정보의 제3자 처리 및 위탁">
          <p>서비스는 원활한 운영을 위해 아래와 같이 외부 서비스를 이용합니다.</p>
          <PolicyList
            items={[
              <>
                Supabase (Supabase Inc.): 데이터베이스 저장, 인증, 파일(사진) 저장을 위한 클라우드
                인프라 제공.
              </>,
              <>
                카카오 / 구글 (Kakao Corp., Google LLC): 소셜 로그인 인증. 로그인 시 이용자가 동의한
                범위의 계정 정보를 제공받습니다.
              </>,
              <>카카오맵 (Kakao Corp.): 지도 표시, 장소 검색 및 경로 렌더링.</>,
            ]}
          />
          <p>
            각 사업자는 자체 개인정보처리방침에 따라 정보를 처리하며, 서비스는 목적 달성에 필요한
            최소한의 정보만 연동합니다.
          </p>
        </PolicySection>

        <PolicySection title="5. 광고 및 쿠키 (Google AdSense 고지)">
          <p>서비스는 Google AdSense를 포함한 제3자 광고 서비스를 게재할 수 있습니다.</p>
          <PolicyList
            items={[
              <>
                Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자의 본 사이트 및 다른 사이트
                방문 기록을 기반으로 광고를 게재합니다.
              </>,
              <>
                Google은 광고 쿠키(DoubleClick 쿠키 등)를 사용하여 이용자와 다른 이용자에게 개인 맞춤
                광고를 표시할 수 있습니다.
              </>,
              <>
                이용자는 Google 광고 설정(
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline underline-offset-2 hover:text-brand-pressed"
                >
                  https://www.google.com/settings/ads
                </a>
                )에서 개인 맞춤 광고를 해제(opt-out)할 수 있습니다.
              </>,
              <>
                제3자 광고 공급업체의 쿠키 사용 및 opt-out에 대한 자세한 내용은 www.aboutads.info(
                <a
                  href="https://www.aboutads.info/choices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline underline-offset-2 hover:text-brand-pressed"
                >
                  https://www.aboutads.info/choices
                </a>
                )에서 확인할 수 있습니다.
              </>,
              <>
                대부분의 브라우저는 설정을 통해 쿠키를 거부하거나 삭제할 수 있으나, 이 경우 서비스
                일부 기능 이용에 제한이 있을 수 있습니다.
              </>,
            ]}
          />
        </PolicySection>

        <PolicySection title="6. 이용자의 권리">
          <p>
            이용자는 언제든지 본인의 개인정보에 대한 열람, 정정, 삭제, 처리 정지를 요청할 수
            있습니다.
          </p>
          <p>
            서비스 내에서 직접 기록(사진·메모·장소 등)을 수정하거나 삭제할 수 있으며, 계정 삭제를
            통해 관련 정보의 파기를 요청할 수 있습니다.
          </p>
          <p>권리 행사는 아래 문의처를 통해 요청할 수 있으며, 서비스는 지체 없이 조치합니다.</p>
        </PolicySection>

        <PolicySection title="7. 개인정보 보호책임자 및 문의처">
          <p>
            개인정보 처리에 관한 문의, 불만, 권리 행사는 아래로 연락해 주시기 바랍니다. 이메일:{' '}
            <a href="mailto:ojh@pitin-ev.com" className="text-brand underline underline-offset-2">
              ojh@pitin-ev.com
            </a>
          </p>
        </PolicySection>

        <PolicySection title="8. 방침의 변경">
          <p>
            본 개인정보처리방침은 법령 또는 서비스 정책 변경에 따라 개정될 수 있으며, 변경 시 서비스
            내 공지를 통해 안내합니다.
          </p>
        </PolicySection>
      </PolicyDocument>
    </PublicShell>
  );
}
