# Spritesheets and Nine-Slice UI Panels

## Measure Before You Code

Spritesheets break silently when frame sizes, spacing, or margins are wrong.
Inspect the source asset before writing loader code.

---

## Spritesheet Loading

### Basic Loading

```javascript
this.load.spritesheet('player', 'assets/player.png', {
  frameWidth: 32,
  frameHeight: 48
});
```

### Spritesheets with Spacing

```javascript
this.load.spritesheet('ui-wood-table', 'assets/wood-table.png', {
  frameWidth: 144,
  frameHeight: 144,
  spacing: 8
});
```

### Spritesheets with Margins

```javascript
this.load.spritesheet('icons', 'assets/icons.png', {
  frameWidth: 32,
  frameHeight: 32,
  margin: 4,
  spacing: 2
});
```

### Frame Dimension Formula

```
imageWidth  = (frameWidth × cols) + (spacing × (cols - 1)) + (margin × 2)
imageHeight = (frameHeight × rows) + (spacing × (rows - 1)) + (margin × 2)
```

---

## Asset Inspection Protocol

1. Open the asset in an image editor
2. Note total dimensions
3. Count rows and columns
4. Measure a single frame
5. Check for gaps (spacing)
6. Check edge padding (margin)
7. Verify the math

**Red flags**:
- Image size doesn’t divide cleanly by frame count
- Frame size comes out fractional
- Visible gaps between tiles

---

## Nine-Slice UI Panels

### 3x3 Frame Layout

```
[0] [1] [2]
[3] [4] [5]
[6] [7] [8]
```

Corners don’t scale, edges scale on one axis, center scales both axes.

### Manual Nine-Slice (Custom)

```javascript
showNineSlicePanel(framesKey, frameSize, panelWidth, panelHeight, bgColor) {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  const left = centerX - panelWidth / 2;
  const top = centerY - panelHeight / 2;
  const right = left + panelWidth;
  const bottom = top + panelHeight;

  const cornerInset = frameSize * 0.3;
  const overlap = frameSize * 0.5;

  const container = this.add.container(0, 0);
  container.add(this.add.rectangle(centerX, centerY, panelWidth, panelHeight, bgColor));

  const center = this.add.image(centerX, centerY, framesKey, 4);
  center.setDisplaySize(panelWidth + overlap, panelHeight + overlap);
  container.add(center);

  const topEdge = this.add.image(centerX, top + cornerInset, framesKey, 1);
  topEdge.setDisplaySize(panelWidth + overlap, frameSize);
  container.add(topEdge);

  const bottomEdge = this.add.image(centerX, bottom - cornerInset, framesKey, 7);
  bottomEdge.setDisplaySize(panelWidth + overlap, frameSize);
  container.add(bottomEdge);

  const leftEdge = this.add.image(left + cornerInset, centerY, framesKey, 3);
  leftEdge.setDisplaySize(frameSize, panelHeight + overlap);
  container.add(leftEdge);

  const rightEdge = this.add.image(right - cornerInset, centerY, framesKey, 5);
  rightEdge.setDisplaySize(frameSize, panelHeight + overlap);
  container.add(rightEdge);

  container.add(this.add.image(left + cornerInset, top + cornerInset, framesKey, 0));
  container.add(this.add.image(right - cornerInset, top + cornerInset, framesKey, 2));
  container.add(this.add.image(left + cornerInset, bottom - cornerInset, framesKey, 6));
  container.add(this.add.image(right - cornerInset, bottom - cornerInset, framesKey, 8));

  return container;
}
```

### Per-Asset Parameters

```javascript
const UI_PANEL_CONFIG = {
  'paper-regular': {
    frameSize: 106,
    spacing: 0,
    cornerInset: 0.28,
    overlap: 55,
    bgColor: 0xF5E6C8
  },
  'paper-special': {
    frameSize: 106,
    spacing: 0,
    cornerInset: 0.28,
    overlap: 55,
    bgColor: 0x4A5568
  },
  'wood-table': {
    frameSize: 144,
    spacing: 8,
    cornerInset: 0.35,
    overlap: 80,
    bgColor: 0x8B5A2B
  }
};
```

---

## Common Pitfalls

1. Wrong frame dimensions → corrupted frames
2. Missing `spacing` → frames drift progressively
3. Wrong background color for nine-slice
4. Assuming similar assets share identical layout
5. Internal padding inside frames causes “side bars”
6. Scaling discontinuous art (ribbons/banners) without slicing

### Fix for Internal Padding

Trim each tile to its alpha bounds, then build a cached texture using
small overlaps and disabled smoothing to avoid seams.

### 3-Slice Ribbon Helper

```javascript
function createRibbonSlice(scene, srcKey, width, height, row, slices) {
  const key = `${srcKey}_3slice_${row}_${width}x${height}`;
  if (scene.textures.exists(key)) return key;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const sy = row * slices.frameH;
  const leftW = Math.round(slices.left.w * (height / slices.frameH));
  const rightW = Math.round(slices.right.w * (height / slices.frameH));
  const centerW = Math.max(1, width - leftW - rightW);
  const seam = 1;

  const src = scene.textures.get(srcKey).getSourceImage();
  ctx.drawImage(src, slices.left.x, sy, slices.left.w, slices.frameH, 0, 0, leftW + seam, height);
  ctx.drawImage(src, slices.center.x, sy, slices.center.w, slices.frameH, leftW - seam, 0, centerW + seam * 2, height);
  ctx.drawImage(src, slices.right.x, sy, slices.right.w, slices.frameH, leftW + centerW - seam, 0, rightW + seam, height);

  scene.textures.addCanvas(key, canvas);
  return key;
}
```

---

## Debugging Spritesheets

Show raw frames first:

```javascript
showRawFrames(key, frameCount) {
  for (let i = 0; i < frameCount; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 100 + col * 120;
    const y = 100 + row * 120;

    this.add.image(x, y, key, i);
    this.add.text(x, y + 50, `${i}`, { fontSize: '12px' }).setOrigin(0.5);
  }
}
```

Quick sanity checks:

```javascript
console.log(this.textures.get(key).frameTotal);
```

Checklist when frames look wrong:

1. Measure actual frame dimensions
2. Confirm spacing/margins
3. Verify math against the image size
4. Update loader config

---

## Asset Documentation Template

```javascript
/**
 * UI Panel Assets - Example Pack
 *
 * Regular Paper: 320×320, 3×3 grid, 106px frames, no spacing
 * Special Paper: 320×320, 3×3 grid, 106px frames, no spacing
 * Wood Table:    448×448, 3×3 grid, 144px frames, 8px spacing
 *
 * Layout:
 *   [0][1][2]
 *   [3][4][5]
 *   [6][7][8]
 */
```
