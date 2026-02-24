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
