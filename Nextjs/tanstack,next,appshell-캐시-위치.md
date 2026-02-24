## tanstack, next, service worker 캐시 위치와 차이

### 1) TanStack Query (클라이언트 데이터 캐시)
- **저장 위치:** 브라우저 **메모리(RAM)** (JS 런타임 내부)
- **접근 주체:** React 앱 코드 (TanStack Query)
- **캐시 대상:** API 응답 데이터 (JSON 등)
- **특징:**
  - 탭 종료/새로고침 시 기본적으로 사라짐
  - `staleTime`, `cacheTime`으로 수명 제어
  - **HTTP Cache와 별개** (네트워크 요청 결과를 앱 내부 상태로 캐싱)

### 2) Next.js (서버/네트워크 캐시)
> Next는 **서버 실행 환경 + CDN**에서 캐시가 생김

#### A. SSG/ISR 결과물 캐시 (정적 HTML)
- **저장 위치:** **CDN** (네트워크 캐시)
- **접근 주체:** CDN/엣지 (브라우저가 받음)
- **캐시 대상:** 빌드 시 생성된 HTML (SSG) / 재검증된 HTML (ISR)
- **특징:** 브라우저가 아니라 **네트워크 경계(CDN)**에 저장됨

#### B. Next fetch 캐시 (서버 데이터 캐시)
- **저장 위치:** **서버 런타임 메모리/스토리지** (Next 서버/엣지)
- **접근 주체:** Next 서버 런타임
- **캐시 대상:** `fetch` 결과 (기본 `force-cache`, ISR `revalidate`)
- **특징:** **서버 사이드 캐시**이며, 브라우저 캐시와 분리됨

#### C. 브라우저 HTTP Cache (정적 리소스)
- **저장 위치:** 브라우저 **메모리/디스크**
- **접근 주체:** 브라우저 네트워크 레이어
- **캐시 대상:** JS/CSS/이미지 등 정적 리소스
- **특징:** `Cache-Control` 헤더에 의해 자동 제어됨

### 3) Service Worker (앱 셸 캐시)
- **저장 위치:** 브라우저 **디스크** (Cache Storage)
- **접근 주체:** Service Worker
- **캐시 대상:** HTML/JS/CSS/이미지/API 응답 등 **명시적으로 저장한 것**
- **특징:**
  - 네트워크보다 앞에서 요청을 가로챔
  - 오프라인 지원 가능
  - **HTTP Cache와 완전히 별도**

---

## 차이 요약

### A. 저장 위치 기준
- **TanStack Query:** 브라우저 메모리 (탭 생명주기)
- **Next (SSG/ISR):** CDN/엣지 캐시 (네트워크 경계)
- **Next fetch 캐시:** 서버 런타임 내부
- **Service Worker:** 브라우저 디스크 (Cache Storage)

### B. 제어 주체 기준
- **TanStack Query:** 앱 코드가 직접 제어
- **Next 캐시:** 서버/프레임워크가 제어
- **Service Worker:** 개발자가 직접 제어
- **HTTP Cache:** 브라우저가 자동 제어

### C. 캐시 대상 기준
- **TanStack Query:** API 응답 데이터 (앱 상태)
- **Next SSG/ISR:** HTML 결과물
- **Next fetch:** 서버 데이터 응답
- **Service Worker:** 리소스 전반 (앱 셸)

---

## 한 줄 결론
- **TanStack = 브라우저 메모리 데이터 캐시**
- **Next = 서버/네트워크 캐시 (HTML + fetch)**
- **Service Worker = 브라우저 디스크 캐시 (앱 셸/오프라인)**
