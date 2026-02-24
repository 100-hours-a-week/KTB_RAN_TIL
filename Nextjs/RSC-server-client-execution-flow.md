# Next 15(App Router) + React 19(RSC): Server 안의 Client Component 실행 흐름

## 개념 정의
Next(App Router)에서 Server Component는 서버(Node.js/Edge)에서 실행되고, Client Component는 브라우저에서 실행되는 컴포넌트이다.

Server Component 안에 Client Component를 포함할 수 있지만, 서버가 Client Component를 실행하는 구조는 아니다.
서버는 해당 위치와 props 정보를 전달하는 역할을 담당한다.

## 동작 원리
실제 흐름은 다음과 같다.

1. 서버에서 Server Component가 실행된다.
   - `fetch` 같은 서버 로직이 수행된다.
   - JSX 트리가 구성된다.
2. Client Component는 이 단계에서 실행되지 않는다.
   - "여기에 Client Component가 있다"는 참조 정보만 남는다.
   - 이 정보가 RSC payload(Flight 데이터)에 포함된다.
3. 서버는 브라우저로 HTML과 Client Component 위치/props 정보를 전송한다.
4. 브라우저는 HTML을 먼저 렌더링한 뒤 Client 번들을 로드하고 hydration 단계에서 Client Component를 실행한다.

```text
Server 단계: Server Component 실행
Client 단계: Client Component 실행
```

처음에는 Server 안에 있으니 같이 실행되는 줄 알았는데, 실제로는 참조만 남기고 실행은 브라우저에서 이루어진다는 점이 핵심이었다.

## 코드 예시
```tsx
// app/page.tsx (Server Component)
import ClientCounter from "./ClientCounter";

export default async function Page() {
  const data = await fetchData();

  return (
    <>
      <h1>{data.title}</h1>
      <ClientCounter initialCount={0} />
    </>
  );
}
```

```tsx
// app/ClientCounter.tsx
"use client";

import { useState } from "react";

export default function ClientCounter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

여기서 `Page()`는 서버에서 실행되고, `ClientCounter`는 hydration 이후 브라우저에서 실행된다.

## Server -> Client 경계 규칙
Server에서 Client로는 직렬화 가능한 props만 전달할 수 있다.

가능:
- string
- number
- boolean
- JSON 형태 객체/배열

불가능:
- 함수
- class instance
- DB connection
- 직렬화 불가능한 객체

React Query(`useQuery`)가 hydration 이후에 동작해 보이는 이유도 같다.
React Query 훅은 Client Component 내부에서 실행되므로 서버 단계에서는 실행되지 않는다.

## 언제 고려해야 하는가
- React Query가 hydration 이후에 실행되는 이유를 이해할 때
- Server에서 데이터 fetch 후 Client로 props를 전달하는 구조를 설계할 때
- 번들 크기 최적화를 위해 Server/Client 경계를 나눌 때
- SEO와 인터랙션을 동시에 설계할 때

특히 App Router 아키텍처에서는 실행 위치를 기준으로 책임을 분리하는 것이 중요하다.

## 핵심 한 줄
Server Component는 Client Component를 실행하지 않고, 위치와 props 정보만 전달하며 실제 실행은 hydration 단계에서 브라우저가 담당한다.

## 참고 자료
- React Server Components: https://react.dev/reference/rsc/server-components
- Next.js App Router Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
