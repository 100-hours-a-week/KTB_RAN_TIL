
# Optional 클래스

`Optional<T>` 클래스는 **값이 있을 수도, 없을 수도 있는 객체(null이 될 수 있는 값)** 을
안전하게 감싸는 **래퍼(Wrapper) 클래스**입니다.

> 즉, `null`을 직접 다루지 않고도 안전하게 처리할 수 있도록 돕는 도구입니다.

```java
Optional<T> 변수명 = Optional.ofNullable(값);
```



### 사용하는 이유

1. 객체가 `null`인 상태에서 접근할 경우 `NullPointerException`(NPE)이 발생할 수 있다.
2. `Optional`은 “값이 존재할 수도, 존재하지 않을 수도 있다”는 것을 **명시적으로 표현**하고,
   이에 맞는 **안전한 처리 로직**을 강제하도록 유도한다.

---

## of(), ofNullable(), empty()

| 메서드              | 설명                                   | 예시                                                        |
| ---------------- | ------------------------------------ | --------------------------------------------------------- |
| **of()**         | 값이 반드시 존재해야 할 때 사용 (null 전달 시 예외 발생) | `Optional<String> carModel = Optional.of("Avante");`      |
| **ofNullable()** | 값이 있을 수도 없을 수도 있을 때 사용               | `Optional<String> carColor = Optional.ofNullable(color);` |
| **empty()**      | 명시적으로 빈 Optional 생성                  | `Optional<String> emptyPlate = Optional.empty();`         |



### 정리

```java
Optional<String> carModel  = Optional.of("Avante");         // 값이 반드시 존재
Optional<String> carColor  = Optional.ofNullable(color);    // null 가능
Optional<String> emptyPlate = Optional.empty();              // 완전히 비어 있음
```

* `of()` → null을 넣으면 **NPE 발생**
* `ofNullable()` → 값이 있으면 감싸고, 없으면 **empty()처럼 작동**
* `empty()` → 명시적으로 “값이 없음” 표현

---

## isPresent() / ifPresent()

### isPresent()

```java
Optional<String> plateNumber = Optional.ofNullable(car.getPlateNumber());

if (plateNumber.isPresent()) {
    System.out.println("번호판 있음!");
}
```

* 반환값: `boolean`
* 설명: 값이 존재하면 `true`, 없으면 `false`



### ifPresent()

```java
Optional<String> plateNumber = Optional.ofNullable(car.getPlateNumber());

plateNumber.ifPresent(value -> {
    System.out.println("번호판: " + value);
});
```

* **값이 존재할 때만** 지정한 코드 실행
* 람다 표현식과 자주 함께 사용됨

---

## orElse() / orElseGet() / orElseThrow()

| 메서드               | 설명                        | 예시                                                                            |
| ----------------- | ------------------------- | ----------------------------------------------------------------------------- |
| **orElse()**      | 값이 없으면 기본값 반환             | `plateNumber.orElse("미등록 차량");`                                               |
| **orElseGet()**   | 값이 없을 때 람다로 **동적 기본값 생성** | `plateNumber.orElseGet(() -> "임시번호-0000");`                                   |
| **orElseThrow()** | 값이 없을 경우 **예외 발생**        | `plateNumber.orElseThrow(() -> new IllegalArgumentException("차량 번호가 없습니다"));` |



### orElse vs orElseGet 차이

| 상황            | 실행 방식                          |
| ------------- | ------------------------------ |
| `orElse()`    | **항상** 내부의 기본값 생성식을 실행함        |
| `orElseGet()` | 값이 **없을 때만** 람다식 실행 (→ 성능 효율적) |

```java
String result = plateNumber.orElse(getDefaultValue());    // getDefaultValue() 무조건 실행
String result2 = plateNumber.orElseGet(() -> getDefaultValue()); // null일 때만 실행
```

---

## map(), flatMap(), filter()

`Optional` 내부의 값을 **람다식으로 가공하거나 필터링**할 때 사용한다.


### map()

> 값을 변환하고 싶을 때

```java
Optional<String> car = Optional.of("Avante");
Optional<Integer> length = car.map(String::length); // "Avante" → 6
```


### flatMap()

> `Optional` 안에 또 다른 `Optional`이 있을 때 중첩을 풀어줌

```java
Optional<Optional<String>> nested = Optional.of(Optional.of("Hello"));
Optional<String> flat = nested.flatMap(x -> x); // Optional<"Hello">
```


### filter()

> 조건에 맞는 값만 통과시킴 (불일치 시 empty 반환)

```java
Optional<String> car = Optional.of("Avante");
Optional<String> filtered = car.filter(name -> name.startsWith("A")); // "Avante" 유지
```

---

## Optional 안티패턴

> “Optional은 null 방지를 위한 도구이지, 만능 Null 체크 도구는 아니다.”

* **필드에 Optional 선언 금지**

    * `private Optional<String> name;` 
      → 직렬화/역직렬화 문제 발생
* **컬렉션이나 배열에 Optional 사용 금지**

    * `List<Optional<User>>`  → 복잡도 증가, `Stream`으로 충분히 해결 가능
* **메서드 매개변수로 Optional 받지 말기**

    * Optional은 **리턴 타입**으로만 사용하는 것이 원칙.


## Optional과 Stream 연계

Optional은 Stream API와 자연스럽게 연결할 수 있다.

```java
Optional.ofNullable(car)
        .stream()                    // Stream으로 변환
        .filter(c -> c.isRegistered()) 
        .map(Car::getName)
        .forEach(System.out::println);
```

> Optional의 단일 값 → Stream 파이프라인에 자연스럽게 흘려보낼 수 있다.

---

## 메서드 요약 
주로 자주 사용하는 optional 메서드입니다.

| 구분                                   | 설명                            |
| ------------------------------------ | ----------------------------- |
| **Optional.of()**                    | null 불가, 값 반드시 존재해야 함         |
| **Optional.ofNullable()**            | null 허용                       |
| **Optional.empty()**                 | 빈 Optional 객체                 |
| **isPresent()**                      | 값 존재 여부 확인                    |
| **ifPresent()**                      | 값 존재 시 코드 실행                  |
| **orElse / orElseGet / orElseThrow** | 기본값, 지연 생성, 예외 처리             |
| **map / flatMap / filter**           | 람다로 Optional 가공               |
| **주의점**                              | 필드, 매개변수, 컬렉션에 Optional 사용 금지 |

---