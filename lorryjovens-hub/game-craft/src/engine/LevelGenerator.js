class LevelGenerator {
  static generateContraStyleLevel(levelNum = 1) {
    const levelWidth = 3000 + levelNum * 1000;
    const platforms = [];
    const enemies = [];
    const items = [];

    platforms.push({ x: 0, y: 420, width: levelWidth, height: 60, color: '#3a3a5a' });

    const platformCount = 15 + levelNum * 5;
    for (let i = 0; i < platformCount; i++) {
      const px = 200 + (i / platformCount) * (levelWidth - 400);
      const py = 200 + Math.random() * 150;
      const pw = 80 + Math.random() * 120;
      platforms.push({
        x: px,
        y: py,
        width: pw,
        height: 16,
        color: `hsl(${240 + Math.random() * 40}, 30%, ${30 + Math.random() * 20}%)`
      });
    }

    const enemyCount = 8 + levelNum * 4;
    for (let i = 0; i < enemyCount; i++) {
      const ex = 300 + (i / enemyCount) * (levelWidth - 600);
      enemies.push({
        x: ex,
        y: 356,
        width: 40,
        height: 50,
        vx: 0,
        health: 30 + levelNum * 10,
        maxHealth: 30 + levelNum * 10,
        frameIndex: 0,
        frameTimer: 0,
        dataUrl: null
      });
    }

    const itemCount = 5 + levelNum * 2;
    for (let i = 0; i < itemCount; i++) {
      const ix = 250 + (i / itemCount) * (levelWidth - 500);
      const iy = 150 + Math.random() * 200;
      items.push({
        x: ix,
        y: iy,
        width: 24,
        height: 24,
        type: i % 3 === 0 ? 'power' : 'health',
        dataUrl: null
      });
    }

    return {
      platforms,
      enemies,
      items,
      startX: 100,
      startY: 356,
      width: levelWidth
    };
  }
}

export { LevelGenerator };
