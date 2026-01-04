### 스택(Stack)

- 스택은 입력 출력을 한 방향으로 제한한 자료구조이다.
- 데이터의 삽입과 삭제가 한쪽에서만 이루어진다.
- **후입선출(LIFO : Last In-First Out)구조** → 나중에 넣은 데이터가 먼저 나온다.
- **스택을 구현하는 방법**
    1. **Array(배열)**
    2. linkedList(연결리스트)
- **스택의 기본연산**
    - `push` : 데이터를 저장
    - `pop`  : 최신 데이터를 제거하며 반환
    - `peek` : 스택의 top 원소를 제거 없이 반환한다.

### stack 코드

- push, pop만으로 stack 자료구조를 직접 만들어야한다.

```jsx
class Stack {
	constructor() { //생성자
		this.array = [];
	}
	
	push(value){
		this.array.push(value);
	}
	
	pop(){
		return this.array.pop();
	}
	
	peek(){
		return this.array[this.array.length-1]
	}

}
```

- **stack 자료구조 사용하기**

```jsx
const stack = new Stack();
stack.push("A");
stack.push("B");
stack.push("C");
stack.push("D");
const pop = stack.pop();
console.log(pop); //"D"

const top = stack.peek();
console.log(top);//"C"

console.log("stack",stack); //[ "A", "B", "C" ]
```

---

### 큐 (Queue)

- 큐는 대기행렬이다.
- 스택과 달리 데이터의 삽입과 한쪽끝에서 이루어지고, 삭제는 반대쪽 끝에서 일어난다.
- 스택과 반대로 **선입선출(FIFO : First In First Out)** → 먼저 넣은 데이터가 먼저 나온다.
- **큐의 기본연산**
    - `enqueue, insert` : 큐에 원소를 삽입한다.
    - `dequeue, remove` : 원소를 큐에서 삭제하고 반환한다.
    - `peek` : 큐의 헤더 원소를 제거 없이 반환한다.

```jsx
class Queue{
	constructor(){
		this.array = [];
	}
	
	enqueue(value){
		this.array.push(value);
	}
	
	dequeue() {
		return this.array.shift();
	}

	peek(){
		return this.array[0];
	}
}
```

---
자료 제공
- 자바스크립트로 배우는 자료구조 & 알고리즘 (개념+문제풀이) - kyo : 인프런