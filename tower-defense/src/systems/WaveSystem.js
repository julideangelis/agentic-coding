export default class WaveSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 1;
    this.waveInProgress = false;
    this.spawnTimer = null;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
  }

  startWave() {
    if (this.waveInProgress) return;

    this.waveInProgress = true;
    this.enemiesSpawned = 0;

    // Calculate wave composition
    const waveConfig = this.getWaveConfig(this.currentWave);
    this.enemiesInWave = waveConfig.totalEnemies;

    // Update registry
    this.scene.registry.set('wave', this.currentWave);
    this.scene.registry.set('enemiesAlive', this.enemiesInWave);

    // Start spawning enemies
    this.spawnEnemies(waveConfig);
  }

  getWaveConfig(wave) {
    const config = {
      totalEnemies: 5 + wave * 2,
      spawnDelay: Math.max(800, 2000 - wave * 50),
      composition: []
    };

    // Wave composition based on wave number
    if (wave === 1) {
      // All basic enemies
      for (let i = 0; i < config.totalEnemies; i++) {
        config.composition.push('basic');
      }
    } else if (wave < 5) {
      // Mix of basic and fast
      const fastCount = Math.floor(config.totalEnemies * 0.3);
      for (let i = 0; i < fastCount; i++) {
        config.composition.push('fast');
      }
      for (let i = fastCount; i < config.totalEnemies; i++) {
        config.composition.push('basic');
      }
    } else if (wave < 10) {
      // Basic, fast, and strong
      const strongCount = Math.floor(config.totalEnemies * 0.2);
      const fastCount = Math.floor(config.totalEnemies * 0.3);
      const basicCount = config.totalEnemies - strongCount - fastCount;

      for (let i = 0; i < strongCount; i++) {
        config.composition.push('strong');
      }
      for (let i = 0; i < fastCount; i++) {
        config.composition.push('fast');
      }
      for (let i = 0; i < basicCount; i++) {
        config.composition.push('basic');
      }
    } else {
      // All types including boss
      const bossCount = wave % 5 === 0 ? 1 : 0;
      const strongCount = Math.floor(config.totalEnemies * 0.3);
      const fastCount = Math.floor(config.totalEnemies * 0.3);
      const basicCount = config.totalEnemies - bossCount - strongCount - fastCount;

      for (let i = 0; i < bossCount; i++) {
        config.composition.push('boss');
      }
      for (let i = 0; i < strongCount; i++) {
        config.composition.push('strong');
      }
      for (let i = 0; i < fastCount; i++) {
        config.composition.push('fast');
      }
      for (let i = 0; i < basicCount; i++) {
        config.composition.push('basic');
      }
    }

    // Shuffle composition
    config.composition.sort(() => Math.random() - 0.5);

    return config;
  }

  spawnEnemies(waveConfig) {
    if (this.enemiesSpawned >= this.enemiesInWave) {
      this.waveInProgress = false;
      return;
    }

    const enemyType = waveConfig.composition[this.enemiesSpawned];
    this.scene.spawnEnemy(enemyType, this.currentWave);
    this.enemiesSpawned++;

    // Schedule next enemy
    if (this.enemiesSpawned < this.enemiesInWave) {
      this.scene.time.delayedCall(waveConfig.spawnDelay, () => {
        this.spawnEnemies(waveConfig);
      });
    }
  }

  checkWaveComplete() {
    const enemiesAlive = this.scene.registry.get('enemiesAlive');

    if (enemiesAlive <= 0 && this.enemiesSpawned >= this.enemiesInWave && this.waveInProgress === false) {
      // Wave complete, prepare next wave
      this.currentWave++;
      this.scene.showWaveComplete();
    }
  }

  reset() {
    this.currentWave = 1;
    this.waveInProgress = false;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
  }
}
