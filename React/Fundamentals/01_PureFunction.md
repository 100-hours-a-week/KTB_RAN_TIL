### 순수 함수 기본 개념

- **동일한 입력에 동일한 출력이 나오며**,

  **함수 외부의 상태를 변경하지 않는 함수**를 말한다.


### **순수함수(Pure Function)의 정의**

순수함수는 다음 두 가지 조건을 모두 만족하는 함수이다.

### 1) **같은 입력 → 항상 같은 출력**

- 호출 시점과 횟수에 관계없이 결과가 절대 바뀌지 않는다.
- 외부 상황에 영향을 받지 않는다.

```jsx
function add(a, b) {
  return a + b;    // 언제 실행해도 항상 동일한 값
}
```

→ **언제 실행해도 라는 관점**은 **외부상황에 영향**을 받지 않고, 독립적으로 실행된다는 뜻.

---

### 2) **함수 외부의 상태를 변경하지 않는다 (부수효과가 없다)**

다음과 같은 행위가 있으면 *순수함수가 아니다*:

- 전역 변수 수정
- DOM 변경
- 네트워크 요청
- console.log (I/O 발생)
- Math.random(), Date.now() 사용 (매번 값이 달라짐)
- React에서 setState 호출

예: 순수하지 않은 함수(외부 값 변경)

```jsx
let count = 0;

function increase() {
  count++;   // 외부 상태 변경 → 순수함수 아님
}

```

---

### React에서 순수함수가 중요한 이유

React 컴포넌트 함수는 “렌더링 시점마다 다시 실행되는 순수 함수”라고 생각해야 한다.

```jsx
function Component(props) {
  return <div>{props.value}</div>;
}
```

컴포넌트 함수는 **렌더링 결과를 계산하는 역할만** 해야 한다.

- API 호출
- timeout
- DOM 조작
- console.log 남발
- setState

이런 부수효과가 있으면 **순수성이 깨져 React가 렌더링을 예측할 수 없게 된다.**

그래서 React는 **부수효과는 useEffect 안에서만 수행하도록 강제**하는 것.

---

### React에서 지켜야 하는 순수함수 규칙

#### 1) 컴포넌트 함수는 순수해야 한다

렌더링 동안 실행되어도 같은 결과가 나와야 한다.

#### 2) state 변경, DOM 접근 등은 effect에서 수행해야 한다

#### 3) reducer는 반드시 순수해야 한다

Redux / useReducer의 reducer는 절대 부수효과가 있으면 안 된다.

예:

```jsx
function reducer(state, action) {
  // ❌ 여기서 fetch, timeout, Math.random() 등을 사용하면 안 됨
  return newState;
}

```