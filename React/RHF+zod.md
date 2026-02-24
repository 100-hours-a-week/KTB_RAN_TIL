

# 1. React Hook Form이 뭐냐 (정체부터)

**React Hook Form(RHF)**은 한 문장으로 이거다.

> **폼 상태 관리 + 검증을
> 브라우저 이벤트 중심으로, 최소 리렌더링으로 처리하는 라이브러리**

React에서 폼을 직접 관리하면 보통 이런 문제가 생긴다.

* `useState`가 필드마다 늘어남
* onChange 때마다 리렌더
* 검증 로직이 흩어짐
* submit / blur / change 타이밍 제어가 어려움

RHF는 이걸 해결한다.

---

# 2. RHF의 핵심 철학 (중요)

RHF는 **Controlled Component를 강제하지 않는다.**

즉,

* input의 값을 React state로 매번 들고 있지 않는다
* **DOM 이벤트를 기반으로 동작**

그래서 빠르고 단순하다.

---

# 3. RHF에서 꼭 알아야 할 개념 5개

## 3.1 `useForm`

폼 하나를 만드는 훅이다.

```ts
const form = useForm<FormModel>();
```

이 한 줄로 RHF가:

* 값 관리
* 검증
* 에러 관리
* touched 관리

를 전부 준비한다.

---

## 3.2 `register`

> **input을 RHF에 “등록”하는 함수**

```tsx
<input {...register("email")} />
```

이 의미는:

* 이 input의 name은 `email`
* 값 변경, blur 이벤트를 RHF가 감지
* RHF가 내부적으로 값을 관리

👉 **register = input과 RHF를 연결하는 접착제**

---

## 3.3 `errors`

> **검증 실패 결과**

```ts
formState.errors
```

구조는 대략 이렇다.

```ts
{
  email?: { message?: string };
  password?: { message?: string };
}
```

그래서 UI에서는 이렇게 쓴다.

```tsx
{errors.email?.message}
```

---

## 3.4 `handleSubmit`

> **submit 시 검증 → 성공하면 콜백 실행**

```ts
handleSubmit(onValid)
```

이건 내부적으로:

1. 모든 필드 검증
2. 실패 → 콜백 실행 안 함
3. 성공 → `onValid(data)` 실행

👉 `event.preventDefault()`를 직접 안 써도 된다.

---

## 3.5 `watch`

> **폼 값 관찰**

```ts
watch("email"); // email 값
watch();        // 전체 값
```

submit 버튼 활성화 같은 로직에 자주 쓴다.

---

# 4. RHF 기본 예제 (아주 단순한 형태)

```tsx
type LoginForm = {
  email: string;
  password: string;
};

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p>Email error</p>}

      <input {...register("password")} />
      {errors.password && <p>Password error</p>}

      <button type="submit">로그인</button>
    </form>
  );
}
```

---

# 5. Zod랑 같이 쓰면 어떻게 되냐

RHF는 **검증을 외부에 위임**할 수 있다.
그래서 Zod를 붙인다.

```ts
resolver: zodResolver(schema)
```

이렇게 하면:

* RHF가 값 수집
* 검증은 Zod가 수행
* 결과를 RHF가 `errors`로 변환

---

# 6. 이제 너희 프로젝트 코드랑 매핑해보자

## 6.1 너희 `useSignUpForm`에서 핵심 부분

```ts
const {
  register,
  handleSubmit,
  watch,
  trigger,
  formState: { errors, touchedFields },
} = useForm<SignUpFormModel>({
  defaultValues: DEFAULT_FORM,
  mode: "onBlur",
  resolver: zodResolver(signUpFormSchema),
});
```

### 이걸 말로 풀면

* 이 폼의 데이터 구조는 `SignUpFormModel`
* 초기값은 `DEFAULT_FORM`
* blur 시 검증
* 검증 규칙은 `signUpFormSchema`

---

## 6.2 UI 컴포넌트에서의 사용

```tsx
<SignUpForm
  register={register}
  errors={errors}
/>
```

그리고 `SignUpForm.tsx` 안에서는:

```tsx
<input {...register("email")} />
{errors.email?.message && <p>{errors.email.message}</p>}
```

👉 **UI는 RHF를 “직접 사용하지 않는다”**
그냥 props로 받은 걸 쓴다.

---

# 7. RHF에서 `trigger`는 뭐냐 (너희 코드에 있음)

```ts
const isValid = await trigger("nickname");
```

의미:

> **nickname 필드 하나만 검증해라**

그래서:

* 중복 확인 버튼
* 특정 필드만 강제 검증

에 쓰인다.

---

# 8. 왜 이 구조가 너희 프로젝트에 잘 맞냐

너희 구조는:

* **model**: `useSignUpForm`
* **ui**: `SignUpForm`
* **schema**: `signUpFormSchema`
* **validation**: shared/validation

RHF는:

* 상태와 검증을 한 곳(model)에 모으기 쉬움
* UI를 얇게 만들기 쉬움

👉 FSD 구조랑 궁합이 좋다.

---

# 9. 한 문장으로 정리

> **React Hook Form은
> “input은 DOM에 맡기고,
> 상태·검증·에러는 훅이 관리하는 폼 라이브러리”다.**

그리고 너희 프로젝트에서는:

> **RHF + Zod를 model 레이어에서 묶고,
> UI는 register와 errors만 받아서 그린다.**

---

이제 다음으로 자연스럽게 이어질 질문은 보통 이거다.

* `register` 안에 뭐가 들어가길래 저게 되는지
* `controlled vs uncontrolled` 차이
* 왜 `useState` 안 쓰는지

원하면 그다음 단계도 이어서 설명해줄게.
