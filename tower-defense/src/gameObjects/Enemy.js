export default class Enemy extends Phaser.GameObjects.Container {
  constructor(scene, path) {
    super(scene, 0, 0);

    this.scene = scene;
    this.path = path;
    this.pathIndex = 0;
    this.hp = 50;
    this.maxHp = 50;
    this.speed = 80;
    this.goldReward = 10;
    this.damageToKingdom = 1;

    // Create enemy visual
    const body = scene.add.circle(0, 0, 12, 0xff0000);
    const eye1 = scene.add.circle(-5, -3, 3, 0xffffff);
    const eye2 = scene.add.circle(5, -3, 3, 0xffffff);

    this.add([body, eye1, eye2]);

    // Health bar background
    this.healthBarBg = scene.add.rectangle(0, -20, 30, 4, 0x000000);
    this.add(this.healthBarBg);

    // Health bar
    this.healthBar = scene.add.rectangle(0, -20, 30, 4, 0x00ff00);
    this.add(this.healthBar);

    scene.add.existing(this);
    this.setSize(24, 24);

    // Start at first point in path
    if (path.length > 0) {
      this.x = path[0].x;
      this.y = path[0].y;
      this.pathIndex = 1;
    }
  }

  setEnemyType(type, wave) {
    // Scale enemy stats based on type and wave
    const types = {
      basic: { hp: 50, speed: 80, gold: 10, color: 0xff0000 },
      fast: { hp: 30, speed: 140, gold: 12, color: 0xff8800 },
      strong: { hp: 120, speed: 60, gold: 20, color: 0x8800ff },
      boss: { hp: 300, speed: 50, gold: 50, color: 0xff00ff }
    };

    const stats = types[type] || types.basic;

    // Scale with wave number
    this.maxHp = Math.floor(stats.hp * (1 + wave * 0.2));
    this.hp = this.maxHp;
    this.speed = stats.speed;
    this.goldReward = Math.floor(stats.gold * (1 + wave * 0.1));

    // Update visual
    const body = this.list[0];
    if (body) {
      body.fillColor = stats.color;

      // Make boss enemies larger
      if (type === 'boss') {
        body.setRadius(18);
        this.setSize(36, 36);
      }
    }

    return this;
  }

  update(time, delta) {
    if (this.pathIndex >= this.path.length) {
      // Reached kingdom
      this.reachKingdom();
      return;
    }

    const target = this.path[this.pathIndex];
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      target.x, target.y
    );

    if (distance < 5) {
      this.pathIndex++;
      return;
    }

    // Move towards target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      target.x, target.y
    );

    const velocity = this.speed * (delta / 1000);
    this.x += Math.cos(angle) * velocity;
    this.y += Math.sin(angle) * velocity;
  }

  takeDamage(damage) {
    this.hp -= damage;
    this.updateHealthBar();

    if (this.hp <= 0) {
      this.die();
    }
  }

  updateHealthBar() {
    const healthPercent = this.hp / this.maxHp;
    this.healthBar.setScale(healthPercent, 1);

    // Change color based on health
    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xffff00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }

  die() {
    // Award gold
    const currentGold = this.scene.registry.get('gold');
    this.scene.registry.set('gold', currentGold + this.goldReward);

    // Update score
    const currentScore = this.scene.registry.get('score');
    this.scene.registry.set('score', currentScore + this.goldReward);

    // Decrease enemies alive count
    const enemiesAlive = this.scene.registry.get('enemiesAlive');
    this.scene.registry.set('enemiesAlive', enemiesAlive - 1);

    this.destroy();
  }

  reachKingdom() {
    // Damage kingdom
    const currentLives = this.scene.registry.get('lives');
    this.scene.registry.set('lives', currentLives - this.damageToKingdom);

    // Decrease enemies alive count
    const enemiesAlive = this.scene.registry.get('enemiesAlive');
    this.scene.registry.set('enemiesAlive', enemiesAlive - 1);

    // Check game over
    if (currentLives - this.damageToKingdom <= 0) {
      this.scene.gameOver();
    }

    this.destroy();
  }
}
