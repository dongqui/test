# PLASK 💫

plask

### Installation ⚙️

```bash
# 의존성 설치
npx yarn

# 배포 환경 연동
npx vercel link

# 환경 변수 로드
npx vercel env pull

# 개발 환경 기동
npx yarn dev
```

### Build Script 🔗

```json
// Next
"dev": "개발 버전 시작",
"prod": "Next.js 정적 빌드",
"start": "프로덕션 버전 시작",

// Storybook
"storybook": "스토리북 시작",
"build-storybook": "스토리북 빌드",

// Build
"build-src": "라우팅 경로로 정적 빌드",
"build-electron": "일렉트론 빌드",
"build": "Next.js 정적 빌드 후 일렉트론도 함께 빌드",
"pack-app": "일렉트론 빌드 후 데스크탑 앱 생성",
"dist": "Next.js 정적 빌드 후 일렉트론 데스크탑 앱 생성",
"clean": "필요없는 dist 파일 삭제",
```
