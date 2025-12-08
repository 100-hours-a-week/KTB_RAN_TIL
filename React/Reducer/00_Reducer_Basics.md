### Reducer Basics

---

### 개념 요약

* useState는 “값” 중심
* useReducer는 “행동(Action)” 중심
  → 상태가 많거나 연관이 깊어지면 useReducer가 더 적합하다.

---

### Reducer란?

행동(action)에 따라 상태가 어떻게 변해야 하는지 정의된 “상태 변경 규칙 함수”.

기본 구조는 다음과 같다.

```
(action) → reducer(state, action) → newState
```

---

### 왜 useState만으로는 부족할까?

초기에는 setState로 관리가 가능하지만, 기능이 늘어나고 상태 간 의존성이 생기면 아래 문제가 생긴다.

* setState 호출이 여러 곳에 흩어진다.
* UI와 로직이 섞여 가독성이 떨어진다.
* 변경 흐름을 추적하기 어렵다.

예: 게시판 기능 확장
제목, 내용, 작성자, 태그, 정렬, 필터, 로딩, 에러…

이런 식으로 관리해야 할 상태가 늘어나면 **상태 변경 규칙을 한 곳에 모아야** 한다.
useReducer는 이 목적에 적합하다.

---

### useReducer 구성 요소

| 구성       | 설명                                 |
| -------- | ---------------------------------- |
| state    | 현재 상태값                             |
| dispatch | 업데이트 요청을 보내는 함수                    |
| action   | 어떤 변경을 원하는지에 대한 설명 객체              |
| reducer  | action 기준으로 state를 어떻게 바꿀지 결정하는 함수 |

사용 형태:

```js
const [state, dispatch] = useReducer(reducer, initialState);
```

---

### 동작 흐름

```
1) 컴포넌트 렌더링
2) useReducer가 초기 state와 dispatch 생성
3) dispatch({ type, payload }) 호출
4) reducer(state, action) 실행
5) 새로운 state를 반환
6) React가 업데이트된 state로 리렌더링
```

---

### reduce()와의 관계

배열의 reduce와 동작 원리가 동일하다.

```js
numbers.reduce((acc, cur) => acc + cur, 0);
```

React도 같은 구조를 갖는다.

```
(state, action) → newState
```

---

### Reducer 작성 규칙

#### 순수함수여야 한다

* 같은 입력이면 같은 출력
* 외부 상태 변경 금지
* 부수효과(side effect) 금지

reducer 내부에서 하면 안 되는 것:

* fetch/axios
* setTimeout
* DOM 조작
* console.log 남발
* Math.random(), Date.now()
* setState 호출

React 렌더링 과정에서 reducer가 여러 번 호출될 수 있기 때문에
부수효과가 있으면 예측 불가능한 동작이 발생한다.

#### 불변성 유지

state를 직접 수정하면 안 된다.

잘못된 방식:

```js
state.value = 1;
```

올바른 방식:

```js
return { ...state, value: 1 };
```

React는 얕은 비교로 변경 여부를 판단하므로
새로운 객체를 반환하지 않으면 리렌더링이 일어나지 않을 수 있다.

---

### Action / Dispatch

dispatch는 “이런 변경을 해줘”라는 요청을 보내는 함수이고,
action은 그 요청의 내용을 담은 객체다.

예:

```js
dispatch({ type: "deposit", payload: 1000 });
```

action 구조:

```js
{
  type: "deposit",
  payload: 1000
}
```

---

### 예제: 입금 / 출금

#### Action 정의

```js
const ACTIONS = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
};
```

#### Reducer

```js
function reducer(balance, action) {
  const amount = Number(action.payload) || 0;

  switch (action.type) {
    case ACTIONS.DEPOSIT:
      return balance + amount;

    case ACTIONS.WITHDRAW:
      return balance - amount;

    default:
      return balance;
  }
}
```

#### 컴포넌트

```jsx
export function Test() {
  const [inputValue, setInputValue] = useState(0);
  const [balance, dispatch] = useReducer(reducer, 0);

  return (
    <div>
      <p>현재 잔고: {balance}</p>

      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
      />

      <button
        onClick={() =>
          dispatch({ type: ACTIONS.DEPOSIT, payload: inputValue })
        }
      >
        예금
      </button>

      <button
        onClick={() =>
          dispatch({ type: ACTIONS.WITHDRAW, payload: inputValue })
        }
      >
        출금
      </button>
    </div>
  );
}
```

---

### Reducer 패턴의 장점

* 상태 변경 규칙이 한 곳에서 관리됨 → 가독성 좋음
* 복잡한 상태 관계를 구조적으로 처리
* UI와 비즈니스 로직 분리
* 순수함수 기반이라 테스트 쉽고 예측 가능
* Redux / Zustand / React Query의 근본 개념과 동일

---

### 요약표

| 구분     | useState | useReducer       |
| ------ | -------- | ---------------- |
| 중심     | 값        | 액션               |
| 난이도    | 쉬움       | 중간               |
| 적합한 상황 | 단순 상태    | 복잡한 상태 구조        |
| 변경 방식  | setState | dispatch(action) |

Reducer는 단순한 대체재가 아니라
복잡한 상태 변경 흐름을 **구조적으로 관리하기 위한 패턴**이다.

