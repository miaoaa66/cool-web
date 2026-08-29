

Math.minmax = (value, limit) => {
  return Math.max(Math.min(value, limit), -limit);
};

const distance2D = (p1, p2) => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

// 两点之间的角度
const getAngle = (p1, p2) => {
  let angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
  if (p2.x - p1.x < 0) angle += Math.PI;
  return angle;
};

// 一个球和一个墙帽能有多近
const closestItCanBe = (cap, ball) => {
  let angle = getAngle(cap, ball);

  const deltaX = Math.cos(angle) * (wallW / 2 + ballSize / 2);
  const deltaY = Math.sin(angle) * (wallW / 2 + ballSize / 2);

  return { x: cap.x + deltaX, y: cap.y + deltaY };
};

// 在墙帽周围滚动球
const rollAroundCap = (cap, ball) => {
  // 球不能再移动的方向，因为墙挡住了它
  let impactAngle = getAngle(ball, cap);

  // 基于球的速度，球想要移动的方向
  let heading = getAngle(
    { x: 0, y: 0 },
    { x: ball.velocityX, y: ball.velocityY }
  );

  //撞击方向和球的期望方向之间的角度
  //这个角度越小，影响越大
  //它越接近90度，就越平滑(在90度时，就没有碰撞)
  let impactHeadingAngle = impactAngle - heading;

  // 速度距离如果没有击中就会发生
  const velocityMagnitude = distance2D(
    { x: 0, y: 0 },
    { x: ball.velocityX, y: ball.velocityY }
  );
  // 与冲击成对角线的速度分量
  const velocityMagnitudeDiagonalToTheImpact =
    Math.sin(impactHeadingAngle) * velocityMagnitude;

  // 球应该离墙帽多远
  const closestDistance = wallW / 2 + ballSize / 2;

  const rotationAngle = Math.atan(
    velocityMagnitudeDiagonalToTheImpact / closestDistance
  );

  const deltaFromCap = {
    x: Math.cos(impactAngle + Math.PI - rotationAngle) * closestDistance,
    y: Math.sin(impactAngle + Math.PI - rotationAngle) * closestDistance
  };

  const x = ball.x;
  const y = ball.y;
  const velocityX = ball.x - (cap.x + deltaFromCap.x);
  const velocityY = ball.y - (cap.y + deltaFromCap.y);
  const nextX = x + velocityX;
  const nextY = y + velocityY;

  return { x, y, velocityX, velocityY, nextX, nextY };
};

// 减少一个数的绝对值，但保持其符号，不低于abs 0
const slow = (number, difference) => {
  if (Math.abs(number) <= difference) return 0;
  if (number > difference) return number - difference;
  return number + difference;
};

const mazeElement = document.getElementById("maze");
const joystickHeadElement = document.getElementById("joystick-head");
const noteElement = document.getElementById("note"); // 说明和游戏获胜、游戏失败文本的注释元素

let hardMode = false;
let previousTimestamp;
let gameInProgress;
let mouseStartX;
let mouseStartY;
let accelerationX;
let accelerationY;
let frictionX;
let frictionY;

const pathW = 25; // 路径宽
const wallW = 10; // 墙宽
const ballSize = 10; // 球的宽高
const holeSize = 18;

const debugMode = false;

let balls = [];
let ballElements = [];
let holeElements = [];

resetGame();

// 第一次抽球
balls.forEach(({ x, y }) => {
  const ball = document.createElement("div");
  ball.setAttribute("class", "ball");
  ball.style.cssText = `left: ${x}px; top: ${y}px; `;

  mazeElement.appendChild(ball);
  ballElements.push(ball);
});

// 墙元数据
const walls = [
  // 边框
  { column: 0, row: 0, horizontal: true, length: 10 },
  { column: 0, row: 0, horizontal: false, length: 9 },
  { column: 0, row: 9, horizontal: true, length: 10 },
  { column: 10, row: 0, horizontal: false, length: 9 },

  // 从第1列开始的水平线
  { column: 0, row: 6, horizontal: true, length: 1 },
  { column: 0, row: 8, horizontal: true, length: 1 },

  // 从第2列开始的水平线
  { column: 1, row: 1, horizontal: true, length: 2 },
  { column: 1, row: 7, horizontal: true, length: 1 },

  // 从第3列开始的水平线
  { column: 2, row: 2, horizontal: true, length: 2 },
  { column: 2, row: 4, horizontal: true, length: 1 },
  { column: 2, row: 5, horizontal: true, length: 1 },
  { column: 2, row: 6, horizontal: true, length: 1 },

  // 从第4列开始的水平线
  { column: 3, row: 3, horizontal: true, length: 1 },
  { column: 3, row: 8, horizontal: true, length: 3 },

  // 从第5列开始的水平线
  { column: 4, row: 6, horizontal: true, length: 1 },

  // 从第6列开始的水平线
  { column: 5, row: 2, horizontal: true, length: 2 },
  { column: 5, row: 7, horizontal: true, length: 1 },

  // 从第7列开始的水平线
  { column: 6, row: 1, horizontal: true, length: 1 },
  { column: 6, row: 6, horizontal: true, length: 2 },

  // 从第8列开始的水平线
  { column: 7, row: 3, horizontal: true, length: 2 },
  { column: 7, row: 7, horizontal: true, length: 2 },

  // 从第9列开始的水平线
  { column: 8, row: 1, horizontal: true, length: 1 },
  { column: 8, row: 2, horizontal: true, length: 1 },
  { column: 8, row: 3, horizontal: true, length: 1 },
  { column: 8, row: 4, horizontal: true, length: 2 },
  { column: 8, row: 8, horizontal: true, length: 2 },

  // 第1列后的垂直线
  { column: 1, row: 1, horizontal: false, length: 2 },
  { column: 1, row: 4, horizontal: false, length: 2 },

  // 第2列后的垂直线
  { column: 2, row: 2, horizontal: false, length: 2 },
  { column: 2, row: 5, horizontal: false, length: 1 },
  { column: 2, row: 7, horizontal: false, length: 2 },

  // 第3列后的垂直线
  { column: 3, row: 0, horizontal: false, length: 1 },
  { column: 3, row: 4, horizontal: false, length: 1 },
  { column: 3, row: 6, horizontal: false, length: 2 },

  // 第4列后的垂直线
  { column: 4, row: 1, horizontal: false, length: 2 },
  { column: 4, row: 6, horizontal: false, length: 1 },

  // 第5列后的垂直线
  { column: 5, row: 0, horizontal: false, length: 2 },
  { column: 5, row: 6, horizontal: false, length: 1 },
  { column: 5, row: 8, horizontal: false, length: 1 },

  // 第6列后的垂直线
  { column: 6, row: 4, horizontal: false, length: 1 },
  { column: 6, row: 6, horizontal: false, length: 1 },

  // 第7列后的垂直线
  { column: 7, row: 1, horizontal: false, length: 4 },
  { column: 7, row: 7, horizontal: false, length: 2 },

  // 第8列后的垂直线
  { column: 8, row: 2, horizontal: false, length: 1 },
  { column: 8, row: 4, horizontal: false, length: 2 },

  // 第9列后的垂直线
  { column: 9, row: 1, horizontal: false, length: 1 },
  { column: 9, row: 5, horizontal: false, length: 2 }
].map((wall) => ({
  x: wall.column * (pathW + wallW),
  y: wall.row * (pathW + wallW),
  horizontal: wall.horizontal,
  length: wall.length * (pathW + wallW)
}));

// 绘制墙
walls.forEach(({ x, y, horizontal, length }) => {
  const wall = document.createElement("div");
  wall.setAttribute("class", "wall");
  wall.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${wallW}px;
      height: ${length}px;
      transform: rotate(${horizontal ? -90 : 0}deg);
    `;

  mazeElement.appendChild(wall);
});

const holes = [
  { column: 0, row: 5 },
  { column: 2, row: 0 },
  { column: 2, row: 4 },
  { column: 4, row: 6 },
  { column: 6, row: 2 },
  { column: 6, row: 8 },
  { column: 8, row: 1 },
  { column: 8, row: 2 }
].map((hole) => ({
  x: hole.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
  y: hole.row * (wallW + pathW) + (wallW / 2 + pathW / 2)
}));

joystickHeadElement.addEventListener("mousedown", function (event) {
  if (!gameInProgress) {
    mouseStartX = event.clientX;
    mouseStartY = event.clientY;
    gameInProgress = true;
    window.requestAnimationFrame(main);
    noteElement.style.opacity = 0;
    joystickHeadElement.style.cssText = `
        animation: none;
        cursor: grabbing;
      `;
  }
});

window.addEventListener("mousemove", function (event) {
  if (gameInProgress) {
    const mouseDeltaX = -Math.minmax(mouseStartX - event.clientX, 15);
    const mouseDeltaY = -Math.minmax(mouseStartY - event.clientY, 15);

    joystickHeadElement.style.cssText = `
        left: ${mouseDeltaX}px;
        top: ${mouseDeltaY}px;
        animation: none;
        cursor: grabbing;
      `;

    const rotationY = mouseDeltaX * 0.8; // Max rotation = 12
    const rotationX = mouseDeltaY * 0.8;

    mazeElement.style.cssText = `
        transform: rotateY(${rotationY}deg) rotateX(${-rotationX}deg)
      `;

    const gravity = 2;
    const friction = 0.01; // Coefficients of friction

    accelerationX = gravity * Math.sin((rotationY / 180) * Math.PI);
    accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
    frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
    frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
  }
});

window.addEventListener("keydown", function (event) {
  // 如果没有按下箭头键或空格或H，则返回
  if (![" ", "H", "h", "E", "e"].includes(event.key)) return;

  // 如果按下了箭头键，则首先防止默认
  event.preventDefault();

  // 如果空间被按下，重新开始游戏
  if (event.key == " ") {
    resetGame();
    return;
  }

  // 设置困难模式
  if (event.key == "H" || event.key == "h") {
    hardMode = true;
    resetGame();
    return;
  }

  // 设置简单模式
  if (event.key == "E" || event.key == "e") {
    hardMode = false;
    resetGame();
    return;
  }
});

function resetGame() {
  previousTimestamp = undefined;
  gameInProgress = false;
  mouseStartX = undefined;
  mouseStartY = undefined;
  accelerationX = undefined;
  accelerationY = undefined;
  frictionX = undefined;
  frictionY = undefined;

  mazeElement.style.cssText = `
      transform: rotateY(0deg) rotateX(0deg)
    `;

  joystickHeadElement.style.cssText = `
      left: 0;
      top: 0;
      animation: glow;
      cursor: grab;
    `;

  if (hardMode) {
    noteElement.innerHTML = `单击操纵杆开始!
        <p>困难模式，避开黑洞。回到简易模式？按E键</p>`;
  } else {
    noteElement.innerHTML = `单击操纵杆开始!
        <p>把每个球移到中间。准备好困难模式了吗？按H键</p>`;
  }
  noteElement.style.opacity = 1;

  balls = [
    { column: 0, row: 0 },
    { column: 9, row: 0 },
    { column: 0, row: 8 },
    { column: 9, row: 8 }
  ].map((ball) => ({
    x: ball.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
    y: ball.row * (wallW + pathW) + (wallW / 2 + pathW / 2),
    velocityX: 0,
    velocityY: 0
  }));

  if (ballElements.length) {
    balls.forEach(({ x, y }, index) => {
      ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
    });
  }

  // 移除以前的孔元素
  holeElements.forEach((holeElement) => {
    mazeElement.removeChild(holeElement);
  });
  holeElements = [];

  // 如果是困难模式，重置孔元素
  if (hardMode) {
    holes.forEach(({ x, y }) => {
      const ball = document.createElement("div");
      ball.setAttribute("class", "black-hole");
      ball.style.cssText = `left: ${x}px; top: ${y}px; `;

      mazeElement.appendChild(ball);
      holeElements.push(ball);
    });
  }
}

function main(timestamp) {
  // 有可能在游戏中途重置游戏。在这种情况下，外观应该停止
  if (!gameInProgress) return;

  if (previousTimestamp === undefined) {
    previousTimestamp = timestamp;
    window.requestAnimationFrame(main);
    return;
  }

  const maxVelocity = 1.5;

  //自上一个周期以来经过的时间除以16
  //这个函数平均每16毫秒调用一次，所以除以16将得到1
  const timeElapsed = (timestamp - previousTimestamp) / 16;

  try {
    // 如果鼠标没有移动，不要做任何事情
    if (accelerationX != undefined && accelerationY != undefined) {
      const velocityChangeX = accelerationX * timeElapsed;
      const velocityChangeY = accelerationY * timeElapsed;
      const frictionDeltaX = frictionX * timeElapsed;
      const frictionDeltaY = frictionY * timeElapsed;

      balls.forEach((ball) => {
        if (velocityChangeX == 0) {
          //没有旋转，平面是平的
          //在平面上摩擦只能减慢速度，但不能反向运动
          ball.velocityX = slow(ball.velocityX, frictionDeltaX);
        } else {
          ball.velocityX = ball.velocityX + velocityChangeX;
          ball.velocityX = Math.max(Math.min(ball.velocityX, 1.5), -1.5);
          ball.velocityX =
            ball.velocityX - Math.sign(velocityChangeX) * frictionDeltaX;
          ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
        }

        if (velocityChangeY == 0) {
          //没有旋转，平面是平的
          //在平面上摩擦只能减慢速度，但不能反向运动
          ball.velocityY = slow(ball.velocityY, frictionDeltaY);
        } else {
          ball.velocityY = ball.velocityY + velocityChangeY;
          ball.velocityY =
            ball.velocityY - Math.sign(velocityChangeY) * frictionDeltaY;
          ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
        }

        //下一个球的初始位置，只有在没有命中的情况下才为真
        //仅用于命中测试，并不意味着球会到达这个位置
        ball.nextX = ball.x + ball.velocityX;
        ball.nextY = ball.y + ball.velocityY;

        if (debugMode) console.log("tick", ball);

        walls.forEach((wall, wi) => {
          if (wall.horizontal) {
            // 水平墙

            if (
              ball.nextY + ballSize / 2 >= wall.y - wallW / 2 &&
              ball.nextY - ballSize / 2 <= wall.y + wallW / 2
            ) {
              //球进入了墙内
              //(不一定打中，可能是之前也可能是之后)

              const wallStart = {
                x: wall.x,
                y: wall.y
              };
              const wallEnd = {
                x: wall.x + wall.length,
                y: wall.y
              };

              if (
                ball.nextX + ballSize / 2 >= wallStart.x - wallW / 2 &&
                ball.nextX < wallStart.x
              ) {
                // 球可能会击中水平墙的左盖
                const distance = distance2D(wallStart, {
                  x: ball.nextX,
                  y: ball.nextY
                });
                if (distance < ballSize / 2 + wallW / 2) {
                  if (debugMode && wi > 4)
                    console.warn("too close h head", distance, ball);

                  // 球击中了水平墙的左盖
                  const closest = closestItCanBe(wallStart, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  const rolled = rollAroundCap(wallStart, {
                    x: closest.x,
                    y: closest.y,
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                  });

                  Object.assign(ball, rolled);
                }
              }

              if (
                ball.nextX - ballSize / 2 <= wallEnd.x + wallW / 2 &&
                ball.nextX > wallEnd.x
              ) {
                // 球可能击中水平墙的右盖
                const distance = distance2D(wallEnd, {
                  x: ball.nextX,
                  y: ball.nextY
                });
                if (distance < ballSize / 2 + wallW / 2) {
                  if (debugMode && wi > 4)
                    console.warn("too close h tail", distance, ball);

                  // 球击中了水平墙的右盖
                  const closest = closestItCanBe(wallEnd, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  const rolled = rollAroundCap(wallEnd, {
                    x: closest.x,
                    y: closest.y,
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                  });

                  Object.assign(ball, rolled);
                }
              }

              if (ball.nextX >= wallStart.x && ball.nextX <= wallEnd.x) {
                // 球进入了墙的主体
                if (ball.nextY < wall.y) {
                  // 从顶部撞击水平墙
                  ball.nextY = wall.y - wallW / 2 - ballSize / 2;
                } else {
                  // 从底部撞击水平墙
                  ball.nextY = wall.y + wallW / 2 + ballSize / 2;
                }
                ball.y = ball.nextY;
                ball.velocityY = -ball.velocityY / 3;

                if (debugMode && wi > 4)
                  console.error("crossing h line, HIT", ball);
              }
            }
          } else {
            // 垂直墙

            if (
              ball.nextX + ballSize / 2 >= wall.x - wallW / 2 &&
              ball.nextX - ballSize / 2 <= wall.x + wallW / 2
            ) {
              //球进入了墙内
              //(不一定打中，可能是之前也可能是之后)

              const wallStart = {
                x: wall.x,
                y: wall.y
              };
              const wallEnd = {
                x: wall.x,
                y: wall.y + wall.length
              };

              if (
                ball.nextY + ballSize / 2 >= wallStart.y - wallW / 2 &&
                ball.nextY < wallStart.y
              ) {
                // 球可能会击中水平墙的顶盖
                const distance = distance2D(wallStart, {
                  x: ball.nextX,
                  y: ball.nextY
                });
                if (distance < ballSize / 2 + wallW / 2) {
                  if (debugMode && wi > 4)
                    console.warn("too close v head", distance, ball);

                  // 球击中了水平墙的左盖
                  const closest = closestItCanBe(wallStart, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  const rolled = rollAroundCap(wallStart, {
                    x: closest.x,
                    y: closest.y,
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                  });

                  Object.assign(ball, rolled);
                }
              }

              if (
                ball.nextY - ballSize / 2 <= wallEnd.y + wallW / 2 &&
                ball.nextY > wallEnd.y
              ) {
                // 球可能会碰到水平墙的底部
                const distance = distance2D(wallEnd, {
                  x: ball.nextX,
                  y: ball.nextY
                });
                if (distance < ballSize / 2 + wallW / 2) {
                  if (debugMode && wi > 4)
                    console.warn("too close v tail", distance, ball);

                  // 球击中了水平墙的右盖
                  const closest = closestItCanBe(wallEnd, {
                    x: ball.nextX,
                    y: ball.nextY
                  });
                  const rolled = rollAroundCap(wallEnd, {
                    x: closest.x,
                    y: closest.y,
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                  });

                  Object.assign(ball, rolled);
                }
              }

              if (ball.nextY >= wallStart.y && ball.nextY <= wallEnd.y) {
                // 球进入了墙的主体
                if (ball.nextX < wall.x) {
                  // 从左侧击中垂直墙
                  ball.nextX = wall.x - wallW / 2 - ballSize / 2;
                } else {
                  // 从右侧击中垂直墙
                  ball.nextX = wall.x + wallW / 2 + ballSize / 2;
                }
                ball.x = ball.nextX;
                ball.velocityX = -ball.velocityX / 3;

                if (debugMode && wi > 4)
                  console.error("crossing v line, HIT", ball);
              }
            }
          }
        });

        // 探测到的是一个球掉进了一个洞里
        if (hardMode) {
          holes.forEach((hole, hi) => {
            const distance = distance2D(hole, {
              x: ball.nextX,
              y: ball.nextY
            });

            if (distance <= holeSize / 2) {
              // 球掉进了一个洞里
              holeElements[hi].style.backgroundColor = "red";
              throw Error("球掉进了一个洞里");
            }
          });
        }

        // 调整球元数据
        ball.x = ball.x + ball.velocityX;
        ball.y = ball.y + ball.velocityY;
      });

      // 将球移动到UI上的新位置
      balls.forEach(({ x, y }, index) => {
        ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
      });
    }

    // 胜利检测
    if (
      balls.every(
        (ball) => distance2D(ball, { x: 350 / 2, y: 315 / 2 }) < 65 / 2
      )
    ) {
      noteElement.innerHTML = `恭喜，你做到了!
        ${!hardMode ? "<p>按H键进入困难模式</p>" : ""}`;
      noteElement.style.opacity = 1;
      gameInProgress = false;
    } else {
      previousTimestamp = timestamp;
      window.requestAnimationFrame(main);
    }
  } catch (error) {
    if (error.message == "球掉进了一个洞里") {
      noteElement.innerHTML = `一个球掉进了黑洞！按空格键重置游戏.
        <p>
          回到容易？按E键
        </p>`;
      noteElement.style.opacity = 1;
      gameInProgress = false;
    } else throw error;
  }
}