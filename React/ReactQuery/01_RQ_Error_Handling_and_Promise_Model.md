
### React Query의 에러 처리 구조

try/catch 없이도 onError가 동작하는 이유

---

### 개념 요약

React Query는 네트워크 요청(Promise)을 다음과 같이 **자동으로 분류**한다.

* 성공(Promise resolved) → `onSuccess`
* 실패(Promise rejected) → `onError`
* 성공/실패 모두 끝난 후 → `onSettled`

이 구조 덕분에 개발자가 매번 try/catch를 작성할 필요가 없다.

---

### React Query는 왜 try/catch가 필요 없을까?

React Query는 `mutationFn` 또는 `queryFn`이 return하는 Promise를 내부에서 이렇게 처리한다:

```jsx
mutationFn()
  .then((data) => {
    setState("success");
    onSuccess?.(data);
  })
  .catch((error) => {
    setState("error");
    onError?.(error);
  })
  .finally(() => {
    onSettled?.();
  });
```

즉,

* 성공이면 onSuccess만 실행되고
* 실패이면 onError만 실행되고
* 둘 다 끝나면 onSettled 실행된다

**이게 React Query 내부에서 자동으로 실행되는 try/catch 역할**이다.

---

### 요청 성공/실패는 어떻게 판단할까?

원칙은 단 하나:

### → **Promise가 reject되면 실패(onError)**

### → **Promise가 resolve되면 성공(onSuccess)**

그래서 `apiFetch` 같은 네트워크 함수는 반드시 다음처럼 구현해야 한다.

```jsx
if (!response.ok) throw new Error("API Error");
return data;
```

React Query는 오류를 판단하지 않는다.
**오류를 throw해야지만 onError가 실행된다.**

---

### React Query 상태 전이 모델

React Query는 내부적으로 다음 상태를 관리한다.

```
idle → loading → success | error
```

이 상태는 다음 값으로 컴포넌트에서 사용된다.

```
isLoading
isError
isSuccess
data
error
```

즉, React Query는 비동기 요청의 state를 자동으로 UI용 상태로 변환해주는 엔진이다.

---

### 인증 실패(401) 처리는 어떻게 해야 할까?

React Query에서는 “전역 에러 처리기”를 만들 수 있다.

QueryClient에서 가능하다:

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      onError: (error) => {
        if (error.message === "UNAUTHORIZED") {
          sessionStorage.clear();
          window.location.href = "/login";
        }
      },
    },
  },
});
```


---

### 에러가 API 단에서 발생하면?

예를 들어 `apiFetch`를 이렇게 구현해두었다면:

```jsx
const res = await fetch(url);
const json = await res.json();

if (json.code === "UNAUTHORIZED") {
  throw new Error("UNAUTHORIZED");
}
```

React Query는 자동으로 onError → QueryClient onError 순으로 실행한다.

---

### 기존 useApi는 어떻게 되는가?

#### 기존 구조

```
컴포넌트 → useApi → apiFetch → server
```

#### React Query 구조

```
컴포넌트 → useQuery/useMutation → apiFetch → server
```

에러/인증실패/리다이렉트 로직은
`QueryClient defaultOptions.onError`에서 처리하는 것이 정석이며,

**useApi라는 fetch wrapper는 필요 없어진다.**

---

### useApi를 유지하고 싶다면?

React Query를 모든 API에서 쓰지 않는 경우라면
useApi를 “일반 fetch wrapper”로 최소한만 유지할 수 있다.

```jsx
export function useApi() {
  const navigate = useNavigate();

  const request = async (...args) => {
    try {
      return await apiFetch(...args);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        sessionStorage.clear();
        navigate("/login");
      }
      throw err;
    }
  };

  return { request };
}
```

하지만 React Query를 사용하기 시작하면 대부분 삭제되는 패턴이다.

---

### GET과 Mutation의 역할 정리

너가 이해한 내용이 정확하다.

#### GET → useQuery

* 데이터 읽기 전용
* 캐싱, staleTime, refetch 자동 처리

#### POST/PUT/PATCH/DELETE → useMutation

* 데이터 변경
* 성공 시 invalidate
* 낙관적 업데이트 가능
