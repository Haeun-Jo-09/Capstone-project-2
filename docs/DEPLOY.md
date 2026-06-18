# 배포 가이드 — Cloudflare Pages + Supabase

GitHub Actions 없이 **Cloudflare Pages Git 연동**으로 배포합니다.  
`js/config.js`는 gitignore 되어 있으므로 **빌드 단계**에서 환경 변수로 생성합니다.

---

## 1. Supabase 설정 (Jo Dashboard)

프로젝트: `bcnhmrvylpkocetfqidh`

### API 키 (Cloudflare에 입력할 값)

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

`SUPABASE_URL`, `SUPABASE_ANON_KEY`는 Edge Function에 Supabase가 자동 주입합니다.

### Auth Redirect URL (Pages URL 확정 후)

**Authentication → URL Configuration**

| 필드 | 값 |
|------|-----|
| Site URL | `https://capstone-project-2.pages.dev` (또는 실제 Pages 도메인) |
| Redirect URLs | `https://capstone-project-2.pages.dev/**` |
| | `http://localhost:5500` |
| | `http://127.0.0.1:5500` |

Google Cloud Console → OAuth client → **Authorized JavaScript origins**에 Pages URL 추가.

Google **Authorized redirect URI** (고정):

```
https://bcnhmrvylpkocetfqidh.supabase.co/auth/v1/callback
```

상세: [SOCIAL_LOGIN_SETUP_GUIDE.md](./SOCIAL_LOGIN_SETUP_GUIDE.md)

---

## 2. Cloudflare Pages 설정 (Jo Dashboard)

**Workers & Pages → capstone-project-2 → Settings → Builds & deployments**

| 설정 | 값 |
|------|-----|
| Production branch | `integrate/ben-jo-supabase-deploy` (테스트) → 검증 후 `main` |
| Framework preset | None |
| Build command | `node scripts/generate-config.js` |
| Build output directory | `/` |
| Root directory | (비움) |

### Environment Variables

**Settings → Environment variables** (Production + Preview)

| Variable | Type | 값 |
|----------|------|-----|
| `SUPABASE_URL` | Plaintext | `https://bcnhmrvylpkocetfqidh.supabase.co` |
| `SUPABASE_ANON_KEY` | Secret | Supabase anon/publishable key |

배포는 **Git push 시 자동** 실행됩니다. `CLOUDFLARE_API_TOKEN`은 Git 연동 배포에 필요 없습니다.

---

## 3. 브랜치 전략

1. `integrate/ben-jo-supabase-deploy` push → CF Pages 테스트 배포
2. 로그인 · onboarding · AI Coach 확인
3. `main` merge → CF Production branch를 `main`으로 변경

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
