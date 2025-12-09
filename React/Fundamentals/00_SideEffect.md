### Side Effect(부수효과)

> **함수가 본래의 목적(입력 → 출력 계산) 외에 ‘추가로’ 외부 세계에 영향을 주는 모든 행위.**
>
- 함수 밖에서 일어나는 변화
- 외부 상태나 시스템과의 상호작용
- 순수 계산이 아닌 모든 작업

이 모든 것이 부수효과에 해당됨.

---

### 대표적인 Side Effect

| 예시 | 이유 |
| --- | --- |
| **서버 요청(fetch)** | 외부 시스템과 통신 |
| **DOM 조작** | React가 관리하지 않는 영역 접근 |
| **setTimeout / setInterval** | 외부 타이머에 의존 |
| **console.log** | I/O 작업 발생 |
| **이벤트 등록** | 브라우저 환경 변화 |
| **전역 변수 수정** | 컴포넌트 바깥 상태 변경 |
| **setState** | 렌더링 사이클을 변경시키기 때문 |

컴포넌트 함수가 **“UI를 계산하는 순수 함수”가 아니게 만드는 모든 작업**이 부수효과다.

---

### 순수 함수(Pure Function)와의 비교

| 항목 | 순수 함수 | 부수효과 함수 |
| --- | --- | --- |
| 특징 | 입력 → 출력만 결정됨 | 외부 세계에 영향 |
| 결과 일정성 | 언제 실행해도 같음 | 실행 시점 따라 다름 |
| 예시 | `(a, b) => a + b` | fetch, DOM 조작 |
| 테스트 난이도 | 쉽다 | 어렵다 |

React 컴포넌트 함수는 가능하면 **순수**해야 한다.

그래서 **fetch, timeout, DOM 조작을 렌더링 중에 하면 안 된다. → useEffect로 뺀 이유**

---

### React가 useEffect를 만든 이유

**React는 렌더링 과정이 순수**해야 한다.

하지만 실제 앱에서는 **외부 세계와의 상호작용(fetch 등)**이 필요하다.

이 문제를 해결하기 위해 React는 역할을 분리했다.

1. **컴포넌트 함수(렌더링)** → 순수 계산
2. **useEffect** → 부수효과 전용 구역

결과 :

- 렌더링이 예측 가능해지고
- React는 렌더링을 여러 번 반복 실행해도 오류 없이 검증할 수 있으며
- Strict Mode의 반복 렌더링에도 안전하다

React의 전체 설계는 “**순수와 부수효과의 분리**”를 중심으로 이루어져 있다.

---

### Side Effect의 상세 예시

### 1. 네트워크 요청

```jsx
fetch("/api/users")

```

### 2. DOM 조작

```jsx
document.querySelector(...)

```

### 3. 타이머 사용

```jsx
setTimeout(...)
setInterval(...)

```

### 4. 이벤트 등록

```jsx
window.addEventListener("scroll", ...)

```

### 5. 전역 값 변경

```jsx
localStorage.setItem(...)

```

### 6. React 상태 변경

**setState**도 사실 **side-effect**이다.

(UI 상태가 변하고 렌더링 과정을 발생시키기 때문이다.)

---

### 추가 학습

### Strict Mode와 Side Effect

React 18 Strict Mode에서는 effect가 두 번 실행된다.

이유는 다음과 같다.

- cleanup이 올바르게 작성되었는지 검증
- 부수효과를 잘못 작성했을 때 문제를 조기에 발견하기 위함
- 개발 환경에서만 두 번 실행되며 운영(production)에서는 한 번만 실행됨

Strict Mode의 목적은 **side-effect의 안전성 검사**다.

---

### Side Effect와 useEffect의 관계

정리하면:

- 컴포넌트는 순수해야 한다 → 렌더링은 “계산”만
- 외부 세계와 상호작용하는 순간 side-effect
- React는 이를 useEffect 안으로 강제 격리
- 의존성 배열을 통해 “언제 부수효과를 실행할지”까지 제어 가능

즉, useEffect는 단순 훅이 아니라 **side-effect를 안전하게 관리하기 위한 React의 핵심 구조**다.

---

### 전체 요약

- **Side Effect = 외부 세계에 영향을 주는 모든 작업**
- 대표 예시: fetch, DOM 조작, 이벤트 등록, timeout, 전역 상태 변경, setState
- React는 렌더링의 순수성을 지키기 위해 useEffect를 통해 부수효과를 분리한다
- Strict Mode는 부수효과의 안전성을 검증하기 위해 effect를 반복 실행한다