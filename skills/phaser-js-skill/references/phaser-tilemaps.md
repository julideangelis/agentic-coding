# Tilemaps Reference

Practical guide for Phaser 3 tilemap integration with Tiled.

## Tiled Setup Best Practices

### Tileset Configuration

1. Use embedded tilesets (or ensure external tilesets are committed)
2. Keep tile size consistent (16x16, 32x32, 64x64)
3. Add custom tile properties for collision, damage, or metadata
4. Use Tiled’s collision editor for accurate hitboxes

### Layer Organization

Recommended order (top to bottom in Tiled):

- Foreground (above player)
- Objects (spawn points, triggers)
- Enemies (object layer)
- Collectibles (object layer)
- Ground (collision)
- Background (decor)

## Loading Tilemaps (JSON)

```javascript
preload() {
  this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
  this.load.image('tiles', 'assets/tilesets/tileset.png');
  this.load.image('terrain', 'assets/tilesets/terrain.png');
  this.load.image('props', 'assets/tilesets/props.png');
}
```

### Tileset with Margin/Spacing

```javascript
const tileset = map.addTilesetImage('my-tiles', 'tiles', 32, 32, 1, 2);
```

## Creating the Map

```javascript
const map = this.make.tilemap({ key: 'level1' });
const tileset = map.addTilesetImage('tileset-name-in-tiled', 'tiles');

const bgLayer = map.createLayer('Background', tileset, 0, 0);
const groundLayer = map.createLayer('Ground', tileset, 0, 0);
const fgLayer = map.createLayer('Foreground', tileset, 0, 0);

fgLayer.setDepth(10);
```

### Multiple Tilesets

```javascript
const terrainTileset = map.addTilesetImage('terrain', 'terrain-img');
const propsTileset = map.addTilesetImage('props', 'props-img');

const groundLayer = map.createLayer('Ground', [terrainTileset, propsTileset]);
```

## Collision Setup

### By Tile Index

```javascript
groundLayer.setCollision(1);
groundLayer.setCollision([1, 2, 3, 4, 5]);
groundLayer.setCollisionBetween(1, 100);
groundLayer.setCollisionByExclusion([-1]);
```

### By Custom Property

```javascript
groundLayer.setCollisionByProperty({ collides: true });
groundLayer.setCollisionByProperty({ solid: true, type: 'wall' });
```

### Physics Collider

```javascript
this.physics.add.collider(player, groundLayer);
this.physics.add.collider(player, hazardLayer, onHazardHit, null, this);

function onHazardHit(player, tile) {
  player.damage(10);
}
```

## Object Layers

### Reading Objects

```javascript
const spawnPoint = map.findObject('Objects', obj => obj.name === 'spawn');
player.setPosition(spawnPoint.x, spawnPoint.y);

const enemies = map.filterObjects('Objects', obj => obj.type === 'enemy');
```

### Creating Sprites from Objects

```javascript
const coins = map.createFromObjects('Collectibles', {
  name: 'coin',
  key: 'coin'
});

this.physics.world.enable(coins);
coins.forEach(coin => coin.body.setAllowGravity(false));
```

### Custom Properties

```javascript
function getProperty(obj, name) {
  const prop = obj.properties?.find(p => p.name === name);
  return prop ? prop.value : undefined;
}
```

## Tile Manipulation

```javascript
const tile = groundLayer.getTileAtWorldXY(pointer.x, pointer.y);

groundLayer.putTileAt(tileIndex, tileX, tileY);
groundLayer.removeTileAt(tileX, tileY);
groundLayer.replaceByIndex(oldIndex, newIndex);
```

## Camera and World Bounds

```javascript
this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
this.cameras.main.startFollow(player, true, 0.1, 0.1);
this.cameras.main.setDeadzone(200, 100);
```

## Advanced Techniques

### Parallax Layers

```javascript
const skyLayer = map.createLayer('Sky', tileset);
const cloudsLayer = map.createLayer('Clouds', tileset);
const mountainsLayer = map.createLayer('Mountains', tileset);
const groundLayer = map.createLayer('Ground', tileset);

skyLayer.setScrollFactor(0);
cloudsLayer.setScrollFactor(0.2);
mountainsLayer.setScrollFactor(0.5);
groundLayer.setScrollFactor(1);
```

### Animated Tiles (Manual)

```javascript
this.time.addEvent({
  delay: 200,
  callback: () => {
    waterLayer.forEachTile(tile => {
      if (tile.index >= 10 && tile.index <= 13) {
        tile.index = 10 + ((tile.index - 10 + 1) % 4);
      }
    });
  },
  loop: true
});
```

### Procedural Tilemap

```javascript
const map = this.make.tilemap({
  tileWidth: 32,
  tileHeight: 32,
  width: 100,
  height: 50
});

const tileset = map.addTilesetImage('tiles');
const layer = map.createBlankLayer('Ground', tileset);

for (let x = 0; x < map.width; x++) {
  for (let y = 0; y < map.height; y++) {
    if (y === map.height - 1) layer.putTileAt(1, x, y);
    else if (Math.random() < 0.1) layer.putTileAt(2, x, y);
  }
}

layer.setCollision([1, 2]);
```

## Debugging Tilemaps

```javascript
groundLayer.renderDebug(this.add.graphics(), {
  tileColor: null,
  collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100),
  faceColor: new Phaser.Display.Color(0, 255, 0, 255)
});
```
