### **Fetch 방식 - Lazy vs Eager**

**키워드**

- FetchType
- 즉시 로딩(EAGER)
- 지연 로딩(LAZY)
- 프록시
- N+1 문제

### 특징

- `@ManyToOne`, `@OneToOne` 의 **기본 Fetch 전략은 EAGER(즉시 로딩)** 이다.
- **즉시 로딩(EAGER)** 이라는 건 “이 엔티티를 가져오는 시점에 연관된 엔티티도 같이 SQL로 가져온다”는 뜻이다.
- 겉으로 보기엔 편해 보이지만, **필요하지 않은 연관 데이터까지 한 번에 가져오기 때문에** 오히려 쿼리가 늘어나고 성능이 떨어질 수 있다.
- 특히 **“컬렉션이 아닌 연관관계가 여러 개 섞여 있는 조회”** 를 할 때 JPA가 전부 조인으로 풀어주지 못하면, 눈에 보이지 않게 **추가 쿼리**가 계속 나가면서 **N+1 문제가 EAGER에서도 발생**한다.

---

### 즉시 로딩(Eager)

- 엔티티를 **조회하는 그 시점**에 연관된 엔티티까지 전부 가져온다.
- “Post를 가져왔으면 작성자(User)도 당연히 필요할 거야”라고 가정하고 **JPA가 알아서 가져오는 방식**이다.
- 한 번의 조회로 연관데이터까지 **모두 로드**하기 때문에 이후 접근할 때는 **추가 쿼리가 발생하지 않는다.**
    - 이건 “그때 이미 다 가져왔다”는 말이지 “쿼리가 1번만 나간다”는 말은 아님
    - 연관 데이터가 필요 없는 경우에도 **불필요한 부하를 발생**시킬 수 있다.

```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    private List<Post> posts;
}

@Entity
public class Post {
    @Id @GeneratedValue
    private Long id;
    private String title;

    @ManyToOne
    private User user;
}

```

### Eager인데 왜 N+1이 나올까요

→ 1:N관계에서 User 100명을 함께 조회(main 1) + User의 각각 post 리스트를 조회(N)

- **JPQL : N+1 문제** 발생 가능성
- 첫 쿼리 + User마다 Post 쿼리 100번

```java
// 1) 사용자 전체 조회
List<User> users = em.createQuery("select u from User u", User.class)
        .getResultList();

// 2) 각 사용자마다 EAGER 걸린 post, profile, team 이 있다면?
for (User user : users) {
    System.out.println(user.getPosts().size());
}
```

- **1번 (전체 유저 불러오기)**

```java
select * from user;  -- 전체 User 조회
```

- 각 유저마다 EAGER가 붙은 연관관계가 있으면

  그때그때 추가로


```sql
select * from post where user_id = 1;
select * from post where user_id = 2;
select * from post where user_id = 3;
...
select * from post where user_id = 100;
```

User 100명이면 **추가로 100번 쿼리**가 나가.

그게 바로 **N+1 문제 (1번 + N번)**

유저 1명  → 추가 쿼리 1~3번
유저 100명 → 추가 쿼리 100~300번
= N+1 패턴

즉시 로딩은 **각각의 User를 조회할 때 “자동으로 연관 객체를 즉시 로딩”** 하기 때문에, **JPA가 내부적으로 100개의 User에 대해 각각 select 쿼리를 날리는 것**이다.

- **EAGER라고 해서 “쿼리가 무조건 1번”이 아니다.**
- EAGER는 “미리 가져온다”지 “한꺼번에 가져온다”가 아님
- JPA가 join 으로 합쳐서 보낼 수 있을 때만 1번처럼 보이는 거고,
- **대부분의 실무 조회는 join 으로 자동 최적화가 안 돼서** EAGER가 오히려 더 많은 쿼리를 만든다.

> JPA에서 EAGER는 위험하니까 웬만하면 LAZY로 바꿔라.
>

### 그렇다면, 즉시 로딩(EAGER)은 어디서 사용할까?

즉시 함께 가져오면 좋은, 작은 범위의 단일 조회”에서만 쓰이고, 대부분의 실무에서는 그냥 무조건 LAZY로 바꿔둔다.

### 1. **엔티티 단일 조회 시**

예를 들어 관리자 페이지에서

```java
userRepository.findById(1L);
```

이런 식으로 딱 하나의 유저를 조회할 때, 그 유저의 프로필이나 권한(Role) 정보까지 한 번에 보고 싶을 때는 EAGER이 좋을 수도 있다.

```java
@Entity
public class User {
    @OneToOne(fetch = FetchType.EAGER)
    private Profile profile;
}
```

### 2. **크기가 작고 항상 필요한 데이터**

- User ↔ Role (역할 정보)
- Setting ↔ DefaultConfig (환경설정)

엔티티마다 하나씩, 있고 (1:1) 거의 항상 같이 쓰이는 경우

```java
@Entity
public class User {
    @ManyToOne(fetch = FetchType.EAGER)
    private Role role; // 유저 1명당 1개 롤
}
```

### 3. **@Embedded / @OneToOne과 비슷한 관계**

예를 들어, `User`와 `UserDetail`이 거의 한 몸처럼 붙어 있을 때는

지연로딩으로 나눌 이유가 별로 없어.

```java
@Entity
public class User {
    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private UserDetail detail;
}
```

- 항상 함께 접근하는 데이터
- Join 비용이 거의 없고, 쿼리 한 번으로 끝난다.
- 단일 객체 기준일 때만 안전함

→ 다중 조회에서는 조심하기

---

### 지연 로딩(Lazy)

- 해당 데이터를 가져올 때, ManyToOne으로 연결되어있을때, (1쪽)에서는 연관관계 주인의 엔티티(N쪽)를 즉시 가져오지 않고 **프록시 객체(대체)**를 사용한다.
    - CGLIB과 같은 proxy를 생성함.

  → 똑같은 쿼리를 실행시키더라도 유저를 조회하는 쿼리 1번만 수행된다.

- 실제 프록시 객체의 진짜 데이터에 접근 시 **조회쿼리**가 수행된다.
    - 필요할 때만 데이터를 불러오기 때문에 **불필요한 SQL 실행**이 줄어든다.
    - 프록시 객체를 반환하면 null임.

```java
@Entity
public class Post {
		
		...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

- find를 사용해서 post의 객체를 조회함.

```java
Post post = em.find(Post.class, 1L);
```

**[SQL 실행]**

```sql
select * from post where id = 1;
```

user에는 진짜 user 객체가 아닌 Hibernate가 만든 프록시 객체가 들어가있다.

```sql
post.user = User$HibernateProxy@1a2b3c
```

---

### 실무에서 사용하는 방법

1. **모든 연관관계는 일단 `LAZY`로 지정**

```java
@ManyToOne(fetch = FetchType.LAZY)
```

2. **화면에서 꼭 같이 써야 하는 데이터만 fetch join으로 묶는다**

```java
@Query("select u from User u join fetch u.role")
```

3. **EAGER은 오직 “항상 붙어 다니는 1:1 관계”에만 사용한다**
4. **EAGER은 “개발 편의용”, LAZY는 “성능 제어용”**

> **EAGER** : 프레임워크에게 맡김
>
>
> **LAZY** : 내가 직접 제어
>

---

### N+1문제 해결 3가지 전략

1. Fetch Join
    - jpql에서 join fetch 로 한번에 가져오기
2. EntityGraph
    - 어노테이션 기반으로 fetch join과 유사효과
3. Batch Size
    - IN 절로 묶어서 여러 쿼리 한번에

## Fetch Join

`join fetch`를 JPQL에 명시해서 **연관된 엔티티를 한 번의 SQL로 모두 로드**하는 방법

```java
@Query("SELECT u FROM User u JOIN FETCH u.posts")
List<User> findAllWithPosts();
```

**결과 SQL**

```sql
SELECT u.*, p.*
FROM user u
JOIN post p ON u.id = p.user_id;
```

→ EAGER처럼 연관된 데이터를 즉시 로딩하지만, 직접 명시했기 때문에 “의도한 만큼만” join이 발생함.

근데 여기서도 어차피 연관관계로 양방향이면 Eager 가져오는거 아님? 아 지연쓴다고 했나

## EntityGraph

JPQL을 수정하지 않고, **어노테이션으로 Fetch Join과 같은 효과**를 주는 방법.

→ “이 Repository 메서드에서는 이 연관관계만 EAGER로 해줘” 느낌.

```java
@EntityGraph(attributePaths = {"posts"})
@Query("SELECT u FROM User u")
List<User> findAllWithPosts();

```

**결과 SQL**

```sql
SELECT u.*, p.*
FROM user u
LEFT JOIN post p ON u.id = p.user_id;

```

## Batch Size

Lazy 로딩을 유지하면서도, **N+1을 IN 쿼리로 묶어 해결**하는 전략.

즉, N개를 한꺼번에 “묶어서” 조회.

```java
@Entity
@BatchSize(size = 10)
public class User {
    ...
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Post> posts;
}

```

**동작 방식**

```sql
-- 기존 (N+1)
SELECT * FROM user;               -- 1
SELECT * FROM post WHERE user_id=1; -- N

-- BatchSize(10) 적용 후
SELECT * FROM user;                   -- 1
SELECT * FROM post WHERE user_id IN (1,2,3,4,5,6,7,8,9,10);  -- ✅ 한 번에 10명 분

```

### 시퀀스 다이어그램

- eager
    - (1+N)즉시 로딩이라 성능 저하
- fetch join
    - 1
- batch size
    - N / batch 크기

![mermaid-diagram-2025-10-30-172801.png](attachment:8be5c1fe-6ddf-402d-8f25-8859e982f18e:mermaid-diagram-2025-10-30-172801.png)