# Performance Optimization

Keep Phaser 3 games smooth (target 60fps).

## Object Pooling

Pool frequently spawned objects to avoid GC stutters.

```javascript
class BulletPool {
  constructor(scene) {
    this.scene = scene;
    this.pool = scene.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 100,
      runChildUpdate: true
    });
  }

  spawn(x, y, velocityX, velocityY) {
    const bullet = this.pool.get(x, y);
    if (!bullet) return null;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    bullet.body.reset(x, y);
    bullet.setVelocity(velocityX, velocityY);
    return bullet;
  }

  kill(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.body.stop();
  }
}
```

## Texture Atlases

Reduce draw calls by packing sprites into atlases.

```javascript
this.load.atlas('sprites', 'atlas/sprites.png', 'atlas/sprites.json');

this.anims.create({
  key: 'walk',
  frames: this.anims.generateFrameNames('sprites', {
    prefix: 'player-walk-',
    start: 1,
    end: 8,
    zeroPad: 2
  }),
  frameRate: 10,
  repeat: -1
});
```

## Camera Culling

Let Phaser cull off-screen sprites, or do it manually for custom objects.

```javascript
update() {
  const bounds = this.cameras.main.worldView;
  this.enemies.children.iterate(enemy => {
    const visible = Phaser.Geom.Rectangle.Contains(bounds, enemy.x, enemy.y);
    enemy.setActive(visible).setVisible(visible);
  });
}
```

## Physics Optimization

```javascript
this.physics.add.collider(player, groundLayer);
this.physics.add.collider(enemies, groundLayer);
this.physics.add.overlap(player, enemies, hitEnemy);
```

Disable physics for off-screen objects:

```javascript
if (!this.cameras.main.worldView.contains(enemy.x, enemy.y)) {
  enemy.body.enable = false;
} else {
  enemy.body.enable = true;
}
```

## Rendering Tips

- Batch sprites that share a texture/atlas
- Avoid heavy blend modes when possible
- Keep particle counts bounded
- For pixel art: `render.pixelArt: true`, `antialias: false`, `camera.roundPixels = true`
- On mobile: reduce overdraw and large transparent layers

```javascript
const emitter = this.add.particles(x, y, 'particle', {
  speed: 100,
  lifespan: 500,
  quantity: 2,
  maxParticles: 100,
  frequency: 50
});
```

## Memory Management

```javascript
sprite.destroy();

shutdown() {
  this.enemies.destroy(true);
  this.bulletPool.destroy(true);
}
```

Unload unused assets when scenes end:

```javascript
this.textures.remove('unused-texture');
this.cache.tilemap.remove('level1');
```

## Update Loop Hygiene

Throttle expensive logic:

```javascript
create() {
  this.lastAIUpdate = 0;
  this.aiUpdateInterval = 100;
}

update(time) {
  if (time - this.lastAIUpdate > this.aiUpdateInterval) {
    this.updateEnemyAI();
    this.lastAIUpdate = time;
  }
}
```

Avoid object creation inside `update()`.

## Profiling

- Use Chrome DevTools Performance/Memory tabs
- Inspect FPS with `this.game.loop.actualFps`
- Profile before optimizing
