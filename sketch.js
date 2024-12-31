let player1, player2;
let player1Bullets = [];
let player2Bullets = [];
let player1Health = 100, player2Health = 100; // 角色生命值

// 載入角色圖片和子彈圖片
let player1Img, player2Img, bullet1Img, bullet2Img;
let player1Actions = [], player2Actions = [];  // 動作圖片陣列
let player1ShootAction = [], player2ShootAction = []; // 攻擊動畫
let player1CurrentAction = 0, player2CurrentAction = 0;  // 當前動作索引
let bgImg; // 背景圖片變數

function preload() {
  // 載入背景圖片，從 libraries 資料夾載入
  bgImg = loadImage('libraries/BG.png');
  
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
  player1 = new Player(100, height  +50, 'Player1', player1Actions, player1ShootAction); // 設置角色1的y座標
  player2 = new Player(width - 200, height - 0, 'Player2', player2Actions, player2ShootAction); // 設置角色2的y座標，與角色1相同
}



function draw() {
  background(bgImg); // 使用背景圖片
  
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

  // 繪製生命值和控制說明
  drawHealth();

  // 在畫面中央顯示TKUET
  textSize(50);
  fill(255, 0, 0); // 變更字體顏色為紅色
  textAlign(CENTER, CENTER);
  text("TKUET", width / 2, height / 2 -100 );

  // 遊戲結束檢查
  if (player1Health <= 0 || player2Health <= 0) {
    textSize(50);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
    noLoop(); // 停止遊戲
  }
}


// 以下的其他程式碼保持不變...



function drawHealth() {
  fill(255, 0, 0); // 紅色
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Player 1 Health: ${player1Health}`, 20, 20);
  text(`Player 2 Health: ${player2Health}`, width - 220, 20);

  textSize(16);
  text("W:跳 A:往左 D:往右 f:攻擊", 20, 50); // 玩家1的控制說明
  text("鍵盤上:跳 鍵盤左:往左 鍵盤右:往右 空白鍵:攻擊", width - 300, 50); // 玩家2的控制說明
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
  for (let i = player1Bullets.length - 1; i >= 0; i--) {
    let bullet = player1Bullets[i];
    if (bullet.hits(player2)) {
      player2Health -= 10;
      player1Bullets.splice(i, 1);
    }
  }
  for (let i = player2Bullets.length - 1; i >= 0; i--) {
    let bullet = player2Bullets[i];
    if (bullet.hits(player1)) {
      player1Health -= 10;
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

    if (b.offscreen()) {
      bullets.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    player1Bullets.push(new Bullet(player1.x + 50, player1.y + 25, 7, bullet1Img, 'right')); // 角色1子彈往右
    player1.state = 'shooting';
    player1CurrentAction = 0;
  }
  if (keyCode === 32) { // 空白鍵
    player2Bullets.push(new Bullet(player2.x - 50, player2.y + 25, 7, bullet2Img, 'left')); // 角色2子彈往左
    player2.state = 'shooting';
    player2CurrentAction = 0;
  }
}



function keyReleased() {
  // 停止移動
  if (key === 'a' || key === 'A' || key === 'd' || key === 'D') {
    player1.move(0);
    player1.state = 'standing'; // Release movement keys for Player 1
  }
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player2.move(0);
    player2.state = 'standing'; // Release movement keys for Player 2
  }

  // 停止跳躍
  if (key === 'w' || keyCode === UP_ARROW) {
    player1.state = 'standing'; // Release jump key for Player 1
    player2.state = 'standing'; // Release jump key for Player 2
  }

  // 停止射擊
  if (key === 'f' || keyCode === 32) {
    player1.state = 'standing'; // Release shoot key for Player 1
    player2.state = 'standing'; // Release shoot key for Player 2
  }
}

// 玩家類別
class Player {
  constructor(x, y, name, actions, shootActions) {
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
    this.facing = 'right'; // 初始面向方向
    this.actions = actions; // Assign action images
    this.shootActions = shootActions; // Assign shoot action images
  }

  move(speed) {
    this.xSpeed = speed;
    this.state = 'moving'; // 當角色移動時，狀態變更為移動
    if (speed < 0) {
      this.facing = 'left'; // 向左移動時面向左
    } else if (speed > 0) {
      this.facing = 'right'; // 向右移動時面向右
    }
  }

  jump() {
    if ((this.name === 'Player1' && this.y >= height - 100) || (this.name === 'Player2' && this.y >= height - 100)) {  // 在地面上才能跳躍
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
    if ((this.name === 'Player1' && this.y < height - 100) || (this.name === 'Player2' && this.y < height - 100)) {
      this.ySpeed += this.gravity;
    } else {
      this.y = height - 100; // 確保角色在同一個水平面上
      this.ySpeed = 0;
      if (this.state === 'jumping') {
        this.state = 'standing'; // 當落地後切換狀態為站立
      }
    }
    
    // 如果是射擊狀態且動畫播放完畢後，切換為站立狀態
    if (this.state === 'shooting' && this.animationFrame === this.shootActions.length - 1) {
      this.state = 'standing';
      this.animationFrame = 0; // 重置動畫幀
    }

    // 更新動畫幀
    this.animationTimer++;
    if (this.animationTimer >= 5) { // 每5幀切換一次動畫
      this.animationFrame = (this.animationFrame + 1) % (this.state === 'shooting' ? this.shootActions.length : this.actions.length);
      this.animationTimer = 0;
    }
  }

  show() {
    let imgArray;
    if (this.state === 'shooting') {
      imgArray = this.shootActions;
    } else if (this.state === 'jumping') {
      imgArray = this.actions.slice(2, 3);
    } else if (this.state === 'moving') {
      imgArray = this.actions.slice(1, 2);
    } else {
      imgArray = this.actions.slice(0, 1);
    }

    let img = imgArray[this.animationFrame % imgArray.length];

    // 根據面向方向翻轉圖片
    if (this.facing === 'left') {
      push();
      translate(this.x + img.width, this.y);
      scale(-1, 1);
      image(img, 0, 0);
      pop();
    } else {
      image(img, this.x, this.y);
    }
  }
}




class Bullet {
  constructor(x, y, speed, img, facing) {
    this.x = x;
    this.y = y;
    this.speed = facing === 'left' ? -speed : speed;
    this.img = img;
    this.facing = facing;
  }

  update() {
    this.x += this.speed;
  }

  show() {
    if (this.facing === 'left') { // 如果面向左，則翻轉圖片
      push();
      translate(this.x + 25, this.y + 10); // 平移到子彈中心
      scale(-1, 1); // 水平翻轉
      image(this.img, -25, -10, 50, 20); // 調整回原位
      pop();
    } else {
      image(this.img, this.x, this.y, 50, 20);
    }
  }

  hits(player) {
    // 檢查子彈是否擊中角色
    return this.x > player.x && this.x < player.x + 50 && this.y > player.y && this.y < player.y + 50; // 調整子彈與角色的碰撞判定範圍
  }

  offscreen() {
    // 檢查子彈是否離開螢幕
    return this.x < 0 || this.x > width;
  }
}
