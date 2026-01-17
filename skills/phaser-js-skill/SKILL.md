---
name: phaser-js-skill
description: >
  Build and evolve Phaser 3 (PhaserJS) games in Claude Code. Use when asked to create or modify
  Phaser game architecture, scenes, sprites, physics (Arcade/Matter), tilemaps, animations, input,
  asset loading, performance tuning, or debugging. Trigger phrases: "phaser game", "phaser scene",
  "phaser physics", "phaser tilemap", "phaser animation", "phaserjs".
---

# PhaserJS Game Development

Build fast, polished 2D browser games with Phaser 3. Treat games as systems: scenes coordinate
flow, entities interact, and input drives state changes.

## Start With the Architecture

Before coding, define the game’s structure:

- Identify scenes (Boot, Menu, Game, UI, Pause, GameOver)
- List core entities and their responsibilities
- Decide what state persists across scenes
- Pick physics system early (Arcade vs Matter)
- Map input methods (keyboard, pointer, touch)

**Principles**:
1. Favor scene-first architecture over global state
2. Compose entities from game objects + components
3. Choose physics model before writing collisions
4. Preload assets and reference by key
5. Use delta time for framerate independence

---

## Game Configuration

Start with a minimal config, then expand.

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [BootScene, GameScene]
};

new Phaser.Game(config);
```

Add scaling, physics, and more scenes as needed:

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },

  render: {
    pixelArt: true,
    antialias: false
  },

  scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene]
};
```

**Pick physics intentionally**:
- Arcade: platformers, shooters, most 2D games
- Matter: physics puzzles, ragdolls, realistic collisions
- None: menus, card games, visual novels

---

## Scene Lifecycle

Implement lifecycle methods explicitly.

```javascript
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.level = data.level || 1;
  }

  preload() {
    this.load.image('player', 'assets/player.png');
  }

  create() {
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    this.player.x += this.speed * (delta / 1000);
  }
}
```

Use scene transitions deliberately:

```javascript
this.scene.start('GameOverScene', { score: this.score });
this.scene.launch('UIScene');
this.scene.pause('GameScene');
this.scene.resume('GameScene');
this.scene.stop('UIScene');
```

---

## State and Data Flow

Prefer explicit, scoped state:

```javascript
// Cross-scene data
this.registry.set('score', 0);
const score = this.registry.get('score');

// Scene-specific data
this.data.set('lives', 3);
this.data.get('lives');
```

Use registries or small state managers instead of globals.

---

## Game Objects

Prefer explicit creation patterns:

```javascript
this.add.image(400, 300, 'background');
const player = this.add.sprite(100, 100, 'player');
const scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
const graphics = this.add.graphics();
const container = this.add.container(400, 300, [sprite1, sprite2]);
```

For physics-enabled objects:

```javascript
const player = this.physics.add.sprite(x, y, 'player');
this.physics.add.existing(sprite);
```

---

## Physics Quick Start (Arcade)

```javascript
this.physics.add.collider(player, platforms);
this.physics.add.overlap(player, coins, collectCoin, null, this);

function collectCoin(player, coin) {
  coin.disableBody(true, true);
  this.score += 10;
}
```

Use groups for pooling and collision management:

```javascript
const enemies = this.physics.add.group({
  key: 'enemy',
  repeat: 5,
  setXY: { x: 100, y: 0, stepX: 70 }
});
```

Deep-dive patterns live in `references/phaser-arcade-physics.md`.

---

## Input Handling

Keyboard:

```javascript
this.cursors = this.input.keyboard.createCursorKeys();
this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

if (this.cursors.left.isDown) player.setVelocityX(-160);
if (this.cursors.right.isDown) player.setVelocityX(160);
```

Pointer/touch:

```javascript
sprite.setInteractive();
sprite.on('pointerdown', () => sprite.setTint(0xff0000));
this.input.on('pointerdown', (pointer) => console.log(pointer.x, pointer.y));
```

---

## Mobile/Tactile UX

Treat mobile input and layout as first-class concerns:

- Favor large touch targets and avoid edge-only controls
- Use on-screen buttons or a virtual joystick
- Lock orientation or adapt UI for both portrait/landscape
- Avoid tiny text; scale UI based on screen size
- Reduce per-frame allocations to keep thermals stable

See `references/phaser-mobile.md` for touch controls, scaling, and perf tips.

---

## Animations

Define once in `create()` or a boot scene:

```javascript
this.anims.create({
  key: 'walk',
  frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
  frameRate: 10,
  repeat: -1
});
```

Play and react:

```javascript
sprite.anims.play('walk', true);
sprite.on('animationcomplete', (anim) => {
  if (anim.key === 'die') sprite.destroy();
});
```

---

## Asset Loading Discipline

Always load in `preload()` (or Boot scene). Keep asset keys consistent.

```javascript
this.load.image('sky', 'assets/sky.png');
this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
this.load.atlas('sprites', 'assets/sprites.png', 'assets/sprites.json');
this.load.tilemapTiledJSON('map', 'assets/level1.json');
this.load.audio('bgm', 'assets/music.mp3');
```

If spritesheets look wrong, verify frame size + spacing/margin. See
`references/phaser-spritesheets-nineslice.md` for inspection protocol and nine-slice UI patterns.

Pixel-art tips:
- Use `render.pixelArt: true` and disable antialiasing in config
- Set `this.cameras.main.roundPixels = true` in `create()` for crisp movement

---

## Tilemaps (Tiled)

Use Tiled JSON, create layers by name, and enable collisions explicitly.

```javascript
const map = this.make.tilemap({ key: 'map' });
const tileset = map.addTilesetImage('tileset-name', 'tiles');
const ground = map.createLayer('Ground', tileset, 0, 0);

ground.setCollisionByProperty({ collides: true });
this.physics.add.collider(this.player, ground);
```

Advanced tilemap patterns live in `references/phaser-tilemaps.md`.

---

## Project Structure

Recommend a modular structure:

```
src/
  scenes/
  gameObjects/
  systems/
  config/
  main.js
assets/
  images/
  audio/
  tilemaps/
  fonts/
```

---

## Anti-Patterns

Avoid these common traps:

- Global state soup (use scene data or registries instead)
- Loading assets in `create()`
- Frame-dependent logic (always use delta time)
- Matter physics for simple arcade collisions
- Giant monolithic scenes
- Magic numbers scattered across code
- Creating/destroying objects every frame (use pooling)

---

## Variation Guidance

Adjust implementation based on context:

- Genre: platformer vs top-down shooter vs puzzle
- Platform: mobile touch vs desktop keyboard
- Art style: pixel art vs HD
- Scale: small game vs large, multi-scene architecture
- Performance: many sprites vs a few

Avoid copy-pasting the same config for every game.

---

## Quick Reference

```javascript
// Physics properties
body.setVelocity(x, y)
body.setBounce(x, y)
body.setGravityY(y)
body.setCollideWorldBounds(true)

// Scene essentials
this.cameras.main
this.physics.world
this.input.keyboard
this.time
this.tweens
this.anims
```

---

## See Also

- `references/phaser-arcade-physics.md` for Arcade physics details
- `references/phaser-tilemaps.md` for tilemap workflows
- `references/phaser-performance.md` for optimization strategies
- `references/phaser-spritesheets-nineslice.md` for spritesheet spacing/margins and UI slicing
- `references/phaser-mobile.md` for mobile/touch input, scaling, and optimization

---

## Remember

Phaser provides primitives; architecture is your responsibility. Define scenes, entities, and
systems before you code, and the project will scale cleanly.
