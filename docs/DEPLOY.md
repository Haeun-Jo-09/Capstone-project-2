# 배포 가이드 — Cloudflare Pages + Supabase

이 프로젝트는 **정적 HTML/JS/CSS** 사이트입니다.  
**Cloudflare Pages**로 배포해야 하며, **Workers Git 연동(`npx wrangler deploy`)은 사용하지 않습니다.**

GitHub Actions 없이 **Cloudflare Pages Git 연동**으로 배포합니다.  
`js/config.js`는 gitignore 되어 있으므로 **빌드 단계**에서 환경 변수로 생성합니다.

---

## Workers → Pages 전환 (중요)

현재 `capstone-project-2`가 **Workers**로 만들어져 있으면 아래처럼 **Pages 프로젝트를 새로** 만듭니다.

| | Workers (현재, 잘못된 설정) | Pages (목표) |
|---|------------------------------|--------------|
| 유형 | Worker + `wrangler deploy` | 정적 사이트 호스팅 |
| Deploy command | `npx wrangler deploy` | **없음** |
| Build command | `npm run build` | `npm run build` |
| Build output | wrangler가 처리 | **`/`** (repo 루트) |
| 도메인 | workers.dev 등 | **`*.pages.dev`** |

### Dashboard에서 Pages 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **Create** → **Pages** → **Connect to Git** (Workers가 아님)
3. GitHub `Haeun-Jo-09/Capstone-project-2` 연결
4. 아래 Build 설정 입력

| 설정 | 값 |
|------|-----|
| Project name | `capstone-project-2` (또는 새 이름) |
| Production branch | `integrate/ben-jo-supabase-deploy` (테스트) → 검증 후 `main` |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | **`/`** |
| Root directory | (비움) |

5. **Environment variables** (Production + Preview) 추가 — 아래 2절 참고
6. 배포 성공 후 URL 확인 (예: `https://capstone-project-2.pages.dev`)
7. (선택) 기존 **Workers** `capstone-project-2` 프로젝트는 Settings에서 삭제해 중복 방지

> Pages에는 **Deploy command / Version command** 필드가 없습니다.  
> `npx wrangler deploy`가 보이면 Workers 프로젝트입니다 — Pages로 새로 만드세요.

---

## 1. Supabase 설정 (Jo Dashboard)

프로젝트: `bcnhmrvylpkocetfqidh`

### API 키 (Cloudflare Pages에 입력할 값)

**Project Settings → API**

| 항목 | 값 | Cloudflare 변수 |
|------|-----|-----------------|
| Project URL | `https://bcnhmrvylpkocetfqidh.supabase.co` | `SUPABASE_URL` |
| anon / publishable key | Dashboard에서 복사 | `SUPABASE_ANON_KEY` |

> `service_role` / secret key는 **절대** Cloudflare·GitHub·브라우저에 넣지 마세요.

### Edge Functions Secret

**Edge Functions → Secrets**

| 이름 | 값 |
|------|-----|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) API key |

### Auth Redirect URL (Pages URL 확정 후)

**Authentication → URL Configuration**

| 필드 | 값 |
|------|-----|
| Site URL | `https://capstone-project-2.pages.dev` |
| Redirect URLs | `https://capstone-project-2.pages.dev/**` |
| | `http://localhost:5500` |
| | `http://127.0.0.1:5500` |

Google Cloud Console → OAuth → **Authorized JavaScript origins**에 Pages URL 추가.

Google **Authorized redirect URI** (고정):

```
https://bcnhmrvylpkocetfqidh.supabase.co/auth/v1/callback
```

상세: [SOCIAL_LOGIN_SETUP_GUIDE.md](./SOCIAL_LOGIN_SETUP_GUIDE.md)

---

## 2. Cloudflare Pages Environment Variables

**Pages 프로젝트 → Settings → Environment variables** (Production + Preview)

| Variable | Type | 값 |
|----------|------|-----|
| `SUPABASE_URL` | Plaintext | `https://bcnhmrvylpkocetfqidh.supabase.co` |
| `SUPABASE_ANON_KEY` | Secret | Supabase anon/publishable key |

Git push 시 Pages가 자동으로 `npm run build` → 정적 파일 배포합니다.

---

## 3. 브랜치 전략

1. `integrate/ben-jo-supabase-deploy` push → Pages 테스트 배포
2. 로그인 · onboarding · AI Coach 확인
3. `main` merge → Pages Production branch를 `main`으로 변경

---

## 4. 로컬 개발

```powershell
copy js\config.example.js js\config.js
# anon key 입력 후 Live Server → http://localhost:5500
```

또는:

```powershell
$env:SUPABASE_ANON_KEY="your_key_here"
node scripts/generate-config.js
```

---

## 5. 빌드 실패 시 확인

| 증상 | 원인 | 해결 |
|------|------|------|
| `ENOENT package.json` | Production branch가 `main` | branch → `integrate/ben-jo-supabase-deploy` |
| `SUPABASE_ANON_KEY is required` | env 미설정 | Pages env variables 추가 |
| `npx wrangler deploy` 실패 | Workers 프로젝트 사용 중 | **Pages** 프로젝트 새로 생성 |
| 502 / 빈 페이지 | `js/config.js` 미생성 | build log에 `Generated js/config.js` 확인 |
