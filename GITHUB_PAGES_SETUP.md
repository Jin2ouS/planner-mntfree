# GitHub Pages 배포 가이드

## 현재 상태
✅ GitHub Actions 워크플로우가 이미 설정되어 있습니다 (`.github/workflows/deploy.yml`)
✅ `vite.config.js`에 base path가 설정되어 있습니다 (`/` — 커스텀 도메인 루트 기준)

## 배포 방법

### 1. 코드 변경 후 배포 (자동 배포)

코드를 수정한 후 다음 명령어를 실행하세요:

```bash
# 변경사항 확인
git status

# 변경사항 스테이징
git add .

# 커밋
git commit -m "변경 내용 설명"

# GitHub에 푸시 (자동으로 배포 시작)
git push origin main
```

푸시하면 GitHub Actions가 자동으로:
1. 프로젝트를 빌드합니다
2. `dist` 폴더를 생성합니다
3. GitHub Pages에 배포합니다

### 2. GitHub Pages 설정 (최초 1회만)

GitHub 저장소에서 Pages를 활성화해야 합니다:

1. **GitHub 저장소로 이동**
   - https://github.com/[사용자명]/planner-mntfree 접속

2. **Settings 메뉴 클릭**
   - 저장소 상단의 "Settings" 탭 클릭

3. **Pages 메뉴 선택**
   - 왼쪽 사이드바에서 "Pages" 클릭

4. **Source 설정**
   - "Build and deployment" 섹션에서:
     - Source: **GitHub Actions** 선택 (권장)

5. **저장**
   - 필요 시 "Save" 버튼 클릭

### 3. 커스텀 도메인 (planner.mntfree.com)

1. **GitHub에서 도메인 등록**
   - Settings → Pages → **Custom domain**
   - 입력: `planner.mntfree.com`
   - **Save**
   - 가능하면 **Enforce HTTPS** 체크

2. **DNS 설정 (도메인 등록처에서)**
   - `planner.mntfree.com`은 서브도메인이므로 **CNAME** 한 개 추가:
   - 타입: **CNAME**
   - 호스트(이름): `planner` (등록처에 따라 `planner.mntfree` 일 수 있음)
   - 값(가리킬 주소): `[GitHub사용자명].github.io`
   - 전파에는 수 분~최대 48시간 걸릴 수 있습니다. GitHub Pages 설정에서 도메인 확인 상태를 확인할 수 있습니다.

### 4. 배포 상태 확인

1. **Actions 탭 확인**
   - GitHub 저장소의 "Actions" 탭에서 배포 진행 상황 확인
   - 초록색 체크 표시가 나타나면 배포 성공

2. **배포된 사이트 확인**
   - 배포가 완료되면 (보통 1-2분 소요):
   - 커스텀 도메인: `https://planner.mntfree.com` 접속
   - 또는 `https://[사용자명].github.io/planner-mntfree/` (base가 `/`이면 루트에서 서빙되므로 사용자명.github.io일 수 있음 — 커스텀 도메인 사용 시 해당 URL은 사용하지 않음)
   - Settings > Pages에서 제공되는 URL 확인

### 5. 수동 배포 (필요시)

자동 배포가 작동하지 않는 경우:

```bash
# 빌드
npm run build

# gh-pages로 배포 (package.json에 스크립트 포함됨)
npm run deploy
```

## 문제 해결

### 배포가 안 될 때

1. **GitHub Actions 확인**
   - 저장소의 "Actions" 탭에서 실패한 워크플로우 확인
   - 에러 메시지 확인

2. **Permissions 확인**
   - Settings > Actions > General
   - "Workflow permissions"에서 "Read and write permissions" 선택
   - "Allow GitHub Actions to create and approve pull requests" 체크

3. **Pages 설정 확인**
   - Settings > Pages에서 "Source"가 **GitHub Actions**로 설정되었는지 확인

### 사이트가 404 에러일 때

- `vite.config.js`의 `base`가 커스텀 도메인 루트 기준이면 `base: '/'` 로 두면 됩니다.
- 현재 설정: `base: '/'`

### 커스텀 도메인 DNS 확인 중일 때

- 도메인 전파 전에는 GitHub에서 "DNS check" 경고가 나올 수 있으며, 전파 후 자동으로 해결되는 경우가 많습니다.

## 참고사항

- 배포는 `main` 브랜치에 푸시할 때마다 자동으로 실행됩니다
- 배포 완료까지 보통 1-3분 정도 소요됩니다
- 첫 배포는 GitHub Pages 설정 후 몇 분 더 걸릴 수 있습니다
- 커스텀 도메인 사용 시 `https://planner.mntfree.com/goal-calc` 등 경로 직접 접속·새로고침도 동작합니다 (404.html SPA 대응)
