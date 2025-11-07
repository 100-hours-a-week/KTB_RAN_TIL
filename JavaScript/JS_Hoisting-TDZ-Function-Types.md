
## 함수선언문 vs 함수표현식 vs 화살표 함수의 호이스팅 TDZ 차이


### 키워드

- **스코프**
- **호이스팅**
- **익명함수**
- **함수선언문**
- **함수표현식**
- **화살표 함수**
- **TDZ**

### 스코프( 범위 )

- **function scope(var)** : 함수 범위 - 함수 스코프

  함수 안에서만 변수를 지정 function 안

  var은 중복선언이 가능함

- **block Scope (let) :** 블록 범위 - 블록 스코프

  함수가 아닌 블록 안에서만

  let은 중복선언이 안됨 .

- **global scope :** 전역 범위

# 호이스팅

변수와 함수가 초기화 되기 이전에 **메모리 상으로 먼저 올라가있는 현상**

→ 해당 스코프의 최상단으로 끌어올려지다.

**⭐️ var, let/const, function 호이스팅이 다르게 동작한다는 사실**

## 변수

---

### ◻️ var

**var의 초기화와 변수 선언을 분리해서 변수 선언을 먼저함.**

프로그램이 실행되기 이전에 사용하려는 변수를 미리 알려줌.

변수명이 올라가고 **undefined로 초기화 된다. → 초기화 진행**

```jsx
console.log(num);
**var num =** 10;
```

아래와 같은 경우로 진행딤.

```jsx
**var num;**
console.log(num)
num=10;
```

> **테스트**
>

```jsx
console.log(num); //undefined
var num = 10;
console.log(num); //10 
```

변수선언을 먼저했을 뿐, 값의 초기화는 진행되지 않았기 때문**에**

**num의 값은 아무값이 할당되지 않은 상태이기 때문에 undefined가 발생**

### ◻️ let / const

- **런타임에 변수 초기화 시키지 않는다.  → 초기화 안해요**
    - 호이스팅된다고했는데요?
    - **TDZ(Temporal Dead Zone) : 일시적 사각지대**
        - **일시적 사각지대에 포함되어있는 변수를 사용하지 못하도록 막았다고 함.**

      → **코드의 예측 가능성**을 높이기 위해 TDZ라는 개념을 도입

    - 이름이 메모리에 등록되어있지만 초기화는 진행되지 않는다.
        - **`initialization X`**

```jsx
console.log(num);
let num = 10;
console.log(num); 
```

![image.png](attachment:08b6e5fd-135e-44b8-bfb5-3e2f89bdbccb:image.png)

→ **호이스팅 현상으로 인해서 초기화되지 않은 변수를 참조할 수 없도록** 하기 위해 초기화 전에 접근할 수 없도록 막아둠

초기화 되기 이전에 접근할 수있는 것 자체가 이상함 ㅋㅋ

실제로 var의 호이스팅 현상은 자바스크립트 개발과정에서 실수로 생긴 일종의 버그라고 합니다

~~마인크래프트에서 지옥문 타고 지옥갈 때 발생하는 멀미효과 버그 같은 것~~

![image.png](attachment:b611be8f-0f76-48b9-9e43-6a8d3af16de1:image.png)

<aside>
💡

**실제 JS 개발자 <브랜든 아이크> 왈**

var hoisting was thus unintended consequence of function hoisting, no block scope, JS as a 1995 rush job. ES6 'let' may help.

호이스팅은 **함수 호이스팅의 의도치 않은 결과물(unintended consequence)**

이었습니다.

블록 스코프(block scope)가 없던 1995년 급하게 만들어진(JS as a 1995 rush job) 자바스크립트에서는 어쩔 수 없었죠. ES6의 `let`이 이 문제를 해결해줄 수 있을 거예요.

</aside>

<aside>
🙂 **요약** : 버그니까 let 만 쓰쇼

</aside>

### 🎉var let const 요약

| 키워드 | 선언 단계 | 초기화 시점 | 초기값 | TDZ 존재 | 선언 전 접근 시 |
| --- | --- | --- | --- | --- | --- |
| `var` | **컴파일 단계** | **컴파일 단계** | `undefined` | ❌ | `undefined` |
| `let` | 컴파일 단계 | 런타임 직전 | (없음) | ✅ | ❌ ReferenceError |
| `const` | 컴파일 단계 | 런타임 직전 | (없음, 선언과 동시에 초기화 필요) | ✅ | ❌ ReferenceError |

---

## 함수

- **익명함수**

  함수의 이름 자체는 익명임!! 변수안에 함수를 넣는 것 뿐임.

    - 익명함수가 존재하다는 뜻. → 즉시 함수
        - 재활용하기 위해 묶어놓은 이름이 없는 코드 집합.

    ```jsx
    function(){} //익명함수
    
    ()=>{} //화살표 함수
    ```

    ```jsx
    setTimeout(**function(){
    	console.log('1초 지남');
    }**, 1000);
    
    setTimeout((**) => { //화살표 함수는 단순히 가독성 측면에서 축약되고가 끝이 아니라 차이점이 있다.
    	console.log('1초 지남');
    }**, 1000);
    ```


### ◻️ 함수 선언식 vs 함수 표현식

- **함수 선언식 :** 함수를 선언하는 방식
- **호이스팅 시 선언 전 호출 가능**
    - 함수 전체 정의부가 메모리에 미리 로드되어 있는다.

```jsx
main()

function main(){
}
```

- **함수 표현식 :** 익명함수를 만들수있다.

  → 표현한 함수를 변수안에 선언

    - 변수 선언(`var`)만 호이스팅되고, 함수 할당은 런타임에 이루어집니다.
    - 즉, **선언은 올라가지만 초기화는 나중에**.
    - 호출 시점에 변수는 `undefined` 상태.

      **→ undefined이기 때문에 함수가 아님**


```jsx
sayHi(); // ❌ TypeError: sayHi is not a function

var sayHi = function () {
  console.log("Hi!");
};
```

```jsx
var sayHi; // undefined로 호이스팅됨
sayHi();   // undefined 호출 →  함수가 아님 : TypeError
sayHi = function() { console.log("Hi!"); };
```

![image.png](attachment:02db3733-b02d-4b6d-a890-392396961a98:image.png)

### ◻️ 화살표 함수

- `const` 또는 `let`과 함께 쓰이는 경우가 대부분.
    - **TDZ(Temporal Dead Zone)** — 변수가 선언되었지만 아직 **초기화**되지 않은 구간.
- 이 구간에서 접근 시 `ReferenceError`.

```jsx
sayHey(); // ❌ ReferenceError (TDZ)

const sayHey = () => {
  console.log("Hey!");
};

```

![image.png](attachment:6e5f493b-9840-4a46-b798-7e7a41d70e5f:image.png)

함수는 **선언과 초기화 모두 호이스팅**이 된다.

함수는 초기화 전에 호출해도 정상적으로 호출이 가능하다.

function 키워드로 선언한 함수는 **선언과 초기화, 할당 단계가 내부적으로 동시에** 진행되기 때문

### 🎉 함선언 / 함표현 / 화살표 요약

| 구분 | 선언 시점 | 호이스팅 | TDZ 발생 | 선언 전 호출 가능 여부 | 대표 예시 |
| --- | --- | --- | --- | --- | --- |
| **함수 선언식(function)** | 함수 전체 | ✅ (함수 정의까지) | ❌ | ✅ 가능 | `function foo() {}` |
| **함수 표현식 (var)** | 런타임 | ⭕️ (변수만 undefined로) | ❌ | ❌ TypeError | `var foo = function(){}` |
| **화살표 함수 (const/let)** | 런타임 | ⭕️ (변수명만 호이스팅) | ✅ | ❌ ReferenceError | `const foo = () => {}` |

---

### ❓ 왜 var 화살표 함수 안쓸까요?

- 스코프 오염
- 호이스팅 으로 인해 타입 변경 가능성

var 은 선언이 **호이스팅되어 undefined로 초기화**되기 때문에, 화살표 함수가 런타임에 할당되기 전 **접근하면 에러가 납니다.**

> **var 선언**
>

```jsx
console.log(greet);

var greet = () => console.log("Hi!");
greet();
console.log(greet);
```

![image.png](attachment:101eda31-42a9-431b-b966-cf422257c44d:image.png)

> **let 선언**
>

TDZ 때문에

```jsx
console.log(greet);

let greet = () => console.log("Hi!");
greet();
console.log(greet);

```

![image.png](attachment:bf22a499-4acb-4187-b00c-bfa9a0ffdc62:image.png)

---

### ❓ 그럼 TDZ때문에 호이스팅이 있어봤자 아닌가?

자바스크립트 엔진은 실행 전에 **모든 선언을 스코프에 등록하는 과정 자체를 호이스팅이라고한다.**

```jsx
console.log(a); // ❌ ReferenceError
let a = 10;
```

**1단계. Creation Phase(생성 컨텍스트 )**

- `a` 식별자를 **스코프(Environment Record)**에 등록 ✅
- 하지만 **초기화하지 않음 (TDZ 진입)**
- 즉, 존재는 하지만 **“uninitialized” 상태**

```
Memory:
a → <uninitialized>
```

**2단계. Execution Phase(실행 컨텍스트 )**

- 코드 한 줄씩 실행
- `let a = 10;` 만나면 이제 **초기화됨**

  (`undefined` 생성 후 `10` 대입)

- **TDZ 종료 → 정상 접근 가능**

---

# 결론

### 호이스팅과 TDZ 의 관계

- **호이스팅**은 **JS 엔진이 코드를 한 번에 파싱하는 특성** 때문에 **자연스럽게** 발생하는 현상

  → 엔진이 “한 번 다 읽고 실행하는 구조”이기 때문이지 *의도적 버그는 아님*

- 하지만 `var` 키워드는 **호이스팅 + 즉시 undefined 초기화** 때문에 “선언 전에 접근해도 에러가 안 나는” **비직관적인 동작이 존재**

```jsx
console.log(x); // undefined //이딴게 에러가 안뜬다고? 
var x = 10;
```

![image.png](attachment:e683a890-dd29-4535-b358-514b207907bf:image.png)

- ES6에서 let과 const가 등장할 때, “**호이스팅은 언어 스펙상 없앨 수 없지만, 버그성 동작은 막자.**” 라는 철학으로 → ***TDZ(Temporal Dead Zone)***가 등장

<aside>
🙂

TDZ는 var 호이스팅의 부작용을 막기 위한 안전장치

</aside>

---

# 출처

https://youtu.be/9I1dzg20r1g?si=HaxggK9FtolsCGs4

https://www.youtube.com/watch?v=eDcaBeaOrqI

https://youtu.be/_zMVlKxmWHg?si=hAMBfYb76_wvQVZe