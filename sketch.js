let player1, player2;
let player1Bullets = [];
let player2Bullets = [];
let player1Health = 100, player2Health = 100; // 角色生命值

// 載入角色圖片和子彈圖片
let player1Img, player2Img, bullet1Img, bullet2Img;
let player1Actions = [], player2Actions = [];  // 動作圖片陣列
let player1ShootAction = [], player2ShootAction = []; // 攻擊動畫
let player1CurrentAction = 0, player2CurrentAction = 0;  // 當前動作索引

function preload() {
  // 載入角色圖片，將每個角色的動作圖片放進陣列中
  player1Actions.push(loadImage('P1/0.png')); // 角色1 站立
  player1Actions.push(loadImage('P1/1.png')); // 角色1 移動
  player1Actions.push(loadImage('P1/2.png')); // 角色1 跳躍
  
  player1ShootAction.push(loadImage('P1A/0.png')); // 角色1 發射子彈動畫
  player1ShootAction.push(loadImage('P1A/1.png')); 
  player1ShootAction.push(loadImage('P1A/2.png')); 

  player2Actions.push(loadImage('P2/0.png')); // 角色2 站立
  player2Actions.push(loadImage('P2/1.png')); // 角色2 移動
  player2Actions.push(loadImage('P2/2.png')); // 角色2 跳躍
  
  player2ShootAction.push(loadImage('P2A/0.png')); // 角色2 發射子彈動畫
  player2ShootAction.push(loadImage('P2A/1.png')); 
  player2ShootAction.push(loadImage('P2A/2.png')); 

  bullet1Img = loadImage('P1A/1.png'); // 角色1的子彈圖片
  bullet2Img = loadImage('P2A/1.png'); // 角色2的子彈圖片
}

function setup() {
  createCanvas(windowWidth, windowHeight);   // 全螢幕視窗
  player1 = new Player(100, height - 100, 'Player1'); // 設置y座標為畫布高度減去角色高度
  player2 = new Player(width - 200, height - 150, 'Player2'); // 設置y座標為畫布高度減去角色高度並再高50像素
}

function draw() {
  background(220);

  // 更新物理
  updatePhysics(player1);
  updatePhysics(player2);

  // 檢查按鍵
  checkKeys();

  // 檢查碰撞
  checkCollisions();

  // 繪製角色
  drawCharacter(player1);
  drawCharacter(player2);

  // 繪製子彈
  drawBullets(player1Bullets);
  drawBullets(player2Bullets);

  // 繪製生命值
  drawHealth();

  // 遊戲結束檢查
  if (player1Health <= 0 || player2Health <= 0) {
    textSize(50);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
    noLoop(); // 停止遊戲
  }
}

function updatePhysics(player) {
  player.update();
}

function checkKeys() {
  // Player 1 控制
  if (keyIsDown(87)) player1.jump(); // W 鍵
  if (keyIsDown(65)) player1.move(-5); // A 鍵
  if (keyIsDown(68)) player1.move(5); // D 鍵

  // Player 2 控制
  if (keyIsDown(UP_ARROW)) player2.jump();  // 上箭頭
  if (keyIsDown(LEFT_ARROW)) player2.move(-5); // 左箭頭
  if (keyIsDown(RIGHT_ARROW)) player2.move(5); // 右箭頭
}

function checkCollisions() {
  // 檢查子彈碰撞到對方角色
  for (let i = player1Bullets.length - 1; i >= 0; i--) {
    let bullet = player1Bullets[i];
    if (bullet.hits(player2)) {
      player2Health -= 10; // 扣除對方生命值
      player1Bullets.splice(i, 1);
    }
  }

  for (let i = player2Bullets.length - 1; i >= 0; i--) {
    let bullet = player2Bullets[i];
    if (bullet.hits(player1)) {
      player1Health -= 10; // 扣除對方生命值
      player2Bullets.splice(i, 1);
    }
  }
}

function drawCharacter(player) {
  player.show();
}

function drawBullets(bullets) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.update();
    b.show();

    // 超出邊界則移除子彈
    if (b.offscreen()) {
      bullets.splice(i, 1);
    }
  }
}

function drawHealth() {
  fill(255, 0, 0);
  textSize(20);
  text(`Player 1 Health: ${player1Health}`, 50, 50);
  text(`Player 2 Health: ${player2Health}`, width - 250, 50);
}

function keyPressed() {
  // Player 1 發射子彈
  if (key === 'f' || key === 'F') {
    player1Bullets.push(new Bullet(player1.x + 50, player1.y + 25, 7, bullet1Img));
    player1.state = 'shooting'; // 攻擊時切換狀態為 shooting
    player1CurrentAction = 0; // 發射子彈時重設為射擊動畫的初始狀態
  }

  // Player 2 發射子彈
  if (keyCode === 32) { // 空白鍵發射
    player2Bullets.push(new Bullet(player2.x - 50, player2.y + 75, -7, bullet2Img)); // 將y座標設置為player2.y + 75
    player2.state = 'shooting';
    player2CurrentAction = 0;
  }
}

function keyReleased() {
  // 停止移動
  if (key === 'a' || key === 'A' || key === 'd' || key === 'D') player1.move(0);
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) player2.move(0);
}

// 玩家類別
class Player {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.ySpeed = 0;
    this.gravity = 0.8;
    this.jumpStrength = -12;
    this.xSpeed = 0;
    this.state = 'standing'; // 初始狀態為站立
    this.animationFrame = 0; // 增加動畫幀索引
    this.animationTimer = 0; // 計時器
  }

  move(speed) {
    this.xSpeed = speed;
    this.state = 'moving'; // 當角色移動時，狀態變更為移動
  }

  jump() {
    if (this.y >= height - 100 && this.name === 'Player1' || this.y >= height - 150 && this.name === 'Player2') {  // 在地面上才能跳躍
      this.ySpeed = this.jumpStrength;
    }
    this.state = 'jumping'; // 當角色跳躍時，狀態變更為跳躍
  }

  update() {
    // 更新x座標
    this.x += this.xSpeed;

    // 更新y座標
    this.y += this.ySpeed;

    // 重力作用
    if (this.y < height - 100 && this.name === 'Player1' || this.y < height - 150 && this.name === 'Player2') {
      this.ySpeed += this.gravity;
    } else {
      this.ySpeed = 0;
      this.y = this.name === 'Player1' ? height - 100 : height - 150;
    }

    // 更新動畫幀
    this.animationTimer++;
    if (this.animationTimer % 10 === 0) { // 每10幀切換一次圖片
      this.animationFrame++;
      if (this.state === 'shooting' && this.animationFrame >= player1ShootAction.length) {
        this.state = 'standing'; // 攻擊動畫播放完畢後恢復站立狀態
        this.animationFrame = 0; // 重置動畫幀
      }
    }
  }

  show() {
    let img;
    if (this.state === 'shooting') {
      img = this.name === 'Player1' ? player1ShootAction[this.animationFrame % player1ShootAction.length] : player2ShootAction[this.animationFrame % player2ShootAction.length];
    } else if (this.state === 'jumping') {
      img = this.name === 'Player1' ? player1Actions[2] : player2Actions[2];
    } else if (this.state === 'moving') {
      img = this.name === 'Player1' ? player1Actions[1] : player2Actions[1];
    } else {
      img = this.name === 'Player1' ? player1Actions[0] : player2Actions[0];
    }

    if (this.name === 'Player2') {
      push(); 
      translate(this.x + 50, this.y + 50);
      scale(-1, 1); // 翻轉角色2
      image(img, 0, 0, 100, 100); 
      pop();
    } else {
      image(img, this.x, this.y, 100, 100); 
    }
  }
}

// 子彈類別
class Bullet {
  constructor(x, y, speed, img) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.img = img;
  }

  update() {
    this.x += this.speed;
  }

  show() {
    if (this.speed < 0) { // 如果速度為負，表示子彈向左移動，則翻轉圖片
      push();
      translate(this.x + 25, this.y + 10); // 平移到子彈中心
      scale(-1, 1); // 水平翻轉
      image(this.img, -25, -10, 50, 20); // 調整回原位
      pop();
    } else {
      image(this.img, this.x, this.y, 50, 20);
    }
  }

  offscreen() {
    return this.x < 0 || this.x > width;
  }

  hits(player) {
    if (this.x < player.x + 100 && this.x + 50 > player.x && this.y < player.y + 100 && this.y + 20 > player.y) {
      return true;
    }
    return false;
  }
}