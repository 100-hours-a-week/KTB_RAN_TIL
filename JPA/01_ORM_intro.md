### 정의

<aside>

**ORM (Obect Relation Mapping)**

객체와 데이터베이스의 패러다임 불일치를 해결하기 위한 기술 개념

</aside>

**키워드**

- 객체지향(Object-Oriented)
- 관계형 데이터베이스(Relational Database)
- 패러다임 불일치(Paradigm Mismatch)
- 자동 매핑(Auto Mapping)
- 추상화(Abstraction)

### 특징

**ORM이란**

- 객체지향 언어에서 사용하는 **객체(Object)** 와

  관계형 데이터베이스의 **테이블(Table)** 을 자동으로 연결(Mapping)해주는 기술이다.

  즉, 클래스의 필드가 DB 컬럼으로 자동 매핑된다.

- ORM이 등장한 이유는 **"객체와 테이블은 태생적으로 다르기 때문"**

  자바는 객체 중심, DB는 테이블 중심이라서 이 두 세계를 이어주는 **“통역기”** 역할을 한다.

  → 그 통역기가 ORM이라는 기술


---

### ORM이 없던 시절엔?

> ORM 없이 데이터를 저장하려면,
>
>
> 모든 SQL을 개발자가 직접 작성해야 했다.
>

예를 들어, User 객체를 DB에 저장한다고 하면

1. User 객체에서 getName(), getEmail() 꺼내기
2. SQL 작성 :

    ```sql
    INSERT INTO user (name, email) VALUES (?, ?)
    
    ```

3. DB 커넥션 얻기 (`Connection conn = DriverManager.getConnection()`)
4. PreparedStatement로 SQL 실행
5. 반대로 조회 시,

   SELECT 쿼리 작성 → ResultSet으로 값 꺼내기 → `new User()` 해서 수동 매핑


필드가 많지 않을 때는 괜찮지만,

객체가 조금만 복잡해져도 **매번 SQL을 직접 써야 하고**,

수정·추가 시 코드 전체를 바꿔야 한다.

→ **보일러플레이트 코드의 반복**

---

### ORM의 목적

> 기술의 발전 방향은 항상
>
>
> **“개발자가 비즈니스 로직에만 집중할 수 있도록”**
>

ORM은 바로 이 목적을 위해 만들어졌다.

- SQL은 내부에서 자동 생성되고,
- 개발자는 객체만 설계하면 된다.
- SQL 실행, 결과 매핑, 예외 처리 등은 **JPA가 자동으로 수행.**

즉,

```java
entityManager.persist(user);

```

이 한 줄이 아래 과정을 전부 대신한다.

```java
Connection conn = ...
PreparedStatement pstmt = ...
String sql = "INSERT INTO user ...";
pstmt.executeUpdate();

```

> ORM = EntityManager에게 SQL 실행 권한을 위임한 것.
>

**💡 PreparedStatement란?**

- JDBC에서 SQL을 실행하기 위한 객체
- 미리 SQL을 준비해두고 변수만 바인딩하는 방식

```java
String sql = "INSERT INTO user (name) VALUES (?)";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setString(1, "kim");
pstmt.executeUpdate();

```

JPA 내부에서도 이 PreparedStatement를 사용한다.

다만, **개발자가 직접 작성하지 않고 JPA가 자동 생성할 뿐.**

---

### 장점

- **SQL이 코드에서 사라진다.**

  → 유지보수 쉬움, 비즈니스 로직에 집중 가능

- **객체 지향적 설계가 가능**

  → 객체 간 연관관계를 그대로 DB에 반영 가능

- **패러다임 불일치 해결**

  → 상속, 다형성, 참조 관계 등을 매핑 가능

- **DB 교체 용이**

  → SQL이 추상화되어 있어, MySQL → Oracle 전환 시 코드 수정 최소화


### 단점

- 완전한 자동화는 아님.

  → 복잡한 쿼리나 성능 튜닝은 결국 개발자가 직접 해야 한다.

  (예: **N+1 문제**, **Lazy Loading**, **Join 성능 이슈**)

- ORM을 잘못 이해하면 쿼리 최적화가 어렵다.

---

### 그렇다면 왜 사용할까요?

- **OOP vs RDB의 패러다임 불일치 해결**
    - 자바에서는 `extends`, DB에서는 테이블 분리와 FK 조합으로 상속 구현
    - 자바는 참조(Reference)로 관계 맺음, DB는 FK로 관계 표현
    - 자바는 객체 그래프 탐색 (user.getTeam().getName())
    - DB는 join 연산으로 관계 탐색

→ ORM은 이 둘을 자동으로 연결해주는 브릿지 역할.

---

### ORM vs JPA vs Hibernate

| 구분 | 설명 |
| --- | --- |
| **ORM** | 개념. 객체와 테이블 매핑 **기술 전체를 말함.** |
| **JPA** | ORM을 자바 진영에서 표준화한 **명세(인터페이스).** |
| **Hibernate** | JPA 명세를 실제로 구현한 **구현체(대표적 ORM 프레임워크).** |
| **Spring Data JPA** | Hibernate 위에서 JPA를 더 쉽게 사용할 수 있게 만든 **스프링 모듈.** |