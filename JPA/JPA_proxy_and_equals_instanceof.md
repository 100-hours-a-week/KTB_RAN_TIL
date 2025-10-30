## Proxy(프록시 객체)

### 정의

**실제 엔티티 대신 대역(가짜 객체)을 세워두는 개념**

예시: *배우 대신 스턴트를 세우는 것처럼,* 엔티티 대신 프록시 객체를 만들어 필요할 때만 실제 엔티티를 불러온다.

**키워드**

- 지연로딩 (Lazy Loading)
- **실제 엔티티 대신** 사용하는 가짜 객체
- 상속 기반 대리 객체
- 예시: 스턴트 배우 (대역)

### 특징

- 엔티티와 **동일한 모양의 프록시 클래스**를 먼저 생성한다.
- 연관된 엔티티를 즉시 가져오지 않고, **필요할 때(DB 접근이 필요할 때)** 불러온다.

**[예시 상황]**

**게시글 목록 조회 시, 게시글 정보만 필요한 상황**

- `Post` 엔티티를 조회하면서 `User` 엔티티까지 한 번에 가져오는 것은 **비효율적**이다.
- 게시글의 작성자 이름만 필요한데, `User`의 모든 정보(이메일, 주소, 패스워드 등)를

  매번 DB에서 불러올 필요는 없다.


→ 이때 **User 엔티티의 스턴트 대역(Proxy 객체)** 을 만들어둔

게시글 목록 조회 시 **게시가 정보 필요한 상황**

### 동작 구조

- `User` 객체를 **상속한 프록시 객체**를 만든다.
    - 실제 데이터는 없음.
    - 다만 **식별자(ID)** 값은 갖고 있다.

      (누군지는 알아야 하니까!)

    - **개체 상속의 뜻(extends)**
        - 부모 클래스의 모든 필드와 메서드를 자식이 물려받는다.
        - 아래와 같은 User 클래스가 있다면

            ```java
            public class User {
                private Long id;
                private String name;
            
                public String getName() { return name; }
            }
            ```

          Hibernate는 실행 시점(runtime)에 **이걸 상속받는 가짜 클래스를 자동으로 만든다.**

            ```java
            public class User$HibernateProxy$A23F5 extends User {
                private LazyInitializer hibernateLazyInitializer;
            
                @Override
                public String getName() {
                    // 원래 User에 있던 메서드를 가로채서,
                    // 실제 DB 접근이 필요한 시점에 진짜 User를 불러옴
                    initializeRealUserIfNeeded();
                    return super.getName();
                }
            }
            ```

          Hibernate가 User의 자식 클래스를 동적으로 만들어서, 그 객체를 **대신 리턴한다.**

- 이후 코드에서 `user.getName()` 등으로 실제 데이터가 필요해지는 순간,

  프록시가 사라지고 **진짜 User 엔티티를 DB에서 조회**한다.


### 사용 이유

1. **성능 최적화**
    - 불필요한 SQL 실행을 줄임.
    - 즉시로딩(EAGER) 대신 지연로딩(LAZY)을 통해 **쿼리 수를 최소화.**
2. **쿼리 지연 실행**
    - 실제 데이터가 필요할 때까지 DB 접근을 미룸.

**타입 비교 시 주의사항**

프록시 객체는 실제 엔티티를 **상속해서 만들어지기 때문에** 타입 비교나 객체 동등성 비교 시 **미묘한 문제**가 발생할 수 있다.

---

### 실제 엔티티와 프록시 객체의 클래스 타입은 다르다.

```sql
User userFromFind = em.find(User.class, 1L);           // User 클래스의 인스턴스
User userFromRef  = em.getReference(User.class, 1L);   // 프록시 클래스의 인스턴스

userFromFind.getClass() == userFromRef.getClass();     // false (타입이 다름)

```

→ `getReference()` 로 가져온 객체는 **프록시 클래스의 인스턴스**이다.(실제 객체가 아님)

```java
class com.example.entity.User
class com.example.entity.User$HibernateProxy$A23F5
```

→ 따라서 `user.getClass()(실제 클래스가 아님) == User.class(실제 클래스)` 비교는 **항상 false** 가 될 수 있음.

**JPA 엔티티 타입 비교 시에는 반드시 `instanceof` 사용!**

→ getReference 는 이미 영속상태 일 것.

```java
User (진짜 엔티티)
└── User$HibernateProxy$A23F5 (프록시, Hibernate가 런타임에 생성)
```
### 동등성 vs 동일성

| 구분 | 비교 기준 | 예시 | 설명 |
| --- | --- | --- | --- |
| **동일성 (==)** | **같은 메모리 주소** | `a == b` | 두 객체가 완전히 동일한 인스턴스인지 |
| **동등성 (equals)** | 내용 비교 | `a.equals(b)` | 값이 같으면 true |
| **완전 동일성 (===)** | (JS에서만) 타입 + 값 비교 | - | Java에는 존재하지 않음 |

### equals vs getClass vs instanceof

| 구분 | 비교 목적 | 설명 |
| --- | --- | --- |
| `==` | 동일성 (주소값) | 같은 인스턴스인가 메모리상의 주소(참조값)이 같은가?  |
| `equals()` | 동등성 (값) / 값(내용)이 같은지 | 내용이 같은가 |
| `getClass()` | 정확한 클래스 일치 ⇒ 같은 클래스 타입인가? (클래스 타입이 같은지) | 클래스가 같아야됨. 상속이 같고 반환 클래스가 달라도 안됨. |
| `instanceof` | 상속 포함 타입 비교 | 해당 클래스거나 본인이거나  |


1. 프록시 객체와 클래스 타입은 다르기 때문에 getClass()은 false
```java
User u1 = new User();

u1.getClass() == User.class      // true
```

2. instanceof는 상속과 본인 포함 비교이기 때문에 true

```java
User u = new User();
User proxy = new User$HibernateProxy();

System.out.println(u instanceof User);      // true
System.out.println(proxy instanceof User);  // true

```


→ instanceof는 상속과 본인 포함 비교이기 때문에 true

→ 프록시 객체와 클래스 타입은 다르기 때문에 getClass()은 false

### 실제 런타임(runtime) 타입과 선언된 타입

| 구분 | 설명 | 예시 |
| --- | --- | --- |
| **① 선언된 타입 (Static Type)** | 자바 코드에 *컴파일 시점*에 명시된 타입 | `User user = …` → **User**가 선언된 타입 |
| **② 실제 클래스 타입 (Runtime Class Type)** | *실행 중(runtime)* JVM이 인식하는 실제 클래스 | `user.getClass()` 로 확인되는 타입 |

```java
User user = em.getReference(User.class, 1L);
```

- **선언된 타입(type)** → `User`
- **실제 클래스 타입(class)** → `User$HibernateProxy$A23F5`

자바 컴파일러 입장 → user 타입 확인

실행 시점에서는 `User$HibernateProxy$A23F5` 이니까 User의 자식 클래스구나.

---

### 코드 예시

```java
User user = em.getReference(User.class, 1L);
System.out.println(user instanceof User); // true
System.out.println(user.getClass() == User.class); // false
```

- **instanceof User**

  → 컴파일러 입장에서는 “얘가 User 타입이거나 그 자식이면 맞아.”

  → true

- **getClass() == User.class**

  → JVM 입장에서 “정확히 같은 클래스야?”

  → false (Proxy는 User의 하위 클래스)


### 쉽게 이해하기

```java
Animal a = new Dog();
```

- 컴파일러는 **“a는 Animal 타입이네”**
- JVM은 “**Dog 클래스로 만들어진 객체네”**

→ 즉, **“형(Type)”은 Anima**l이고, **“클래스(Class)”는 Dog**이야.