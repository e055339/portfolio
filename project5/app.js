//讓canvas變成繪畫空間
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//劃分空間16*16
const unit = 20;
const row = canvas.height / unit;
const column = canvas.width / unit;

//製作蛇初始位置
let snake = [];
function createSnack() {
  snake[0] = {
    x: 80,
    y: 0,
  };

  snake[1] = {
    x: 60,
    y: 0,
  };

  snake[2] = {
    x: 40,
    y: 0,
  };

  snake[3] = {
    x: 20,
    y: 0,
  };
}

//製作加分方塊
class Fruit {
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }
  //吃到方塊後重製方塊，不能重疊蛇蛇
  pickALocation() {
    let overlapping = false;
    let new_x;
    let new_y;

    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          //           console.log("overlapping...");
          overlapping = true;
          return;
        } else {
          overlapping = false;
        }
      }
    }

    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      //       console.log("方塊的新座標為" + new_x, new_y);
      checkOverlap(new_x, new_y);
    } while (overlapping);

    this.x = new_x;
    this.y = new_y;
  }
}

//初始設定
createSnack();
let myFruit = new Fruit();

//處理按下鍵盤後移動方向
window.addEventListener("keydown", changeDirection);
let d = "Right";
function changeDirection(e) {
  if (e.key == "ArrowUp" && d != "Down") {
    d = "Up";
  } else if (e.key == "ArrowDown" && d != "Up") {
    d = "Down";
  } else if (e.key == "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (e.key == "ArrowRight" && d != "Left") {
    d = "Right";
  }
  window.removeEventListener("keydown", changeDirection);
}

let score = 0;
let highestScore;
loadHighestScore();
document.getElementById("gameScore").innerText = "遊戲分數:" + score;
document.getElementById("highestScore").innerText = "最高分數:" + highestScore;

function draw() {
  //處理死亡條件
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      alert("遊戲結束");
      return;
    }
  }

  //執行移動前先將畫布塗黑，以免前次畫布殘留(因為canvas繪畫是使用覆蓋，所以若不在每次更新前重製畫布顏色，會殘留前次畫面)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //把加分方塊放進這個函式，讓函式執行一開始就做出加分方塊
  myFruit.drawFruit();
  //製作蛇顏色
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      ctx.fillStyle = "lightgreen";
    } else {
      ctx.fillStyle = "lightblue";
    }
    ctx.strokeStyle = "white";

    //穿牆功能
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    }
    if (snake[i].x < 0) {
      snake[i].x = canvas.width - unit;
    }
    if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    }
    if (snake[i].y < 0) {
      snake[i].y = canvas.height - unit;
    }

    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  //以目前d變數方向，來決定蛇的下一幀要放在哪個座標
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (d == "Up") {
    snakeY -= unit;
  } else if (d == "Down") {
    snakeY += unit;
  } else if (d == "Left") {
    snakeX -= unit;
  } else if (d == "Right") {
    snakeX += unit;
  }

  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  //處理身體移動時的呈現方式&吃到果實的效果
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    myFruit.pickALocation();
    score++;
    setHighestScore(score);
    document.getElementById("gameScore").innerText = "遊戲分數:" + score;
    document.getElementById("highestScore").innerText =
      "最高分數:" + highestScore;
  } else {
    snake.pop();
  }
  snake.unshift(newHead);
  window.addEventListener("keydown", changeDirection);
}

//畫面更新
let myGame = setInterval(draw, 100);

//載入最高分數
function loadHighestScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

//儲存最高分數
function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
