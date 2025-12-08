
### React Query – 캐싱 구조 완전 정리

staleTime / cacheTime / gcTime 개념 한 번에 이해하기

---

### 1. React Query가 캐싱을 하는 이유

React Query의 가장 큰 강점은 **서버 상태(Server State)를 캐싱**한다는 점이다.

캐싱은 다음 문제를 해결한다.

* 같은 데이터를 여러 컴포넌트에서 재사용
* 페이지 이동 후 돌아왔을 때 즉시 화면 제공
* 네트워크 요청 최소화
* 새로운 요청보다 빠른 UI 응답 제공

즉, “불필요한 재요청을 줄이고 사용자 경험을 높이기 위한 구조”라고 보면 된다.

이 캐싱의 중심에 있는 것이 **staleTime / cacheTime(gctime)** 이다.

---

### 2. staleTime: “데이터가 신선하다고 판단되는 시간”

staleTime은 **데이터가 신선(Fresh)하다고 간주되는 시간**이다.

* staleTime 동안 → refetch가 자동으로 일어나지 않음
* staleTime이 지나면 → 데이터는 stale(오래됨) 상태로 바뀜

기본값: **0초**
→ 즉, 기본 설정에서는 데이터를 불러오자마자 stale로 판단한다.

#### 예시

```jsx
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 5000, // 5초 동안 신선함
});
```

이제 5초 동안은:

* 포커스 이동해도 refetch 안 함
* 컴포넌트가 다시 마운트돼도 refetch 안 함
* 다른 곳에서 invalidate되기 전까지 동일 데이터 유지

---

### 3. cacheTime(gctme): “사용되지 않는 데이터가 메모리에 남아 있는 시간”

cacheTime은 **구독(Observer)이 사라진 후, 즉 데이터가 화면에서 사라졌을 때 메모리에서 제거되기까지의 시간**이다.

기본값: **5분(5 * 60 * 1000)**

핵심은 이것이다:

> **staleTime은 데이터의 신선도 기준,
> cacheTime은 데이터가 메모리에 보관되는 기준**

#### 예시

```
페이지 A에서 posts 데이터를 조회함  
→ 페이지 B로 이동하면서 posts는 화면에서 사라짐  
→ cacheTime 동안 메모리에 유지됨  
→ cacheTime이 지나면 GC(garbage collector)가 제거함
```

---

### 4. gcTime이란?

React Query v5에서 기존 용어인 `cacheTime`이 `gcTime`으로 변경되었다.

의미는 같다.

> **구독자가 사라진 뒤 Query가 GC되기까지의 시간**

---

### 5. staleTime과 cacheTime의 관계

둘의 차이를 명확히 정리하면 다음과 같다.

| 항목         | staleTime                | cacheTime(gcTime)          |
| ---------- | ------------------------ | -------------------------- |
| 의미         | 데이터가 신선한 기간              | 데이터가 메모리에 남아 있는 기간         |
| 기본값        | 0                        | 5분                         |
| refetch 여부 | staleTime 동안 refetch 안 함 | 캐시가 유지되는 한 refetch 시 즉시 응답 |
| 캐시 삭제      | 영향을 주지 않음                | cacheTime 지나면 삭제됨          |

---

### 6. 실제 동작 예시 (상황별 분석)

#### 예시 1) staleTime이 10초이고, cacheTime이 5분일 때

1. A 페이지에서 posts를 조회함
2. 3초 뒤 B페이지로 이동
3. 20초 뒤 A 페이지로 다시 돌아옴

이때 React Query의 행동:

* staleTime 10초가 이미 지났음
* 하지만 cacheTime 5분 안에는 있음
  → **캐시는 살아 있으므로 UI에는 즉시 표시됨**
  → 그리고 background에서 자동 refetch 진행됨

→ 사용자 경험은 빠르고 매끄럽다.

---

#### 예시 2) staleTime이 0초(기본값)일 때

React Query는 데이터를 불러오자마자 stale로 판단한다.

→ 페이지 이동 후 돌아올 때 **항상 자동 refetch가 발생**한다.
→ 즉시 표시되는 캐시도 존재하지만 stale이므로 배경 refetch가 발생한다.

실제 프로젝트에서는 staleTime을 1~10초 정도 주는 경우가 많다.

---

#### 예시 3) cacheTime이 지나면?

cacheTime을 넘기면 Query는 GC 처리되어 삭제된다.

→ 다시 같은 쿼리를 조회해도 “캐시가 없기 때문에”
→ **네트워크 요청을 반드시 새로 실행한다.**

---

### 7. 한눈에 보는 상태 변화 흐름

```
데이터 fetch 완료
↓
fresh (staleTime동안 유지)
↓
stale (오래됨)
↓
구독자가 사라짐
↓
cacheTime동안 메모리에 유지
↓
GC 처리로 삭제
```

→ 이 흐름을 이해하면 React Query 캐시 전략이 명확해진다.

---

### 8. staleTime / cacheTime이 중요한 이유

1. **네트워크 요청 수를 컨트롤할 수 있다.**
2. **부드러운 화면 전환(UI/UX)을 만들 수 있다.**
3. **무한 스크롤 페이지나 리스트 기반 서비스에 큰 성능 차이를 만든다.**
4. **캐시를 얼마나 공격적으로 사용할지 전략을 세울 수 있다.**

예를 들어:

* 커뮤니티 최신 게시글 → staleTime 매우 짧게
* 게시물 상세 내용 → staleTime 길게
* 유저 프로필 → staleTime 길게 + cacheTime 길게
* 커머스 상품 리스트 → staleTime 길게

---

### 9. 권장 설정 예시

#### 빠르게 변하는 데이터

```jsx
staleTime: 0
```

#### 적당히 변하는 리스트

```jsx
staleTime: 5000 // 5초
```

#### 거의 변하지 않는 데이터

```jsx
staleTime: Infinity
```

#### 캐시를 오래 유지하고 싶을 때

```jsx
gcTime: 1000 * 60 * 30 // 30분
```

---

### 10. 결론

React Query 캐싱의 핵심은 다음 두 가지다.

1. **staleTime = 데이터의 신선도 기준**
2. **cacheTime(gcTime) = 메모리 유지 시간**

둘을 정확히 이해하면:

* 불필요한 refetch를 줄일 수 있고
* 빠른 화면 렌더링을 만들 수 있고
* API 호출 비용을 크게 절약할 수 있고
* 전체 페이지 UX가 부드러워진다

React Query를 제대로 활용하기 위해서는
mutation보다도 먼저 이 “캐싱 구조”를 이해하는 것이 중요하다.
