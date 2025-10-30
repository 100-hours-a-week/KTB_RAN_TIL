## Spring Data JPA

정의

JPA 데이터 처리를 기반으로 JPARepository를 통해 CRUD를 자동으로 만들어주어 보일러플레이트 코드를 감소화시킨것

**키워드**

- JPARepository
- EntityManager
- 프록시 객체
- CRUD 자동 생성
- 개발자 생산성 향상

---

### 특징

JPA는 **인터페이스**이기 때문에 내부적으로 **`EntityManager`** 를 사용한다.

개발자가 직접 EntityManager를 호출하지 않아도,
Spring Data JPA가 대신 내부에서 그 역할을 수행해준다.

즉, `JpaRepository`를 상속받으면 이미 구현된 `EntityManager` 로직을 Spring이 대신 실행해주는 셈이다.

> 그래서 개발자는 직접 persist(), find() 같은 메서드를 호출할 필요가 없다.
>
>
> 이미 `JpaRepository` 안에 이 기능들이 구현되어 있다.
>

- **순수 JPA도 안 쓴 JDBC** : 직접 농사
    - 모든 SQL, Connection, Transaction을 직접 작성
- **순수 JPA :** 손질된 기본재료와 친절한 레시피 북 (entityManager)
    - 코드가 간소화되지만 여전히 직접 호출 필요
- **Spring Data JPA** : 셰프 고용
    - CRUD까지 자동으로 수행, 개발자는 요리 이름만 부르면 됨

**구조 이해**

| 구분 | 설명 |
| --- | --- |
| **JPA (Java Persistence API)** | 인터페이스이자 표준 명세. 직접 구현이 없다. |
| **EntityManager** | 실제로 DB 연동을 수행하는 핵심 클래스. |
| **Spring Data JPA** | JPA 위에 만들어진 추상화 계층. `EntityManager`를 자동으로 사용하게 해줌. |
| **JpaRepository** | Spring Data JPA가 제공하는 인터페이스. CRUD를 자동 구현. |

### 예시 코드

- 상속만 받아도 **save(), findById()** 기능들이 자동으로 동작한다.

```java
public interface UserRepository extends JpaRepository<User, Long>{

}
```

**[ 동작 과정 ]**

1. 스프링 애플리케이션 실행
2. 스프링이 `JpaRepository`를 상속한 `UserRepository` 인터페이스를 발견
3. 내부적으로 **프록시 객체**를 만들어 **스프링 빈으로 등록**
4. `@Autowired` 또는 `@RequiredArgsConstructor` 로 주입받을 때,

   **이 프록시 객체가 실제로 동작함**

5. 프록시 객체는 개발자가 호출하는 메서드 이름(`findById`, `save`)을 분석해서

   **JPQL을 자동 생성**하고 내부적으로 **EntityManager를 호출**


> 즉, UserRepository.save(user) 를 호출하면
>
>
> 실제로는 `EntityManager.persist(user)` 가 수행되는 셈이다.
>

→ 이 **프록시 객체**는 우리가 호출하는 **메서드 이름 findById 분석**해서 **그에 맞는 JPQL을 생성하고 내부적으로 entitymanager 를 호출하는 로직을 대신 수행한다.**

- `Spring Data JPA`는 `JPA`를 **대체하는 기술이 아님**

  → JPA를 **더 쉽게, 더 생산적으로** 쓸 수 있도록 도와주는 추상화 계층이다.

- ***JPA 내부의 핵심 객체인 `EntityManager`를 대신 사용한다.***
- `save()`, `findById()`, `delete()` 등의 메서드는 모두 **프록시 객체를 통해 동작**한다.
- 직접 JPQL이나 쿼리를 작성하는 경우는 **성능 튜닝이나 커스텀 쿼리**가 필요할 때뿐이다.

### JPA Repository 공통 인터페이스 계층 구조

- **Repository**
    - 아무 메서드도 없지만 인터페이스를 상속받으면 스프링이 데이터 저장소 역할 하는 컴포넌트
    - 이건 데이터 저장소야! 라고. 스프링에게 알려주는 마커 인터페이스
- **CrudRepository**
    - 기본 **CRUD 메서드 제공(save, findById, findAll,delete)**
    - JPA 말고도 여러 저장소에 사용 가능
- **PagingAndSortingRepository**
    - 페이징 정렬 기능 제공
    - Rest API 용으로 자주 사용
- **JpaRepository**
    - **Spring Data JPA의 핵심**
    - JPA 특화 기능 제공
    - `flush`, `saveAllAndFlush`, `deleteInBatch` 등
- **도메인 별 Repository**
    - 실제 비즈니스 도메인에 매핑되는 Repository
    - JpaRepository 상속 받음

![image.png](attachment:5af43d89-e6c1-4c4c-90de-c990b329092a:image.png)

---

## 공통 Repository 인터페이스

**BaseRepository** 를 공통으로 두는 방법

### 1. BaseRepository.java

```java
@NoRepositoryBean // 스프링이 직접 빈으로 등록하지 않게 함
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {
    // 모든 엔티티에 공통적으로 쓰는 메서드를 여기에 추가 가능
}

```

### 2. MemberRepository.java

```java
public interface MemberRepository extends BaseRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
}

```

### 3. PostRepository.java

```java
public interface PostRepository extends BaseRepository<Post, Long> {
    List<Post> findByAuthorId(Long authorId);
}

```

### Repository의 구조

![image.png](attachment:e36bdb9b-71b1-465f-9b80-f0b14eb5d70c:image.png)

## 도서관 사서 비유

- `Repository` = 도서관이라는 존재
- `CrudRepository` = 책을 추가/삭제/조회하는 기능이 생긴 사서
- `JpaRepository` = JPA 기술을 완전히 숙달한 사서 (페이징, flush 등 가능)
- `MemberRepository`, `PostRepository` = 각 도서관 코너별 전문 사서

---

### 기타 팁

- DDL 스크립트로 스키마를 만들고 **더미 데이터**를 미리 넣어두는 건 OK
- 하지만 `create` 모드는 매번 테이블을 새로 생성하므로 **주의 필요**
- `update` 또는 `none` 모드로 설정하는 것이 실무적으로 안전함