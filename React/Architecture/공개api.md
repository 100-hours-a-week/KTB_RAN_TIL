https://feature-sliced.design/docs/reference/public-api



엄격한 Api : index.js


```ts
// components/index.ts
export { Button } from "./Button";
export { Modal } from "./Modal";
```

```ts
// 사용
import { Button } from "@/components";
```


---

## 2. FSD에서 말하는 “공개 API”는 뭐가 다른가

FSD에서는 `index.ts`를 이렇게 정의한다.

> **“이 슬라이스에서 외부에 보여줘도 되는 것만 선언한 계약서”**

즉:

* `index.ts` = **외부에서 import 가능한 유일한 입구**
* 내부 파일 구조는 **외부에서 알 필요도, 알 수도 없음**

---

## 3. 왜 “엄격한 공개 API”라고 부르나

이 문장이 핵심이다:

> 외부와의 계약(공개 API)이 유지되는 한
> 슬라이스 내부 코드는 자유롭게 리팩토링할 수 있다

### 예시로 보면 바로 이해된다

#### 현재 구조

```
shared/ui/
 ├─ Button.tsx
 ├─ IconButton.tsx
 └─ index.ts
```

```ts
// shared/ui/index.ts
export { Button } from "./Button";
export { IconButton } from "./IconButton";
```

외부 사용:

```ts
import { Button } from "shared/ui";
```

---

#### 내부 리팩토링 후

```
shared/ui/
 ├─ button/
 │   ├─ Button.tsx
 │   └─ index.ts
 └─ index.ts
```

```ts
// shared/ui/index.ts
export { Button } from "./button";
```

➡️ **외부 코드는 한 줄도 안 바뀜**

이게 바로 “공개 API를 유지하면 내부는 마음대로 바꿀 수 있다”는 뜻이다.

---

## 4. 왜 Shared는 “세그먼트별 index”를 쓰라고 하나

문서에서 말한 이 부분이 중요하다.

> Shared 레이어는 슬라이스가 없으므로
> 각 세그먼트별로 별도의 공개 API를 정의하는 것이 더 편리하다

### 이유

Shared는 이런 성격이다:

* ui
* api
* config
* lib
* utils

👉 전부 성격이 다름
👉 한 `shared/index.ts`에 몰아두면 import가 난잡해짐

그래서:

```ts
import { Button } from "shared/ui";
import { apiFetch } from "shared/api";
import { backendBaseUrl } from "shared/config";
```

이게 **의도적으로 읽히는 구조**다.

---

## 5. 반대로 Pages / Features는 왜 “슬라이스 단위 index”인가

Pages, Features, Widgets는 공통점이 있다.

* **슬라이스 단위로 의미가 있음**
* 내부에 `ui / api / model` 같은 세그먼트가 있음
* 외부에서는 “이 슬라이스가 뭘 제공하는지만” 알면 됨

그래서:

```
pages/
 └─ feed/
     ├─ ui/
     ├─ api/
     ├─ model/
     └─ index.ts  ← 공개 API
```

```ts
// pages/feed/index.ts
export { FeedPage } from "./ui/FeedPage";
```

외부에서는:

```ts
import { FeedPage } from "pages/feed";
```

👉 `ui`, `api`, `model` 존재 자체를 모르게 만드는 게 목적

---

## 6. “폴더 안의 다른 파일에 의존하지 마라”의 정확한 의미

문서에 나온 이 문장:

> pages/feed 폴더 안의 내용은 shared/ui 폴더만 알 수 있으며
> 다른 파일은 이러한 폴더의 내부 구조에 의존해서는 안 됩니다.

이 말은:

```ts
// ❌ 금지
import { Button } from "shared/ui/Button";

// ⭕ 허용
import { Button } from "shared/ui";
```

👉 **index.ts를 통하지 않은 직접 접근 금지**

이게 FSD의 “의존성 제어” 핵심이다.

---

## 7. 헤더 예제가 왜 중요한가

### 왜 헤더를 Shared에 둘 수 있었나?

* UI가 단순함
* 상위 레이어(Pages, Features)를 import하지 않음
* api 요청만 사용 → `shared/api`는 허용

👉 **Shared는 “아래 레이어만 사용” 가능**

---

### 헤더가 복잡해졌다면?

* Feature 사용
* Entity 사용
* 로그인 상태 분기 로직 증가

👉 그 순간 **Shared ❌ → Widgets ⭕**
---