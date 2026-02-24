## ESLint 개요

**ESLint**는 JavaScript/TypeScript 코드에 대해 **정적 분석(static analysis)**을 수행하여
문법 오류, 잠재적 버그, 안티 패턴, 코드 스타일 불일치를 자동으로 검출하는 **린팅 도구**다.
실행 시점(Runtime)이 아닌 **개발 시점**에 문제를 발견하는 것을 목표로 한다.

---

## 1. ESLint의 핵심 역할 (What)

ESLint는 다음을 수행한다.

* **문법 오류 검출**

    * 잘못된 변수 사용, 미정의 식별자, unreachable code 등
* **버그 가능성 탐지**

    * `==` 사용, 의존성 배열 누락, stale closure 가능성 등
* **코딩 규칙 강제**

    * 팀 컨벤션(네이밍, import 순서, 금지 API 등) 일관성 유지
* **자동 수정**

    * 일부 규칙은 `--fix`로 코드 자동 수정 가능

---

## 2. 왜 ESLint를 사용하는가 (Why)

### 2.1 품질 관점

* 런타임 전에 오류를 제거하여 **QA 비용 감소**
* 리뷰어가 스타일이 아닌 **로직에 집중** 가능

### 2.2 협업 관점

* 개인 성향과 무관하게 **팀 규칙을 코드로 강제**
* 신규 인원 합류 시 암묵적 규칙 설명 비용 감소

### 2.3 대체 수단과의 차이

| 도구         | 역할                       |
| ---------- | ------------------------ |
| TypeScript | 타입 오류 검출 (정적 타입 시스템)     |
| Prettier   | 포맷팅 전용                   |
| ESLint     | **의미적 규칙 + 버그 패턴 + 스타일** |

→ TypeScript와 Prettier로 **대체 불가**한 영역을 담당한다.

---

## 3. ESLint 동작 방식 (How)

### 3.1 내부 동작 흐름

1. 소스 코드를 **AST(Abstract Syntax Tree)**로 파싱
2. 각 Rule이 AST 노드를 순회하며 검사
3. Rule 위반 시 Report 생성
4. Fixer가 정의된 Rule은 코드 수정 가능

공식 문서:

* AST 기반 분석 구조
  [https://eslint.org/docs/latest/extend/custom-rules](https://eslint.org/docs/latest/extend/custom-rules)

---

## 4. Rule 시스템 구조

### 4.1 Rule의 구성

각 Rule은 다음 요소로 구성된다.

* **메타 정보**

    * 타입(`problem`, `suggestion`, `layout`)
* **검사 로직**

    * AST 노드 방문(visitor pattern)
* **Fix 함수(Optional)**

예시(개념):

```ts
create(context) {
  return {
    Identifier(node) {
      if (node.name === "foo") {
        context.report({ node, message: "금지된 식별자" });
      }
    }
  }
}
```

---

## 5. 설정 파일 구조

### 5.1 주요 설정 요소

```js
export default {
  env: { browser: true, es2023: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### 5.2 설정 우선순위

1. CLI 옵션
2. 프로젝트 `.eslintrc`
3. `extends`된 preset
4. 기본 Rule

공식 문서:
[https://eslint.org/docs/latest/use/configure](https://eslint.org/docs/latest/use/configure)

---

## 6. TypeScript / React와의 관계

### 6.1 TypeScript ESLint

* `typescript-eslint`는 **TS AST를 이해하는 파서 + 규칙 집합**
* TS 컴파일러가 잡지 못하는 **의미적 문제**를 보완

공식 문서:
[https://typescript-eslint.io/](https://typescript-eslint.io/)

### 6.2 React / Hooks Rule

* `eslint-plugin-react`
* `eslint-plugin-react-hooks`

예:

* `rules-of-hooks`
* `exhaustive-deps`

공식 문서:
[https://react.dev/reference/react/useEffect#linting](https://react.dev/reference/react/useEffect#linting)

---

## 7. 프로젝트 관점에서의 활용 전략 (분석)

### 7.1 Rule 책임 분리 권장

| 범주       | 예                                    |
| -------- | ------------------------------------ |
| 언어 안정성   | `no-undef`, `no-unused-vars`         |
| 타입 안정성   | `@typescript-eslint/no-explicit-any` |
| 아키텍처     | `import/no-restricted-paths`         |
| React 규칙 | hooks 규칙                             |
| 스타일      | Prettier로 위임                         |

### 7.2 과도한 Rule의 위험

* false positive 증가
* 개발 생산성 저하
* Rule 무시(`eslint-disable`) 남발

→ **문제 방지 목적 Rule만 error**, 스타일은 warn 또는 제거가 일반적이다.

---

## 8. 정리

* ESLint는 **정적 분석 기반 품질 게이트**
* TypeScript/Prettier와 **역할이 명확히 다르다**
* 팀 규모가 커질수록 효과가 커진다
* Rule은 “모두 켜기”가 아니라 **의도 기반 선별**이 중요하다

---

## 1️ FSD에서 ESLint의 역할 (전제 정리)

> **ESLint는 FSD를 ‘권장’하는 도구가 아니라
> ‘위반을 즉시 감지하는 안전장치’로 사용한다.**

* 코드 리뷰 이전에 구조 위반을 차단한다.
* “알고는 있었는데 실수했다”를 허용하지 않는다.
* Dependency Cruiser가 **구조 전체**를 본다면,
  ESLint는 **파일 단위 개발 경험(DX)**을 책임진다.

---

## 2️⃣ FSD 기반 ESLint Rule 설계 원칙

### 설계 원칙 3가지

1. **레이어 의존성 규칙만 강제한다**
2. **비즈니스 로직은 규칙화하지 않는다**
3. **자동으로 검증 가능한 것만 ESLint에 맡긴다**

📌
→ “이 컴포넌트가 widget이냐 feature냐” 같은 판단은
ESLint가 아니라 **문서/리뷰 영역**

---

## 3️⃣ 핵심 Rule 범주 (실무 표준)

### 3.1 레이어 역참조 금지 (가장 중요)

**규칙**

* 상위 레이어는 하위 레이어를 참조할 수 없다.

```text
shared ← feature ← widget ← page ← app
```

```ts
// ❌ 금지: shared에서 feature 참조
import { useLogin } from "features/auth";

// ✅ 허용
import { Button } from "shared/ui";
```

📌 **의미**

* shared는 “가장 순수한 기반”
* 도메인 지식이 위로 새어 내려가는 걸 차단

---

### 3.2 동일 레이어 간 참조 제한

**규칙**

* 동일 레이어 간 직접 참조는 허용하되,
* slice 경계를 넘는 참조는 금지한다.

```ts
// ❌ 금지
features/auth → features/planner

// ✅ 허용
features/auth → shared
features/auth → features/auth/*
```

📌 **근거**

* feature는 독립된 기능 단위
* feature 간 결합은 확장 시 가장 큰 장애 요소

---

### 3.3 page → feature/widget 단방향 규칙

**규칙**

* page는 feature/widget을 조합만 한다.
* page 내부 로직을 다른 레이어에서 참조하지 않는다.

```ts
// ❌ 금지
features/planner → pages/home

// ✅ 허용
pages/home → widgets/planner
```

📌 **의미**

* page는 진입점
* 재사용 대상이 아님

---

### 3.4 shared 레이어 순수성 유지

**규칙**

* shared는 다음을 포함하지 않는다.

    * 도메인 조건
    * 서버 상태 접근
    * 전역 상태 의존

```ts
// ❌ 금지
shared/ui/Button.tsx
→ useUserStore()

// ✅ 허용
shared/ui/Button.tsx
→ props 기반 UI만 처리
```

---

## 4️⃣ ESLint로 강제할 수 있는 것 vs 없는 것

| 항목             | ESLint | 비고        |
| -------------- | ------ | --------- |
| 레이어 역참조        | ✅      | import 기반 |
| slice 간 참조     | ✅      | path 규칙   |
| page 재사용       | ✅      | import 기준 |
| UI에 도메인 로직 포함  | ❌      | 리뷰/문서 영역  |
| feature 설계 적절성 | ❌      | 설계 판단     |

👉 **그래서 Dependency Cruiser와 병행하는 게 표준**

---

## 5️⃣ 문서에 바로 넣을 수 있는 정제본

아래는 **11번 섹션에 바로 들어가도 되는 수준**이야.

---

### 11.X FSD 아키텍처 기반 ESLint Rule 설계

* ESLint는 FSD 아키텍처의 **레이어 의존성 규칙을 코드 레벨에서 강제**하는 용도로 사용한다.
* 레이어 역참조 및 slice 간 잘못된 의존성을 사전에 차단한다.
* 다음 의존성 규칙을 따른다.

#### 레이어 의존성 규칙

* `shared`는 다른 레이어를 참조하지 않는다.
* `feature`는 `shared`만 참조할 수 있다.
* `widget`은 `feature`, `shared`를 참조할 수 있다.
* `page`는 `widget`, `feature`, `shared`를 조합한다.
* 상위 레이어를 하위 레이어에서 참조하는 것을 금지한다.

#### 적용 원칙

* 규칙 위반은 ESLint error로 처리한다.
* 일시적인 예외는 허용하지 않는다.
* 구조적 검증은 Dependency Cruiser와 병행하여 수행한다.

---

## 6️⃣ 객관적 평가

* ✅ FSD 철학과 정확히 일치
* ✅ ESLint가 할 수 있는 일만 맡김
* ✅ 팀 합의·리뷰 비용 감소
* ❌ 과도한 rule 나열 없음 (좋음)

---

### 한 줄 요약

> **FSD에서 ESLint는 “구조를 지키게 만드는 최소한의 강제력”이다.
> 설계 판단까지 규칙화하려 들면 실패한다.**


