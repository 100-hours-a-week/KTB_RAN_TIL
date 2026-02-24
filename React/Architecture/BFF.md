BFF(Backend For Frontend)
nextJs의 중간 프록시 서버 

## api-routes란 무엇인가

`api-routes`는 **Next.js App Router의 Route Handler(`app/api/**/route.ts`)와
FSD(Feature-Sliced Design) 아키텍처 간의 구조 충돌을 완화하기 위한 선택적 설계 패턴**이다.

Next.js가 요구하는 **파일 시스템 기반 API 라우팅 구조**와,
FSD가 지향하는 **논리적 레이어 기반 코드 배치**를 분리하기 위해 사용된다.

---

## api-routes가 등장한 배경

### 1) Next.js Route Handler의 제약

Next.js App Router에서는 API가 다음 규칙을 따른다.

```txt
app/api/users/route.ts  →  /api/users
```

* **파일 위치가 곧 API 경로**
* 로직은 반드시 `app/api` 하위에 존재해야 한다

즉, 프레임워크가 **물리적 위치를 강제**한다.

---

### 2) FSD 아키텍처의 요구

FSD에서는 다음을 기대한다.

* 로직은 `entities / features / shared` 등 **의미 단위 레이어**에 배치
* URL 구조와 **비즈니스 로직 위치는 분리**
* 프레임워크 규칙이 아키텍처를 침범하지 않도록 설계

이 두 요구가 충돌한다.

---

## api-routes의 핵심 아이디어

> **라우팅은 Next.js가 요구하는 위치에서 처리하고,
> 실제 API 로직은 아키텍처가 원하는 위치에 둔다.**

이를 위해 다음과 같은 구조를 만든다.

```txt
app/
 └─ api/
    └─ users/
       └─ route.ts          ← 라우팅 프록시

src/
 └─ app/
    └─ api-routes/
       └─ users.ts          ← 실제 API 구현
```

### 역할 분리

* `app/api/**/route.ts`

    * 경로 정의
    * HTTP 메서드 매핑
    * 재내보내기만 수행

* `src/app/api-routes/**`

    * 실제 핸들러 로직
    * DB 접근
    * 외부 API 호출
    * 캐싱 / 재검증
    * 도메인 규칙 처리

---

## api-routes의 목적 정리

* Next.js의 **프레임워크 제약을 만족**
* FSD의 **레이어 규칙을 유지**
* API 로직이 `app/api` 안에 뒤섞이는 것을 방지
* Route Handler를 **서버 애플리케이션처럼 확장 가능**하게 만듦

---

## 언제 api-routes를 사용하는가

다음 조건이 **동시에** 만족될 때 의미가 있다.

* Next.js Route Handler가:

    * DB에 직접 접근한다
    * 여러 외부 API를 조합한다
    * 캐싱 / 재검증 로직을 가진다
    * 도메인 규칙을 직접 구현한다
* 즉, Route Handler가 **실질적인 백엔드 로직 계층**일 때

이 경우, api-routes는 구조적으로 합리적이다.

---

## 언제 api-routes를 사용하지 않는가

다음과 같은 경우에는 **불필요하거나 과하다**.

* Route Handler의 역할이:

    * 인증 토큰 중계
    * 쿠키 전달
    * 단순 프록시(BFF)
    * 접근 제어 보조
* 실제 비즈니스 로직은 **별도 백엔드 서버**에 있음
* FSD는 **클라이언트 코드 구조 정리 목적**으로만 사용

이 경우 api-routes는:

* 레이어 충돌을 해결하지도 못하고
* 구조만 복잡하게 만든다

---

## 오해하기 쉬운 점

* `api-routes`는 **Next.js 공식 기능이 아니다**
* 프레임워크가 요구하는 것도 아니다
* **아키텍처 선택 사항**이다

즉, “써야 하는 것”이 아니라
“특정 상황에서만 유효한 패턴”이다.

---

## 한 문장 요약 (정의)

> **api-routes는 Next.js Route Handler가 비즈니스 로직을 포함할 때,
> 프레임워크의 파일 기반 라우팅 구조와
> FSD의 레이어 기반 아키텍처 간 충돌을 완화하기 위해 사용하는 선택적 구조 패턴이다.**

---

## 너희 프로젝트 기준 한 줄 결론

> **Route Handler가 단순 인증/프록시 역할만 수행한다면,
> api-routes는 필요 없다.**

원하면 다음으로

* 이 내용을 **아키텍처 결정 기록(ADR)** 형식으로 정리하거나
* “왜 api-routes를 도입하지 않았는가”를 문서 문장으로 다듬어줄 수 있다.
