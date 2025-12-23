import { useState, useEffect, useRef, useCallback } from "react";
import { GameUI } from "./GameUI";
import { Heart, Zap, Volume2, VolumeX, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExplosionParticle } from "./ExplosionParticle";
import { BossEnemy } from "./BossEnemy";
import { soundSystem } from "./SoundSystem";
import { SKINS } from "../data/skins";
import shipImage from "figma:asset/c0bc8fcf24f3481aab86180e60f959c3344595f8.png";
import explosionSprite from "figma:asset/e282743e205409e326a879bffcc17d9800688b1f.png";

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  speed: number;
  isEnemy: boolean;
  vx?: number; // Optional horizontal velocity for complex patterns
  vy?: number; // Optional vertical velocity override
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: number;
  health: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: "health" | "power" | "shield" | "bomb";
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  frame: number;
  size: "small" | "large";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface Boss {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  phase: number;
  pattern: 'spiral' | 'spread';
  patternTimer: number;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 48;
const ENEMY_SIZE = 32;
const BULLET_SIZE = 8;
const PLAYER_HITBOX_SIZE = 16; // Much smaller than PLAYER_SIZE (48)
const GRAZE_DISTANCE = 32;

// Base Speeds (Pixels per Second)
const PLAYER_SPEED = 300;
const BULLET_SPEED_PLAYER = 400;
const BULLET_SPEED_ENEMY = 150;
const BOSS_MOVE_SPEED = 100;

interface PixelShooterGameProps {
  isPaused: boolean;
  onPause: () => void;
  onGameOver: (score: number) => void;
  selectedSkin?: string;
}

export function PixelShooterGame({ isPaused, onPause, onGameOver, selectedSkin = 'classic' }: PixelShooterGameProps) {
  const [playerPos, setPlayerPos] = useState<Position>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 });
  const playerPosRef = useRef<Position>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 });

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [power, setPower] = useState(1);

  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [wave, setWave] = useState(1);
  const [screenShake, setScreenShake] = useState(0);
  const [bossWarning, setBossWarning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New features
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [grazeCount, setGrazeCount] = useState(0);
  const [totalGrazes, setTotalGrazes] = useState(0);
  const [shield, setShield] = useState(0);
  const [bombs, setBombs] = useState(3);
  const [bombActive, setBombActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [totalKills, setTotalKills] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastShotTime = useRef(0);
  const bossPatternTimer = useRef(0);
  const bulletIdCounter = useRef(0);
  const enemyIdCounter = useRef(0);
  const powerUpIdCounter = useRef(0);
  const explosionIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const bossIdCounter = useRef(0);
  const bossMovementTime = useRef(0);
  const comboTimer = useRef<number | null>(null);
  const grazedBullets = useRef<Set<number>>(new Set());

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('spaceExplorer_highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('spaceExplorer_highScore', score.toString());
    }
  }, [score, highScore]);

  // Combo timer reset
  const resetComboTimer = useCallback(() => {
    if (comboTimer.current) {
      clearTimeout(comboTimer.current);
    }
    comboTimer.current = window.setTimeout(() => {
      setCombo(0);
    }, 3000); // Reset combo after 3 seconds
  }, []);

  // Create explosion helper - Now purely procedural particles
  const createExplosion = useCallback((x: number, y: number, size: "small" | "large" = "small") => {
    // Determine particle counts and colors
    const particleCount = size === "large" ? 20 : 8;
    const baseColors = size === "large"
      ? ["#FFAB00", "#FFD700", "#FF4500", "#FFFFFF"] // Gold/Orange/Red/White
      : ["#FFAB00", "#FFA500", "#FFFF00"];

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const id = particleIdCounter.current++;
      newParticles.push({
        id,
        x,
        y,
        color: baseColors[Math.floor(Math.random() * baseColors.length)],
      });
    }
    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation (approx 1s)
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);

    // Trigger screen shake
    const shakeIntensity = size === "large" ? 8 : 4;
    setScreenShake(shakeIntensity);
    setTimeout(() => setScreenShake(0), 200);
  }, []);


  // Activate bomb
  const activateBomb = useCallback(() => {
    if (bombs > 0 && !bombActive && !gameOver && !isPaused) {
      setBombs(b => b - 1);
      setBombActive(true);
      if (soundEnabled) soundSystem.bomb();

      // Clear all bullets
      setBullets(prev => prev.filter(b => !b.isEnemy));

      // Damage all enemies
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        health: Math.max(0, enemy.health - 3)
      })).filter(enemy => {
        if (enemy.health <= 0) {
          createExplosion(enemy.x, enemy.y, "large");
          setScore(s => s + 50);
          setTotalKills(k => k + 1);
          return false;
        }
        return true;
      }));

      // Damage boss
      if (boss) {
        setBoss(prev => {
          if (!prev) return null;

          let newShield = prev.shield;
          let newHealth = prev.health;

          if (newShield > 0) {
            newShield = Math.max(0, newShield - 10);
            if (newShield <= 0 && soundEnabled) soundSystem.shieldBreak();
          } else {
            newHealth = Math.max(0, newHealth - 10);
          }

          if (newHealth <= 0) {
            createExplosion(prev.x, prev.y, "large");
            setScore(s => s + 1000);
            setTotalKills(k => k + 1);
            return null;
          }
          return { ...prev, health: newHealth, shield: newShield };
        });
      }

      // Create massive explosion effect
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const x = Math.random() * GAME_WIDTH;
          const y = Math.random() * GAME_HEIGHT;
          createExplosion(x, y, "small");
        }, i * 30);
      }

      setTimeout(() => setBombActive(false), 500);
    }
  }, [bombs, bombActive, gameOver, isPaused, soundEnabled, boss, createExplosion]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
      }
      if (e.key.toLowerCase() === "p" || e.key === "Escape") {
        onPause();
      }
      if (e.key.toLowerCase() === "b") {
        activateBomb();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activateBomb, onPause]);

  const spawnBoss = useCallback(() => {
    // 5x base HP buff as requested
    const baseBossHP = (50 + wave * 10) * 5;
    const maxHealth = baseBossHP * (1 + (level - 1) * 0.5);
    // Shield is 2 layers (approx 40% of HP or specific value?) Let's make it 50% of HP
    const maxShield = maxHealth * 0.5;

    setBoss({
      id: bossIdCounter.current++,
      x: GAME_WIDTH / 2,
      y: 80,
      health: maxHealth,
      maxHealth,
      shield: maxShield,
      maxShield,
      phase: 1,
      pattern: 'spiral',
      patternTimer: 0,
    });
  }, [wave, level]);

  // Spawn enemies
  const spawnEnemies = useCallback((waveNum: number) => {
    // Boss wave every 5 waves
    if (waveNum % 5 === 0) {
      setBossWarning(true);
      if (soundEnabled) soundSystem.bossWarning();
      setTimeout(() => {
        setBossWarning(false);
        spawnBoss();
      }, 500); // Reduced from 2000ms to 500ms for faster aggression
      return;
    }

    const newEnemies: Enemy[] = [];
    const enemyCount = Math.min(5 + waveNum, 12);
    const healthMultiplier = 1 + (level - 1) * 0.2;

    for (let i = 0; i < enemyCount; i++) {
      const baseHealth = waveNum > 3 ? 2 : 1;
      newEnemies.push({
        id: enemyIdCounter.current++,
        x: (i % 6) * 60 + 40,
        y: Math.floor(i / 6) * 50 + 30,
        type: Math.floor(Math.random() * 3),
        health: Math.ceil(baseHealth * healthMultiplier),
      });
    }

    setEnemies(prev => [...prev, ...newEnemies]);
  }, [wave, spawnBoss, level, soundEnabled]);

  // Spawn initial wave
  useEffect(() => {
    spawnEnemies(1);
  }, [spawnEnemies]);

  // Explosion animation loop - REMOVED legacy sprite loop since we use particles
  /* useEffect(() => { ... } */

  // Main game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Cap deltaTime to prevent huge jumps (e.g. tab switching)
      const dt = Math.min(deltaTime, 0.1);

      // Move player
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const moveAmount = PLAYER_SPEED * dt;

        if (keysPressed.current.has("arrowleft") || keysPressed.current.has("a")) {
          newX = Math.max(PLAYER_SIZE / 2, prev.x - moveAmount);
        }
        if (keysPressed.current.has("arrowright") || keysPressed.current.has("d")) {
          newX = Math.min(GAME_WIDTH - PLAYER_SIZE / 2, prev.x + moveAmount);
        }
        if (keysPressed.current.has("arrowup") || keysPressed.current.has("w")) {
          newY = Math.max(PLAYER_SIZE / 2, prev.y - moveAmount);
        }
        if (keysPressed.current.has("arrowdown") || keysPressed.current.has("s")) {
          newY = Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, prev.y + moveAmount);
        }

        const nextPos = { x: newX, y: newY };
        playerPosRef.current = nextPos;
        return nextPos;
      });

      // Player shooting
      const now = Date.now();
      if (keysPressed.current.has(" ") && now - lastShotTime.current > 150) {
        lastShotTime.current = now;
        if (soundEnabled) soundSystem.shoot();
        setBullets(prev => {
          const newBullets: Bullet[] = [];
          if (power >= 1) {
            newBullets.push({
              id: bulletIdCounter.current++,
              x: playerPosRef.current.x,
              y: playerPosRef.current.y - PLAYER_SIZE / 2,
              speed: -BULLET_SPEED_PLAYER,
              isEnemy: false,
            });
          }
          if (power >= 2) {
            newBullets.push(
              {
                id: bulletIdCounter.current++,
                x: playerPosRef.current.x - 10,
                y: playerPosRef.current.y - PLAYER_SIZE / 2,
                speed: -BULLET_SPEED_PLAYER,
                isEnemy: false,
              },
              {
                id: bulletIdCounter.current++,
                x: playerPosRef.current.x + 10,
                y: playerPosRef.current.y - PLAYER_SIZE / 2,
                speed: -BULLET_SPEED_PLAYER,
                isEnemy: false,
              }
            );
          }
          if (power >= 3) {
            newBullets.push(
              {
                id: bulletIdCounter.current++,
                x: playerPosRef.current.x - 15,
                y: playerPosRef.current.y,
                speed: -BULLET_SPEED_PLAYER * 0.9,
                isEnemy: false,
              },
              {
                id: bulletIdCounter.current++,
                x: playerPosRef.current.x + 15,
                y: playerPosRef.current.y,
                speed: -BULLET_SPEED_PLAYER * 0.9,
                isEnemy: false,
              }
            );
          }
          return [...prev, ...newBullets];
        });
      }

      // Move bullets
      setBullets(prev => {
        return prev
          .map(bullet => ({
            ...bullet,
            x: bullet.vx ? bullet.x + bullet.vx * dt : bullet.x, // Apply horizontal velocity override if exists
            y: bullet.y + (bullet.vy !== undefined ? bullet.vy : bullet.speed) * dt, // Apply vertical velocity (speed or vy override)
          }))
          .filter(bullet => bullet.y > -10 && bullet.y < GAME_HEIGHT + 10 && bullet.x > -10 && bullet.x < GAME_WIDTH + 10);
      });

      // Enemy shooting
      setEnemies(prev => {
        if (Math.random() < 0.03) {
          const shootingEnemy = prev[Math.floor(Math.random() * prev.length)];
          if (shootingEnemy) {
            setBullets(bullets => [
              ...bullets,
              {
                id: bulletIdCounter.current++,
                x: shootingEnemy.x,
                y: shootingEnemy.y + ENEMY_SIZE / 2,
                speed: BULLET_SPEED_ENEMY * (1 + (level - 1) * 0.1),
                isEnemy: true,
              },
            ]);
          }
        }
        return prev;
      });

      // Boss movement and shooting
      if (boss) {
        setBoss(prev => {
          if (!prev) return null;

          // Sine wave movement
          bossMovementTime.current += dt * 2;
          const newX = GAME_WIDTH / 2 + Math.sin(bossMovementTime.current) * 120;

          // Pattern switching logic
          bossPatternTimer.current += dt;
          let currentPattern = prev.pattern;
          if (bossPatternTimer.current > 5) { // Switch every 5 seconds
            currentPattern = prev.pattern === 'spiral' ? 'spread' : 'spiral';
            bossPatternTimer.current = 0;
          }

          // Boss shooting
          if (Math.random() < 0.05) {
            const newBossBullets: Bullet[] = [];
            const speedMultiplier = 1 + (level - 1) * 0.1;
            const baseSpeed = BULLET_SPEED_ENEMY * 0.8 * speedMultiplier;

            if (currentPattern === 'spiral') {
              // Spiral Pattern
              const bulletCount = 3;
              const spiralOffset = bossMovementTime.current * 3; // Rotation over time

              for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 / bulletCount) * i + spiralOffset;
                newBossBullets.push({
                  id: bulletIdCounter.current++,
                  x: prev.x + Math.cos(angle) * 10,
                  y: prev.y + 40 + Math.sin(angle) * 10,
                  speed: 0, // Not used when we have vx/vy
                  vx: Math.cos(angle + Math.PI / 2) * baseSpeed, // Tangential? No, radial from center usually. Let's do radial.
                  vy: Math.sin(angle + Math.PI / 2) * baseSpeed,
                  // Wait, spiral usually means bullets travel outward in a spiral SHAPE (radial velocity) 
                  // OR they travel in a curve. Let's do radial out from a spinning source.
                  // Correct math for radial out from center with spinning angle:
                  // vx = cos(angle) * speed, vy = sin(angle) * speed.
                  // Let's use correct angle.
                  isEnemy: true,
                });
                // Overriding with simpler radial burst from rotating point
                const radialAngle = angle;
                newBossBullets[i].vx = Math.cos(radialAngle) * baseSpeed;
                newBossBullets[i].vy = Math.sin(radialAngle) * baseSpeed;
              }
            } else {
              // Spread Pattern (Fan towards player)
              const spreadCount = 5;
              const angleStep = Math.PI / 8; // 22.5 degrees
              const startAngle = Math.PI / 2 - (angleStep * (spreadCount - 1)) / 2; // Centered downwards (PI/2)

              // Calculate angle towards player
              const dx = playerPos.x - prev.x;
              const dy = playerPos.y - prev.y;
              const targetAngle = Math.atan2(dy, dx);

              // Fan centered on target
              const fanStartAngle = targetAngle - (angleStep * (spreadCount - 1)) / 2;

              for (let i = 0; i < spreadCount; i++) {
                const angle = fanStartAngle + i * angleStep;
                newBossBullets.push({
                  id: bulletIdCounter.current++,
                  x: prev.x,
                  y: prev.y + 20,
                  speed: 0,
                  vx: Math.cos(angle) * baseSpeed * 1.5, // Faster spread
                  vy: Math.sin(angle) * baseSpeed * 1.5,
                  isEnemy: true,
                });
              }
            }

            setBullets(bullets => [...bullets, ...newBossBullets]);
          }

          return { ...prev, x: newX, pattern: currentPattern };
        });
      }

      // Check bullet-enemy collisions
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        const bulletsToRemove = new Set<number>();

        // Check boss collisions
        if (boss) {
          setBoss(prevBoss => {
            if (!prevBoss) return null;

            for (const bullet of remainingBullets) {
              if (
                !bullet.isEnemy &&
                !bulletsToRemove.has(bullet.id) &&
                Math.abs(bullet.x - prevBoss.x) < 48 + BULLET_SIZE / 2 &&
                Math.abs(bullet.y - prevBoss.y) < 48 + BULLET_SIZE / 2
              ) {
                bulletsToRemove.add(bullet.id);

                let newHealth = prevBoss.health;
                let newShield = prevBoss.shield;

                if (newShield > 0) {
                  newShield -= 1;
                  if (newShield <= 0) {
                    if (soundEnabled) soundSystem.shieldBreak();
                    // Flash effect could be here, but we rely on sound + bar for now
                  }
                } else {
                  newHealth -= 1;
                }

                if (newHealth <= 0) {
                  // Boss defeated
                  setScore(s => s + 1000);
                  createExplosion(prevBoss.x, prevBoss.y, "large");
                  if (soundEnabled) soundSystem.explosion();

                  // Drop multiple power-ups
                  for (let i = 0; i < 3; i++) {
                    setPowerUps(prev => [
                      ...prev,
                      {
                        id: powerUpIdCounter.current++,
                        x: prevBoss.x + (Math.random() - 0.5) * 60,
                        y: prevBoss.y + (Math.random() - 0.5) * 60,
                        type: Math.random() < 0.5 ? "power" : "health",
                      },
                    ]);
                  }

                  setWave(1);
                  setLevel(l => l + 1); // Level up!
                  setTimeout(() => spawnEnemies(1), 1500);
                  return null;
                }

                // Change phase based on health
                const newPhase = newHealth <= prevBoss.maxHealth * 0.33 ? 3
                  : newHealth <= prevBoss.maxHealth * 0.66 ? 2 : 1;

                return { ...prevBoss, health: newHealth, shield: newShield, phase: newPhase };
              }
            }

            return prevBoss;
          });
        }

        setEnemies(prevEnemies => {
          const remainingEnemies = prevEnemies.map(enemy => {
            for (const bullet of remainingBullets) {
              if (
                !bullet.isEnemy &&
                !bulletsToRemove.has(bullet.id) &&
                Math.abs(bullet.x - enemy.x) < ENEMY_SIZE / 2 + BULLET_SIZE / 2 &&
                Math.abs(bullet.y - enemy.y) < ENEMY_SIZE / 2 + BULLET_SIZE / 2
              ) {
                bulletsToRemove.add(bullet.id);
                enemy.health -= 1;
                if (enemy.health <= 0) {
                  setScore(s => s + 100);

                  // Create explosion
                  createExplosion(enemy.x, enemy.y, "large");
                  if (soundEnabled) soundSystem.explosion();

                  // Drop power-up chance
                  if (Math.random() < 0.15) {
                    setPowerUps(prev => [
                      ...prev,
                      {
                        id: powerUpIdCounter.current++,
                        x: enemy.x,
                        y: enemy.y,
                        type: Math.random() < 0.7 ? "power" : "health",
                      },
                    ]);
                  }
                  return null;
                }
                break;
              }
            }
            return enemy;
          }).filter((e): e is Enemy => e !== null);

          // Check if wave cleared (and no boss)
          if (remainingEnemies.length === 0 && !boss) {
            setWave(w => w + 1);
            setTimeout(() => spawnEnemies(wave + 1), 1000);
          }

          return remainingEnemies;
        });

        return remainingBullets.filter(b => !bulletsToRemove.has(b.id));
      });

      // Check bullet-player collisions
      setBullets(prevBullets => {
        for (const bullet of prevBullets) {
          if (
            bullet.isEnemy &&
            Math.abs(bullet.x - playerPosRef.current.x) < PLAYER_HITBOX_SIZE / 2 + BULLET_SIZE / 2 &&
            Math.abs(bullet.y - playerPosRef.current.y) < PLAYER_HITBOX_SIZE / 2 + BULLET_SIZE / 2
          ) {
            // Create explosion at player position
            createExplosion(playerPosRef.current.x, playerPosRef.current.y, "small");
            if (soundEnabled) soundSystem.hit();

            setLives(l => {
              const newLives = l - 1;

              if (newLives <= 0) {
                setGameOver(true);
                if (soundEnabled) {
                  soundSystem.gameOver();
                  // Stop any ongoing loops
                  soundSystem.stopAll();
                }
                // Clear input state immediately
                keysPressed.current.clear();

                // Signal Game Over to parent
                onGameOver(score);
                // Create larger explosion on game over
                createExplosion(playerPosRef.current.x, playerPosRef.current.y, "large");
              }
              return newLives;
            });
            return prevBullets.filter(b => b.id !== bullet.id);
          }
        }
        return prevBullets;
      });

      // Move and collect power-ups
      setPowerUps(prev => {
        return prev
          .map(powerUp => ({
            ...powerUp,
            y: powerUp.y + 100 * dt,
          }))
          .filter(powerUp => {
            // Check collision with player - Use full sprite size for PowerUps (easier collection)
            if (
              Math.abs(powerUp.x - playerPosRef.current.x) < PLAYER_SIZE / 2 + 12 &&
              Math.abs(powerUp.y - playerPosRef.current.y) < PLAYER_SIZE / 2 + 12
            ) {
              if (powerUp.type === "health") {
                setLives(l => Math.min(l + 1, 5));
              } else if (powerUp.type === "power") {
                setPower(p => Math.min(p + 1, 3));
              } else if (powerUp.type === "shield") {
                setShield(s => Math.min(s + 1, 3));
              } else if (powerUp.type === "bomb") {
                setBombs(b => Math.min(b + 1, 3));
              }
              return false;
            }
            return powerUp.y < GAME_HEIGHT;
          });
      });

      // Graze detection
      setBullets(prevBullets => {
        for (const bullet of prevBullets) {
          if (
            bullet.isEnemy && // Check enemy bullets only
            Math.abs(bullet.x - playerPosRef.current.x) < PLAYER_SIZE / 2 + GRAZE_DISTANCE &&
            Math.abs(bullet.y - playerPosRef.current.y) < PLAYER_SIZE / 2 + GRAZE_DISTANCE &&
            // But not too close (would be a hit - check against HITBOX)
            !(Math.abs(bullet.x - playerPosRef.current.x) < PLAYER_HITBOX_SIZE / 2 + BULLET_SIZE / 2 &&
              Math.abs(bullet.y - playerPosRef.current.y) < PLAYER_HITBOX_SIZE / 2 + BULLET_SIZE / 2)
          ) {
            if (!grazedBullets.current.has(bullet.id)) {
              grazedBullets.current.add(bullet.id);
              setGrazeCount(c => c + 1);
              setTotalGrazes(t => t + 1);
              setScore(s => s + 10); // Bonus points for grazing
              if (soundEnabled) soundSystem.graze();
            }
          }
        }
        return prevBullets;
      });

      // Update combo
      if (combo > 0) {
        resetComboTimer();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop); // Start loop

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameOver, isPaused, wave, spawnEnemies, createExplosion, resetComboTimer, onGameOver, score, soundEnabled, level]);

  const resetGame = () => {
    soundSystem.stopAll();
    keysPressed.current.clear();
    setPlayerPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 });
    playerPosRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 };
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setExplosions([]);
    setParticles([]);
    setBoss(null);
    setBossWarning(false);
    setScore(0);
    setLives(3);
    setPower(1);
    setWave(1);
    setGameOver(false);
    // setPaused(false);
    setCombo(0);
    setGrazeCount(0);
    setShield(0);
    setBombs(3);
    setBombActive(false);
    setTotalKills(0);
    bossMovementTime.current = 0;
    grazedBullets.current.clear();
    lastTimeRef.current = 0; // Reset time
    spawnEnemies(1);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <GameUI
        score={score}
        lives={lives}
        power={power}
        wave={wave}
        bombs={bombs}
        grazeCount={grazeCount}
        highScore={highScore}
      />

      <motion.div
        className="relative border-4 border-purple-500 shadow-lg shadow-purple-500/50"
        animate={{
          x: screenShake > 0 ? [0, -screenShake, screenShake, -screenShake, screenShake, 0] : 0,
          y: screenShake > 0 ? [0, screenShake, -screenShake, screenShake, -screenShake, 0] : 0,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 100%)",
          imageRendering: "pixelated",
        }}
      >
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Boss Warning */}
        {bossWarning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
              }}
            >
              <h2 className="pixel-text-large text-red-500 mb-4">WARNING!</h2>
              <p className="pixel-text-medium text-yellow-400">BOSS APPROACHING</p>
            </motion.div>
          </motion.div>
        )}

        {/* Boss */}
        {boss && (
          <BossEnemy
            x={boss.x}
            y={boss.y}
            health={boss.health}
            maxHealth={boss.maxHealth}
            shield={boss.shield}
            maxShield={boss.maxShield}
          />
        )}

        {/* Enemies */}
        {enemies.map(enemy => (
          <motion.div
            key={enemy.id}
            className="absolute"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            style={{
              left: enemy.x - ENEMY_SIZE / 2,
              top: enemy.y - ENEMY_SIZE / 2,
              width: ENEMY_SIZE,
              height: ENEMY_SIZE,
            }}
          >
            <div className={`w-full h-full pixel-enemy-${enemy.type}`}>
              {enemy.type === 0 && (
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path d="M4 8h24v4H4zM8 12h16v8H8zM12 20h8v4h-8z" fill="#f87171" />
                  <rect x="8" y="4" width="4" height="4" fill="#f87171" />
                  <rect x="20" y="4" width="4" height="4" fill="#f87171" />
                  <rect x="10" y="14" width="4" height="4" fill="#000" />
                  <rect x="18" y="14" width="4" height="4" fill="#000" />
                </svg>
              )}
              {enemy.type === 1 && (
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path d="M2 10h28v4H2zM6 14h20v6H6zM10 20h12v4H10z" fill="#60a5fa" />
                  <rect x="10" y="6" width="4" height="4" fill="#60a5fa" />
                  <rect x="18" y="6" width="4" height="4" fill="#60a5fa" />
                  <rect x="8" y="16" width="16" height="2" fill="#1e3a8a" opacity="0.5" />
                </svg>
              )}
              {enemy.type === 2 && (
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path d="M8 8h16v6h-16zM4 14h24v6H4zM10 20h12v4H10z" fill="#34d399" />
                  <rect x="14" y="4" width="4" height="4" fill="#34d399" />
                  <rect x="6" y="16" width="4" height="4" fill="#064e3b" opacity="0.5" />
                  <rect x="22" y="16" width="4" height="4" fill="#064e3b" opacity="0.5" />
                </svg>
              )}
            </div>
          </motion.div>
        ))}

        {/* Player */}
        {/* Player */}
        <div
          className="absolute z-10"
          style={{
            left: playerPos.x - PLAYER_SIZE / 2,
            top: playerPos.y - PLAYER_SIZE / 2,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            // Apply Skin Color Glow/Tint - REMOVED per user request ("not the halo")
            // filter: `drop-shadow(0 0 4px ${SKINS.find(s => s.id === selectedSkin)?.color || '#FFFFFF'})`,
          }}
        >
          {shield > 0 && (
            <motion.div
              className="absolute inset-0 -m-2 border-2 border-cyan-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          <img
            src={shipImage}
            alt="Player Ship"
            className="w-full h-full object-contain"
            style={{
              // Optionally apply tint? drop-shadow on parent is usually enough for a unified glow
              // filter: `drop-shadow(0 0 2px ${SKINS.find(s => s.id === selectedSkin)?.color})` 
            }}
          />
        </div>

        {/* Bullets */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className={`absolute rounded-full ${bullet.isEnemy ? "bg-red-500 shadow-red-500" : ""
              }`}
            style={{
              left: bullet.x - BULLET_SIZE / 2,
              top: bullet.y - BULLET_SIZE / 2,
              width: BULLET_SIZE,
              height: BULLET_SIZE,
              backgroundColor: bullet.isEnemy ? undefined : '#FFAB00',
              boxShadow: `0 0 ${bullet.isEnemy ? '4px #ef4444' : '6px #FFAB00'}`,
            }}
          />
        ))}

        {/* PowerUps */}
        {powerUps.map(powerUp => (
          <motion.div
            key={powerUp.id}
            className="absolute z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              left: powerUp.x - 12,
              top: powerUp.y - 12,
            }}
          >
            <div className={`p-1 rounded-full border-2 ${powerUp.type === "health" ? "border-pink-500 bg-pink-900/50" :
              powerUp.type === "power" ? "border-yellow-400 bg-yellow-900/50" :
                powerUp.type === "shield" ? "border-cyan-400 bg-cyan-900/50" :
                  "border-red-500 bg-red-900/50"
              }`}>
              {powerUp.type === "health" && <Heart className="w-4 h-4 text-pink-500" />}
              {powerUp.type === "power" && <Zap className="w-4 h-4 text-yellow-400" />}
              {powerUp.type === "shield" && <Shield className="w-4 h-4 text-cyan-400" />}
              {powerUp.type === "bomb" && <span className="text-xs font-bold text-red-500">B</span>}
            </div>
          </motion.div>
        ))}

        {/* Hitbox Indicator (Optional Debug/Visual Help) */}
        <div
          className="absolute z-20 rounded-full bg-white opacity-80 pointer-events-none animate-pulse"
          style={{
            left: playerPos.x - 3,
            top: playerPos.y - 3,
            width: 6,
            height: 6,
            boxShadow: "0 0 4px white"
          }}
        />

        {/* Explosions - Deprecated sprite rendering removed, using particles */}

        {/* Particles */}
        {particles.map(particle => (
          <ExplosionParticle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            color={particle.color}
          />
        ))}

        {/* Combo Indicator */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              className="absolute top-20 right-4 pointer-events-none"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="text-right">
                <div className="text-2xl font-bold italic text-yellow-400 pixel-text" style={{ textShadow: '2px 2px #d97706' }}>
                  {combo}x COMBO!
                </div>
                <div className="w-full h-1 bg-gray-700 mt-1 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-400"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over / Pause Overlays handled by parent App.tsx now */}

      </motion.div>
    </div>
  );
}