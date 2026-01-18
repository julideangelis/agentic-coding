export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Create UI background panel
    const uiPanel = this.add.graphics();
    uiPanel.fillStyle(0x000000, 0.5);
    uiPanel.fillRect(0, 0, 1024, 50);

    // Gold display
    const goldIcon = this.add.circle(50, 25, 15, 0xffd700);
    this.goldText = this.add.text(75, 25, '150', {
      fontSize: '24px',
      fill: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Lives display
    const heartIcon = this.add.text(250, 25, '❤', {
      fontSize: '24px'
    }).setOrigin(0, 0.5);
    this.livesText = this.add.text(285, 25, '20', {
      fontSize: '24px',
      fill: '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Wave display
    this.waveText = this.add.text(450, 25, 'Wave: 1', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Score display
    this.scoreText = this.add.text(700, 25, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Listen to registry changes
    this.registry.events.on('changedata', this.updateUI, this);
  }

  updateUI(parent, key, value) {
    switch(key) {
      case 'gold':
        this.goldText.setText(value.toString());
        break;
      case 'lives':
        this.livesText.setText(value.toString());
        // Change color based on lives
        if (value <= 5) {
          this.livesText.setColor('#ff0000');
        } else if (value <= 10) {
          this.livesText.setColor('#ff8800');
        } else {
          this.livesText.setColor('#ff4444');
        }
        break;
      case 'wave':
        this.waveText.setText(`Wave: ${value}`);
        break;
      case 'score':
        this.scoreText.setText(`Score: ${value}`);
        break;
    }
  }

  shutdown() {
    this.registry.events.off('changedata', this.updateUI, this);
  }
}
