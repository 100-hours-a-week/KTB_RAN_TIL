

### React Query – Mutation 동작 흐름 완전 정리

데이터 변경 작업을 중심으로 정리한 개념 문서

---

### 1. Mutation의 기본 개념

React Query에서 **mutation은 서버에 변경 작업을 요청하는 기능**을 의미한다.
즉, 다음과 같은 REST 작업이 여기에 해당한다.

* POST (생성)
* PUT / PATCH (수정)
* DELETE (삭제)

반대로 **GET 요청은 mutation이 아니라 query**로 처리해야 한다.
React Query는 “읽기”와 “쓰기”를 명확하게 구분하는 구조를 기반으로 설계되어 있다.

---

### 2. Mutation의 동작 흐름

mutation은 다음과 같은 순서로 진행된다.

```
① mutate() 호출
② mutationFn 실행 (서버 요청)
③ 성공 또는 실패 여부 판단
④ 성공 → onSuccess 실행
⑤ 실패 → onError 실행
⑥ 마지막에 onSettled 실행
⑦ 필요한 경우 invalidateQueries로 데이터 최신화
```

이 흐름을 이해하면, 좋아요 기능, 댓글 생성, 게시글 생성·삭제 등
대부분의 서버 변경 작업을 자연스럽게 구현할 수 있다.

---

### 3. 실제 코드 예시

```jsx
const { mutate, isPending } = useMutation({
  mutationFn: (form) => apiFetch("/post", "POST", form),

  onSuccess: () => {
    queryClient.invalidateQueries(["posts"]);
  },

  onError: (error) => {
    console.error("에러 발생:", error);
  },

  onSettled: () => {
    console.log("요청 완료");
  },
});
```

여기서 핵심적으로 확인해야 할 점은 다음과 같다.

#### 1) mutationFn

* 서버 요청을 담당하는 함수
* resolve되면 성공, throw되면 실패로 판단됨

#### 2) onSuccess

* mutationFn이 성공적으로 실행된 경우 호출됨
* 여기에서 필요한 쿼리를 invalidate하여 최신 데이터를 가져오도록 만드는 것이 일반적인 패턴

#### 3) onError

* mutationFn 내부에서 throw가 발생한 경우 실행됨
* 별도의 try/catch가 필요 없는 이유가 이 구조 덕분이다

#### 4) onSettled

* 성공·실패 여부와 관계없이 항상 마지막에 실행됨
* 로딩 종료 처리 등에 유용

---

### 4. 왜 onSuccess에서 invalidate가 필요한가?

mutation은 “데이터 변경”이 일어나는 작업이다.
즉, 기존에 캐싱해두었던 데이터가 더 이상 최신 데이터가 아니게 된다.

예를 들어:

* 게시글 작성 → 게시글 목록이 변경됨
* 좋아요 클릭 → 게시글 상세 정보가 변경됨
* 댓글 작성 → 댓글 목록이 변경됨

이때 캐시에 남아 있는 데이터를 계속 사용하는 것은 부정확하다.

그래서 React Query는 **개발자가 직접 invalidateQueries를 호출**하여
“해당 데이터는 오래되었다(stale)”라고 표시하도록 요구한다.

그 결과, React Query는 자동으로 refetch를 수행해 최신 데이터를 가져오게 된다.

---

### 5. Mutation과 Query의 역할 차이

| 구분         | Query                      | Mutation                      |
| ---------- | -------------------------- | ----------------------------- |
| 목적         | 데이터 읽기                     | 서버 데이터 변경                     |
| 캐싱         | 있음                         | 없음                            |
| 상태 변경 후 처리 | 자동 반영되지 않음 → invalidate 필요 | 성공 시 필요한 쿼리를 직접 invalidate    |
| 내부 상태      | isLoading, data, isError   | isPending, isError, isSuccess |

특히 중요한 점은 mutation에는 **캐싱이 없다는 것**이다.
mutation은 “행위”이며, 실제 데이터는 관련된 쿼리를 통해 다시 조회해야 한다.

---

### 6. mutate vs mutateAsync

두 방식의 차이는 다음과 같다.

* `mutate`

    * 콜백 기반
    * fire-and-forget 방식 (Promise 반환 없음)

* `mutateAsync`

    * Promise 기반
    * `await mutateAsync()` 형태로 사용할 수 있음

예시:

```jsx
await mutateAsync(form);
```

로직 자체는 동일하지만, mutation 흐름을 async/await 방식으로 다루고 싶을 때 유용하다.

---

### 7. 자주 발생하는 실수와 주의점

1. **mutationFn에서 return을 누락**
   → onSuccess에서 data가 undefined로 전달됨

2. **에러를 throw하지 않음**
   → onError가 실행되지 않음
   → React Query는 throw 기반으로 실패 여부를 판단한다

3. **invalidateQueries를 누락**
   → UI가 최신 데이터로 갱신되지 않음

4. **mutation을 GET처럼 사용하는 경우**
   → 캐싱 기능이 없기 때문에 query로 처리해야 하는 작업은 반드시 query로 관리해야 한다

---

### 8. 한 문장 요약

> mutation은 서버 데이터 변경을 담당하며, 성공 후에는 관련된 쿼리를 반드시 invalidate해 최신 상태를 유지해야 한다.

