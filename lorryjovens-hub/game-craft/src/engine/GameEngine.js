class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gameState = {
      running: false,
      paused: false,
      level: 1,
      score: 0,
      lives: 3
    };

    this.player = {
      x: 100,
      y: 300,
      width: 48,
      height: 64,
      vx: 0,
      vy: 0,
      speed: 4,
      jumpForce: -12,
      gravity: 0.6,
      onGround: false,
      facing: 1,
      state: 'idle',
      frameIndex: 0,
      frameTimer: 0,
      health: 100,
      maxHealth: 100,
      attacking: false,
      attackTimer: 0,
      specialReady: true,
      specialCooldown: 0
    };

    this.camera = { x: 0, y: 0 };
    this.platforms = [];
    this.enemies = [];
    this.projectiles = [];
    this.items = [];
    this.particles = [];
    this.keys = {};
    this.assets = { character: {}, enemies: [], backgrounds: [], items: [] };

    this.setupInput();
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'z' || e.key === 'Z') this.jump();
      if (e.key === 'x' || e.key === 'X') this.attack();
      if (e.key === 'c' || e.key === 'C') this.specialAttack();
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  setAssets(assets) {
    this.assets = assets;
  }

  loadLevel(levelData) {
    this.platforms = levelData.platforms || [];
    this.enemies = levelData.enemies || [];
    this.items = levelData.items || [];
    this.player.x = levelData.startX || 100;
    this.player.y = levelData.startY || 300;
  }

  jump() {
    if (this.player.onGround) {
      this.player.vy = this.player.jumpForce;
      this.player.onGround = false;
      this.player.state = 'jump';
    }
  }

  attack() {
    if (!this.player.attacking) {
      this.player.attacking = true;
      this.player.attackTimer = 15;
      this.player.state = 'attack';
      
      this.projectiles.push({
        x: this.player.x + (this.player.facing > 0 ? this.player.width : -20),
        y: this.player.y + this.player.height / 2 - 5,
        width: 20,
        height: 10,
        vx: this.player.facing * 8,
        damage: 25,
        life: 60,
        type: 'punch'
      });
    }
  }

  specialAttack() {
    if (this.player.specialReady) {
      this.player.specialReady = false;
      this.player.specialCooldown = 180;
      this.player.state = 'special';
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        this.projectiles.push({
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height / 2,
          width: 16,
          height: 16,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          damage: 40,
          life: 90,
          type: 'cosmic'
        });
      }

      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color: `hsl(${45 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`,
          size: 3 + Math.random() * 4
        });
      }
    }
  }

  update() {
    if (!this.gameState.running || this.gameState.paused) return;

    const player = this.player;

    if (this.keys['arrowleft'] || this.keys['a']) {
      player.vx = -player.speed;
      player.facing = -1;
      if (player.onGround) player.state = 'walk';
    } else if (this.keys['arrowright'] || this.keys['d']) {
      player.vx = player.speed;
      player.facing = 1;
      if (player.onGround) player.state = 'walk';
    } else {
      player.vx = 0;
      if (player.onGround && !player.attacking) player.state = 'idle';
    }

    player.vy += player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    player.onGround = false;
    for (const platform of this.platforms) {
      if (this.checkCollision(player, platform)) {
        if (player.vy > 0 && player.y < platform.y) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.onGround = true;
        }
      }
    }

    if (player.y > this.height + 100) {
      player.health = 0;
    }

    if (player.attackTimer > 0) {
      player.attackTimer--;
      if (player.attackTimer === 0) player.attacking = false;
    }

    if (player.specialCooldown > 0) {
      player.specialCooldown--;
      if (player.specialCooldown === 0) player.specialReady = true;
    }

    player.frameTimer++;
    if (player.frameTimer >= 8) {
      player.frameTimer = 0;
      player.frameIndex = (player.frameIndex + 1) % 6;
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      if (proj.vy) proj.y += proj.vy;
      proj.life--;

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (this.checkCollision(proj, enemy)) {
          enemy.health -= proj.damage;
          this.projectiles.splice(i, 1);
          
          for (let k = 0; k < 5; k++) {
            this.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 20,
              maxLife: 20,
              color: '#ff4444',
              size: 3
            });
          }
          
          if (enemy.health <= 0) {
            this.enemies.splice(j, 1);
            this.gameState.score += 100;
          }
          break;
        }
      }
    }

    for (const enemy of this.enemies) {
      const dx = player.x - enemy.x;
      const dist = Math.abs(dx);
      
      if (dist < 300) {
        enemy.vx = dx > 0 ? 1.5 : -1.5;
        enemy.x += enemy.vx;
      }

      enemy.frameTimer = (enemy.frameTimer || 0) + 1;
      if (enemy.frameTimer >= 10) {
        enemy.frameTimer = 0;
        enemy.frameIndex = (enemy.frameIndex || 0) + 1;
      }

      if (this.checkCollision(player, enemy) && !player.attacking) {
        player.health -= 10;
        player.vx = (player.x < enemy.x ? -1 : 1) * 5;
      }
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (this.checkCollision(player, item)) {
        if (item.type === 'health') {
          player.health = Math.min(player.maxHealth, player.health + 30);
        } else if (item.type === 'power') {
          player.specialReady = true;
          player.specialCooldown = 0;
        }
        this.items.splice(i, 1);
        this.gameState.score += 50;
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.camera.x = player.x - this.width / 3;
    if (this.camera.x < 0) this.camera.x = 0;

    if (player.health <= 0) {
      this.gameState.lives--;
      if (this.gameState.lives > 0) {
        player.health = player.maxHealth;
        player.x = 100;
        player.y = 300;
      } else {
        this.gameState.running = false;
      }
    }
  }

  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    if (this.assets.backgrounds.length > 0) {
      const bg = new Image();
      bg.src = this.assets.backgrounds[0].dataUrl;
      ctx.drawImage(bg, this.camera.x * 0.5, 0, this.width * 2, this.height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(1, '#0d0520');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.camera.x, 0, this.width, this.height);
    }

    for (const platform of this.platforms) {
      ctx.fillStyle = platform.color || '#4a4a6a';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.fillStyle = '#6a6a8a';
      ctx.fillRect(platform.x, platform.y, platform.width, 4);
    }

    for (const item of this.items) {
      if (item.dataUrl) {
        const img = new Image();
        img.src = item.dataUrl;
        ctx.drawImage(img, item.x, item.y, item.width, item.height);
      } else {
        ctx.fillStyle = item.type === 'health' ? '#ff4444' : '#4444ff';
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.dataUrl) {
        const img = new Image();
        img.src = enemy.dataUrl;
        ctx.save();
        if (enemy.vx < 0) {
          ctx.translate(enemy.x + enemy.width, enemy.y);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, enemy.width, enemy.height);
        } else {
          ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = '#aa3333';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }

      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
      ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : '#ff4444';
      ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
    }

    const player = this.player;
    const frames = this.assets.character[player.state] || this.assets.character['idle'] || [];
    const currentFrame = frames[player.frameIndex % frames.length];
    
    if (currentFrame && currentFrame.dataUrl) {
      const img = new Image();
      img.src = currentFrame.dataUrl;
      ctx.save();
      if (player.facing < 0) {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, player.width, player.height);
      } else {
        ctx.drawImage(img, player.x, player.y, player.width, player.height);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#44aaff';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(player.x + 10, player.y + 10, 28, 15);
    }

    if (player.attacking) {
      ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
      const attackX = player.facing > 0 ? player.x + player.width : player.x - 30;
      ctx.fillRect(attackX, player.y + 15, 30, 20);
    }

    for (const proj of this.projectiles) {
      if (proj.type === 'cosmic') {
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.width, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
      }
    }

    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    this.drawUI();
  }

  drawUI() {
    const ctx = this.ctx;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 30);
    
    const healthPercent = this.player.health / this.player.maxHealth;
    ctx.fillStyle = '#333';
    ctx.fillRect(15, 15, 190, 20);
    ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(15, 15, 190 * healthPercent, 20);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`HP: ${Math.ceil(this.player.health)}/${this.player.maxHealth}`, 20, 30);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width - 160, 10, 150, 30);
    ctx.fillStyle = '#ffdd44';
    ctx.font = '14px monospace';
    ctx.fillText(`SCORE: ${this.gameState.score}`, this.width - 155, 30);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.width / 2 - 40, 10, 80, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(`LIVES: ${this.gameState.lives}`, this.width / 2 - 30, 30);

    if (this.player.specialReady) {
      ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.font = '12px monospace';
      ctx.fillText('★ SPECIAL READY [C]', this.width / 2 - 60, this.height - 20);
    } else {
      const cooldownPercent = 1 - (this.player.specialCooldown / 180);
      ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
      ctx.font = '12px monospace';
      ctx.fillText(`SPECIAL: ${Math.floor(cooldownPercent * 100)}%`, this.width / 2 - 50, this.height - 20);
    }

    if (!this.gameState.running) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#fff';
      ctx.font = '36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
      ctx.font = '18px monospace';
      ctx.fillText(`Final Score: ${this.gameState.score}`, this.width / 2, this.height / 2 + 20);
      ctx.fillText('Press R to Restart', this.width / 2, this.height / 2 + 50);
      ctx.textAlign = 'left';
    }
  }

  start() {
    this.gameState.running = true;
    this.gameLoop();
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  restart() {
    this.gameState = {
      running: true,
      paused: false,
      level: 1,
      score: 0,
      lives: 3
    };
    this.player.health = this.player.maxHealth;
    this.player.x = 100;
    this.player.y = 300;
    this.player.vx = 0;
    this.player.vy = 0;
    this.projectiles = [];
    this.particles = [];
  }
}

export { GameEngine };
