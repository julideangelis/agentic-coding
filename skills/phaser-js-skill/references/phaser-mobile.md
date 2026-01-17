# Mobile Phaser Tips

Guidance for touch input, scaling, and mobile performance.

## Input: Touch-First

### Pointer Settings

```javascript
this.input.addPointer(2); // Allow multitouch
this.input.topOnly = true; // Prefer top-most interactive object
```

### Virtual Buttons

```javascript
const btn = this.add.image(80, 520, 'ui', 'button');
btn.setInteractive({ useHandCursor: false });
btn.on('pointerdown', () => this.player.jump());
```

### Virtual Joystick (Simple)

```javascript
const stick = this.add.circle(80, 520, 48, 0x000000, 0.3);
const knob = this.add.circle(80, 520, 20, 0xffffff, 0.6);
let dragging = false;

stick.setInteractive();
stick.on('pointerdown', () => dragging = true);
this.input.on('pointerup', () => {
  dragging = false;
  knob.setPosition(80, 520);
  this.player.setVelocityX(0);
});

this.input.on('pointermove', (p) => {
  if (!dragging) return;
  const dx = Phaser.Math.Clamp(p.x - 80, -40, 40);
  const dy = Phaser.Math.Clamp(p.y - 520, -40, 40);
  knob.setPosition(80 + dx, 520 + dy);
  this.player.setVelocityX(dx * 4); // Tune speed
});
```

## Scaling for Mobile

### Responsive Scale Config

```javascript
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### Resize Hook

```javascript
this.scale.on('resize', (gameSize) => {
  const { width, height } = gameSize;
  this.cameras.resize(width, height);
  this.layoutUI(width, height);
});
```

### Safe Areas

Keep UI away from notches and rounded corners:

```javascript
const padding = Math.max(16, this.scale.displaySize.width * 0.02);
uiContainer.setPosition(padding, height - padding);
```

## Performance on Mobile

- Prefer Arcade physics for most 2D games
- Reduce overdraw; avoid huge transparent layers
- Limit particle systems and blend modes
- Pool objects aggressively
- Cap FPS if the game is not twitchy

```javascript
fps: {
  target: 60,
  forceSetTimeOut: true
}
```

## Audio Tips

- Use short, compressed SFX (ogg/mp3)
- Avoid too many simultaneous sounds
- Gate music start on first input (mobile autoplay rules)

```javascript
this.input.once('pointerdown', () => {
  this.sound.play('bgm', { loop: true, volume: 0.5 });
});
```
