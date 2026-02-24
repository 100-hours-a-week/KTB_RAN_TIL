Route Groups는 **Next.js App Router에서 “URL에는 영향을 주지 않으면서, 파일을 논리적으로 묶기 위한 디렉터리 기능”**이다.
라우팅 기능이라기보다 **라우팅을 위한 구조화 도구**에 가깝다.

아래에서 **정의 → 왜 필요한지 → 동작 방식 → 언제 쓰는지/쓰지 말아야 하는지** 순서로 정리한다.

---

## 1. Route Groups의 정의

**Route Group**은 `(폴더명)` 형태로 작성된 디렉터리다.

```txt
app/
 ├─ (public)/
 │   └─ login/page.tsx
 └─ (protected)/
     └─ home/page.tsx
```

* 괄호로 감싼 폴더명은 **URL 경로에 포함되지 않는다**
* 오직 **파일 구조 정리와 책임 분리 목적**으로만 존재한다

### URL 결과

```txt
/public/login  ❌
/login         ✅

/protected/home ❌
/home           ✅
```

---

## 2. Route Groups가 필요한 이유

App Router에서는 **폴더 구조 = URL 구조**이기 때문에
아무 생각 없이 폴더를 만들면 URL이 금방 망가진다.

예를 들어 이런 요구가 있다면:

* 공개 영역 / 보호 영역을 나누고 싶다
* 인증 여부에 따라 layout이나 guard를 다르게 쓰고 싶다
* URL은 `/login`, `/home`처럼 단순하게 유지하고 싶다

→ **이걸 동시에 만족시키기 위한 수단이 Route Groups**다.

---

## 3. Route Groups의 실제 동작 방식

### (1) URL에는 영향 없음

```txt
app/
 └─ (auth)/
     └─ login/page.tsx
```

* `(auth)`는 라우팅 경로 계산에서 **완전히 무시**
* URL은 `/login`

---

### (2) layout.tsx는 정상적으로 동작

```txt
app/
 └─ (protected)/
     ├─ layout.tsx
     └─ home/page.tsx
```

* `(protected)/layout.tsx`는

    * `(protected)` 그룹에 속한 모든 페이지에 적용
* URL은 `/home`

👉 **URL은 그대로, 레이아웃만 분기 가능**

---

### (3) middleware / auth guard와 잘 맞음

```txt
app/
 ├─ (public)/
 └─ (protected)/
```

* middleware에서:

    * `(protected)` 하위 경로만 인증 검사
* 코드 구조만 봐도:

    * “여긴 보호 영역이다”가 드러남

---

## 4. Route Groups vs 일반 폴더 차이

| 구분        | 일반 폴더 | Route Group |
| --------- | ----- | ----------- |
| URL 포함 여부 | 포함됨   | ❌ 포함 안 됨    |
| 목적        | 경로 생성 | 구조/의미 분리    |
| layout 적용 | 가능    | 가능          |
| 사용자에게 노출  | O     | X           |

---

## 5. 언제 쓰는 게 좋은가

### Route Groups를 쓰는 경우

* 인증 여부로 영역 분리
* 공개/비공개 페이지 구분
* 마케팅 페이지 / 앱 페이지 분리
* 동일 URL 깊이를 유지하면서 내부 구조만 정리하고 싶을 때

👉 **지금 너희 프로젝트의 `(public)` / `(protected)`는 매우 적절한 사용**

---

## 6. 쓰지 말아야 하는 경우

* URL 구조 자체를 의미적으로 나누고 싶을 때

    * 예: `/auth/login`, `/dashboard/home`
* SEO 상 URL 경로가 의미를 가져야 할 때

이 경우에는 **Route Group 말고 일반 폴더**를 써야 한다.

---

## 7. 너희 프로젝트 기준으로 정리하면

```txt
app/
 ├─ (public)/
 │   └─ login/page.tsx
 └─ (protected)/
     └─ home/page.tsx
```

이 구조는:

* URL: 단순 (`/login`, `/home`)
* 구조: 명확 (공개 / 보호)
* middleware / layout 분기: 쉬움

👉 **Next.js App Router 의도를 정확히 사용하고 있다**

---

## 8. 문서용 한 문장 요약

> Route Groups는 URL 경로에 영향을 주지 않으면서
> 페이지를 논리적으로 그룹화하기 위한 App Router의 구조화 기능이다.
> 주로 접근 제어, 레이아웃 분리, 역할 구분을 위해 사용한다.

---

## 9. 한 줄 결론

> **Route Groups는 “URL을 건드리지 않고 구조만 정리하는 폴더”다.**
