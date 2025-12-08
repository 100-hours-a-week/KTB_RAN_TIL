
### Immutability & Update Patterns (불변성과 상태 업데이트 패턴)

---

### 개념 요약

React의 상태는 “불변성(immutability)”을 지켜야 한다.
즉, 기존 state를 직접 수정하는 것이 아니라 **새로운 객체를 생성하여 교체**해야 한다.

---

### 왜 불변성이 중요한가?

React는 상태 변경 여부를 판단할 때 **얕은 비교(Object.is)** 를 사용한다.
그래서 기존 객체를 직접 수정하면 React는 “변경되지 않았다”고 판단할 수 있다.

예:

```js
state.value = 1; // 직접 수정 → 리렌더링이 안 될 수 있음
```

반면 새로운 객체를 반환하면 React가 값 변경을 감지한다.

```js
return { ...state, value: 1 }; // 올바른 방식
```

---

### 직접 수정하면 안 되는 이유

* 렌더링 여부 판단이 깨진다.
* 이전 상태와 새로운 상태를 비교할 수 없다.
* 버그 추적이 어려워진다.
* 리덕스·리액트 쿼리·zustand 등 다른 상태관리 도구와도 충돌할 수 있다.

불변성은 React 전체 렌더링 모델의 핵심 규칙에 포함된다.

---

### 배열을 매번 순회(map/filter)하는 이유

불변성 때문에 기존 배열을 직접 수정할 수 없어서
“새로운 배열을 생성”해야 한다.

이 과정에서 자연스럽게 `map`, `filter` 같은 순회 메서드를 사용하게 된다.

---

### 삭제 시 filter를 사용하는 이유

```js
students: state.students.filter(s => s.id !== action.payload.id)
```

filter는 조건에 맞지 않는 요소를 제거하면서
**새로운 배열을 반환**한다.

→ 기존 배열을 직접 수정하지 않는다.
→ 리렌더링이 정상적으로 일어난다.

---

### 업데이트(토글) 시 map을 사용하는 이유

```js
students: state.students.map(s =>
  s.id === action.payload.id
    ? { ...s, isHere: !s.isHere } // 새 객체로 교체
    : s
)
```

map은 모든 요소를 순회하며
특정 요소만 “새로운 객체로 교체”할 수 있다.

이 패턴은 매우 일반적이며, React 공식 문서에서도 사용하는 방식이다.

---

### “id로 찾아서 해당 객체만 바꾸면 안 되나?”

프론트엔드에서는 배열 요소를 직접 수정하는 것이 불변성 위반이기 때문에 불가능하다.

예:

```js
const item = students.find(s => s.id === 1);
item.isHere = true; // ❌ 직접 수정
```

이렇게 하면 배열 자체는 동일한 참조이므로 React가 변화로 인식하지 못한다.

결국 아래처럼 새 배열을 만들어야 한다.

```js
students.map(...)
```

---

### 배열은 “중간 요소만 삭제”하는 개념이 없다

JavaScript의 배열은 “중간을 비우는 삭제(delete)”를 해도
길이가 유지되며 undefined가 남는다.

그래서 결국 삭제하려면
새로운 배열을 만들어야 한다 → filter 사용.

---

### 백엔드(DB) 업데이트 방식과의 차이

백엔드(DB)는 “데이터 자체를 수정”하는 것이 자연스럽다.

예:

* UPDATE 쿼리로 특정 필드만 변경
* DELETE 쿼리로 특정 레코드 삭제

하지만 프론트는 **state 기반 렌더링 모델**을 사용한다.

즉,
UI를 그릴 기준이 되는 데이터는 “이전과 비교해야” 한다.

그래서:

* 이전 상태(state)
* 새로운 상태(new state)

두 개가 필요하며,
이 둘을 비교하는 방식이 **불변성 모델**이다.

---

### 실제 Reducer 예제 — 삭제

```js
case "delete":
  return {
    ...state,
    students: state.students.filter(s => s.id !== action.payload.id)
  };
```

---

### 실제 Reducer 예제 — 토글 업데이트

```js
case "toggle":
  return {
    ...state,
    students: state.students.map(s =>
      s.id === action.payload.id
        ? { ...s, isHere: !s.isHere }
        : s
    )
  };
```

---

### 요약

* React는 상태 변경을 얕은 비교로 판단한다.
* 기존 객체를 수정하면 React가 변경을 감지하지 못할 수 있다.
* 항상 “새로운 객체/배열”을 반환해야 한다.
* filter와 map은 불변성을 지키면서 배열을 조작하기 위한 표준 방식.
* 백엔드(DB)처럼 직접 수정하는 방식은 프론트에서는 사용 불가.

