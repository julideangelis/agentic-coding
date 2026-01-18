import Tower from '../gameObjects/Tower.js';
import Enemy from '../gameObjects/Enemy.js';
import Projectile from '../gameObjects/Projectile.js';
import WaveSystem from '../systems/WaveSystem.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Create background
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillRect(0, 0, 1024, 768);

    // Define path for enemies
    this.path = [
      { x: 0, y: 150 },
      { x: 200, y: 150 },
      { x: 200, y: 350 },
      { x: 400, y: 350 },
      { x: 400, y: 150 },
      { x: 600, y: 150 },
      { x: 600, y: 450 },
      { x: 800, y: 450 },
      { x: 800, y: 250 },
      { x: 950, y: 250 }
    ];

    // Draw path
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(40, 0x8b7355, 1);
    pathGraphics.beginPath();
    pathGraphics.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      pathGraphics.lineTo(this.path[i].x, this.path[i].y);
    }
    pathGraphics.strokePath();

    // Draw kingdom at end of path
    this.createKingdom(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y);

    // Initialize game systems
    this.towers = [];
    this.enemies = [];
    this.projectiles = this.add.group({
      classType: Projectile,
      maxSize: 50,
      runChildUpdate: true
    });

    this.waveSystem = new WaveSystem(this);

    // Tower placement
    this.selectedTowerType = null;
    this.towerPreview = null;

    // Create tower selection UI
    this.createTowerSelectionUI();

    // Input for tower placement
    this.input.on('pointermove', (pointer) => {
      if (this.towerPreview) {
        this.towerPreview.x = pointer.x;
        this.towerPreview.y = pointer.y;

        // Check if valid placement
        const canPlace = this.canPlaceTower(pointer.x, pointer.y);
        this.towerPreview.setAlpha(canPlace ? 0.8 : 0.3);
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (this.selectedTowerType && this.towerPreview) {
        this.placeTower(pointer.x, pointer.y);
      }
    });

    // Start button for first wave
    this.createStartWaveButton();

    // Game state
    this.gameEnded = false;
  }

  createKingdom(x, y) {
    const kingdom = this.add.container(x, y);

    // Castle
    const base = this.add.rectangle(0, 0, 80, 100, 0x8b4513);
    const roof = this.add.triangle(0, -50, -50, 0, 50, 0, 0, -40, 0xdc143c);
    const door = this.add.rectangle(0, 30, 30, 40, 0x654321);
    const window1 = this.add.rectangle(-20, -10, 15, 15, 0xffff00);
    const window2 = this.add.rectangle(20, -10, 15, 15, 0xffff00);

    // Flag
    const flagPole = this.add.rectangle(30, -50, 3, 60, 0x654321);
    const flag = this.add.triangle(45, -65, 0, 0, 30, 7, 0, 14, 0x4169e1);

    kingdom.add([base, roof, door, window1, window2, flagPole, flag]);

    // Add text
    const text = this.add.text(0, 70, 'KINGDOM', {
      fontSize: '16px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    kingdom.add(text);

    this.kingdom = kingdom;
  }

  createTowerSelectionUI() {
    const startY = 550;
    const spacing = 120;

    const towerTypes = [
      { type: 'basic', cost: 50, color: 0x4488ff, name: 'Basic\n$50' },
      { type: 'fast', cost: 75, color: 0xff4488, name: 'Fast\n$75' },
      { type: 'heavy', cost: 100, color: 0x44ff88, name: 'Heavy\n$100' }
    ];

    this.towerButtons = [];

    towerTypes.forEach((tower, index) => {
      const x = 150 + index * spacing;
      const button = this.add.container(x, startY);

      const bg = this.add.rectangle(0, 0, 100, 80, 0x333333);
      bg.setStrokeStyle(2, 0x666666);

      const towerPreview = this.add.circle(0, -15, 15, tower.color);
      const text = this.add.text(0, 25, tower.name, {
        fontSize: '14px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      button.add([bg, towerPreview, text]);
      button.setSize(100, 80);
      button.setInteractive();

      button.on('pointerdown', () => {
        this.selectTowerType(tower.type, tower.cost);
      });

      button.on('pointerover', () => {
        bg.setStrokeStyle(3, 0xffffff);
      });

      button.on('pointerout', () => {
        bg.setStrokeStyle(2, 0x666666);
      });

      this.towerButtons.push(button);
    });

    // Cancel button
    const cancelButton = this.add.container(500, startY);
    const cancelBg = this.add.rectangle(0, 0, 100, 80, 0x333333);
    cancelBg.setStrokeStyle(2, 0x666666);
    const cancelText = this.add.text(0, 0, 'Cancel', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    cancelButton.add([cancelBg, cancelText]);
    cancelButton.setSize(100, 80);
    cancelButton.setInteractive();

    cancelButton.on('pointerdown', () => {
      this.cancelTowerPlacement();
    });
  }

  createStartWaveButton() {
    this.startWaveButton = this.add.container(850, 650);

    const bg = this.add.rectangle(0, 0, 150, 60, 0x228b22);
    bg.setStrokeStyle(3, 0x32cd32);

    this.startWaveText = this.add.text(0, 0, 'Start Wave', {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.startWaveButton.add([bg, this.startWaveText]);
    this.startWaveButton.setSize(150, 60);
    this.startWaveButton.setInteractive();

    this.startWaveButton.on('pointerdown', () => {
      if (!this.waveSystem.waveInProgress) {
        this.waveSystem.startWave();
        this.startWaveButton.setVisible(false);
      }
    });

    this.startWaveButton.on('pointerover', () => {
      bg.setFillStyle(0x32cd32);
    });

    this.startWaveButton.on('pointerout', () => {
      bg.setFillStyle(0x228b22);
    });
  }

  selectTowerType(type, cost) {
    const gold = this.registry.get('gold');

    if (gold < cost) {
      return;
    }

    this.selectedTowerType = type;
    this.selectedTowerCost = cost;

    // Create preview
    if (this.towerPreview) {
      this.towerPreview.destroy();
    }

    this.towerPreview = new Tower(this, 0, 0, type);
    this.towerPreview.setAlpha(0.6);
  }

  cancelTowerPlacement() {
    if (this.towerPreview) {
      this.towerPreview.destroy();
      this.towerPreview = null;
    }
    this.selectedTowerType = null;
  }

  canPlaceTower(x, y) {
    // Check if on path
    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i + 1];

      const distToSegment = this.pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
      if (distToSegment < 50) {
        return false;
      }
    }

    // Check if near kingdom
    const kingdomDist = Phaser.Math.Distance.Between(x, y, this.kingdom.x, this.kingdom.y);
    if (kingdomDist < 80) {
      return false;
    }

    // Check if near other towers
    for (const tower of this.towers) {
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist < 60) {
        return false;
      }
    }

    // Check if in bottom UI area
    if (y > 520) {
      return false;
    }

    return true;
  }

  pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Phaser.Math.Distance.Between(px, py, x1, y1);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Phaser.Math.Distance.Between(px, py, projX, projY);
  }

  placeTower(x, y) {
    if (!this.canPlaceTower(x, y)) {
      return;
    }

    const gold = this.registry.get('gold');
    if (gold < this.selectedTowerCost) {
      return;
    }

    // Deduct gold
    this.registry.set('gold', gold - this.selectedTowerCost);

    // Place tower
    const tower = new Tower(this, x, y, this.selectedTowerType);
    this.towers.push(tower);

    // Cancel placement mode
    this.cancelTowerPlacement();
  }

  spawnEnemy(type, wave) {
    const enemy = new Enemy(this, this.path);
    enemy.setEnemyType(type, wave);
    this.enemies.push(enemy);
  }

  update(time, delta) {
    if (this.gameEnded) return;

    // Update towers
    this.towers.forEach(tower => {
      tower.update(time, this.enemies);
    });

    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });

    // Clean up destroyed enemies
    this.enemies = this.enemies.filter(enemy => enemy.active);

    // Check wave completion
    this.waveSystem.checkWaveComplete();
  }

  showWaveComplete() {
    // Award bonus gold
    const bonusGold = 25 + this.waveSystem.currentWave * 5;
    const currentGold = this.registry.get('gold');
    this.registry.set('gold', currentGold + bonusGold);

    // Show message
    const message = this.add.text(512, 300, `Wave ${this.waveSystem.currentWave - 1} Complete!\n+${bonusGold} Gold`, {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      message.destroy();
      this.startWaveButton.setVisible(true);
      this.startWaveText.setText(`Start Wave ${this.waveSystem.currentWave}`);
    });
  }

  gameOver() {
    this.gameEnded = true;
    const score = this.registry.get('score');
    const wave = this.registry.get('wave');
    this.scene.start('GameOverScene', { score, wave });
  }
}
