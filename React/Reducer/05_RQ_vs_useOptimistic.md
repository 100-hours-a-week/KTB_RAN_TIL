### React Query vs useOptimistic

낙관적 업데이트 비교

---

### 개념 요약

둘 다 “UI를 먼저 업데이트한다”는 점은 같지만

**다루는 데이터의 종류(Server vs UI)와 역할이 완전히 다르다.**

- **React Query** → 서버 상태(Server State)를 관리하는 도구
- **useOptimistic** → UI 상태(UI State)를 빠르게 보여주기 위한 도구

겉보기에는 비슷해 보이지만 “문제 해결 범위”가 다르다.

---

### React Query의 Optimistic Update는 어떻게 구현될까?

React Query에서 낙관적 업데이트는 **따로 존재하는 API가 아니다.**

→ 아래 3개의 cache 조작 메서드를 조합하여 **패턴으로 구현한다.**

- `cancelQueries` → 기존 fetch 중단
- `getQueryData` → 이전 캐시 백업
- `setQueryData` → 캐시를 즉시 수정(= UI 먼저 변경)

따라서:

> 이 세 가지를 함께 사용하면 = React Query의 낙관적 업데이트 패턴을 구현하는 것이다.
>

이게 React Query의 공식 방식이다.

---

### React Query의 낙관적 업데이트

React Query의 목적은

**서버에 존재하는 데이터(server state)의 캐싱·동기화·정합성 유지**다.

Optimistic Update의 흐름:

```
onMutate → UI 즉시 반영 (캐시 수정)
onError → 실패 시 롤백(getQueryData로 백업한 데이터 사용)
onSettled → invalidateQueries로 서버와 다시 동기화

```

특징:

- 전역 캐시를 먼저 변경한다
- 캐시를 공유하는 모든 컴포넌트가 동시에 UI 업데이트됨
- 실패 시 롤백이 필수
- 서버 정합성 보장이 목적

---

### useOptimistic (React 19)의 목적

useOptimistic은 전혀 다른 철학을 갖는다.

- 서버 상태를 다루지 않는다
- 캐시 없음
- 전역 공유 없음

useOptimistic의 목적은 단지:

> “UI를 먼저 바꿔서 반응성을 높이기 위한 임시 상태 관리”
>

흐름:

```
addOptimistic → UI 즉시 변경
서버 액션 실행
실제 데이터가 오면 setState로 확정

```

rollback 로직도 필요 없다.

실제 state가 오면 자연스럽게 대체되기 때문.

---

### 무엇이 “근본적으로” 다른가?

### React Query

- 관리 대상: **Server State**
- 캐싱 / stale / 동기화까지 책임짐
- 실패 → rollback 필요
- 전역 데이터 중심

### useOptimistic

- 관리 대상: **UI state**
- 캐시 없음
- 동기화 책임 없음
- rollback 필요 없음
- 로컬 중심

---

### 코드 비교

### React Query — 서버 상태 캐시를 먼저 수정

```jsx
onMutate: () => {
  const prev = queryClient.getQueryData(["post"]);
  queryClient.cancelQueries(["post"]);
  queryClient.setQueryData(["post"], old => ({
    ...old,
    like: old.like + 1,
  }));
  return { prev };
},
onError: (_, __, ctx) => {
  queryClient.setQueryData(["post"], ctx.prev);
},
onSettled: () => {
  queryClient.invalidateQueries(["post"]);
},

```

---

### useOptimistic — UI만 먼저 변경

```jsx
const [optimistic, addOptimistic] = useOptimistic(
  realState,
  (state, item) => [...state, item]
);

async function addItem(text) {
  addOptimistic({ id: "temp", text });
  const result = await serverAction(text);
  setRealState(old => [...old, result]);
}

```

---

### 어떤 경우에 무엇을 써야 할까?

### React Query가 적합

- 서버 데이터 공유 필요
- 리스트/상세/검색에서 같은 데이터 사용
- 무효화/동기화 필요
- 정합성(포인트, 재고 등) 중요

### useOptimistic이 적합

- UI 반응성만 빠르면 됨
- 캐시 공유 필요 없음
- 로컬 작업
- 서버 액션 기반 Next.js 환경

---

### 최종 요약

**React Query = 서버 상태를 맞추기 위한 낙관적 업데이트(캐시 기반)**

**useOptimistic = UI 반응성을 높이기 위한 낙관적 업데이트(로컬 상태 기반)**

그리고 React Query의 낙관적 업데이트는 다음으로 구현된다:

> cancelQueries + getQueryData + setQueryData
>
>
> 이 세 가지가 결합하면 곧 “React Query식 optimistic update”이다.
>