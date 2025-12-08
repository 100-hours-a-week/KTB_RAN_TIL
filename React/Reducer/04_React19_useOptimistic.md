### useOptimistic (React 19)

---

### 개념 요약

`useOptimistic`은 React 19에서 추가된 훅으로,
서버 응답을 기다리지 않고 **UI를 먼저 업데이트하는 낙관적 UI 패턴을 쉽게 구현하도록 만든 기능**이다.

기존에는 낙관적 업데이트를 직접 구현하거나 React Query 의존이 필요했지만,
이제 React 자체에서 이 패턴을 공식적으로 지원한다.

---

### 등장 배경

React 19는 **서버 액션(Server Actions)** 중심의 새로운 아키텍처를 표준으로 삼기 시작했다.

서버 액션을 기반으로 할 때는 다음 문제가 발생한다.

* 사용자가 UI에서 어떤 동작을 하면 서버 액션이 트리거됨
* 서버 응답까지 시간이 걸릴 수 있음
* 작은 상호작용(예: 댓글 추가, 좋아요)에 이 지연은 UX를 크게 떨어뜨림

그래서 필요한 것이
“UI 먼저 보여주고, 나중에 서버 응답으로 확정”하는 흐름이다.

이 흐름을 쉽게 만드는 도구가 `useOptimistic`.

---

### 사용 목적

* UI를 먼저 변화시키기
* 서버 작업이 끝나면 실제 상태로 확정
* 실패 시 자연스럽게 복원하거나 덮어쓰기 가능

즉, **React Query 없이도 “즉시 반응하는 UI”를 만들 수 있다.**

---

### 기본 사용 형태

```jsx
const [optimisticState, addOptimistic] = useOptimistic(
  realState,
  (currentState, optimisticValue) => {
    // optimistic 업데이트 로직
    return [...currentState, optimisticValue];
  }
);
```

설명:

* `realState` → 실제 상태
* `optimisticState` → UI에서 먼저 보여줄 상태
* `addOptimistic()` → optimisticState를 업데이트하는 함수

UI는 항상 **optimisticState** 기준으로 렌더링된다.

---

### 동작 흐름

```
1) 초기 렌더링: optimisticState = realState
2) 사용자가 액션 실행 → addOptimistic 호출
3) UI가 즉시 optimisticState로 변경
4) 서버 액션 실행
5) 서버로부터 실제 데이터 응답
6) setState로 realState 업데이트
7) UI가 실제 상태(realState)로 자연스럽게 전환
```

이 과정에서 롤백 코드를 직접 작성할 필요가 거의 없다.

---

### 실제 예제: 댓글 즉시 추가

```jsx
"use client";
import { useState, useOptimistic } from "react";

export default function Comments({ initialComments, addComment }) {
  const [comments, setComments] = useState(initialComments);

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newCommentText) => [
      ...state,
      { id: "temp-id", text: newCommentText },
    ]
  );

  async function handleAddComment(formData) {
    const text = formData.get("text");

    // UI 먼저 업데이트
    addOptimisticComment(text);

    // 서버 액션 실행
    const newComment = await addComment(text);

    // 실제 상태 업데이트
    setComments([...comments, newComment]);
  }

  return (
    <form action={handleAddComment}>
      <input name="text" type="text" />
      <button type="submit">Add</button>

      <ul>
        {optimisticComments.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
    </form>
  );
}
```

핵심 포인트:

* optimistic 상태는 즉시 UI에 반영
* 서버 응답 기반 실제 상태가 다시 렌더링되면 optimistic UI는 자연스럽게 대체됨

---

### 장점

#### 1) 낙관적 UI 구현이 매우 단순해짐

이전에는 다음을 직접 관리해야 했다.

* 기존 상태 백업
* optimistic 반영
* 서버 요청
* error 시 롤백
* 성공 시 다시 sync

`useOptimistic`은 이 과정을 훨씬 줄여준다.

#### 2) 서버 액션과 자연스럽게 맞물린다

Next.js 14+에서 서버 액션을 사용할 때 최적화된 도구.

#### 3) React Query 의존 없이 가능

단순 UI 업데이트에 불필요한 도구를 쓰지 않아도 된다.

---

### 주의할 점

#### 1) 서버 상태(Cache)를 관리하는 기능은 아니다

React Query처럼 캐싱·동기화 기능은 제공하지 않는다.

#### 2) 여러 컴포넌트에 공유되지 않는다

local state 기반이다.

#### 3) 복잡한 데이터 동기화가 필요한 경우에는 적합하지 않다

이런 경우 React Query가 더 낫다.

#### 4) optimistic 로직은 순수 함수여야 한다

reducer처럼 예측 가능한 출력이 필요하다.

---

### 언제 사용하면 좋을까?

* 댓글 즉시 추가
* 좋아요 버튼
* 북마크, 투표
* 리스트에 항목 추가
* 간단한 UI 상호작용

즉, **로컬 UI 중심의 빠른 피드백이 필요한 경우**.

---

### 요약

* useOptimistic은 React 19의 공식 낙관적 UI 도구
* UI를 먼저 변경하고, 실제 서버 응답으로 상태를 확정
* local state 기반
* 서버 상태(Cache) 관리가 필요한 경우에는 React Query가 더 적합
* 서버 액션 기반 UI/UX 최적화를 위해 만들어진 기능

