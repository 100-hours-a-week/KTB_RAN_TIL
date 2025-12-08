
### State Management Libraries & Reducer Model

전역 상태 관리 라이브러리와 Reducer 원리

---

### 개념 요약

겉으로 보기에는 Redux, Zustand, React Query가 서로 완전히 다른 방식으로 동작하는 것처럼 보이지만,
**상태가 어떻게 변하는지 결정하는 내부 원리는 모두 동일한 "Reducer 기반 모델"을 따른다.**

즉,

```
(state, action) → newState
```

이 원리가 다양한 형태로 구현되어 있을 뿐이다.

---

### 왜 이런 구조를 쓰는가?

상태(state)를 변경할 때
“이 행동(action)에 따라 상태가 이렇게 바뀐다”
라는 **예측 가능한 규칙**이 필요하기 때문이다.

이 방식이 다음과 같은 이유로 최적이다.

* 상태 전이가 명확하다
* 테스트 가능성 증가
* 디버깅 용이
* 부수효과를 제어하기 쉽다

그래서 현대 프론트엔드 상태관리 라이브러리 대부분이
**Reducer 모델을 중심으로 설계**되어 있다.

---

### Redux

* 가장 전형적인 Reducer 패턴 구현체
* 상태 전이가 완전히 명시적이며 순수함수 기반
* 공식 구조 자체가 Reducer

형태 그대로:

```
state + action → reducer → newState
```

특징:

* 전역 상태 변경이 모두 reducer에 모인다
* 액션 로그 기반의 디버깅이 매우 쉬움
* 다만 코드량이 많고 보일러플레이트가 무거운 편

---

### Zustand

* “Redux보다 가볍고, 간단한 전역 상태 관리 라이브러리”
* 문법은 간단하지만 내부 업데이트 모델은 Reducer 기반 흐름을 따른다

예시는 set 함수를 사용하지만:

```js
set(state => ({ count: state.count + 1 }))
```

이 구조 역시 내부적으로는

```
(currentState → nextState)
```

라는 전이 모델을 가진다.

Reducer를 직접 작성하지 않을 뿐,
상태 전이를 “규칙 기반”으로 처리한다는 점에서는 동일한 원리다.

---

### React Query (TanStack Query)

* 서버 상태(Server State) 전용 라이브러리
* 비동기 요청의 “상태 전이”를 다룬다

대표적인 상태:

* isLoading
* isError
* isSuccess
* isFetching

이 값들은 내부적으로 다음과 같은 Reducer 모델을 따른다.

```
request start → loading
request success → success
request error → error
```

비동기 상태 전이가 모두 action 기반이다.

React Query가 reducer를 드러내지 않을 뿐…

내부적으로는:

```
(state, action) → newState
```

구조 그대로다.

---

### 공통된 핵심 원리

모든 상태관리 도구는 아래 원리를 공유한다.

#### 1) 상태는 “이전 상태 → 새로운 상태”로 전이된다

#### 2) 전이는 어떤 행동(action)에 의해 결정된다

#### 3) 전이는 순수해야 한다 — 예측 가능성 확보

#### 4) 상태는 변경이 아니라 “교체”된다 (불변성)

이 원리가 Reducer 패턴이며,
현대 상태 관리 전체의 기반이라고 볼 수 있다.

---

### 요약

| 라이브러리       | Reducer와의 관계                      |
| ----------- | --------------------------------- |
| Redux       | Reducer 패턴을 그대로 구현한 대표 사례         |
| Zustand     | 문법은 간단하지만 상태 전이 방식은 Reducer 원리 기반 |
| React Query | 비동기 상태 전이를 Reducer 모델로 관리         |


> **전역 상태 라이브러리들은 형태는 다르지만
> 내부 모델은 모두 Reducer 원리를 따른다.**

