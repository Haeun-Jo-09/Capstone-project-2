# Changelog

All notable changes to **AI Future Planner for Students** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.4.1] - 2026-06-18

### Supervisor Session Note — Josh (2026-06-18)

> **To: Ben & Haeun**  
> 오늘 세션에서 백엔드·배포를 처음 다루는 팀이 이해할 수 있도록, **무엇을 왜 했는지** 흐름 위주로 정리합니다.  
> 코드 디테일보다 **“우리 앱이 이제 어떻게 돌아가는지”** 를 같이 공유하는 메모입니다.

---

#### 1. 오늘 한 일 한 줄 요약

**Ben & Jo가 만든 Supabase 백엔드 코드를 안전하게 합치고, Cloudflare Pages에 실제로 배포해서, Google 로그인 + AI Coach까지 live에서 확인했습니다.**

- Live URL: **https://ai-planner-7y0.pages.dev**
- 테스트 브랜치: `integrate/ben-jo-supabase-deploy` (아직 `main` merge 전)
- Supabase 프로젝트: `bcnhmrvylpkocetfqidh` (Haeun 계정)

---

#### 2. 시작 전 상태 (왜 오늘 작업이 필요했나)

| 구분 | v0.3까지 | Ben PR (v0.4.0) | 오늘 세션 후 |
|------|----------|-----------------|--------------|
| 로그인 | 브라우저 localStorage + Google SDK | Supabase Auth | ✅ live 동작 |
| 데이터 | 브라우저에만 저장 | Supabase DB | ✅ live 동작 |
| AI Coach | 사용자가 Gemini API key 직접 입력 | Edge Function (서버) | ✅ live 동작 |
| 배포 | 없음 (로컬 HTML만) | GitHub Actions 초안 | ✅ **Cloudflare Pages** |

Ben의 PR은 **기능 코드**는 잘 갖춰져 있었지만, 팀 계정(GitHub / Supabase / CF) 연결과 **배포 방식 선택(Workers vs Pages)** 정리가 필요했습니다.  
Josh가 Cursor + MCP 도구로 **통합·배포·키 설정·검증**을 함께 진행했습니다.

---

#### 3. 전체 흐름 — 비개발자도 따라갈 수 있는 그림

```
[사용자 브라우저]
   ai-planner-7y0.pages.dev  ← Cloudflare Pages (HTML/JS/CSS 호스팅)
        │
        ├─ 로그인/회원가입 ──→ Supabase Auth (Google OAuth)
        │
        ├─ 프로필·로드맵·할일 ──→ Supabase Database (Postgres)
        │
        └─ AI Coach / 로드맵 생성 ──→ Supabase Edge Functions
                                              │
                                              └─→ Google Gemini API (키는 서버에만)
```

**핵심 개념 3가지 (Ben & Jo용)**

1. **Cloudflare Pages** = 우리 `index.html`, `js/`, `style.css` 파일을 인터넷에 올려주는 **웹 호스팅**. GitHub에 push하면 자동으로 다시 배포됩니다.
2. **Supabase** = **로그인 + DB + 서버 함수**를 대신 운영해 주는 백엔드. 우리가 서버를 직접 빌드하지 않아도 됩니다.
3. **Edge Functions** = AI처럼 **비밀 API 키가 필요한 작업**을 브라우저가 아니라 Supabase 서버에서 실행. 사용자 브라우저에 Gemini 키를 노출하지 않습니다.

---

#### 4. 오늘 세션 타임라인 (순서대로)

**Phase A — PR 안전하게 받기**

1. Ben fork (`Capstone-project-2-Ben-Jo`)의 `feat/supabase-cloudflare-deploy` 브랜치 확인
2. `main`에 바로 merge하지 않고 **`integrate/ben-jo-supabase-deploy`** 브랜치 생성
3. 충돌 없이 fast-forward merge 성공 → 기존 `main` 작업 보호

**Phase B — Supabase 백엔드 확인 (Haeun 프로젝트)**

- DB 테이블 6개 + RLS(행 단위 보안) 적용 확인
- Edge Functions `ai-coach`, `generate-roadmap` 배포 확인
- `GEMINI_API_KEY`는 Supabase Dashboard → Edge Functions → Secrets에 설정

**Phase C — 배포 방식 정리 (가장 많이 헷갈렸던 부분)**

| 시도 | 결과 | 교훈 |
|------|------|------|
| Workers + `npx wrangler deploy` | 빌드 실패 (`main`에 `package.json` 없음) | 정적 HTML 앱에는 **Workers가 아님** |
| GitHub Actions | 사용 안 함 | CF Pages Git 연동만으로 충분 |
| **Cloudflare Pages** + `npm run build` | ✅ 성공 | 올바른 선택 |

**Workers vs Pages (팀 공통 이해용)**

- **Workers** = JavaScript **서버 프로그램** 실행용 (`wrangler deploy`)
- **Pages** = **정적 웹사이트** (HTML/CSS/JS) 호스팅용 — **우리 프로젝트에 해당**
- 실수로 만든 Workers `capstone-project-2`는 삭제 완료. Pages `ai-planner`만 사용 중.

**Phase D — `js/config.js` 문제 해결**

- Supabase **anon key**는 브라우저에서 써야 하지만, Git에는 올리면 안 됨 (`.gitignore`)
- 해결: Cloudflare Pages **빌드 시** 환경 변수로 `js/config.js` 자동 생성
  - `scripts/generate-config.js` + `npm run build`
  - CF env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

**Phase E — GitHub push (Haeun 계정)**

- 로컬 Git이 Josh 계정(`shualoalumin`)으로 되어 있어 `Haeun-Jo-09` repo push 403
- `gh auth login`으로 **Haeun(`Haeun-Jo-09`)** 계정 전환 후 push 성공

**Phase F — 키/URL 설정 (Dashboard 작업 — Haeun)**

| 어디 | 무엇을 |
|------|--------|
| **Cloudflare Pages** | Production branch, `npm run build`, env 2개 |
| **Supabase → URL Configuration** | Site URL + Redirect URLs (`ai-planner-7y0.pages.dev`) |
| **Google Cloud Console** | OAuth origins + callback URI |
| **Supabase → Providers → Google** | GCP Client ID/Secret 붙여넣기 |

> Supabase Dashboard UI가 바뀌어 **Authentication → URL Configuration** 으로 이동.  
> (예전 `Project Settings → Authentication` 아님)

**Phase G — live 검증 ✅**

- https://ai-planner-7y0.pages.dev 에서 Google 로그인 성공
- Onboarding → Dashboard → Roadmap 데이터 표시
- AI Coach (Gemini Edge Function) 정상 응답

---

#### 5. 역할 분담 정리

| 사람 | 오늘 한 일 |
|------|-----------|
| **Ben** | Supabase Auth/DB/Edge Functions 프론트 연동 코드 PR (`feat/supabase-cloudflare-deploy`) |
| **Haeun** | Supabase·GitHub·Cloudflare **계정 소유**, Dashboard 키 입력, GitHub push 인증 |
| **Josh (supervisor)** | PR 통합 브랜치 전략, Workers→Pages 전환, 빌드 스크립트, MCP로 Supabase/CF 확인, 배포 문서 작성, 팀 가이드 |

---

#### 6. Ben & Jo가 기억하면 좋은 것

1. **배포 URL 바뀌면** Supabase URL Configuration + GCP OAuth origins **둘 다** 업데이트
2. **anon key**는 CF Pages 환경 변수에만 — GitHub에 commit 금지
3. **Gemini key**는 Supabase Edge Functions Secrets에만 — 브라우저/Profile 탭에 넣지 않음
4. **Google redirect URI**는 항상 Supabase callback 하나:  
   `https://bcnhmrvylpkocetfqidh.supabase.co/auth/v1/callback`
5. 로컬 개발: `js/config.example.js` → `js/config.js` 복사 + Live Server `http://localhost:5500`

---

#### 7. 문서 위치 (나중에 다시 볼 때)

| 문서 | 내용 |
|------|------|
| [docs/DEPLOY.md](docs/DEPLOY.md) | CF Pages + Supabase 키 + Workers 삭제 |
| [docs/SOCIAL_LOGIN_SETUP_GUIDE.md](docs/SOCIAL_LOGIN_SETUP_GUIDE.md) | Google OAuth + Supabase redirect |
| [docs/PROJECT_FLOW.md](docs/PROJECT_FLOW.md) | 앱 사용자/코드 흐름 |

---

#### 8. 다음 단계 (main merge 전 checklist)

- [x] `integrate/ben-jo-supabase-deploy` origin push
- [x] Cloudflare Pages 배포 + env 설정
- [x] Supabase URL Configuration
- [x] GCP OAuth + Supabase Google Provider
- [x] live 로그인 + AI Coach 검증
- [x] Workers `capstone-project-2` 삭제
- [ ] **`main` merge** + CF Pages production branch → `main`  
  → 내일 아침 Ben & Haeun이 진행: **[docs/MAIN_MERGE_GUIDE.md](docs/MAIN_MERGE_GUIDE.md)**

`main` merge 후에도 live URL(`ai-planner-7y0.pages.dev`)은 동일하게 유지됩니다.  
Production branch만 `integrate/...` → `main`으로 바꾸면 됩니다.

— Josh

---

### Added

- `scripts/generate-config.js` — Cloudflare Pages 빌드 시 `js/config.js` 생성
- `package.json` with `npm run build` for CF Pages
- [docs/DEPLOY.md](docs/DEPLOY.md) — Supabase/Cloudflare 키 입력 및 배포 가이드

### Changed

- Cloudflare Pages Git 연동 배포로 전환 (GitHub Actions 워크플로 제거)
- Supabase Auth redirect URL 문서에 `ai-planner-7y0.pages.dev` 추가

### Removed

- `.github/workflows/deploy-cloudflare-pages.yml`
- `wrangler.toml` (Workers 배포용 — Pages Git 연동에서는 불필요)

---

## [0.4.0] - 2026-06-18

### Added

- Supabase backend integration (Postgres + RLS)
- Supabase Auth with Google OAuth and email/password
- Edge Function `ai-coach` — server-side Gemini proxy (API key in secrets)
- Edge Function `generate-roadmap` — AI roadmap generation on onboarding complete
- `js/supabase.js` client module
- Database tables: `profiles`, `onboarding_profiles`, `roadmaps`, `milestones`, `daily_tasks`, `daily_progress`
- `.env.example` for Supabase configuration

### Changed

- Auth migrated from localStorage/GIS to Supabase Auth
- AI Coach calls Edge Function instead of client-side Gemini API key
- Onboarding completion triggers real AI roadmap generation (with static fallback)
- Dashboard tasks and milestones load from Supabase when available
- Progress tab uses DB-backed completion data; removed fixed 5% overall progress
- Profile tab no longer exposes Gemini API key input
- `SOCIAL_LOGIN_SETUP_GUIDE.md` updated for Supabase Google provider

### Removed

- Client-side Gemini API key storage (`afp_gemini_key`)
- Plaintext password storage in `localStorage` (replaced by Supabase Auth)

---

## [0.3.0] - 2026-06-15

### Added

- 5-tab bottom navigation: Home, Roadmap, AI Coach, Progress, Profile
- `js/ai.js` — Gemini 2.0 Flash integration, daily progress & streak tracking
- AI Coach chat UI with fallback canned responses
- Progress tab: today ring chart, 7-day bar chart, streak counter
- Profile tab: user info and Gemini API key settings

### Changed

- `js/dashboard.js` refactored for multi-tab layout
- `js/utils.js` — added `goTab()` helper
- `index.html` and `style.css` — bottom nav and tab pane styles

See also: [work-status/2026-06-15-report_Jo.md](work-status/2026-06-15-report_Jo.md)

---

## [0.2.0] - 2026-06-09

### Added

- Google OAuth via Google Identity Services (`js/auth.js`)
- `SOCIAL_LOGIN_SETUP_GUIDE.md`
- Delete today's task button
- US curriculum presets and chat visibility updates
- Mobile-first centered smartphone viewport on desktop (`style.css`)

### Fixed

- Google OAuth `origin_mismatch` — requires local server instead of `file://`

See also: [work-status/2026-06-09-report_Jo.md](work-status/2026-06-09-report_Jo.md)

---

## [0.1.0] - 2026-06-05

### Added

- Modular JS split: `auth.js`, `onboarding.js`, `dashboard.js`, `data.js`, `utils.js`, `main.js`
- 6-step onboarding flow (grade → track → goal → target date → levels → hours)
- `DEVELOPMENT_PLAN.md` — Capstone MVP roadmap and phased plan
- Analyzing screen with loading animation

### Changed

- Single HTML prototype split into `index.html` + `js/` modules

---

## [0.0.1] - 2026-05-28

### Added

- Initial HTML prototype (`ai_future_planner_dashboard.html`)
- Product vision document `AI_Future_Planner_for_Students.md`
- Login, register, onboarding, and dashboard UX shell
- Track-specific static presets (Science, Medical, Humanities, Arts, Business, Study Abroad)

---

## Notes

- **2026-06-16**: PR #3 reverted some styling from PR #2 merge; 5-tab + `ai.js` features retained. Docs reorganized into `MD_files/` (later `docs/`).
- Daily work reports: [work-status/](work-status/)
