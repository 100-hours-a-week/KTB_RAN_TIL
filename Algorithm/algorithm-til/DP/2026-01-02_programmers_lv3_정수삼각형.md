> 🍀더도말고 덜도말고 하루에 한문제 코딩테스트 풀기!
플랫폼 : 프로그래머스
코테 푼 날짜 : 2026.01.02
문제 : 정수 삼각형
Level 3
>

### 🧩문제
https://school.programmers.co.kr/learn/courses/30/lessons/43105

위와 같은 삼각형의 꼭대기에서 바닥까지 이어지는 경로 중, 거쳐간 숫자의 합이 가장 큰 경우를 찾아보려고 합니다. 아래 칸으로 이동할 때는 대각선 방향으로 한 칸 오른쪽 또는 왼쪽으로만 이동 가능합니다. 예를 들어 3에서는 그 아래칸의 8 또는 1로만 이동이 가능합니다. 

삼각형의 정보가 담긴 배열 triangle이 매개변수로 주어질 때, 거쳐간 숫자의 최댓값을 return 하도록 solution 함수를 완성하세요.

            7
          3   8
        8   1   0
      2   7   4   4
    4   5   2   6   5

### 🧩코드 로직

### DFS + DP

- 효율성 테스트 실패 (시간 초과 )
    - top down 으로 풀어서 그런듯

```jsx
function solution(triangle) {
    const memo = {};
    const n = triangle.length
    
    function dfs(depth,index){
        //1. 종료 조건
        if(depth === n-1){
            //리프 노드
            return triangle[depth][index];
        }

        //계산시키기 전에 빠르게 해결 
        const key = `${depth},${index}`;
        if(key in memo) return memo[key];

        //2. 분기점 : 자신의 인덱스 +0, +1밖에 못함

        const right = dfs(depth+1, index+1);
        const left = dfs(depth+1, index);

        memo[key] = triangle[depth][index] + Math.max(left, right);

        return memo[key];
    }   
    
    return dfs(0,0);
}
```

### 실패한 이유

1. JS는 재귀가 느리다.
    1. 함수 호출 비용이 큼.
    2. 삼각형 크기가 500일 경우 함수 호출 500*500
        1. DFS 호출 수.  500*500 / 2 = 약 125,000
        2. memo를 쓴다고 해도 한번이상은 계산을 해야하기 때문에 너무 많은 비용이 듬.
2. 문자열 key(`"${depth},${index}"`)
    1. 문자열 생성
    2. 해시 계산
    3. 객체 탐색

   → 효율성이 안좋다.


### DP

- **bottom up**
    - 반복문을 사용

```jsx
function solution(triangle) {
    const dp = triangle.map(row=>[...row])
    
    for(let i=triangle.length-2;i>=0;i--){
        for(let j=0;j<triangle[i].length;j++){
            dp[i][j] += Math.max(dp[i+1][j],dp[i+1][j+1]) //조건
        }
    }
    
    //장점. : 조건에 부합하지 않으면 수행하지 않음 
    //-> dp[0][0]가 자식노드 중 큰값이 아닌 노드는 합쳐지지도 않음. 
    
    return dp[0][0];
}
```

| 항목 | DFS + memo | Bottom-up |
| --- | --- | --- |
| 함수 호출 | 많음 | 없음 |
| 메모 접근 | 문자열 key | 배열 인덱스 |
| 캐시 효율 | 낮음 | 높음 |
| JS 친화성 | ❌ | ✅ |

### 🎉회고

생각보다 쉬웠음 DP의 원리만 알고있었다면 쉽게 풀었을 듯.

bottom up 의 장점 : 조건에 부합하지 않으면 수행하지 않음

dp[0][0]가 자식노드 중 큰 값이 아닌 노드는 합친 경우의 수가 없다.