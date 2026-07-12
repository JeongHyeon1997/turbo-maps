---
status: todo
last-updated: 2026-07-12
owner: planner
---

# 프로필 직접 편집 — 이미지 업로드 + 내정보 편집

> 사용자 원문: **"내정보 또한, 이것저것 프로필이미지 등 카카오톡에서 받아온 거 말고도 변경할 수 있으면 좋겠어."**
> 연관: `docs/plan/09-mobile.md`(모바일 후속 뷰), `supabase/SCHEMA.md`(profiles·storage), `04/06`(공개 표면은 작성자 익명 — 아바타 미노출, 아래 "영향 범위" 참고).

## 배경 / 왜 지금
- 현재 `/profile`은 **닉네임 편집·커플상태·로그아웃**만 있다(`ProfileActions.tsx`). 프로필 이미지는 **직접 바꿀 수단이 없다.**
- `avatar_url`은 로그인마다 OAuth(카카오/구글) 메타데이터에서 **자동 백필/덮어쓰기**된다 — `auth/callback/route.ts` L40~44가 매 로그인 `avatar_url`을 provider 아바타로 update. 즉 지금 구조에선 사용자가 아무리 바꿔도 **다음 로그인에 원복**된다. 이 덮어쓰기 동작이 "직접 변경"의 핵심 장애물이자, 아래 컬럼 분리 결정의 근거다.
- 아바타를 소비하는 곳: `profile/page.tsx`(본인, 56px) · `AppShell.tsx resolveAvatars()`(헤더 본인+파트너). 파트너 아바타 실표시는 이미 Done — 즉 **profiles의 타 유저 row select가 이미 허용돼 있다**(RLS 변경 불필요).

## 목표 (범위)
### ① 프로필 이미지 직접 업로드 (핵심)
- 사용자가 `/profile`에서 이미지 파일을 올려 프로필 사진을 지정한다.
- **OAuth 아바타는 폴백으로 유지** — 커스텀을 지우면 카카오/구글 사진으로 되돌아간다("카카오 사진으로 되돌리기").
- Supabase Storage 신규 **`avatars` 버킷**에 저장(`date-photos`/`public-covers` 선례 참고).

### ② 닉네임 외 추가 편집 필드 (후보 심사)
- **후보: 상태 문구/한 줄 소개(bio)** — 검토 결과 **Phase 1에서 컷.**
  - 컷 근거: (a) 공개 표면은 작성자 익명(`0007`)이라 **공개 소비처가 없다.** (b) 본인+파트너만 보는 값인데 헤더/프로필에 노출할 **UI 슬롯이 현재 없다.** (c) 사용자의 명시 요구는 "이미지"이고 나머지는 "이것저것"의 여지 — 컬럼·RLS·렌더 추가 비용 대비 가치가 낮다.
  - 향후 옵션으로만 남긴다: 필요 시 `profiles.bio text` 단일 컬럼 + 프로필/파트너 헤더 서브텍스트. 독립 마이그레이션으로 분리.
- **닉네임 편집은 이미 있음**(`ProfileActions`) — 재사용. 이번 범위는 아바타 UI와 같은 카드로 시각 통합만.

### ③ 헤더/파트너 아바타 표시 경로 영향
- 렌더는 **`custom_avatar_url ?? avatar_url` 코얼레스**로 통일한다. 소비처 2곳:
  - `profile/page.tsx` — select에 `custom_avatar_url` 추가, `Avatar imageUrl`에 코얼레스.
  - `AppShell.tsx` — 본인/파트너 select에 `custom_avatar_url` 추가, `toDescriptor`에서 코얼레스.
- **파트너**의 커스텀 아바타도 그대로 뜬다: `avatars` 버킷을 public으로 두면 파트너가 URL로 직접 읽는다(파트너 profile row select는 이미 허용). 추가 RLS 변경 없음.
- **공개 표면(`/explore`·`/places` 등)엔 영향 없음** — 작성자 익명 원칙(`0007`) 유지, 아바타는 어디서도 anon에게 노출되지 않는다.

## 데이터 모델

### 컬럼 결정 — `avatar_url` 재사용 vs 분리 → **분리 채택**
신규 컬럼 **`custom_avatar_url text null`** 추가. `avatar_url`은 지금 의미(OAuth 자동 동기화) 그대로 둔다.

| 선택지 | 판정 | 근거 |
| --- | --- | --- |
| **A. `custom_avatar_url` 분리 (권장·채택)** | ✅ | OAuth 아바타를 **진짜 폴백 컬럼으로 보존** → "카카오 사진으로 되돌리기"가 custom을 NULL로만 지우면 성립. `auth/callback`은 **손댈 필요 없음**(계속 `avatar_url`만 백필). 렌더는 단순 코얼레스. 기존 데이터 무손상·되돌리기 쉬움. |
| B. `avatar_url` 재사용 + `avatar_is_custom bool` | ✗ | 콜백이 flag 검사 후 조건부 백필로 복잡해지고, custom으로 덮으면 원래 OAuth URL이 **소실**돼 폴백 복원 불가. |
| C. `avatar_url` 재사용, 콜백 백필 제거 | ✗ | provider 사진 최신화가 끊기고, 신규 유저 첫 아바타 소스도 사라짐(회귀). |

렌더 규칙: **표시값 = `custom_avatar_url` ?? `avatar_url` ?? 이니셜 폴백**.

### 마이그레이션 — `0010_profile_avatars` (public/test 병행)
1. `alter table <schema>.profiles add column custom_avatar_url text;` — **public + test 두 블록**.
2. 신규 **public 버킷 `avatars`** + storage.objects 정책 (프로젝트 글로벌 — schema-mirror 아님, `public-covers` 선례):
   - `insert into storage.buckets (id,name,public) values ('avatars','avatars',true) on conflict do nothing;`
   - `avatars_rw` (`for all to authenticated`) — 본인 top-level 폴더(`<uid>/…`)만 read/write/delete (`(storage.foldername(name))[1] = auth.uid()::text`).
   - `avatars_public_read` (`for select`, no folder scope) — anon 포함 누구나 SELECT. 이 버킷은 표시용 아바타만 담는다(민감도 낮음, OAuth 아바타도 이미 공개 CDN URL). 파트너/헤더 표시가 무토큰 public URL로 되게 하는 근거.
   - Public 오브젝트 URL: `/storage/v1/object/public/avatars/<uid>/<file>`.
3. **`supabase/SCHEMA.md` 같은 커밋에 갱신**: profiles 컬럼표에 `custom_avatar_url`, Storage 섹션에 `avatars` 버킷 문단.

> 버킷 public vs private 결정: **public 채택.** private+signed URL은 파트너 표시마다 서명 필요 + `avatar_url`이 지금 "URL 문자열"이라 렌더러 전면 수정이 따라온다. public이 `public-covers` 선례와 일관되고 렌더 변경이 코얼레스 한 줄로 끝난다. 아바타는 민감도 낮음.

## 화면
- `/profile` — 상단 아바타 카드에 **아바타 업로더** 추가(현재 프로필사진 미리보기 + "사진 변경" 파일 선택 + 업로드 진행/완료 + "카카오 사진으로 되돌리기"[custom 있을 때만]). 닉네임 편집은 기존 유지, 시각적으로 같은 편집 카드로 통합.

## API / 데이터 흐름 (신규 엔드포인트 없음 — 클라 직결)
- 업로드: 브라우저 supabase 클라이언트 → `storage.from('avatars').upload('<uid>/<uuid>.<ext>', file, { upsert:true, contentType })` → `getPublicUrl` → `profiles.update({ custom_avatar_url: publicUrl }).eq('id', uid)`. (`logs/new` 업로드 제약 재사용: contentType 지정, 이미지 타입/용량 가드.)
- 되돌리기: `profiles.update({ custom_avatar_url: null })` (+ best-effort로 기존 오브젝트 remove).
- 서버 라우트 불필요(RLS가 폴더 스코프로 강제). `SupabaseService` 경유 규칙은 apps/api 한정 — web은 클라 직결 유지.

## 작업 분해 (역할별 STEP)
- **STEP 1 — db-dev:** `0010_profile_avatars` 작성(위 마이그레이션 1~3, public/test 병행, `avatars` 버킷+정책, SCHEMA.md 동시 갱신). `rls-migration` 스킬 사용.
- **STEP 1b — dba(사용자 승인 후):** 0010 라이브 적용 + 검증(본인 폴더 write 허용/타 폴더 거부, anon SELECT 200, 컬럼 존재). ⚠️ `0009`가 아직 미적용(Blocked) — **0010은 0009와 함께 배치 적용 권장**(STEP0 실데이터 투입 시점). SCHEMA.md 라이브 현행화.
- **STEP 2 — schema-dev:** `packages/shared` profile Zod에 `custom_avatar_url: z.string().url().nullable().optional()` 추가(단일 소스). 소비처 타입 확인.
- **STEP 3 — web-dev:** 
  - `AvatarUploader` molecule(atoms 재사용: Avatar/Button/파일입력 라벨 focus-within 링) — 미리보기·업로드·되돌리기·에러(a11y `role=alert`).
  - `/profile` 배선: select에 `custom_avatar_url` 추가 + Avatar 코얼레스 + 업로더 마운트.
  - `AppShell.tsx`: 본인·파트너 select에 `custom_avatar_url` 추가, `toDescriptor` 코얼레스.
  - `auth/callback`은 **변경 없음**(설계상 custom을 절대 안 건드림 — 이 무변경이 폴백 유지의 핵심).
- **STEP 4 — reviewer + build-qa:** 폴더 스코프/코얼레스/콜백 무변경 정확성 검수 + typecheck/lint/web build. 파트너 아바타 회귀 없는지 확인.
- **STEP 5 — mobile (후속, Phase 1 뷰 이후):** `09-mobile.md` STEP 2~5(뷰) 진행 후, 모바일 `/profile` 상당 화면에 아바타 업로더 이식(`expo-image-picker` + 동일 버킷/컬럼). **Phase 1 뷰 트랙 완료 전엔 착수하지 않음.**

## 완료 기준 (Definition of Done)
- [ ] `/profile`에서 이미지 업로드 → 즉시 본인 아바타(프로필+헤더) 반영.
- [ ] 재로그인해도 커스텀 아바타 유지(OAuth 백필이 덮지 않음).
- [ ] "카카오 사진으로 되돌리기" → OAuth 아바타로 폴백.
- [ ] 파트너가 상대 커스텀 아바타를 헤더에서 정상 조회(무토큰 public URL).
- [ ] 타 유저 폴더 업로드 거부(RLS), anon SELECT 허용, base 공개 표면 영향 0.
- [ ] typecheck/lint/web build PASS, reviewer/uiux 지적 반영.

## 열린 질문 (권장안으로 자율 진행)
1. bio/상태 문구 포함? → **컷(위 근거).** 사용자 이견 시 독립 컬럼으로 후속.
2. 이미지 리사이즈/크롭 UI? → **Phase 1 컷** — 원본 업로드 + contentType/용량 가드만. 크롭은 후속 UX 과제.
3. 버킷 public? → **public 채택**(위 근거). 사용자가 프라이버시 우려 시 private+signed로 전환 가능(렌더러 수정 동반).
