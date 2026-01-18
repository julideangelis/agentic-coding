export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave = data.wave || 1;
  }

  create() {
    // Background
    const bg = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

    // Game Over text
    const gameOverText = this.add.text(512, 250, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Score
    const scoreText = this.add.text(512, 350, `Final Score: ${this.finalScore}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Wave reached
    const waveText = this.add.text(512, 400, `Waves Survived: ${this.finalWave - 1}`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Restart button
    const restartButton = this.add.container(512, 500);
    const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x228b22);
    buttonBg.setStrokeStyle(3, 0x32cd32);
    const buttonText = this.add.text(0, 0, 'Play Again', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    restartButton.add([buttonBg, buttonText]);
    restartButton.setSize(200, 60);
    restartButton.setInteractive();

    restartButton.on('pointerdown', () => {
      this.restartGame();
    });

    restartButton.on('pointerover', () => {
      buttonBg.setFillStyle(0x32cd32);
    });

    restartButton.on('pointerout', () => {
      buttonBg.setFillStyle(0x228b22);
    });

    // Tips
    const tips = [
      'Tip: Fast towers are great for quick enemies',
      'Tip: Heavy towers deal massive damage to bosses',
      'Tip: Place towers at corners for maximum coverage',
      'Tip: Save gold for later waves when enemies get stronger'
    ];

    const randomTip = Phaser.Utils.Array.GetRandom(tips);
    this.add.text(512, 600, randomTip, {
      fontSize: '18px',
      fill: '#ffff00',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  restartGame() {
    // Reset registry
    this.registry.set('gold', 150);
    this.registry.set('lives', 20);
    this.registry.set('wave', 1);
    this.registry.set('score', 0);
    this.registry.set('enemiesAlive', 0);

    // Stop all scenes
    this.scene.stop('UIScene');

    // Restart game
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
