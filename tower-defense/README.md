# 🏰 Tower Defense - Protect the Kingdom

A classic tower defense game built with Phaser 3. Defend your kingdom from waves of enemies by strategically placing towers along their path.

## 🎮 How to Play

### Objective
Protect your kingdom from waves of enemies. Don't let them reach your castle!

### Game Mechanics

1. **Placing Towers**
   - Click on a tower type at the bottom of the screen
   - Click on the map to place the tower (avoid the path and other towers)
   - Each tower costs gold to build

2. **Tower Types**
   - **Basic Tower** ($50): Balanced damage, range, and fire rate
   - **Fast Tower** ($75): Low damage but very high fire rate
   - **Heavy Tower** ($100): High damage but slow fire rate

3. **Enemy Waves**
   - Click "Start Wave" to begin each wave
   - Enemies follow a fixed path to your kingdom
   - Each wave introduces more or stronger enemies
   - Enemy types:
     - **Basic** (Red): Standard enemy
     - **Fast** (Orange): Quick but weak
     - **Strong** (Purple): Slow but tanky
     - **Boss** (Pink): Appears every 5 waves, very tanky

4. **Economy**
   - Start with 150 gold
   - Earn gold by defeating enemies
   - Bonus gold awarded at the end of each wave
   - Manage your gold wisely for later waves!

5. **Game Over**
   - You have 20 lives
   - Lose a life when an enemy reaches your kingdom
   - Game ends when lives reach 0

## 🚀 Running the Game

### Option 1: Simple HTTP Server (Python)
```bash
cd tower-defense
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser

### Option 2: Node.js HTTP Server
```bash
cd tower-defense
npx http-server -p 8000
```
Then open http://localhost:8000 in your browser

### Option 3: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 🎯 Strategy Tips

- Place towers at corners where enemies slow down
- Mix tower types for balanced defense
- Save gold for later waves when enemies get tougher
- Fast towers are excellent for quick enemies
- Heavy towers are essential for bosses
- Don't block the entire path - leave room for future towers

## 🛠️ Technical Details

- **Engine**: Phaser 3.60.0
- **Physics**: Arcade Physics
- **Architecture**: Scene-based with modular game objects
- **Rendering**: Canvas with automatic WebGL fallback

## 📁 Project Structure

```
tower-defense/
├── index.html              # Entry point
├── src/
│   ├── main.js            # Game configuration
│   ├── scenes/
│   │   ├── BootScene.js   # Asset loading and initialization
│   │   ├── GameScene.js   # Main gameplay
│   │   ├── UIScene.js     # HUD overlay
│   │   └── GameOverScene.js
│   ├── gameObjects/
│   │   ├── Tower.js       # Tower class with 3 types
│   │   ├── Enemy.js       # Enemy with 4 types
│   │   └── Projectile.js  # Tower projectiles
│   └── systems/
│       └── WaveSystem.js  # Wave management and difficulty scaling
```

## 🎨 Features

- ✅ 3 unique tower types with different strategies
- ✅ 4 enemy types with progressive difficulty
- ✅ Wave-based gameplay with scaling difficulty
- ✅ Gold economy system
- ✅ Visual feedback (health bars, range indicators)
- ✅ Responsive tower placement with collision detection
- ✅ Game over and restart functionality
- ✅ Score tracking
- ✅ Procedurally generated graphics (no external assets needed)

## 🔧 Difficulty Balancing

The game progressively increases in difficulty:
- **Enemy HP**: Scales by +20% per wave
- **Enemy Count**: Increases by 2 per wave
- **Enemy Types**: New enemy types introduced in later waves
- **Boss Waves**: Every 5 waves features a boss enemy
- **Spawn Rate**: Enemies spawn faster in later waves

Enjoy defending your kingdom! 🏰⚔️
