export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Create loading text
    const loadingText = this.add.text(512, 384, 'Loading...', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create a loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(412, 420, 200, 30);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(412, 420, 200 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    // Initialize game state in registry
    this.registry.set('gold', 150);
    this.registry.set('lives', 20);
    this.registry.set('wave', 1);
    this.registry.set('score', 0);
    this.registry.set('enemiesAlive', 0);

    // Start the game
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
