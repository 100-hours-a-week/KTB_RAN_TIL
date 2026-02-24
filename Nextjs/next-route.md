# Step 1. 브라우저 쿠키 정책 정확히 이해

## 1-1. `SameSite`의 정확한 의미

`SameSite`는 **쿠키가 “어떤 사이트 컨텍스트에서 전송/저장될 수 있는지”를 제한하는 브라우저 보안 정책**다.
여기서 말하는 “Site”는 **Origin이 아니라 Registrable Domain 기준**이다.

### Site 정의 (중요)

* `https://app.example.com`
* `https://api.example.com`

→ **Same-Site**
(같은 eTLD+1: `example.com`)

* `http://localhost:3000`
* `https://api.example.com`

→ **Cross-Site**

---

### SameSite 옵션별 동작

| 옵션       | 동작                                                               |
| -------- | ---------------------------------------------------------------- |
| `Strict` | same-site + top-level navigation만 허용                             |
| `Lax`    | same-site fetch 허용 + cross-site **top-level navigation(GET)** 허용 |
| `None`   | 모든 컨텍스트 허용 (단, `Secure=true` 필수)                                 |

현재 너희 상황에서 핵심은:

> **`SameSite=Lax`는 cross-site fetch 요청에서는 쿠키 영구 저장을 보장하지 않는다**

---

## 1-2. `Secure` 옵션의 정확한 역할

* `Secure=true`
  → HTTPS 연결에서만 쿠키 전송/저장 가능
* HTTP 환경(localhost)에서는 **정상 동작이 보장되지 않음**

중요 포인트:

* Secure는 SameSite를 “완화”하지 않는다
* Secure + Lax 조합은 **cross-site fetch를 허용하지 않음**

---

## 1-3. cross-site vs cross-origin (가장 많이 헷갈리는 부분)

### Origin 정의

```
scheme + host + port
```

### Site 정의

```
registrable domain (eTLD+1)
```

---

### 차이 정리

| 구분           | 기준                 | 예시                              |
| ------------ | ------------------ | ------------------------------- |
| cross-origin | scheme/host/port   | localhost:3000 ↔ localhost:4000 |
| cross-site   | registrable domain | localhost ↔ example.com         |

중요한 결론:

> **CORS는 cross-origin 문제**
> **SameSite 쿠키는 cross-site 문제**

지금 이슈는 **CORS 문제가 아니라 브라우저 쿠키 저장 정책 문제**다.

---

## 1-4. 왜 “로그인 직후에는 보이고, 새로고침 후 사라질까?”

브라우저 동작 요약:

1. cross-site fetch 응답 수신
2. `Set-Cookie` 수신
3. **임시 저장 (in-memory)**
4. document lifecycle 종료(새로고침)
5. SameSite 정책 위반 → 영구 저장 불가 → 쿠키 제거

이건 버그가 아니라 **의도된 브라우저 보안 동작**이다.

---

# Step 2. Reverse Proxy vs BFF / Thin vs Thick Proxy

## 2-1. Reverse Proxy vs BFF

### Reverse Proxy

* 서버 앞단
* 모든 클라이언트 공용
* 예: Nginx, CDN

### BFF (Backend For Frontend)

* **특정 프론트엔드를 위한 서버**
* 브라우저와 직접 통신
* 프론트 요구사항에 맞게 최적화

---

### 핵심 차이

| 항목 | Reverse Proxy | BFF        |
| -- | ------------- | ---------- |
| 대상 | 전체 클라이언트      | 특정 FE      |
| 목적 | 트래픽/보안        | UX/브라우저 정책 |
| 위치 | 인프라           | FE 서버      |

너희는 **BFF**를 도입하려는 상황이다.

---

## 2-2. Thin Proxy vs Thick Proxy

### Thin Proxy (너희가 원하는 형태)

* 요청/응답 그대로 전달
* 인증 판단 없음
* 비즈니스 로직 없음
* 목적: **요청 컨텍스트 재구성**

```text
Browser → BFF → Backend
        (쿠키 수신 위치 변경)
```

---

### Thick Proxy (주의해야 할 형태)

* 토큰 검증
* 사용자 인증 판단
* Refresh 로직 수행
* API 응답 가공

이 경우:

* Auth Gateway 성격
* 장애·보안 리스크 급증
* 프론트/백엔드 책임 경계 붕괴

---

### 결론

> v2에서 도입할 프록시는 **의도적으로 기능이 부족해야 한다**

---

# Step 3. Next.js Route Handler 단순 프록시 POC

## 3-1. 설계 목표

* 브라우저 기준 same-site 요청 만들기
* `Set-Cookie` 헤더 손실 없이 전달
* 인증 로직 추가하지 않기

---

## 3-2. 기본 구조

```
app/
 └─ api/
     └─ proxy/
         └─ [...path]/
             └─ route.ts
```

---

## 3-3. Route Handler 예시 (개념 코드)

```ts
// app/api/proxy/[...path]/route.ts

import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = "https://api.project.com";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const targetUrl = `${BACKEND_BASE_URL}/${params.path.join("/")}`;

  const backendRes = await fetch(targetUrl, {
    method: "GET",
    headers: req.headers,
    credentials: "include",
  });

  const res = new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: backendRes.headers,
  });

  return res;
}
```

핵심 포인트:

* `headers` 그대로 전달
* `Set-Cookie` 제거하지 않음
* `credentials: include`

---

## 3-4. Set-Cookie 전달 테스트 시나리오

### 테스트 절차

1. `/api/proxy/auth/login` 호출
2. backend → `Set-Cookie: RT`
3. 브라우저 Application > Cookies 확인
4. 새로고침
5. 쿠키 유지 여부 확인

---

## 3-5. 실패 시 체크 포인트

* `credentials: include` 누락
* HTTPS 환경 여부
* Next.js runtime(edge/node) 차이
* Response headers 복사 누락

---

# Step 4. v2 인증 흐름 다이어그램 & 책임 경계 문서화

## 4-1. v2 인증 흐름 (텍스트 다이어그램)

```
[Browser]
   |
   | POST /api/proxy/auth/login
   |
[Frontend(BFF)]
   |
   | POST /auth/login
   |
[Backend]
   |  Set-Cookie: RT
   |
[Frontend(BFF)]
   |  (그대로 전달)
   |
[Browser]
   |  RT 쿠키 저장 (same-site)
```

---

## 4-2. Refresh 흐름

```
[Browser]
   |
   | POST /api/proxy/auth/refresh (Cookie: RT)
   |
[BFF]
   |
   | POST /auth/refresh (Cookie forwarding)
   |
[Backend]
   |  AT 재발급
   |
[Browser]
   |  AT → 메모리 저장
```

---

## 4-3. “프록시 책임 경계” 문서 예시

### 프록시가 담당하는 것

* 요청 오리진 통합
* Cookie 전달
* Header 전달
* 브라우저 정책 충족

### 프록시가 **절대 하지 않는 것**

* 인증 상태 판단
* 토큰 파싱
* 사용자 식별
* 에러 의미 변환
이 질문이 핵심이야.
여기서 헷갈리기 쉬운 포인트가 있어서 **개념 → 실제 동작 → 구현 레벨**로 분리해서 설명할게.

결론부터 말하면,

> **프론트에서 “도메인을 변경하는 것”은
> 브라우저의 주소를 바꾸는 게 아니라,
> 브라우저가 인식하는 “요청의 도착 오리진”을 바꾸는 것**이다.

---

# 1. 먼저 오해부터 정리

### ❌ 프론트에서 도메인을 “변경한다”는 오해

* JS에서 domain을 rewrite?
* fetch 옵션으로 origin 변경?
* 쿠키 domain 강제 설정?

→ **프론트 코드는 브라우저의 origin을 바꿀 수 없다.**

브라우저 보안 모델상:

* 현재 페이지의 origin은 **주소창 기준**
* JS는 origin을 조작할 수 없음

---

### ✅ 실제로 의미하는 “도메인 변경”

> **브라우저가 “이 응답은 어느 오리진에서 왔다”고 인식하느냐가 바뀐다**

이건 **서버 구조 + 네트워크 라우팅 문제**다.

---

# 2. 현재 구조에서 왜 cross-site로 인식되는가

## 현재 (문제 구조)

```
주소창:
https://app.project.com

JS fetch:
fetch("https://api.project.com/auth/login")
```

브라우저 인식:

* 페이지 origin: `app.project.com`
* 응답 origin: `api.project.com`
* → **cross-site**
* → SameSite=Lax 쿠키 영구 저장 ❌

---

# 3. BFF 도입 시 “도메인이 바뀌는 지점”

중요한 포인트:

> **브라우저는 “최종 응답을 준 서버”를 기준으로 쿠키를 저장한다**

---

## BFF 구조

```
주소창:
https://app.project.com

JS fetch:
fetch("/api/auth/login")
```

실제 네트워크 흐름:

```
Browser
  └─ https://app.project.com/api/auth/login
        ↓
     Frontend Server (BFF)
        ↓
     https://api.project.com/auth/login
```

---

## 브라우저가 보는 세계

* 요청 보냄: `app.project.com`
* 응답 받음: `app.project.com`
* Set-Cookie 수신 오리진: `app.project.com`

👉 **여기서 “도메인이 바뀐 것”이다**

백엔드가 아니라 **프론트 서버가 응답 주체가 됨**

---

# 4. 그럼 실제로 도메인은 어떻게 구성하느냐

여기서부터가 실무 포인트다.

## 4-1. DNS / 배포 레벨 구조

예시:

```
app.project.com  → Frontend (Next.js)
api.project.com  → Backend API
```

v2에서 BFF 도입 후에도 **DNS는 안 바뀐다**.

변하는 건 **요청 경로**다.

---

## 4-2. 프론트에서의 변화 (아주 중요)

### ❌ 기존

```ts
fetch("https://api.project.com/auth/login");
```

### ✅ 변경 후

```ts
fetch("/api/auth/login", {
  credentials: "include",
});
```

* 절대 URL → 상대 URL
* 호출 대상은 **항상 app.project.com**

---

## 4-3. Next.js가 “프록시 서버”가 되는 지점

Next.js 서버가 이 요청을 받는다:

```
GET https://app.project.com/api/auth/login
```

Route Handler에서:

```
→ https://api.project.com/auth/login
```

으로 **서버-서버 요청**을 보낸다.

---

# 5. 왜 이게 SameSite를 만족시키는가

### 핵심 공식 (브라우저 관점)

* 쿠키는 **응답을 준 서버의 site** 기준으로 저장된다
* BFF가 응답을 주면:

  * site = `project.com`
  * same-site 성립

---

### Secure / SameSite 그대로 유지 가능

* Secure=true 유지
* SameSite=Lax 유지
* None로 완화할 필요 ❌

---

# 6. “도메인을 바꾼다”를 정확히 표현하면

정확한 기술적 표현은 이거다:

> **브라우저가 백엔드 API를 직접 호출하지 않도록 하고,
> 프론트엔드 서버가 동일 오리진에서 응답을 재발행한다**

또는 문서용으로는:

> **API 요청의 최종 응답 오리진을 프론트엔드 서버로 귀속시킨다**

---

# 7. 한 줄로 정리

* 프론트는 도메인을 바꾸지 않는다
* DNS도 바꾸지 않는다
* 쿠키 옵션도 바꾸지 않는다

👉 **“누가 응답을 주느냐”만 바꾼다**

---

# 8. 체크 질문 (이해 확인용)

아래 질문에 스스로 답이 나오면 정확히 이해한 거다:

1. 왜 fetch URL을 상대경로로 바꾸면 쿠키가 유지되는가?
2. 브라우저는 Set-Cookie를 어느 서버 기준으로 저장하는가?
3. BFF가 없어도 SameSite=None으로 해결 가능한데, 왜 안 쓰는가?
4. 이 구조에서 CORS 설정이 단순해지는 이유는?

---

다음으로 이어가면 좋은 주제:

* Next.js Route Handler에서 **Host / Cookie 헤더 포워딩 규칙**
* Edge runtime vs Node runtime 차이
* BFF가 점점 두꺼워지는 걸 막는 규칙 문서

원하면 그중 하나 바로 이어서 파줄게.

좋아, 이제 **“원칙 → 실제 코드”**로 내려가자.
아래는 **운영/스테이징/로컬 공통으로 쓰는 BFF(Thin Proxy) 기준 코드**다.
지금 네 프로젝트 스택(Next.js App Router, Node runtime, fetch 기반)에 맞춰서 설명할게.

---

# 0. 전제 정리 (이 코드가 성립하는 조건)

* 브라우저는 **항상 `/api/**`만 호출**
* 백엔드 도메인은 **브라우저에 노출되지 않음**
* BFF는 **인증 판단 안 함**
* 목적: **SameSite 충족 + Set-Cookie 전달**

---

# 1. 디렉토리 구조

```txt
app/
 └─ api/
     └─ proxy/
         └─ [...path]/
             └─ route.ts
```

* `/api/proxy/**` → 백엔드로 그대로 전달
* path 기반으로 모든 API 커버

---

# 2. 환경 변수

```env
# local / staging / prod 공통
BACKEND_BASE_URL=https://api.molip.com
```

로컬에서는:

```env
BACKEND_BASE_URL=https://stg.molip
```

👉 **환경별 분기는 여기서만 발생**

---

# 3. 핵심: BFF Route Handler 코드

## 3-1. 공통 유틸 (선택)

```ts
// app/api/proxy/_lib.ts
import { NextRequest } from "next/server";

export function buildBackendUrl(req: NextRequest, path: string[]) {
  const base = process.env.BACKEND_BASE_URL!;
  const query = req.nextUrl.search;
  return `${base}/${path.join("/")}${query}`;
}
```

---

## 3-2. route.ts (핵심)

```ts
// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "../_lib";

export const runtime = "nodejs"; // 중요

async function proxy(req: NextRequest, path: string[]) {
  const targetUrl = buildBackendUrl(req, path);

  const backendRes = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,          // 헤더 그대로 전달
    body: req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer(),
    credentials: "include",
  });

  // 응답 그대로 재전달
  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: backendRes.headers,    // Set-Cookie 포함
  });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path);
}

export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path);
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path);
}
```

---

# 4. 왜 이렇게 짜야 하는가 (중요 포인트 설명)

## 4-1. `runtime = "nodejs"`

* Edge runtime은 `Set-Cookie` 헤더 처리 제약 있음
* 인증 프록시는 **Node runtime 고정**이 안전

---

## 4-2. `headers: req.headers`

* `Cookie`, `Authorization`, `Content-Type` 유지
* 프록시가 판단하지 않음

---

## 4-3. `backendRes.headers` 그대로 반환

이 줄이 **가장 중요**하다.

```ts
headers: backendRes.headers
```

* `Set-Cookie` 손실 방지
* SameSite 판단은 **브라우저 몫**

---

# 5. 프론트엔드 호출 방식 (절대 규칙)

```ts
// ❌ 금지
fetch("https://api.molip.com/auth/login");

// ✅ 정답
fetch("/api/proxy/auth/login", {
  method: "POST",
  credentials: "include",
});
```

이 한 줄로:

* cross-site 제거
* CORS 단순화
* 인증 흐름 통일

---

# 6. 로그인 / refresh 흐름 실제 연결

## 로그인

```
Browser
  └─ POST /api/proxy/auth/login
        ↓
     BFF
        ↓
     Backend → Set-Cookie: RT
        ↓
     Browser (same-site로 저장)
```

---

## Refresh

```ts
fetch("/api/proxy/auth/refresh", {
  method: "POST",
  credentials: "include",
});
```

* 브라우저가 RT 쿠키 자동 첨부
* 프록시는 그대로 전달

---

# 7. 로그아웃은 어떻게?

```ts
POST /api/proxy/auth/logout
```

백엔드가:

```http
Set-Cookie: RT=; Max-Age=0; Path=/; Secure; SameSite=Lax
```

프록시는 **아무것도 안 함**

---

# 8. 이 코드에서 절대 하면 안 되는 것

* ❌ 쿠키 파싱
* ❌ 토큰 검증
* ❌ 응답 바디 가공
* ❌ 상태 코드 변환
* ❌ 에러 메시지 해석

> BFF는 “통로”여야 한다

---

# 9. 체크리스트 (이거 통과하면 성공)

* [ ] 브라우저에 백엔드 도메인이 안 보인다
* [ ] 로컬에서 새로고침 후 로그인 유지됨
* [ ] SameSite=None 안 쓴다
* [ ] Secure 옵션 유지된다
* [ ] 운영/스테이징/로컬 코드 동일

---

## 한 줄 요약

> **코드는 단순할수록 옳고,
> 인증 프록시는 얇을수록 안전하다.**

다음 단계로 바로 이어갈 수 있는 것:

* 이 프록시 위에 **observability(로그/트레이싱) 최소 삽입**
* 특정 경로만 프록시하도록 분리
* E2E 테스트에서 프록시 기준 시나리오 작성

원하면 바로 다음으로 가자.
