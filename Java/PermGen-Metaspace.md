**📖PermGen이 사라진 이유와 GC의 관계**

- **Permanent Generation (PermGen) 란?**
    - JAVA 7까지 **힙 메모리영역** 중 일부였음
    - java 의 **클래스 메타데이터, 상수 풀, static 변수의 메타 데이터를** 가지고 있음.
    - **힙 구조**

    ```tsx
    Young Generation
    	ㄴ Eden
    	ㄴ Survivor 0
    	ㄴ Survivor 1
    Old Generation
    (java 8 이전) Permanent Generation (PermGen)
    ```

    - [메서드 영역은](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html#jvms-2.5.4) 명세에 기술된 논리적 개념 이므로 모든 JVM에는 메서드 영역이 있습니다. 하지만 이것이 구현 코드에 반영되어야 한다는 것을 의미하지는 않습니다. 마찬가지로, [Java 힙 공간은](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html#jvms-2.5.3) 명세에 모든 Java 객체를 저장하는 개념으로 명시되어 있으므로, 실제로 구현 방식과 관계없이 모든 Java 객체는 정의에 따라 힙에 저장됩니다.
    - Java 객체와 Java 객체 이외의 JVM 데이터 구조를 포함했던 Perm Gen과 달리, Java 8용 HotSpot JVM의 메모리 레이아웃은 명확하게 구분되어 있습니다. Old Gen은 여전히 Java 객체만 포함하는 반면, Metaspace는 JVM 특정 데이터만 포함하고 Java 객체는 포함하지 않습니다. 따라서 이전에 Perm Gen에 저장되었던 Java 객체는 Old Gen으로 이동되었습니다. Method Area는 "런타임 상수 풀, 필드 및 메서드 데이터, 메서드 및 생성자 코드 등"의 아티팩트, 즉 Java 객체가 아닌 객체(단, 풀에는 힙 객체에 대한 *참조가* 포함될 수 있음 )를 포함하기 때문에 이제 Metaspace의 일부가 되었습니다.
    - 이제 메타스페이스가 메서드 영역의 구현인지, 아니면 메서드 영역 이상을 포함할 수 있는지 논의할 수 있지만, 이는 실질적인 관련성이 없습니다. 실제로 JVM은 메타스페이스와 그 안에 포함된 아티팩트를 관리하는 코드를 포함하고 있으며, 이러한 아티팩트가 명세에서 "메서드 영역"으로 정의하는 영역에 논리적으로 속하는지 여부는 신경 쓸 필요가 없습니다.

- **메타스페이스 metaspace란?**

  **: 네이티브 메모리** 안에 있는 공간으로 클래스의 메타데이터, 상수 풀, static 변수 메타데이터를 저장해둠.

- **네이티브 메모리란?**

  : JVM 외부에서 **OS가 직접 관리**하는 메모리


- java 8 이후는 PermGen이 삭제 되고, Metaspace로 대체됨.

**❓ 왜 PermGen이 삭제되었는가?**

- JVM이 실행될때, **PermGen의** **크기를 지정**해 줘야했기 때문에, 실행 도중에 많은 클래스가 로딩되면 **OutOfMemory(OOM)**라는 예외가 빈번하게 일어났다.

→ 메모리 누수 발생 원인

→ C++의 malloc 동적 메모리 할당 처럼 JVM도 메모리 크기를 지정해줘야됨.

- PermGen이 사라지고 새롭게 생긴 네이티브 메모리의 **Metaspace는,** 네이티브 메모리 공간으로 **자동으로 메모리를 크게** 만들수있음.

![image.png](attachment:7d87ccea-7495-462d-87fb-5532c2c5bd22:image.png)

메타 데이터를 더 유연하게 관리하고 필요 시 GC가 Metaspace도 함께 정리함.

- **Metaspace가 너무 커지면 JVM이 FullGC를 실행**

→ MetaspaceSize 및 MaxMetaspaceSize : Metaspace 상한을 설정할 수 있음

```tsx
class User {
    String name;
    int age;
    class care(){
	    
    }
}

User u = new User();

```

- `User`라는 클래스의 구조 정보 (필드 name, age, 메서드 정보) → **Metaspace에 저장**
- `new User()`로 만든 객체 `u`의 실제 값(name, age 값) → **Heap에 저장**

> **Metaspace의 자동확장 / 축소 규칙**
>
- 남은 공간이 **Min**MetaspaceFreeRatio 보다 적으면 **자동으로 확장함.**

  : GC 후에도 남은 여유공간이 지정한 값보다 작을경우

→ JVM이 OS에게 “메모리 좀 더 plz” 하고 Metaspace를 확장함.

**`MinMetaspaceFreeRatio`** : 가비지 수집 후 **남은 클래스 메타데이터 용량의 최소 백분율**입니다.

- 남은 공간이 **Max**MetaspaceFreeRatio 보다 많으면 **축소함.**

  : GC 후에도 남은 여유 공간이 **지나치게 많으면,**

→ JVM이 일부 Metaspace를 OS에 반환해서 낭비를 막음.

**`MaxMetaspaceFreeRatio`** : 가비지 수집 후 공간 감소를 방지하기 위해 **남은 클래스 메타데이터 용량의 최대 백분율**입니다.

**❓왜 PermGen은 Metaspace처럼 자동으로 확장/축소가 되지 않는가?**

힙 내부 영역이라 OS 메모리를 자유롭게 요청해서 늘릴 수가 없었음.

---

## 📍 객체와 메타데이터 저장 위치

### 1. **일반 객체(인스턴스)**

- `new`로 만든 객체, 배열 → **JVM Heap (Java Heap)** 에 저장됨.
- 이건 GC 대상.
- (주의) OS 네이티브 힙이 아니라 JVM이 OS로부터 빌려온 “Java Heap” 안에 올라간다.

### 2. **클래스 메타데이터**

- 클래스 이름, 상속 정보, 필드/메서드 시그니처, static 필드 정의, 메서드 바이트코드 → **Metaspace** 에 저장됨.
- Metaspace는 **OS 네이티브 힙 영역(off-heap)** 위에 구현됨.
- 즉, “클래스 관련 정보”만 네이티브 메모리에 저장되고, GC는 클래스 로더 언로딩 때만 관여.

### 3. **static 변수 값**

- static 필드의 **정의**는 Metaspace에 있지만,
- static 필드의 **실제 값(primitive든 reference든)**은 JVM Heap에 저장됨.
- reference static이면, 그 값이 가리키는 객체 역시 Heap에 있음.

| 구분 | **Method Area (JVM Spec)** | **PermGen (HotSpot, ~JDK7)** | **Metaspace (HotSpot, JDK8~)** |
| --- | --- | --- | --- |
| **정의** | JVM 명세서에 나온 *논리적 메모리 영역* (클래스/메서드 관련 데이터 저장) | Method Area의 **HotSpot 구현체** (Java Heap 내부의 고정 영역) | Method Area의 **HotSpot 구현체** (네이티브 메모리 기반) |
| **저장 데이터** | - 클래스 구조 정보- 런타임 상수 풀- 필드/메서드 데이터- 바이트코드(메서드 코드)- 초기화 메서드 | 동일 (Method Area 요구사항 충족) | 동일 (Method Area 요구사항 충족) |
| **메모리 위치** | 논리적으로 힙의 일부 (스펙상) | 자바 힙 내부 (GC 대상이지만 관리 한계 있음) | 네이티브 메모리(힙 밖, off-heap) |
| **관리 방식** | JVM 구현에 따라 다름 (스펙은 정책 미지정) | - 크기 고정 또는 확장- OutOfMemoryError 발생 가능- GC에 의해 해제 가능하나 제약 많음 | - Elastic Metaspace (JEP 387)- 필요 시 OS에서 메모리 반환(uncommit)- GC 클래스 언로딩과 연동 |
| **튜닝 옵션** | 스펙은 크기 조절 권한만 언급 | `-XX:PermSize`, `-XX:MaxPermSize` | `-XX:MetaspaceSize`, `-XX:MaxMetaspaceSize`,`-XX:CompressedClassSpaceSize` |
| **한계** | 구현체마다 다름 | 크기 한계로 인해 `OutOfMemoryError: PermGen space` 자주 발생 | 네이티브 메모리 기반이라 상대적으로 여유로움, 대신 전체 프로세스 메모리에 의존 |