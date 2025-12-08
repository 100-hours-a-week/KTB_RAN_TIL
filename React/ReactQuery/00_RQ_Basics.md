
### React Query 기본 개념

서버 상태(Server State)를 관리하는 React 생태계의 표준 도구

---

### React Query는 무엇을 해결하려고 만든 라이브러리인가?

React의 상태는 크게 두 가지로 나뉜다.

1. **클라이언트 상태 (Client State)**

    * useState / useReducer로 관리
    * UI, 폼 값, 모달 열림 여부, 토글 상태 등

2. **서버 상태 (Server State)**

    * API로 가져오는 데이터
    * 시간에 따라 변할 수 있고, 여러 컴포넌트에서 공유됨
    * 새로고침하면 다시 필요
    * stale(오래됨) 여부를 판단해야 함
    * 캐싱, 리패칭 등 복잡한 로직 필요

React Query는 이 중 **두 번째 → 서버 상태(Server State)** 를 다루기 위한 라이브러리다.

---

### 왜 서버 상태를 별도로 관리해야 할까?

단순 fetch + useState로도 데이터를 가져올 수 있지만 문제는 다음과 같다.

* 여러 컴포넌트에서 같은 데이터를 공유하기 어렵다
* 새로고침하면 모두 사라져 다시 받아야 한다
* 캐싱이 없어 네트워크 낭비가 생긴다
* 로딩/에러/성공 상태를 매번 직접 작성해야 한다
* 데이터가 오래된(stale) 상태인지 판단하기 어렵다
* refetch 타이밍 관리가 필요하다
* pagination, infinite query는 구현 난이도가 높다
* 데이터 변경(post/put/delete) 후 어떤 쿼리를 다시 불러와야 할지 관리해야 한다

React Query는 이 모든 문제를 **자동으로 처리**하는 라이브러리다.

---

### React Query가 제공하는 것 (핵심 기능)

#### 1) 캐싱 (Caching)

한 번 불러온 데이터를 재사용한다.
→ 같은 페이지 이동 / 뒤로 가기 시 즉시 보여주기 가능.

#### 2) staleTime을 이용한 신선도 관리

데이터가 “오래되었는지(stale)” 자동으로 판단한다.

#### 3) refetch 자동화

창 포커스, 네트워크 복구 시 데이터 최신화가 자동으로 이루어진다.

#### 4) 로딩 / 에러 / 성공 상태 자동 제공

직접 try/catch, setLoading, setError 하지 않아도 된다.

#### 5) 쿼리 무효화(invalidate)

데이터를 변경하면 어떤 데이터를 다시 가져와야 하는지 자동으로 연계할 수 있다.

#### 6) 무한 스크롤, 페이지네이션 지원

반복되는 로직 없이 높은 추상화로 쉽게 구현 가능.

#### 7) 낙관적 업데이트(Optimistic Update)

좋아요, 댓글 생성처럼 “미리 UI를 업데이트하는 기술”을 편하게 구현 가능.

---

### React Query에서 가장 중요한 구분

React Query는 “읽기와 쓰기”를 명확히 나눈다.

#### 1) **읽기 (GET)**

→ `useQuery` / `useInfiniteQuery`
→ “서버 상태를 가져오고, 캐싱하고, 새로고침하고, stale 관리하는 기능”

#### 2) **쓰기 (POST / PUT / PATCH / DELETE)**

→ `useMutation`
→ “데이터를 변경하는 작업 + 성공 후 쿼리 무효화(invalidate)”

이 철학이 React Query 전체 구조를 이끈다.

---

### React Query의 내부 모델 (아주 기초 버전)

React Query가 하는 일은 결국 다음 한 줄이다.

> **Promise 기반 네트워크 요청을 상태(state)로 바꿔주는 것**

즉,

```
fetch → loading / success / error 로 자동 분리 → UI에서 즉시 사용 가능
```

그래서 다음이 자동으로 제공된다.

```
isLoading
isError
isSuccess
data
error
refetch
```

---

### React Query가 왜 try/catch 없이 onSuccess/onError가 가능한가?

이건 React Query 내부에서 다음과 같은 구조로 동작하기 때문이다.

```jsx
mutationFn()
  .then((data) => onSuccess(data))
  .catch((error) => onError(error));
```

React Query는 Promise의 성공/실패를 자동으로 분리한 뒤
상태를 reducer로 관리하고, 이벤트(onSuccess/onError)를 호출한다.

→ 개발자는 try/catch를 쓸 필요가 없다.
→ res.ok도 필요 없다.
→ throw만 되면 자동으로 onError로 이동한다.

---

### 그렇다면 fetch wrapper(useApi)는 없어지는가?

React Query를 사용하면 fetch Wrapper는 꼭 필요하지 않다.

왜냐하면,

* 캐싱
* 오류 처리
* 리다이렉트
* 인증 실패 처리
* retry
* staleTime
* invalidate

이런 역할을 전부 **QueryClient**가 담당하기 때문이다.

기존 구조:

```
컴포넌트 → useApi → apiFetch
```

React Query 구조:

```
컴포넌트 → useQuery / useMutation → apiFetch
```

즉, useApi의 역할을 QueryClient가 흡수한다.

---

### React Query의 동작을 한 문장으로 정리하면?

> “서버 데이터를 손쉽게 가져오고, 최신 상태를 유지하도록 관리해주는 서버 상태 관리자”

이 모든 과정이 자동으로 이루어진다.

---

### 가장 중요한 결론

#### 1) GET → useQuery

#### 2) POST/PUT/PATCH/DELETE → useMutation

이 구조는 React Query의 설계 철학이자 공식 권장 패턴이다.
단순히 문법이 아니라, **서버 상태 관리의 본질적 구분**이다.

