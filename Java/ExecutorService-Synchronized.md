## ExecutorService

**개발자 대신 스레드풀을 관리하고 실행시켜주는 실행관리자**

---

> ExecutorService는 스레드를 매번 새로 만들지 않고,
>
>
> 미리 만들어둔 스레드 풀에서 runnable 같은 작업을 할당해주고,
>
> 끝나면 스레드를 재사용하도록 관리하는 구조입니다.
>

**재사용의 뜻**

Thread는 미리 만들어두고 runnable로 만들어진 인터페이스만 만들어진 Thread에 넣었다가 완료되면 빼는 그런 구조

**고양이로 이해하기**

![image.png](attachment:cf613a21-329e-449b-a36d-f2f1e6f9bd92:image.png)

- **Runnable Cat** → 실제로 해야 할 작업(고양이 = Task)
- **Thread 상자** → 고양이를 태워서 실행해주는 실행기
- **Thread Pool** → 여러 상자를 미리 모아둔 공간, ExecutorService가 관리
- **BlockingQueue** → 고양이(Task)들이 대기하는 줄 → 실행할 차례를 기다림
- **executor.submit()** → 고양이를 호텔(풀)로 보내는 역할

**실행 구조**

- Task(Runnable 고양이)는 스스로 휴식하지 못하고, **Thread 상자에 들어가야 쉴수있음**.
- Thread는 한 번 만들어두면 계속 남아있고, 여러 고양이를 태워서 번갈아 쉴수있음.
- ExecutorService는 고양이 호텔처럼 **스레드와 대기 줄(BlockingQueue)을 관리**해서 효율적 실행 보장.

---

**코드로 작성하기**

```tsx

public class Main {
    public static void main(String[] args) {
    
        //고양이 호텔에 방(상자)2개만듬
        ExecutorService catHotel = Executors.newFixedThreadPool(2);

        //고양이 3마리 휴식 요청
        catHotel.execute(()->handleRest("귀여운"));
        catHotel.execute(()->handleRest("멋쟁이"));
        catHotel.execute(()->handleRest("까칠한"));

        catHotel.shutdown(); //고양이 모두 휴식 후 종료

    }

    private static void handleRest(String kindOfCat) {
        System.out.println(kindOfCat + "고양이 쉬는 중)) 룸 번호:" + Thread.currentThread().getName());
        try{
            Thread.sleep(1000); //1초간 쉽니다.
        }catch (InterruptedException e){
            Thread.currentThread().interrupt();
        }
        System.out.println(kindOfCat+"휴식완료");
    }
}
```

---

## Synchronized

- **Synchronized** : 여러 스레드가 공유 자원에 접근하지 못하도록 → 해당 자원에 대한 접근을 하나로 제한하는 것
- 여러 스레드가 동시에 같은 메모리 공간에 접근하면 예기치 않은 결과가 발생
    - 하나의 자원에 하나의 스레드만 해당 자원에 접근할 수 있도록 제한한 영역 : **임계 영역**

**임계 영역**

- 여러 프로세스나 사용자가 공유자원에 동시에 접근하지 못하도록
    - 하나의 스레드만 접근하도록 일시적으로 제한한 영역
- 스레드가 임계 영역 진입 → lock 대출 → 코드 실행 끝→ lock 반납 → 다른 스레드가 대기 후 진입

사용법

메서드에 Synchronized 를 선언하면 임계영역으로 간주

**메서드와 블럭 단위로 나뉘어 사용 가능**

**synchronized 키워드를 사용시 메서드안의 락 기준 : 현재 객체**

- **코드 안에서는 carName이 됨.**

```tsx
package com.ran;

class FuelPump { //주유소
    private int fuelCount = 0;

    public synchronized void refuel(String carName){ //주유소에서 연료 넣는 행위
        fuelCount++;
        System.out.println(fuelCount + " " + carName);
    }

    public int getFuelCount(){
        return fuelCount;
    }

}

public class Main {
    public static void main(String[] args) {

        FuelPump fp = new FuelPump();

        Thread elecCar = new Thread(()-> fp.refuel("ElecCar"));
        Thread hybridCar = new Thread(()-> fp.refuel("HiCar"));
        Thread gasolineCar = new Thread(()-> fp.refuel("GasolineCar"));

        elecCar.start();
        hybridCar.start();
        gasolineCar.start();

    }
}
```

static 메서드 적용시

- **클래스 자체가 락의 기준이 됨.**
- 하지만 위에랑 결과는 같음.
    - 그럼 어디서 차이가 있을까?
    - 해당 static은 **전역설정을 변경할때 클래스 차원에서 하나의 리소스를 공유할 때, 여러 인스턴스가 동시에 접근할 수 있는 로깅 시스템 등에서 동기화가 필요할때**

```tsx
package com.ran;

class FuelPump { //주유소
    private **static** int fuelCount = 0;

    public **static** synchronized void refuel(String carName){ //주유소에서 연료 넣는 행위
        fuelCount++;
        System.out.println(fuelCount + " " + carName);
    }

    public int getFuelCount(){
        return fuelCount;
    }

}

public class Main {
    public static void main(String[] args) {
//        FuelPump fp = new FuelPump();
        Thread elecCar = new Thread(()-> FuelPump.refuel("ElecCar"));
        Thread hybridCar = new Thread(()-> FuelPump.refuel("HiCar"));
        Thread gasolineCar = new Thread(()-> FuelPump.refuel("GasolineCar"));

        elecCar.start();
        hybridCar.start();
        gasolineCar.start();

    }
}
```

- **세분화 하여 synchronized 를 사용**
    - 더 세밀하고 역할 구분을 확실하게 할 수 있음.

```tsx
class FuelPump { //주유소
    private int fuelCount = 0;

    public void refuel(String carName){ //주유소에서 연료 넣는 행위
        System.out.println(carName + " in enter ");

        //임계영역을 더 세밀한 영역으로 나눔.
        synchronized (this){
            fuelCount++;
            System.out.println(carName + " save ... ("+fuelCount+")");
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println(carName + " Complict ");
        }

        System.out.println(carName + " out bye");
    }

}

public class Main {
    public static void main(String[] args) {
        FuelPump fp = new FuelPump();

        Thread elecCar = new Thread(()-> fp.refuel("ElecCar"));
        Thread hybridCar = new Thread(()-> fp.refuel("HiCar"));
        Thread gasolineCar = new Thread(()-> fp.refuel("GasolineCar"));

        elecCar.start();
        hybridCar.start();
        gasolineCar.start();

    }
}
```