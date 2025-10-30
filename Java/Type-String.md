## **type**

**기본타입** : 원시 타입이라고도 함. 가장 기본적인 타입

- **int double char boolean byte short long float**

**참조타입**

- 값이 저장된 **메모리 주소를 저장** (참조)하는 타입
- **클래스(Car, String), 배열(int []), 인터페이스(Runnable), 열거형(enum)**
- 객체를 다루는 타입 으로 불리며, 참조하는 타입은 모두 **객체**입니다.

**→ 타입에 맞는 값만 저장할 수 있다. :** int number = 10 / number = “Apple” 오류 발생

**타입 추론 : var**

Kotlin에도 var이 존재 → val :불변 / var :가변 및 타입추론(주로 변수 타입이 바뀔 가능성을 염두해두어 사용)

---

## **final (제한자)**

한 번 초기화 한 변수나 필드가 이후에 **재정의가 불가하도록 제한함.**

→ 때문에, 단한번만 값을 할당할 수 있음.

```tsx
final int MAX_SEED = 100;
```

**어디에 사용되는가**

- 주로 상수(constant)를 선언할 때 사용됨. (고정되어야하는 상황에서 타입의 안정성과 명확성을 보장해줌.)

**⭐참조타입에 변수에 사용될 경우**

- 참조값 변경 불가 / 객체 내부상태는 변경 가능

> **배열 참조**

```tsx
final int[] arr = {1,2,3};
int[0] = 10; //가능 
arr = new int[5]; //불가!! 
```

> **컬렉션 참조**

```tsx
final List<String> list = new ArrayList<>();
list.add("Hi");     // 가능
list = new LinkedList<>(); // 불가
```

---

## **static**

객체 없이도 클래스 이름만으로 접근 가능

→ static으로 선언된 필드나 메서드는 메서드 영역에 생성되며 **프로그램 종료 때까지 모든 객체 공유 및 사라지지 않음.**

- **static의 장점**

  객체를 생성하지 않아도 필드나 메서드에 접근 가능함.

- **static의 단점**
    - **메모리 회수 불가**
    - **공유 상태**이므로 다른 곳에서 상태를 바꾸면 또 다른곳에 영향을 줄수있음.
    - 이로 인한 **객체지향 설계원칙 위반**

---

## **Wrapper**

기본 자료형을 객체로 감싸는 **클래스**

- **왜 필요하지?**
    - 자바의 객체 지향 특징을 위해, 다양한 기능을 기본형 타입이 누리기 위해
    - ArrayList에는 Int 담기 불가 → Integer로 Wrapper 감싸야합니다.

    **❓왜 ArrayList는 기본형 타입 Int를 담지 못하나?**

    **ArrayList 같은 제네릭**은 런타임 이후 → 타입 소거 → Object로 변함

    **! 하지만,** int는 Object의 자식(하위 타입)이 아닙니다.

- ArrayList<Object>  **ArrayList에 Object 타입(객체)인 Integer, Byte만** 담을 수 있다.
- int → Integer같은 Auto-boxing(오토박싱) 자동으로 형 변환을 해주는 오토박싱이 발생하여 가능.

```tsx
ArrayList<Object> list = new ArrayList<>();
list.add("Hello");      // String
list.add(10);           // int → Integer (auto-boxing)
list.add((byte) 5);     // byte → Byte (auto-boxing)
```

- <Object> → 모든 객체 즉, 모든 참조 타입이 들어올수있다는 뜻!
- <Integer> → 많은 객체 형중 **Integer 타입**만 제한
- <Car> → **Car 객체**만 들어올 수 있도록 제한

---

## **오토박싱 Autoboxing**

기본 타입을 자동으로 **래퍼 클래스 객체**로 변환해줌

```tsx
Integer num = 10; //int -> Integer (auto-boxing)
```

## **언박싱 Unboxing**

래퍼 클래스를 기본타입으로 바꿔줌

```tsx
int value = num // Integer -> Int (Unboxing) 
```

![image.png](attachment:35ba97da-8bfe-4fc7-9985-6989ecac4615:image.png)

---


## String

불변 객체 문자열 자료형

`“  ”` : 문자열 리터럴 ← 이렇게 저장된 문자열값은 **String Constant Pool (문자열 상수 풀)**에 저장됨.

불변 객체 이기 때문에, 값을 변경해도 변경된게 아닌 **새로운 객체를 만든것**

기존 참조했었던 값은 그대로 존재합니다. ← 해당 값은 GC대상

```tsx
String str = "I";        
// [str] → "I"

str = str + " am";       
// "I am" 이라는 새 객체 생성
// [str] → "I am" (참조 변경)
// 원래 "I" 객체는 그대로 있음 (GC 대상 가능)
```

**❓equals()와 ==의 차이를 구분하는방법**

**== (동등성 비교)**

**:** 값 자체를 비교함. 때문에, 값의 주소값을 저장하는 **참조 타입은 주솟값으로 비교**하게 됨.

```tsx
//기본 타입 
int a = 10;
int b = 10;
System.out.println(a == b); // true (값이 같음)

//참조 타입
Integer x = new Integer(10);
Integer y = new Integer(10);
System.out.println(x == y); // false (주소가 다름)
```

**equals (내용 비교, Logical Equality : 논리적 )**

: Object 클래스의 메서드로, 내용을 비교함.

```tsx
Integer a = new Integer(10);
Integer b = new Integer(10);

System.out.println(a == b);       // false (주소가 다름)
System.out.println(a.equals(b));  // true  (내용 같음)
```

---

Kotlin과 Java 의 메소드 비교

| 기능 | Java | Kotlin |
| --- | --- | --- |
| 문자열 길이 | **str.length()** | **str.length**  |
| 특정 위치 문자 | str.charAt(i) | str[i] 또는 str.get(i) |
| 부분 문자열 | **str.substring(begin, end)** | **str.substring(beginIndex, endIndex)** |
| 대문자로 변환 | str.toUpperCase() | str.uppercase()  |
| 포함 여부 확인 | **str.contains("am")** | **str.contains("am")**  |

---
