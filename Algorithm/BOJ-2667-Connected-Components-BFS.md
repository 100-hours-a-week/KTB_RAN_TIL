## 🧩 문제

* **문제 제목** : 단지번호붙이기
* **문제 레벨** : Silver I
* **문제 유형** : 그래프 탐색, BFS/DFS, 연결 요소
* **문제 제공** : BOJ 2667
* **문제 링크** : https://www.acmicpc.net/problem/2667
* **코드 파일** : [BOJ-2667.js](./BOJ-2667.js)

---

## 🧩 문제 설명

N x N 지도에서 `1`은 집, `0`은 빈 칸이다. 상하좌우로 연결된 집들을 하나의 단지로 본다. 전체 단지 수와 각 단지의 집 수를 오름차순으로 출력하면 된다.

---

## 🧩 문제 핵심 포인트

* 단지 하나를 찾으면 해당 단지의 모든 집을 한 번에 방문 처리해야 중복 카운팅이 없다.
* 이 문제는 "BFS를 여러 번" 실행하는 연결 요소 탐색 문제이다.
* 따라서 BFS마다 큐는 독립적으로 생성되어야 안전하다.

---

## 🧩 내 풀이 방식

* 이중 루프로 전체 좌표를 순회하면서 `1`을 만나면 새로운 BFS를 시작한다.
* BFS 내부에서 큐를 새로 만들고, 시작 지점을 바로 `0`으로 바꿔 방문 처리한다.
* BFS가 끝날 때 반환된 집 개수를 배열에 담고, 마지막에 정렬해서 출력한다.

---

## 🧩 코드 로직 정리

### 전체 흐름

```txt
1. 모든 칸을 순회하다가 값이 1인 칸을 찾는다.
2. 해당 칸을 시작점으로 BFS를 1회 수행해 단지 크기를 구한다.
3. BFS 내부에서는 큐를 독립 생성하고, 방문한 칸은 0으로 즉시 변경한다.
4. 단지 크기들을 모아 오름차순 정렬 후 단지 수와 함께 출력한다.
```

---

## 🧩 코드 구현 (내 풀이)

```js
const fs = require("fs"); // /dev/stdin
const input = fs.readFileSync("../예제.txt").toString().trim().split("\n");

//백준 제출 시
// const fs = require("fs");
// const input = fs.readFileSync(0, "utf-8").trim().split("\n");

//연결 요소 갯수 구하기 : BFS

function bfs(queue, graph, dx, dy, n, count) {
  while (queue.length) {
    let [curX, curY] = queue.shift();
    //상하좌우를 모두 확인해야됨.
    for (let i = 0; i < 4; i++) {
      let nextX = curX + dx[i];
      let nextY = curY + dy[i];

      if (
        nextX >= 0 &&
        nextX < n &&
        nextY >= 0 &&
        nextY < n &&
        graph[nextX][nextY] === 1
      ) {
        count++;
        queue.push([nextX, nextY]);
        graph[nextX][nextY] = 0;
      }
    }
  }

  return count;
}

function solution(n, graph) {
  //방문한 곳이 필요하고,
  //발자취 queue로 이동

  const answer = [];
  let groupCount = 0;

  let dx = [-1, 0, 1, 0];
  let dy = [0, 1, 0, -1];

  //방문한 곳은 0으로 처리할 것임.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let count = 1;
      if (graph[i][j] === 1) {
        groupCount++;
        const queue = [];
        queue.push([i, j]);
        graph[i][j] = 0;
        count = bfs(queue, graph, dx, dy, n, count);
        answer.push(count);
      }
    }
  }

  return groupCount + "\n" + answer.sort((a, b) => a - b).join("\n");
}

const n = Number(input[0]);
const arr = input.slice(1).map((i) => i.split("").map(Number));

console.log(solution(n, arr));
```

---

## 🧩 사용된 JS 개념

* `Array.prototype.push` : 큐의 뒤에 다음 탐색 좌표를 추가한다.
* `Array.prototype.shift` : 큐의 앞 원소를 꺼내 BFS 순서를 유지한다.
* `Array.prototype.sort((a, b) => a - b)` : 단지 크기를 숫자 오름차순으로 정렬한다.

---

## 🧩 복잡도

* 시간복잡도 : `O(N^2)` 방문 + `shift()` 비용 누적으로 구현상 최악 `O(N^4)`까지 증가 가능
* 공간복잡도 : `O(N^2)` (최악의 경우 큐/입력 그래프)

---

## 🧠 사고 키워드

* 연결 요소 문제는 "방문 안 한 시작점마다 탐색 1회" 구조이다.
* BFS 1회는 컴포넌트 1개를 의미하므로 큐도 독립 상태여야 한다.
* 방문 처리를 enqueue 시점에 하면 중복 삽입을 막을 수 있다.

---

## 🔍 트리거 문장

* "BFS를 여러 번 실행해야 하나?"

---

## ⚠️ 오답 포인트

* 큐를 전역처럼 재사용하면 이전 탐색 상태가 섞여 논리 오류가 날 수 있다.
* 방문 처리를 늦게 하면 같은 좌표가 큐에 여러 번 들어갈 수 있다.
* `shift()`를 반복 사용하면 입력이 커질 때 시간 초과 위험이 커진다.
