# maps

커플이 함께한 **데이트 · 맛집 · 경로**를 기록하는 커뮤니티 — **Web + Mobile + API** 를 하나의 모노레포에서 운영합니다.

- **web** — Next.js 15 (App Router)
- **mobile** — Expo Router + React Native
- **api** — NestJS (Vercel serverless)
- **shared** — Zod 스키마 (단일 진실 공급원)
- **tokens** — 디자인 토큰
- 지도: **Kakao Map** · DB/Auth: **Supabase** (project `giilijttitajvygdosbe`)

## 시작하기

```sh
bun install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
# 값 채우기 → supabase/SETUP.md 참고

bun run dev     # 전체 실행 (turbo)
bun run web     # 웹만
bun run api     # api만
bun run mobile  # 모바일만
```

## 구조

```
maps/
├── apps/{web,api,mobile}
├── packages/{shared,tokens}
├── supabase/           # migrations · RLS · SCHEMA.md
├── docs/               # 기획·진행 문서 (세션 이어가기의 근거)
├── DESIGN.md           # 디자인 시스템 방향
└── .claude/{agents,skills}
```

## 개발 방식

작업은 `.claude/agents/`의 역할별 서브에이전트로 진행됩니다: `planner` · `designer` · `web-dev` · `app-dev` · `server-dev` · `db-dev` · `reviewer` · `build-qa`. 진행 상황은 `docs/PROGRESS.md`에 남겨 세션이 끊겨도 이어서 작업합니다. 자세한 규칙은 루트 `CLAUDE.md`.
