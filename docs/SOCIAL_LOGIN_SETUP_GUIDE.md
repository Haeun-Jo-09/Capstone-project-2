# Social Login Setup Guide (Supabase Auth)

Google login is handled through **Supabase Auth**, not the Google Identity Services SDK.

## Prerequisites

1. Supabase project: `bcnhmrvylpkocetfqidh`
2. `js/config.js` with your Supabase URL and anon key (copy from `js/config.example.js`)
3. App served from `http://localhost` or HTTPS (not `file://`)

## Step 1. Enable Google in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/bcnhmrvylpkocetfqidh/auth/providers)
2. Go to **Authentication → Providers → Google**
3. Enable Google and paste your **Client ID** and **Client Secret** from Google Cloud Console

## Step 2. Google Cloud Console

1. Create or select a project
2. **APIs & Services → Credentials → Create OAuth client ID** (Web application)
3. **Authorized JavaScript origins:**
   - `http://localhost:5500` (or your local port)
   - `https://bcnhmrvylpkocetfqidh.supabase.co`
   - `https://ai-planner-7y0.pages.dev`
4. **Authorized redirect URIs:**
   - `https://bcnhmrvylpkocetfqidh.supabase.co/auth/v1/callback`

## Step 3. Supabase redirect URLs

Supabase Dashboard UI가 바뀌었습니다. **Project Settings → Authentication**이 아니라 아래 경로를 사용하세요.

### 찾는 방법 (2025~ UI)

**방법 A — 직접 링크 (가장 빠름)**

1. [URL Configuration 페이지 열기](https://supabase.com/dashboard/project/bcnhmrvylpkocetfqidh/auth/url-configuration)

**방법 B — 사이드바**

1. [Supabase Dashboard](https://supabase.com/dashboard/project/bcnhmrvylpkocetfqidh) 프로젝트 열기
2. 왼쪽 **Authentication** 클릭
3. 하위 메뉴에서 **Configuration** 또는 **URL Configuration** 선택  
   - 예전 `Project Settings → Authentication`은 **단축 링크**만 남아 있을 수 있음
4. **Site URL** / **Redirect URLs** 입력란 확인

> **OAuth Server** 쪽 Redirect URI 설정과 혼동하지 마세요.  
> Google 로그인용은 **Authentication → URL Configuration** (사용자 로그인 redirect)입니다.

### 입력할 값

- **Site URL:** `https://ai-planner-7y0.pages.dev` (production) or `http://localhost:5500` (local)
- **Redirect URLs:** **Add URL** 버튼으로 하나씩 추가:
  - `https://ai-planner-7y0.pages.dev/**`
  - `http://localhost:5500`
  - `http://127.0.0.1:5500`
  - `http://localhost:3000`

변경 후 **Save** 클릭.

## Step 4. Test

1. Start a local static server (e.g. Live Server on port 5500)
2. Open the app → **Continue with Google**
3. Complete sign-in → app should create a `profiles` row and route to onboarding or dashboard

## Email / password login

Register with email + password uses Supabase `signUp`. Login form uses **email** (not username ID).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redirect loop | Check Site URL matches your origin exactly |
| `Invalid login credentials` | Confirm email confirmation settings in Supabase Auth |
| Popup blocked | Supabase uses redirect flow; allow redirects for localhost |
| AI Coach fails | Set `GEMINI_API_KEY` in Edge Functions → Secrets |

## Edge Function secrets

Set in Dashboard → **Edge Functions → Secrets**:

- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey)

Supabase injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically for Edge Functions.
