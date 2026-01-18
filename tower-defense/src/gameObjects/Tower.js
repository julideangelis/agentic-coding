export default class Tower extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type) {
    super(scene, x, y);

    this.scene = scene;
    this.type = type;

    // Tower types with different stats
    const towerStats = {
      basic: {
        damage: 15,
        range: 150,
        fireRate: 1000,
        cost: 50,
        color: 0x4488ff,
        name: 'Basic Tower'
      },
      fast: {
        damage: 8,
        range: 120,
        fireRate: 400,
        cost: 75,
        color: 0xff4488,
        name: 'Fast Tower'
      },
      heavy: {
        damage: 40,
        range: 180,
        fireRate: 2000,
        cost: 100,
        color: 0x44ff88,
        name: 'Heavy Tower'
      }
    };

    this.stats = towerStats[type];
    this.damage = this.stats.damage;
    this.range = this.stats.range;
    this.fireRate = this.stats.fireRate;
    this.lastFired = 0;

    // Create tower visual (simple shapes)
    const base = scene.add.circle(0, 0, 20, 0x666666);
    const tower = scene.add.circle(0, -5, 15, this.stats.color);
    const barrel = scene.add.rectangle(0, -20, 8, 20, this.stats.color);

    this.add([base, tower, barrel]);
    this.barrel = barrel;

    // Create range indicator (hidden by default)
    this.rangeCircle = scene.add.circle(0, 0, this.range, 0xffffff, 0.1);
    this.rangeCircle.setStrokeStyle(2, 0xffffff, 0.3);
    this.rangeCircle.setVisible(false);
    this.add(this.rangeCircle);

    scene.add.existing(this);

    this.setSize(40, 40);
    this.setInteractive();

    // Show range on hover
    this.on('pointerover', () => {
      this.rangeCircle.setVisible(true);
    });

    this.on('pointerout', () => {
      this.rangeCircle.setVisible(false);
    });
  }

  update(time, enemies) {
    if (time - this.lastFired < this.fireRate) {
      return;
    }

    // Find closest enemy in range
    let closestEnemy = null;
    let closestDistance = this.range;

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        enemy.x, enemy.y
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.fire(closestEnemy);
      this.lastFired = time;

      // Point barrel towards enemy
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        closestEnemy.x, closestEnemy.y
      );
      this.barrel.setRotation(angle + Math.PI / 2);
    }
  }

  fire(target) {
    const projectile = this.scene.projectiles.get();
    if (projectile) {
      projectile.fire(this.x, this.y, target, this.damage);
    }
  }
}
