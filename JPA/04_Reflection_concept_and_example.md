## Reflection

> EntityManager가 런타임 중에 리플렉션(Reflection)을 사용해서
엔티티 객체를 생성하고 관리하려면,
JPA 명세상 “파라미터가 없는 기본 생성자”가 반드시 존재해야 한다.

* JVM 메서드 영역(Method Area)에 있는 클래스의 메타데이터(정보)를
  **런타임**에 꺼내서 사용하는 기술
* `setAccessible(true)` 메서드를 사용하면
  접근제어자가 **private**이어도 접근할 수 있다.

---

### 특징

* **컴파일 이후(런타임)** 에 클래스의 구조(필드, 메서드, 생성자)를 읽고 조작할 수 있다.
* 즉, **“코드가 실행되는 도중”** 객체의 타입을 모르더라도
  클래스 정보를 읽어 객체를 생성하거나 메서드를 실행할 수 있다.
* **클래스 자체를 꺼내고 조작할 수 있는 기술**

    * 단, 보안·성능 이슈로 **모든 클래스에 다 접근할 수 있는 건 아님.**

---

## 코드 비교로 이해하기

### (1) 일반 생성자 방식

```java
User user = new User("a@b.com", "1234", "상균");
```

* **컴파일할 때** 이미 `User` 클래스의 구조를 알고 있고,
* JVM은 코드에 맞춰 메모리를 할당하고 생성자를 호출합니다.
* 매우 빠르고 안전하지만,
  → “`User`라는 클래스를 직접 알아야만” 객체를 만들 수 있다.

---

### (2) 리플렉션 방식

```java
Class<?> clazz = Class.forName("com.ran.jpa_practice.User");
Object obj = clazz.getDeclaredConstructor().newInstance();
```

* 실행 중(runtime)에 `"com.ran.jpa_practice.User"` 문자열을 읽고,
* 그 이름으로 클래스를 **찾아서 동적으로 로드**
* **기본 생성자**를 꺼내서 객체를 생성함
* 이때 **코드에 `User`라는 타입이 직접 등장하지 않는다.**

    * 즉, 컴파일 시점에는 `User` 타입을 몰라도 된다.
* JPA는 실제로 이 방식을 사용해 **Entity 객체를 동적으로 생성**한다.
* 기본적으로 `get`으로 public 멤버는 접근 가능,
  private은 `getDeclared…` 메서드로 접근해야 함.
* **기본 생성자가 반드시 존재해야 한다.**

---

### 동작 원리 (JVM 관점)

* **클래스 로더(Class Loader)** 가 `.class` 파일을 읽어
  JVM의 **Method Area** 에 클래스의 구조(필드, 메서드, 생성자 정보)를 저장한다.
* 리플렉션은 바로 이 Method Area에 있는 정보를 읽어
  **Heap 영역에 객체를 생성하거나, 메서드를 호출**하는 방식으로 동작한다.

> 즉, 리플렉션은 **Method Area의 메타데이터를 읽어서**
> **Heap 영역의 객체를 조작**하는 기술이다.

---

### 리플렉션이 사용되는 곳

* **JPA**
  → Entity 클래스의 이름을 문자열로 받아서 런타임에 `newInstance()`로 객체를 생성
* **Spring Framework**
  → 빈(Bean) 생성, 의존성 주입(DI), `@Autowired` 매핑 시 사용
* **Jackson / Gson**
  → JSON 직렬화·역직렬화 시 필드 접근
* **JUnit**
  → @Test 메서드 자동 실행
* **MyBatis**
  → Mapper 인터페이스 동적 프록시 생성


DB에서 조회한 데이터를 User 객체로 매핑할 때
```
User user = entityManager.find(User.class, 1L);
```

→ 내부적으로 new User()를 직접 쓰지 않고 Reflection으로 객체를 만들고, 필드에 값을 직접 주입(set) 합니다.

[ 동작 과정 ]
1. `EntityManager`가 “User” 엔티티 메타데이터를 확인
2. SQL:SELECT * FROM user WHERE id = 1 실행
3. 결과 ResultSet을 `User` 클래스로 매핑
4. 리플렉션으로 User 객체 생성 (`newInstance()`)
5. 조회된 값을 필드에 직접 주입
6. EntityManager가 생성된 객체를 영속성 컨텍스트에 저장 (1차 캐시)
7. 이후부터 `user.setName()` 하면 EntityManager가 변경 감지 (Dirty Checking)
---

### 단점

| 항목           | 설명                                        |
| ------------ | ----------------------------------------- |
| **성능 저하**    | 런타임에 클래스 정보를 탐색하기 때문에 일반 코드보다 느리다.        |
| **안전성 저하**   | private 멤버 접근, 보안 제약 우회 가능 (예상치 못한 버그 가능) |
| **유지보수 어려움** | IDE 자동완성, 컴파일 타임 오류 탐지가 불가능하다.            |

> 따라서 일반 비즈니스 코드에서는 사용하지 않고,
> 주로 **프레임워크 내부 구현부**에서 사용된다.



### 리플렉션을 사용하는 이유 (핵심 요약)

> **“컴파일 시점에 모르는 클래스를 런타임 시점에 다루기 위해”**

* 프레임워크는 사용자가 어떤 클래스를 넘겨줄지 모른다.
* 그래서 런타임에 **클래스 이름(String)** 으로 클래스를 찾고,
  생성자와 메서드를 가져와 실행한다.
* 이를 통해 “확장성 있고 유연한 프로그램 구조”를 구현할 수 있다.

---

### 리플렉션 동작 구조 요약

```text
.class 파일
   ↓ (ClassLoader)
Method Area (메타데이터 저장)
   ↓ (Reflection)
Heap 영역 (객체 생성 및 접근)
```



### 실제 코드 : 메서드 접근

```java
Class<?> clazz = Class.forName("com.example.User");
Method method = clazz.getDeclaredMethod("setName", String.class);
Object obj = clazz.getDeclaredConstructor().newInstance();

method.invoke(obj, "채영"); // private도 접근 가능 (setAccessible(true) 시)
```
