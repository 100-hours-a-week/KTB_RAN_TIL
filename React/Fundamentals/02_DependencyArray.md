### useEffect 의존성 배열 기본 개념

값이 달라졌을 경우 실행되는, 의존하는 값.

```jsx
useEffect(()=>{},[value])

```

렌더링 자체는 계속 일어나도 value가 바뀌지 않았다면 effect는 다시 실행되지 않는다.

- 원시값(숫자, 문자열)은 “값” 비교
- 객체/배열/함수는 “참조(메모리 주소)” 비교

  → 함수는 렌더링될 때마다 새로운 객체를 생성

  → useMemo, useCallback을 사용하면 기존 객체를 재사용 가능


---

### 의존성 배열 규칙

- `[]` → 마운트 때 1번만 실행
- `[value]` → value가 바뀔 때만 실행
- 생략 → 렌더마다 실행(거의 쓰지 말 것)

의존성 배열을 생략하고 내부에서 setState를 하면

렌더 → useEffect → setState → 렌더 무한 반복이 되어 무한루프가 발생한다.

---

### 이펙트 안에서 쓰는 값은 모두 deps에 넣어야 한다

```jsx
function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]);
}

```

userId를 deps에 넣지 않으면

나중에 userId가 바뀌어도 effect가 다시 실행되지 않아 **옛날 데이터만 계속 보이게 된다.**

이것이 stale closure의 대표적인 형태다.

---

### Stale Closure(옛날 값 참조 버그)

```jsx
function Timer({ duration }) {
  useEffect(() => {
    const id = setTimeout(() => {
      alert(`${duration}초 끝!`);
    }, duration * 1000);

    return () => clearTimeout(id);
  }, []); // duration 넣지 않음
}

```

duration이 바뀌어도 effect가 재실행되지 않기 때문에

타이머는 최초 duration 값만 기억한다.

stale closure란:

“이미 만들어진 함수(closure)가 최신 값이 아니라 옛날 값을 계속 참조하는 문제”

---

### 정말 이 로직이 useEffect 안에 있어야 할까?

```jsx
useEffect(() => {
  setTotal(price * count);
}, [price, count]);

```

이런 값은 단순 계산이기 때문에 effect에서 처리할 필요가 없다.

```jsx
const total = price * count;

```

기준은 다음과 같다.

- 현재 state/props로부터 계산 가능한 값인가?

  → 그렇다면 useEffect 대신 렌더링 과정에서 계산하거나 useMemo로 해결


---

### useCallback / useMemo로 참조 고정하기

문제 예시:

```jsx
function Search({ query }) {
  useEffect(() => {
    const handler = () => console.log(query);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [query]);
}

```

query가 자주 바뀌면 이벤트 리스너 등록/해제가 반복된다.

개선:

```jsx
const handler = useCallback(() => {
  console.log(query);
}, [query]);

useEffect(() => {
  window.addEventListener("scroll", handler);
  return () => window.removeEventListener("scroll", handler);
}, [handler]);

```

---

### deps에 handler를 넣는 것이 더 정확한 이유

너의 코드:

```jsx
useEffect(() => { ... }, [query]);

```

권장 패턴:

```jsx
useEffect(() => { ... }, [handler]);

```

그 이유는 다음과 같다.

1. effect 안에서 실제로 사용하는 값은 handler이다
2. 이후 handler 내부 로직이 바뀌어 의존성이 늘어날 경우, query만 넣어두면 stale 문제가 발생할 수 있다

React Hooks ESLint 규칙도

“effect 내부에서 사용하는 값을 deps에 넣어라”

라는 원칙을 따른다.

---

### 함수형 업데이트로 의존성 줄이기

```jsx
useEffect(() => {
  setCount(count + 1);
}, [count]);

```

이럴 때는 함수형 업데이트(prev)를 사용하면 deps에서 count를 제거할 수 있다.

```jsx
useEffect(() => {
  setCount((prev) => prev + 1);
}, []);

```

prev는 항상 최신값이 전달되므로 stale closure가 발생하지 않는다.

---

### React Strict Mode에서 effect가 두 번 실행되는 이유

React 18 개발 모드에서는 마운트 → 언마운트 → 마운트 과정을 두 번 반복한다.

이유는 다음 때문이다:

- effect의 cleanup이 제대로 되는지 검증
- side-effect 안전성 확인

→ **production에서는 한 번만 실행된다.**

---

### useEffect에서 async를 직접 쓰면 안 되는 이유

```jsx
useEffect(async () => { ... }, []); // XX 

```

effect는 cleanup을 반환해야 하는데 async 함수는 Promise를 반환하기 때문에 규칙에 어긋난다.

올바른 패턴:

```jsx
useEffect(() => {
  async function run() { ... }
  run();
}, []);

```

또는 즉시실행 함수.

---

### deps 규칙의 진짜 의미

deps는 “렌더링 시점에서 effect 내부에서 참조된 값 전부”를 넣어야 하는 규칙이다.

즉, “동작하는 것처럼 보인다”가 아니라 **“항상 최신 상태를 참조하도록 보장”하기 위한 규칙**이다.

---

### React 19 이후 철학: “useEffect를 줄여라”

React 공식팀에서는

> 가능하면 useEffect를 쓰지 말라.
>
>
> 로직을 **렌더링·메모이제이션**으로 옮겨라.
>

- 계산은 **렌더링**에서
- 부수효과**만** **effect**에서
- optimistic UI는 **useOptimistic**
- 서버 요청은 **server actions or React Query**

이 흐름을 이해하면 의존성 배열의 필요성과 한계를 정확히 파악하게 된다.

---

## 전체 요약

- 의존성 배열은 effect 실행 조건을 결정한다
- stale closure는 “옛날 값이 클로저에 갇히는 문제”
- effect 내부에서 사용하는 값은 모두 deps에 넣는 것이 원칙
- 계산 가능한 값은 effect 밖에서 처리
- handler는 useCallback으로 안정화하고 deps에는 handler를 넣는 것이 안전한 패턴
- prev 업데이트는 stale closure를 피하는 안전장치
- Strict Mode, async 사용 규칙, deps 원칙을 이해하면 effect를 완전히 컨트롤할 수 있다