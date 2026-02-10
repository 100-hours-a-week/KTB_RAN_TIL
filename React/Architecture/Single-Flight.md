# 싱글 플라이트(Single Flight) 정리

## 왜 이 개념이 중요한가

같은 목적의 비동기 요청이 동시에 여러 번 발생하면, 실제 실행은 한 번만 하고 나머지는 그 결과를 공유하게 만드는 패턴이 `싱글 플라이트(single-flight)`다.

인증/재인증 흐름에서는 이 패턴이 거의 필수다.

- 토큰 재발급(refresh token)
- 캐시 미스 시 동일 리소스 fetch
- 중복 계산 방지
- 인증 상태 복구 로직

---

## 1) 문제 상황을 일반화하면

동시에 여러 API 요청이 401을 받는 상황:

```txt
API A 요청 → 401
API B 요청 → 401
API C 요청 → 401
```

보통 각 요청은 아래 순서로 처리한다.

```txt
401 발생
→ refresh token 요청
→ 성공 시 원래 요청 retry
```

이때 제어가 없으면 각 요청이 refresh를 따로 보낸다.

```txt
요청 A → 401 → refresh #1
요청 B → 401 → refresh #2
요청 C → 401 → refresh #3
```

---

## 2) 싱글 플라이트가 없을 때 생기는 문제

- refresh token 동시 사용
- 일부 요청만 성공하고 일부는 실패
- 쿠키 갱신 타이밍 충돌
- refresh token 1회성(one-time/rotation) 정책에서 즉시 무효화
- 이후 401 루프 또는 비결정적 상태 발생

즉, "retry가 여러 번 날아가서 꼬인다"는 현상의 전형적인 원인이다.

---

## 3) 싱글 플라이트 설계의 핵심

원칙은 단 하나:

> refresh 요청은 항상 1개만 실행한다.

개념 흐름:

```txt
여러 요청이 동시에 401
↓
첫 요청만 refresh 실행
↓
나머지는 동일 Promise를 기다림
↓
refresh 성공: 모두 retry
refresh 실패: 모두 실패 처리
```

---

## 4) 프론트엔드 구현 패턴(의사 코드)

```ts
let refreshPromise: Promise<void> | null = null;

async function refreshTokenSingleFlight() {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
```

인터셉터 처리 예시:

```ts
if (response.status === 401) {
  await refreshTokenSingleFlight();
  return retryOriginalRequest();
}
```

핵심 포인트:

- 이미 refresh 진행 중이면 새 요청을 보내지 않고 기존 Promise를 `await`
- refresh 완료 이후에만 retry

---

## 5) 쿠키 기반 인증에서 더 치명적인 이유

아래 조건이면 싱글 플라이트 중요도가 더 올라간다.

- refresh token이 `HttpOnly Cookie`로 관리됨
- 서버가 `Set-Cookie`로 토큰을 갱신함
- refresh token이 1회성 또는 rotation 정책임

동시에 refresh가 여러 번 들어오면:

- 서버 입장에서 비정상 요청 패턴이 될 수 있음
- 한 요청이 토큰을 갱신한 직후 나머지 요청은 무효 토큰으로 처리될 수 있음

---

## 6) "싱글 플라이트로 설계했다"의 정확한 의미

보통 아래 의미를 가진다.

- 동시 다발 refresh 요청이 와도
- 실제 갱신 로직은 1회만 수행되고
- 나머지는 동일 결과를 공유한다

구현 위치는 2가지:

### A. 프론트엔드(인터셉터)

- 가장 일반적이고 즉시 효과가 큼
- 현재 증상은 이 레이어 제어 누락/파손일 가능성이 높음

### B. BFF/서버

- 서버에서 락 또는 요청 병합(coalescing) 처리
- 구현 난이도 높음
- 프론트 제어 없이 서버만 믿는 설계는 위험

---

## 7) 장애 증상과의 직접 매핑

아래 증상이 함께 나타나면 싱글 플라이트 부재를 우선 의심한다.

- 401이 동시에 다수 발생
- refresh 요청이 중복 전송
- 쿠키 갱신 타이밍 충돌
- 일부 요청은 200, 일부는 401
- 재현 결과가 매번 달라짐(비결정성)

결론:

> 프론트엔드 단의 refresh 단일 실행 보장이 깨졌을 가능성이 높다.

---

## 8) 바로 점검할 체크리스트

1. 인터셉터에서 refresh 요청 Promise를 공유하는가
2. refresh 실패 시 대기 중인 요청들을 한 번에 실패 처리하는가
3. retry가 refresh 완료 이후에만 실행되는가
4. DevTools Network에서 refresh 요청이 동시 2건 이상 찍히는가

---

## 한 줄 요약

싱글 플라이트는 "중복 요청 최적화"가 아니라, 인증 상태를 깨지지 않게 지키기 위한 동시성 제어 장치다.
