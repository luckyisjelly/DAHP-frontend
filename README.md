# DAHP-frontend

DAHP 프론트엔드 (Vite + React 19 + TypeScript + Tailwind v4).

## 개발 환경

- Node.js 22+
- 백엔드: `c:\dahp` (Spring Boot, http://localhost:8090)

## 시작하기

```bash
npm install
npm run dev
```

기본 포트: http://localhost:5173

`/api/*` 요청은 vite dev proxy로 http://localhost:8090 으로 전달됩니다.
필요 시 `.env.local`에 `VITE_API_BASE_URL`을 지정해 직접 호출도 가능합니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | TypeScript 타입체크만 |

## 폴더 구조

```
src/
  api/        # axios 클라이언트, 엔드포인트별 함수
  components/ # 재사용 컴포넌트
  hooks/      # 커스텀 훅
  layouts/    # AppLayout, AuthLayout
  pages/      # 라우트 페이지
  routes/     # react-router 설정
  store/      # zustand 스토어
  types/      # 공용 타입
  utils/      # 유틸 함수
```

## 인증

- JWT Bearer 토큰 — `localStorage`(`dahp-auth` 키)에 access/refresh 저장
- 401 응답 시 `/api/auth/refresh`로 자동 갱신 1회 시도 → 실패 시 `/login`으로 리다이렉트
- 자세한 응답 포맷은 백엔드 `c:\dahp` 참고
