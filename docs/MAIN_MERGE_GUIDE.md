# main merge 가이드 — Ben & Haeun (2026-06-19 아침)

Josh(supervisor)가 정리한 **내일 아침 직접 진행**용 체크리스트입니다.  
백엔드/배포 경험이 없어도 **아래 순서만** 따라 하면 됩니다.

---

## 먼저 알아두기

| 질문 | 답 |
|------|-----|
| Site URL 바꿔야 하나? | **아니요.** `https://ai-planner-7y0.pages.dev` 그대로 |
| Supabase / GCP 설정 다시? | **아니요.** 이미 완료됨 |
| 뭘 바꾸나? | Git `main` merge + CF Pages **Production branch**만 `main`으로 |

---

## 사전 확인 (merge 전)

- [ ] 어제 live 테스트 OK (로그인 + AI Coach)
- [ ] GitHub 저장소: `Haeun-Jo-09/Capstone-project-2`
- [ ] merge 대상 브랜치: `integrate/ben-jo-supabase-deploy` (origin에 push되어 있음)
- [ ] **Haeun GitHub 계정**으로 로그인 (`gh auth status` → `Haeun-Jo-09`)

---

## Step 1 — Git: main merge (Haeun PC 또는 둘 중 한 명)

PowerShell 또는 Git Bash:

```powershell
cd "c:\Users\Josh.PCLAB\Documents\github\Capstone-project-2"

# 최신 코드 받기
git fetch origin

# main으로 이동
git checkout main
git pull origin main

# integrate 브랜치 내용 합치기
git merge origin/integrate/ben-jo-supabase-deploy

# 충돌 없으면 바로 push
git push origin main
```

### GitHub 계정 403 나올 때

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth status
```

`shualoalumin` 등 다른 계정이면:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login -h github.com -p https -w
```

**Haeun-Jo-09**로 로그인 후 push 다시 시도.

### merge 충돌(conflict) 나면

- **직접 해결하지 말고** Josh에게 연락
- `git merge --abort` 로 되돌릴 수 있음

---

## Step 2 — Cloudflare Pages: Production branch 변경 (Haeun)

**merge push가 끝난 뒤에** 진행하세요. (순서 바꾸면 빌드 실패)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **ai-planner** (Pages 프로젝트) 선택 — Workers `capstone-project-2` 아님
3. **Settings** → **Builds & deployments**
4. **Production branch** 변경:
   - `integrate/ben-jo-supabase-deploy` → **`main`**
5. **Save** 후 배포 시작 확인 (자동 또는 **Retry deployment**)

### Build 설정 확인 (변경 없어도 됨 — 확인만)

| 설정 | 값 |
|------|-----|
| Build command | `npm run build` |
| Build output | `/` |
| `SUPABASE_URL` | `https://bcnhmrvylpkocetfqidh.supabase.co` |
| `SUPABASE_ANON_KEY` | (Secret, 이미 설정됨) |

---

## Step 3 — 검증 (Ben 또는 Haeun)

1. https://ai-planner-7y0.pages.dev 접속
2. **Continue with Google** 로그인
3. Dashboard / AI Coach 한 번씩 확인
4. Cloudflare **Deployments** 탭에서 최신 배포 **Success** 확인

---

## Step 4 — 완료 후 (선택)

- GitHub에서 `integrate/ben-jo-supabase-deploy` 브랜치는 당장 삭제하지 않아도 됨
- 나중에 Josh와 상의 후 정리 가능

---

## 건드리지 말 것

| 항목 | 이유 |
|------|------|
| Supabase Site URL / Redirect URLs | URL 안 바뀜 |
| GCP OAuth origins / redirect URI | URL 안 바뀜 |
| CF Environment variables | 그대로 사용 |
| Workers 프로젝트 새로 만들기 | Pages만 사용 |

---

## 문제 발생 시

| 증상 | 확인 |
|------|------|
| CF 빌드 `ENOENT package.json` | Production branch가 `main`인데 **merge push 전**인지 확인 |
| Google 로그인 실패 | Supabase/GCP는 건드리지 않았는지 확인 → Josh |
| merge 충돌 | Josh에게 연락 |

---

## 참고 문서

- [DEPLOY.md](./DEPLOY.md) — 전체 배포 설정
- [CHANGELOG.md](../CHANGELOG.md) — 2026-06-18 Supervisor Session Note (Josh)

— Josh
