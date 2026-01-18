export default class Projectile extends Phaser.GameObjects.Circle {
  constructor(scene) {
    super(scene, 0, 0, 5, 0xffff00);

    this.scene = scene;
    this.speed = 400;
    this.damage = 10;
    this.target = null;

    scene.add.existing(this);
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x, y, target, damage) {
    this.setPosition(x, y);
    this.target = target;
    this.damage = damage;
    this.setActive(true);
    this.setVisible(true);
  }

  update(time, delta) {
    if (!this.active || !this.target || !this.target.active) {
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    // Move towards target
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    if (distance < 10) {
      // Hit target
      this.target.takeDamage(this.damage);
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    const velocity = this.speed * (delta / 1000);
    this.x += Math.cos(angle) * velocity;
    this.y += Math.sin(angle) * velocity;
  }
}
