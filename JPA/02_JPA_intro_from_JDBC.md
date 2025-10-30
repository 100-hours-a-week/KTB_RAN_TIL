### 정의

<aside>

**Java Persistency API**

**자바 객체와 데이터베이스를 매핑**하고, 객체 단위로 데이터를 저장 조회할 수 있는 **ORM 인터페이스**

</aside>


### 특징

- ORM은 JPA같은 구현체로 사용합니다.

- **JPA 동작**

  JPA는 **객체 구조를 분석해 필요한 SQL문을 자동으로 생성**하여 매핑하여준다.

  **1차 캐시에 엔티티**를 보관함.

- JDBC를 사용하지 않아도 객체를 데이터베이스에 불러올수있도록 하는 중간계층역할
    - JDBC
        - 자바와 데이터베이스를 연결해주는 api

  JPA는 도구의 모음이다. → 명령을 주지 않으면 동작하지 않음

    - **즉, 자바에서 ORM을 구현하기 위한 명세표**
    - **hibernate 는** JPA에서 구현한 실제 ORM 프레임워크
    - **hibernate vs jpa 차이**
        - **ORM**은 객체와 데이터베이스의 패러다임 불일치를 해결하기 위한 개념이고,
        - **JPA**는 자바에서 ORM을 구현하기 위해 설계된 인터페이스이고,
        - **Hibernate**은 실제로 JPA를 구현하여 DB와 JAVA를 연결하는 구현체이다.

- JPA는 ORM 인터페이스인데, JDBC를 안쓰고도 객체를 데이터 베이스에 저장하고 불러올수있도록 돕는 **중간계층**임.
- **JDBC**는 **자바 애플리케이션과 데이터베이스를 연결해주는 AP**I이다.

  → 즉 **JPA는 개발자가 비즈니스 로직에만 집중할 수 있도록 만들어진 기술임.**


# JDBC (Java Database Connectivity)

자바와 데이터베이스를 연결해주는 표준 API

### 정의

> JDBC (Java Database Connectivity)
>
>
> 자바에서 **데이터베이스에 접속하고 SQL문을 작성 및 실행할 수 있도록 해주는 API**
>

---

### 핵심 키워드

- **Database 연결**
- **SQL 실행**
- **API (표준화된 인터페이스)**
- **Driver (DBMS 별 구현체)**
- **보일러플레이트 코드 (반복적 코드)**

### 특징

- JDBC는 **자바와 데이터베이스가 통신할 수 있도록 도와주는 표준 인터페이스**이다.
- 즉, 데이터베이스의 종류(MySQL, Oracle, PostgreSQL 등)에 상관없이 **일정한 규약에 따라** 접근 가능하다.

### JDBC 흐름

<img width="1983" height="1456" alt="Image" src="https://github.com/user-attachments/assets/9df54629-658a-41b8-b74d-d68255572b47" />

- **JDBC API**

  → 자바에서 제공하는 인터페이스.

  DBMS 종류에 상관없이 동일한 방식으로 SQL을 실행할 수 있도록 함.

- **JDBC Driver**

  → 각 **DBMS(MySQL, Oracle, PostgreSQL)** 가 제공하는 실제 구현체.

  JDBC API 명령을 **DB 전용 프로토콜과 명령어로 변환**하여 전달함.


![image.png](attachment:c9173e3f-8dad-42e7-9eff-e032b9e14332:image.png)

---

## 💻 순수 JDBC 예제

```java
Connection conn = null;
PreparedStatement pstmt = null;
ResultSet rs = null;

try {
    // 1. DB 연결
    conn = DriverManager.getConnection(
        "jdbc:mysql://localhost:3306/mydb", "root", "password");

    // 2. SQL 준비
    String sql = "SELECT * FROM user WHERE id = ?";
    pstmt = conn.prepareStatement(sql);
    pstmt.setLong(1, 1);

    // 3. SQL 실행
    rs = pstmt.executeQuery();

    // 4. 결과 처리
    while (rs.next()) {
        System.out.println(rs.getString("name"));
    }

} catch (SQLException e) {
    e.printStackTrace();
} finally {
    // ⑤ 자원 해제
    rs.close();
    pstmt.close();
    conn.close();
}

```

---

### 순수 JDBC의 한계

| 문제점 | 설명 |
| --- | --- |
| 보일러플레이트 코드 | `Connection`, `PreparedStatement`, `ResultSet` 을 매번 관리해야 함 |
| SQL 의존성 | SQL문을 직접 작성해야 함 (DB 변경 시 코드 수정 필요) |
| 자원 관리 어려움 | 연결, 해제, 예외처리 반복 |
| 객체-테이블 불일치 | 자바 객체 ↔ 테이블 구조 간 변환 불편 |

**보일러플레이트(Boilerplate)란?**

- 실제 기능과는 상관없이 형식적으로 반복되는 코드

**→ 그래서 등장한 JPA**

> JDBC의 복잡한 과정을 자동화하기 위해 등장한 기술이 바로 JPA(Java Persistence API)
>

---

### 🔄 JDBC → JPA 구조 변화

![mermaid-diagram-2025-10-29-233751.png](attachment:5fa96b43-2762-4cb6-9abc-b6693cbe8474:mermaid-diagram-2025-10-29-233751.png)

| 계층 | 역할 |
| --- | --- |
| **JPA / Hibernate** | SQL 자동 생성, 객체 ↔ 테이블 매핑 |
| **JDBC API** | 표준화된 데이터 접근 인터페이스 |
| **DB Driver** | 실제 DB와 통신 담당 |
| **Database** | 데이터 저장 및 질의 처리 |

## 정리

- **JDBC**는 **자바와 DB를 직접 연결**해주는 표준 API
- **JPA/Hibernate**는 **JDBC 기반의 자동화 계층(ORM)** 으로,

  보일러플레이트 코드를 제거하고 **객체 지향적인 데이터 접근**을 가능하게 함


---

### 개발자가 JPA를 사용하여 DB에 실제 데이터를 저장하기 까지의 흐름

![Untitled diagram-2025-10-28-083744.png](attachment:168cc526-a43e-4499-a243-b79d1cf9ab1b:Untitled_diagram-2025-10-28-083744.png)

---

## 참고

- [Oracle JDBC Documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/)
- [Baeldung - Introduction to JDBC](https://www.baeldung.com/java-jdbc)
- [JPA vs JDBC 비교](https://www.baeldung.com/jpa-vs-jdbc)