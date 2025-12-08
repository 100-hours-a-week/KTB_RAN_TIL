
### Async Loading State Management

비동기 로딩 상태 관리

---

### 개념 요약

비동기 작업(API 요청 등)은 즉시 끝나지 않는다.
요청이 실행되는 동안 UI는 아래 3가지 상태를 가질 수 있다.

* **loading**: 데이터를 가져오는 중
* **success**: 데이터 가져오기 성공
* **error**: 요청 실패

이 흐름을 제어하고 UI에서 활용할 수 있도록 만드는 것이
**비동기 로딩 상태 관리**다.

---

### 왜 필요한가?

API 요청은 시간이 걸리기 때문에 UI가 현재 상황을 알아야 한다.

* 로딩 중에는 스피너를 보여줘야 하고
* 성공하면 데이터를 렌더링해야 하고
* 실패하면 에러 메시지를 보여줘야 한다

이 정보가 없으면 UI는 다음과 같은 문제를 겪는다.

* 로딩 중인지 몰라서 화면이 멈춘 것처럼 보임
* 실패했는지 알 수 없음
* 언제 렌더링해야 할지 시점이 불명확

즉, 비동기 상태는 UI의 “현재 상황”을 설명하는 메타데이터다.

---

### 직접 상태를 관리하면 보통 이렇게 생김

```jsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

async function fetchPosts() {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch("/posts");
    const json = await res.json();
    setData(json);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
}
```

이 패턴은 매우 자주 등장하는데,
이 자체가 **비동기 로딩 상태 관리**다.

문제는 이 패턴이 반복된다는 것이고,
API가 늘어날수록 관리가 힘들어진다.

---

### Reducer로 관리하면 흐름이 명확해진다

loading → success → error 상태 전이를
액션 타입으로 분리할 수 있다.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "REQUEST_START":
      return { ...state, loading: true, error: null };

    case "REQUEST_SUCCESS":
      return { loading: false, data: action.data, error: null };

    case "REQUEST_ERROR":
      return { ...state, loading: false, error: action.error };

    default:
      return state;
  }
}
```

이 방식의 장점:

* 상태 전이가 명확하다
* UI 로직과 비즈니스 로직이 분리된다
* 여러 API 요청을 일관된 방식으로 관리할 수 있다

---

### 하지만 이 방식에도 한계가 있다

요청을 할 때마다 아래를 관리해야 한다.

* 캐싱
* 리패칭
* 새로고침 시 자동 재요청
* 백그라운드 업데이트
* 데이터 stale 시간 관리
* 쿼리 키 기반 데이터 식별

직접 구현하려면 고려해야 할 요소가 매우 많아진다.
여기서 등장한 도구가 **React Query(TanStack Query)**다.

---

### React Query가 등장한 이유

React Query는 **서버 상태(Server State)** 를 관리하기 위한 도구다.
즉, API 요청의 로딩/성공/실패를 모두 자동으로 처리해준다.

React Query가 제공하는 값들:

* `isLoading`
* `isFetching`
* `isError`
* `isSuccess`
* `error`
* `data`

이 값들은 “비동기 로딩 상태 관리”의 모든 핵심 요소를 이미 담고 있다.

추가로:

* 캐싱
* 자동 리패칭
* 윈도우 포커스 재요청
* 백그라운드 업데이트
* stale time 관리

이 모든 것을 자동으로 처리한다.

즉,

> 직접 하던 비동기 로딩 상태 관리를
> 훨씬 안전하고 체계적으로 자동화해주는 도구가 React Query다.

---

### 요약

* 비동기 로딩 상태는 UI가 현재 어떤 상황인지 알기 위해 필요하다.
* 직접 구현하면 loading, success, error를 매번 관리해야 한다.
* Reducer로 전이 흐름을 구조화할 수 있지만 코드가 많아진다.
* React Query는 비동기 상태 관리를 자동화하고 서버 상태를 안정적으로 유지할 수 있게 해준다.

