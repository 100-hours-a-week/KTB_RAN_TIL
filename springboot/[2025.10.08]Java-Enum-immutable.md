이전 게시글인

**[Enum과 친해지기 + TS와 JAVA의 Enum]**

에서 이어지는 글입니다.

Enum에 대해 기본적인 개념을 알고 계실 경우 넘어가셔도 되는 글입니다.

Java의 enum 객체가 꼭 불변(immutable)인 건 아니다라는 사실에 지적한 stackoverflow에 있는 글을 읽고 정리한 TIL 입니다.

---

### JAVA의 Enum

먼저 토론을 확인하기 앞서 토론글의 더 쉬운 이해를 위해 간단하게 **JAVA에서의 Enum의 특징**에 대해 정리하였습니다.

**기본적인 java enum의 구조**

```tsx
public enum Role {
    DEVELOPER,
    PLANNER,
    DESIGNER
}
```

이지만, 추가적으로 **객체의 속성과 메서드**를 가질 수 있습니다.

```tsx
public enum Role {

    DEVELOPER("개발자", "#747474"),
    PLANNER("기획자", "#C58B3A"),
    DESIGNER("디자이너", "#997EFF");
    //Role 객체 생성 
    
    private final String koreanName;
    private final String color;

    Role(String koreanName, String color) {
        this.koreanName = koreanName;
        this.color = color;
    }

    public String getKoreanName() {
        return koreanName;
    }

    public String getColor() {
        return color;
    }
}
```

[Enum Types (The Java™ Tutorials >        
Learning the Java Language > Classes and Objects)](https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html?utm_source=chatgpt.com)

**🔹 Enum 특징**

1. **상수로 정의(불변 데이터)**
2. 상태 변경 **불가능**

---

### Java의 enum 객체는 꼭 불변일까?

**[stackoverflow - 출처]**

[Java enums mutability usecases and possibilities?](https://stackoverflow.com/questions/13015870/java-enums-mutability-usecases-and-possibilities?utm_source=chatgpt.com)

### 🔸질문

```tsx
enum EnumTest {
  TOTO("TOTO 1"),
  TATA("TATA 2");

  private String str;

  private EnumTest(String str) {
    this.str = str;
  }

  @Override
  public String toString() {
    return str;
  }
}

```

enum의 가장 기본적인 구조이지만, **enum 값들은 (final) 불변이 아니기 때문에 수정이 가능하다.**

**❓TATA의 enum 값을 “newVal”로 수정이 가능할까?**

```tsx
System.out.println(EnumTest.TATA);

EnumTest.TATA.str = "newVal";

System.out.println(EnumTest.TATA);
```

**⭐출력결과**

```tsx
TATA 2 //EnumTest.TATA
newVal //변경 후 EnumTest.TATA
```

출력결과를 통해 **내부 필드 값이 변경되었다**는 사실을 확인할 수 있다.

대부분의 경우  enum 값은 생성 시점에 초기화 되지만 **final 키워드를 쓰지 않으면 수정이 가능하다.**

하지만 작성자는 enum을 변경가능하도록 설계한 코드를 본적이 없었다고 합니다.

위의 질문에 대하여

**두 가지를 주요 답변으로 다룹니다.**

1. mutable한 enum(수정 가능한 enum)을 만드는 실제 사례(usecase)가 있나요?
2. enum은 어디까지 확장해서 써도 될까요?

   예를 들어 Spring Bean을 주입할 수도 있을까요?

   (@Deprecated 같은 어노테이션은 enum 인스턴스에도 붙일 수 있더라고요.)


---

### 1 mutable한 enum(수정 가능한 enum)을 만드는 실제 사례(usecase)가 있나요?

> 있긴 하지만 **매우 드물다**
>
>
> → 대부분의 경우 **immutable** 로 작성한다.
>

가능한 경우은 **지연 초기화**와 **싱글톤 객체 관리**로 활용된다.

**지연 초기화란?**

- null인 상태에만 생성되므로 **처음 호출할때만** 객체가 생성된다.
- **진짜 필요할 때 까지 객체를 지연시킨다. → 지연 초기화**

```tsx
public class User {
    private Address address;

    public Address getAddress() {
        if (address == null) {          // 아직 안 만들어졌다면
            address = new Address();    // 그때 생성
        }
        return address;
    }
}
```

객체나 변수를 필요할 때 생성한다.

- **비교를 위한 즉시 초기화**

    ```tsx
    public class User {
        private Address address = new Address(); // 객체 생성 즉시 초기화
    
        public Address getAddress() {
            return address;
        }
    }
    ```

  즉시 초기화는 **User 객체를 만들자 마자 Address 객체가 생성**된다.

    - **불필요한 객체 :** 해당 객체의 **getAddress를 호출하지 않으면** 객체는 쓸데없는 메모리만 차지하게 된다.

      ~~아무 행위 안했는데 호카스를 누리고 있다고? 완전 식충이잔어~~


**Java Enum의 경우**

```tsx
public enum DataCache {
    INSTANCE;

    private Map<String, String> cache; // final (나중에 초기화됨)

    public Map<String, String> getCache() {
        if (cache == null) { //지연 초기화 (lazy initialization)
            cache = new HashMap<>();
            cache.put("key1", "value1");
        }
        return cache;
    }
}

```

- final을 사용하지 않고 객체가 필요할 때 만드는 패턴
    - 여기서 cache 는 처음엔 null 상태였다가, **getCache() 호출 시점에 값이 새로 들어가기 때문에 mutable한 상태**입니다.

---

### 2 enum은 어디까지 확장해서 써도 될까요?

**❗아,맞다! Spring 개념 복습하기**

- **Bean :** Spring이 직접 생성하고 관리하는 객체
- **DI(의존성 주입) :** Spring이 그 Bean을 필요한 곳에 자동으로 주입해주는 기능

  **→ 객체 생성 권한을 Spring에게 넘겨줍니다. 개발자는 new 사용하지 않음**


그렇다면 Enum에 Spring Bean을 주입할 수도 있을까요?

**예시 코드**

```tsx
@Service //Spring Bean 
public class UserService {
    public String greet() {
        return "Hello!";
    }
}

//Enum
public enum Role {
    DEVELOPER;

    @Autowired
    private UserService userService; //주입해주길 바래요

    public void sayHi() {
        System.out.println(userService.greet());
    }
}

```

→ Sprint이 관리하는 **Bean(SomeService)을 enum안에서도** 쓰고 싶어요!!

하지만 실행하면 NPE 발생 → UserService에 의존성 주입이 안되기 때문.

1. **enum**은 어플리케이션 생명주기 전반에서 **상수로 존재한다.**

   Spring Bean 처럼 런타임 시점에 관리되는 객체와 수명주기가 다르다.

   **Bean 주입 전 이미 enum 인스턴스가 생성됨.**

2. Spring의 DI는 런타임에서 작동하지만 enum은 컴파일 타임에 고정됨.

   프레임워크의 관리 범위 밖에 존재

   **💡Enum은 JVM이 미리 만든 상수이기 때문에 Spring의 Baen DI가 불가능하다.**


`@Deprecated` 처럼 컴파일 타임 어노테이션은 enum에 적용 가능하지만, Spring Bean 주입 (@Autowired, Component)는 적용되지 않는다.

**⭐Spring의 DI 컨테이너는 enum을 관리하지 않기 때문이다.**

---

### 정리

> 💡 Java enum은 문법적으로는 “객체”이기 때문에 내부 필드가 `final`이 아니면 **값을 바꿀 수 있습니다.**
>
>
>
> 하지만 **설계 관점에서는 enum은 “상수 집합”**을 나타내기 때문에 **불변(immutable)** 하게 유지하는 것이 **좋은 실무 관례(best practice)** 입니다.
>

---

### 회고

enum에 대해 궁금하여 찾아보다 나뭇가지 처럼 각각의 가지에 대해 궁금하게 되어 이것 저것 찾아보게 되었네요. 요리를 하기 전, 재료를 모두 꺼내야하는 단계처럼 enum은 설계에서 구현단계에서 넘어올때 리팩토링의 첫 단계라고 생각하는 단계입니다. 때문에 다양한 곳에서 enum이 어떻게 사용되고 있는지 실제 프로젝트에서 enum을 통해 얻을 수 있는 구체적인 이점이 궁금했는데 이번 리서치로 궁금증이 조금이나마 풀린 것 같습니다! 덕분에 커뮤에서 발생했던 개발자들의 열정적인 토론현장도 볼 수 있어서 상당히 재밌었습니다 ㅋㅋㅋㅋ 이게 딥다이브의 맛이군요 😋

이번 배움일기를 보시고 동료들의 간지러웠던 부분들이 시원해졌길 바라는 마음입니다.