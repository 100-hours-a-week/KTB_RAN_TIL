다음은 **기술 문서·설계 문맥에서 바로 써먹을 수 있는 수준**으로 정리한 설명이다.

---

## Polyfill이란 무엇인가

**Polyfill**은 **브라우저가 아직 지원하지 않는 최신 웹 표준 API를, JavaScript 코드로 “대체 구현”하여 동일하게 동작하도록 만드는 보완 코드**다.

즉,

> **브라우저 기능 부족을 런타임에서 메워주는 호환성 계층**

이다.

---

## 왜 필요한가 (문제 배경)

웹 표준은 빠르게 진화하지만,
모든 브라우저가 **동시에 같은 API를 지원하지는 않는다**.

예:

* 최신 브라우저: `Array.prototype.flat()` 지원
* 구형 브라우저: 해당 메서드 없음 → 런타임 에러 발생

이때 Polyfill이 없으면:

* 코드가 아예 실행되지 않거나
* 특정 기능이 완전히 깨진다

---

## Polyfill의 동작 방식 (How)

Polyfill은 보통 다음 패턴을 따른다.

```ts
if (!Array.prototype.flat) {
  Array.prototype.flat = function () {
    // 대체 구현
  };
}
```

* **이미 지원되면 아무 것도 하지 않음**
* **지원되지 않을 때만 기능을 추가**
* 전역 객체(`window`, `Array.prototype` 등)에 주입

→ 애플리케이션 코드는 **브라우저 차이를 신경 쓰지 않고** 최신 API를 사용할 수 있다.

---

## 대표적인 Polyfill 대상

### 1. JavaScript 표준 API

* `Promise`
* `fetch`
* `Array.prototype.includes`
* `Object.assign`
* `URL`, `URLSearchParams`

### 2. Web API

* `IntersectionObserver`
* `ResizeObserver`
* `requestIdleCallback`

### 3. 언어 기능 vs Polyfill의 차이

| 구분  | 예시                       | Polyfill 가능 여부 |
| --- | ------------------------ | -------------- |
| API | `fetch`, `Promise`       | 가능             |
| 메서드 | `Array.flat()`           | 가능             |
| 문법  | `optional chaining (?.)` | ❌ 불가능          |

❗ **문법(Syntax)은 Polyfill로 해결 불가**
→ 이 경우 **트랜스파일(Babel)**이 필요하다.

---

## Babel / Polyfill / Transpile 관계

이 세 가지는 역할이 다르다.

| 구분       | 역할                |
| -------- | ----------------- |
| Babel    | 최신 문법을 구형 문법으로 변환 |
| Polyfill | 없는 API를 코드로 추가    |
| Browser  | 실제 실행 환경          |

예시:

```ts
const x = foo?.bar;
```

* `?.` → Babel이 변환
* `Promise` → Polyfill이 추가

공식 문서:

* [https://babeljs.io/docs/en/babel-preset-env](https://babeljs.io/docs/en/babel-preset-env)
* [https://github.com/zloirock/core-js](https://github.com/zloirock/core-js)

---

## Polyfill의 단점 (중요)

Polyfill은 **공짜가 아니다**.

### 1. 번들 크기 증가

* core-js 전체 사용 시 수십 KB 증가
* 초기 로딩 성능(FCP/LCP)에 영향

### 2. 런타임 오버헤드

* 네이티브 구현보다 느릴 수 있음
* 전역 오염(Global pollution) 위험

### 3. 디버깅 복잡도 증가

* 스택 트레이스가 Polyfill 코드로 섞임

---

## 그래서 언제 쓰는가

### Polyfill을 쓰는 경우

* IE 또는 구형 브라우저를 **명시적으로 지원해야 할 때**
* B2B, 관공서, 폐쇄망 환경

### Polyfill을 쓰지 않는 경우 (요즘 트렌드)

* 최신 브라우저만 지원
* SPA / PWA / 모던 서비스
* 번들 크기와 성능을 우선시

---

## 네 문서 맥락에서의 정리 문장 (권장)

아래 문장은 **아키텍처 문서에 그대로 써도 된다**.

```md
- 본 프로젝트는 최신 브라우저 환경을 대상으로 하며,
  레거시 브라우저 호환을 위한 Polyfill은 적용하지 않는다.
- JavaScript 문법 변환은 Babel을 통해 처리하며,
  런타임 Polyfill로 인한 번들 크기 증가를 최소화한다.
```

---

## 한 줄 요약

> Polyfill은 브라우저에 없는 기능을 코드로 흉내 내는 것이며,
> 성능·번들 비용이 있기 때문에 “지원 브라우저 전략”과 항상 함께 결정해야 한다.
