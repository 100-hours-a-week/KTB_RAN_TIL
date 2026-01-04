## 📌 개념 : 한줄 요약

## 💡 특징 및 동작 원리

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

- **useReducer의 구성 요소**
    - state : 현재 상태값
    - **dispatch** : 발송하다(동사)
        - 상태 변화가 있어야한다는 사실을 알리는 함수 : 상태 변화의 명령함수
    - **reducer** : 변환기
        - 상태(state)를 실제로 변환시키는 변환기 역할

---

## Reducer의 핵심 역할

### **액션(action)에 따라 state를 어떻게 바꿀지 결정하는 함수**

- 보통 reducer 안에 switch 또는 if else를 많이 쓴다.

```jsx
function reducer(balance, action) {
  const amount = Number(action.payload) || 0;

  switch (action.type) {
    case ACTIONS.DEPOSIT:
      return balance + amount;

    case ACTIONS.WITHDRAW:
      return balance - amount;

    default:
      return balance;
  }
}

```

- 입금이면 → 더하기
- 출금이면 → 빼기
- 그 외는 → 기존 그대로

- **money :** reducer가 관리하는 state
- **dispatch :** useReducer가 제공하는 setter 함수
    - dispatch로 전달하는 것(action)은 오브젝트 형식으로 전달된다.

```tsx
const [money, dispatch] = useReducer(reducer, 0);
```

```tsx
 <button
        onClick={() => {
          dispatch({ type: ACTIONS_TYPES.deposit, payload: number });
        }}
      >
```

### 핵심 정리

**Reducer란 상태 변경 로직**을 하나로 모은 함수

```
(state, action) => newState
```

- state: 현재 상태
- action: 어떤 변경을 원하는지 설명하는 객체
- newState: 변경 후 상태

Redux, Zustand 같은 전역 상태 라이브러리도 **이 패턴이 핵심 원리**다.

---

- **예제 전체 코드**
- 코드 참고 자료 : 별코딩 유투브 
    - **액션 타입 정리**

    ```tsx
    const ACTIONS = {
      DEPOSIT: "deposit",
      WITHDRAW: "withdraw",
    };
    ```

    - reducer 함수

    ```tsx
    function reducer(balance, action) {
      console.log("Reducer 실행:", balance, action);
    
      const amount = Number(action.payload) || 0; // NaN 방지
      const current = Number(balance) || 0;
    
      switch (action.type) {
        case ACTIONS.DEPOSIT:
          return current + amount;
    
        case ACTIONS.WITHDRAW:
          return current - amount;
    
        default:
          return current;
      }
    }
    ```

    - 전체 컴포넌트

    ```tsx
    export function Test() {
      const [inputValue, setInputValue] = useState(0); // 입금/출금 입력 값
      const [balance, dispatch] = useReducer(reducer, 0); // 잔고 state
    
      const handleChange = (e) => {
        const value = Number(e.target.value) || 0;
        setInputValue(value);
      };
    
      return (
        <div>
          <p>💰 현재 잔고: {balance}</p>
    
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            step="1000"
          />
    
          <button
            onClick={() =>
              dispatch({ type: ACTIONS.DEPOSIT, payload: inputValue })
            }
          >
            예금
          </button>
    
          <button
            onClick={() =>
              dispatch({ type: ACTIONS.WITHDRAW, payload: inputValue })
            }
          >
            출금
          </button>
        </div>
      );
    }
    ```