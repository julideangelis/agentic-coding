# Arcade Physics Deep Dive

Reference guide for Phaser 3 Arcade Physics.

## World Configuration

```javascript
physics: {
  default: 'arcade',
  arcade: {
    gravity: { x: 0, y: 300 },
    debug: true,
    debugShowBody: true,
    debugShowStaticBody: true,
    debugShowVelocity: true,
    debugBodyColor: 0xff00ff,
    debugStaticBodyColor: 0x0000ff,
    debugVelocityColor: 0x00ff00,
    fps: 60,
    timeScale: 1,
    checkCollision: { up: true, down: true, left: true, right: true },
    overlapBias: 4,
    tileBias: 16,
    forceX: false,
    maxEntries: 16,
    useTree: true
  }
}
```

## Body Types

### Dynamic Bodies

```javascript
const player = this.physics.add.sprite(100, 100, 'player');

player.body.setVelocity(100, -200);
player.body.setBounce(0.5, 0.5);
player.body.setDrag(100, 100);
player.body.setFriction(0.5, 0.5);
player.body.setMaxVelocity(300, 400);
player.body.setGravityY(500);
player.body.setAcceleration(100, 0);
player.body.setCollideWorldBounds(true);
player.body.onWorldBounds = true;

// Common toggles
player.body.setAllowGravity(false);
player.body.setImmovable(true);
```

### Static Bodies

```javascript
const platforms = this.physics.add.staticGroup();
platforms.create(400, 568, 'ground');

sprite.body.setImmovable(true);
sprite.body.moves = false;

sprite.refreshBody();
```

## Body Sizing and Shape

```javascript
sprite.body.setSize(32, 48, true);
sprite.body.setOffset(2, 6);

sprite.body.setCircle(16, 0, 0);
```

## Collision Detection

```javascript
this.physics.add.collider(player, platforms);
this.physics.add.collider(player, enemies, hitEnemy, null, this);
this.physics.add.overlap(player, coins, collectCoin, null, this);
```

### Process Callbacks

```javascript
function shouldCollide(player, enemy) {
  return !player.isInvincible;
}

this.physics.add.collider(player, enemies, hitEnemy, shouldCollide, this);
```

### World Bounds Events

```javascript
this.physics.world.on('worldbounds', (body, up, down) => {
  if (down) {
    // Hit bottom of world
  }
});

player.body.onWorldBounds = true;
player.body.setCollideWorldBounds(true);
```

## Groups and Pooling

```javascript
const enemies = this.physics.add.group({
  key: 'enemy',
  repeat: 5,
  setXY: { x: 100, y: 0, stepX: 100 }
});

const bullets = this.physics.add.group({
  defaultKey: 'bullet',
  maxSize: 50,
  runChildUpdate: true,
  collideWorldBounds: true,
  velocityY: -300
});

const bullet = bullets.get(x, y);
if (bullet) {
  bullet.setActive(true).setVisible(true);
  bullet.body.enable = true;
}
```

## Movement Patterns

### Platformer

```javascript
update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('walk', true);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('walk', true);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
    player.anims.play('idle', true);
  }

  if (cursors.up.isDown && player.body.blocked.down) {
    player.setVelocityY(-330);
  }
}
```

### Acceleration-Based

```javascript
const accel = 600;
const maxSpeed = 200;
const drag = 400;

player.body.setMaxVelocity(maxSpeed);
player.body.setDrag(drag, 0);

update() {
  if (cursors.left.isDown) {
    player.body.setAccelerationX(-accel);
  } else if (cursors.right.isDown) {
    player.body.setAccelerationX(accel);
  } else {
    player.body.setAccelerationX(0);
  }
}
```

## Velocity Helpers

```javascript
this.physics.moveTo(sprite, targetX, targetY, speed);
this.physics.moveToObject(sprite, target, speed);
this.physics.accelerateTo(sprite, targetX, targetY, accel, maxSpeedX, maxSpeedY);
this.physics.velocityFromAngle(angle, speed, outVelocity);
```

## World Bounds and Camera

```javascript
this.physics.world.setBounds(0, 0, 3000, 600);
this.cameras.main.setBounds(0, 0, 3000, 600);
this.cameras.main.startFollow(player);
```

## Common Patterns

### One-Way Platforms

```javascript
function oneWayPlatform(player, platform) {
  if (player.body.velocity.y > 0 &&
      player.body.bottom <= platform.body.top + 10) {
    return true;
  }
  return false;
}

this.physics.add.collider(player, platforms, null, oneWayPlatform, this);
```

### Knockback

```javascript
function hitEnemy(player, enemy) {
  const knockback = 200;
  const direction = player.x < enemy.x ? -1 : 1;

  player.setVelocity(direction * knockback, -knockback);
  player.isInvincible = true;

  this.time.delayedCall(1000, () => {
    player.isInvincible = false;
  });
}
```
