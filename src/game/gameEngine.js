/**
 * Operation: Rescue Motku - Main 3D Game Engine
 * Orchestrates Three.js rendering, physics, lane switching, obstacle spawning,
 * collision detection, collectible coins, villain chase, checkpoints, and rescue sequence.
 */
import * as THREE from 'three';
import { Environment, LANES, LANE_WIDTH } from './environment.js';
import { ObstacleManager } from './obstacles.js';
import { CoinManager } from './coins.js';
import { ParticleSystem } from '../effects/particles.js';
import { ArijitAvatar } from '../characters/arijit.js';
import { AyantikaAvatar } from '../characters/ayantika.js';
import { VillainAvatar } from '../characters/villain.js';
import { FemaleHodAvatar } from '../characters/femaleHod.js';
import { soundManager } from '../audio/soundManager.js';
import { QUIZ_CONFIG } from '../questions.js';

export const GAME_STATES = {
  INTRO: 'INTRO',
  RUNNING: 'RUNNING',
  QUIZ: 'QUIZ',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  RESCUE: 'RESCUE',
  ENDING: 'ENDING'
};

export class GameEngine {
  constructor() {
    this.state = GAME_STATES.INTRO;
    this.canvas = document.getElementById('game-canvas');

    // Stats
    this.distance = 0;
    this.coins = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('rescue_motku_high_score') || '0', 10);
    this.currentQuestionIndex = 0;
    this.isRescueReady = false;
    this.bookThrowCooldown = 4.5;

    // Checkpoint Timer
    this.checkpointTimeLeft = QUIZ_CONFIG.currentIntervalSeconds;

    // Health / Lives (3 Hearts)
    this.lives = 3;
    this.invulnerableTimer = 0;

    // Runner physics & movement
    this.baseSpeed = 13.5;
    this.speed = this.baseSpeed;
    this.targetSpeed = this.baseSpeed;
    this.currentLane = 1; // 0: Left, 1: Center, 2: Right
    this.playerX = LANES[1];
    this.targetPlayerX = LANES[1];
    this.playerY = 0;
    this.playerVy = 0;
    this.gravity = -34;
    this.isJumping = false;
    this.isSliding = false;
    this.slideDuration = 0.72;
    this.slideTimer = 0;

    // Obstacle & Coin Spawning (continuous 120m pre-spawn for maximum visibility)
    this.furthestObstacleZ = -70;
    this.nextCoinZ = -15;

    // Hostage distance tracking (starts 140m ahead, gets closer with each correct answer)
    this.hostageLeadDistance = 140;
    this.targetHostageLeadDistance = 140;

    // Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    this.camera.position.set(0, 4.4, 6.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.clock = new THREE.Clock();

    // Subsystems
    this.environment = new Environment(this.scene);
    this.obstacles = new ObstacleManager(this.scene);
    this.coinManager = new CoinManager(this.scene);
    this.particles = new ParticleSystem(this.scene);

    // Characters
    // 1. Playable hero: Arijit
    this.arijit = new ArijitAvatar();
    this.scene.add(this.arijit.group);

    // 2. Chaser villain: Male Assistant HOD who chases and throws books/phrases
    this.maleHod = new VillainAvatar();
    this.villain = this.maleHod; // for compatibility
    this.scene.add(this.maleHod.group);

    // 3. Captive duo: Saree-Wearing Female HOD holding Ayantika (in jeans & t-shirt) hostage
    this.femaleHod = new FemaleHodAvatar();
    this.ayantika = new AyantikaAvatar();

    this.hostageDuo = new THREE.Group();
    this.femaleHod.group.position.set(-0.65, 0, 0);
    this.femaleHod.group.rotation.set(0, Math.PI, 0);

    this.ayantika.group.position.set(0.55, 0, 0);
    this.ayantika.group.rotation.set(0, Math.PI, 0);

    this.hostageDuo.add(this.femaleHod.group);
    this.hostageDuo.add(this.ayantika.group);
    this.scene.add(this.hostageDuo);

    // Position characters for opening cinematic
    this.resetCharacterPositionsForIntro();

    // Input handlers
    this.setupInputHandlers();

    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }

  resetCharacterPositionsForIntro() {
    this.hostageDuo.visible = true;
    if (this.ayantika.group.parent !== this.hostageDuo) {
      this.hostageDuo.add(this.ayantika.group);
      this.ayantika.group.position.set(0.55, 0, 0);
      this.ayantika.group.rotation.set(0, Math.PI, 0);
    }

    // In intro: Arijit at front ready to rescue
    this.arijit.group.position.set(0, 0, 1.8);
    this.arijit.group.rotation.set(0, 0, 0);

    // Female HOD in saree holding Ayantika (in jeans & t-shirt) hostage!
    this.hostageDuo.position.set(0, 0, -3.8);
    this.hostageDuo.rotation.set(0, 0, 0);

    // Male HOD stands beside them comically waving papers
    this.maleHod.group.position.set(-1.8, 0, -4.2);
    this.maleHod.group.rotation.set(0, Math.PI, 0);

    this.camera.position.set(0, 2.5, 4.4);
    this.camera.lookAt(0, 1.4, -3.0);
  }

  setupInputHandlers() {
    // Keyboard
    window.addEventListener('keydown', e => {
      if (this.state === GAME_STATES.RUNNING) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          this.moveLane(-1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.moveLane(1);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
          this.jump();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          this.slide();
        } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          this.pauseGame();
        }
      } else if (this.state === GAME_STATES.PAUSED) {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          this.resumeGame();
        }
      }
    });

    // Touch Swiping on Canvas
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', e => {
      if (this.state !== GAME_STATES.RUNNING) return;
      if (e.changedTouches.length === 0) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const dt = Date.now() - touchStartTime;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Minimum swipe distance
      if (Math.max(absX, absY) > 28 && dt < 450) {
        if (absX > absY) {
          // Horizontal swipe
          if (dx > 0) this.moveLane(1);
          else this.moveLane(-1);
        } else {
          // Vertical swipe
          if (dy < 0) this.jump();
          else this.slide();
        }
      }
    }, { passive: true });
  }

  moveLane(dir) {
    const nextLane = this.currentLane + dir;
    if (nextLane >= 0 && nextLane <= 2) {
      this.currentLane = nextLane;
      this.targetPlayerX = LANES[this.currentLane];
    }
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.playerVy = 11.5;
      this.isSliding = false; // Cancels slide if any
      soundManager.playJump();
    }
  }

  slide() {
    if (!this.isSliding && !this.isJumping) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      soundManager.playSlide();
    }
  }

  startRunning() {
    this.state = GAME_STATES.RUNNING;
    this.checkpointTimeLeft = QUIZ_CONFIG.currentIntervalSeconds;
    this.lives = 3;
    this.invulnerableTimer = 0;
    this.uiManager.showHUD(true);
    soundManager.startBgm('running');

    // Put Arijit at start of track
    this.arijit.group.position.set(LANES[1], 0, 0);
    this.arijit.group.rotation.set(0, 0, 0);
    this.playerX = LANES[1];
    this.targetPlayerX = LANES[1];
    this.currentLane = 1;

    // Put Assistant HOD behind Arijit for comical pursuit
    this.maleHod.group.position.set(LANES[1], 0, 5.2);
    this.maleHod.group.rotation.set(0, 0, 0);

    // Hostage duo (Saree-Wearing Female HOD holding Ayantika in jeans & t-shirt)
    // ALWAYS VISIBLE down the track ahead, starting at distance 140m
    if (this.ayantika.group.parent !== this.hostageDuo) {
      this.hostageDuo.add(this.ayantika.group);
      this.ayantika.group.position.set(0.55, 0, 0);
      this.ayantika.group.rotation.set(0, Math.PI, 0);
    }
    this.hostageLeadDistance = Math.max(16, 140 - (this.currentQuestionIndex * 25));
    this.targetHostageLeadDistance = this.hostageLeadDistance;
    this.hostageDuo.position.set(0, 0, -this.hostageLeadDistance);
    this.hostageDuo.visible = true;

    // Clear and pre-spawn obstacles up to 130m ahead so player clearly sees them early!
    this.obstacles.clear();
    this.furthestObstacleZ = -70;
    while (this.furthestObstacleZ > -130) {
      this.obstacles.spawnPattern(this.furthestObstacleZ);
      this.furthestObstacleZ -= (26 + Math.random() * 8);
    }

    this.coinManager.clear();
    this.nextCoinZ = -15;
  }

  triggerQuizNow() {
    if (this.state === GAME_STATES.RUNNING) {
      if (this.isRescueReady) {
        this.triggerFinalRescue();
        return;
      }
      this.state = GAME_STATES.QUIZ;
      this.uiManager.showHUD(false);
      soundManager.stopBgm();
      this.uiManager.showQuizCheckpoint(this.currentQuestionIndex);
    }
  }

  pauseGame() {
    if (this.state === GAME_STATES.RUNNING) {
      this.state = GAME_STATES.PAUSED;
      this.uiManager.showPauseModal(true);
      soundManager.stopBgm();
    }
  }

  resumeGame() {
    if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.RUNNING;
      this.uiManager.showPauseModal(false);
      soundManager.startBgm('running');
    }
  }

  restartGame() {
    // Reset all game counters and progress to Question 1
    this.distance = 0;
    this.coins = 0;
    this.score = 0;
    this.lives = 3;
    this.invulnerableTimer = 0;
    this.currentQuestionIndex = 0;
    this.isRescueReady = false;
    this.checkpointTimeLeft = QUIZ_CONFIG.currentIntervalSeconds;

    this.obstacles.clear();
    this.coinManager.clear();
    this.furthestObstacleZ = -70;
    this.nextCoinZ = -15;

    this.environment.pavilion.visible = false;
    this.startRunning();
  }

  resetToTitle() {
    this.state = GAME_STATES.INTRO;
    this.distance = 0;
    this.coins = 0;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.isRescueReady = false;
    this.obstacles.clear();
    this.coinManager.clear();
    this.resetCharacterPositionsForIntro();
    soundManager.startBgm('intro');
  }

  resetCheckpointTimer() {
    this.checkpointTimeLeft = QUIZ_CONFIG.currentIntervalSeconds;
  }

  resumeFromQuiz() {
    this.checkpointTimeLeft = QUIZ_CONFIG.currentIntervalSeconds;
    this.state = GAME_STATES.RUNNING;
    this.uiManager.showHUD(true);
    soundManager.startBgm('running');
  }

  triggerRomanticBurst() {
    this.particles.createHeartBurst(this.arijit.group.position, 35, 0xff3366);
    this.particles.createHeartBurst(this.arijit.group.position, 20, 0xffd700);
  }

  // Final Rescue Milestone Sequence
  triggerFinalRescue() {
    this.state = GAME_STATES.RESCUE;
    soundManager.stopBgm();

    // Hide the moving hostage duo during cinematic reunion
    this.hostageDuo.visible = false;

    // Show rescue pavilion ahead
    const rescueZ = this.arijit.group.position.z - 35;
    this.environment.showPavilionAt(rescueZ);

    // Position Ayantika in the pavilion waiting for Arijit
    this.scene.add(this.ayantika.group);
    this.ayantika.group.position.set(0, 1.25, rescueZ);
    this.ayantika.group.rotation.set(0, 0, 0);

    // Both HODs defeated!
    this.maleHod.update(0.1, 'DEFEATED');
    this.femaleHod.update(0.1, 'DEFEATED');

    // Confetti and rose petals shower
    this.particles.createConfettiShower(new THREE.Vector3(0, 2, rescueZ), 200);

    // Animate Arijit running into the pavilion
    const startZ = this.arijit.group.position.z;
    const targetZ = rescueZ + 1.2;
    const duration = 2.4;
    let elapsed = 0;

    const rescueInterval = setInterval(() => {
      elapsed += 0.03;
      const progress = Math.min(1, elapsed / duration);

      this.arijit.group.position.z = THREE.MathUtils.lerp(startZ, targetZ, progress);
      this.arijit.group.position.x = THREE.MathUtils.lerp(this.arijit.group.position.x, 0, progress);
      this.arijit.update(0.03, 'RUNNING', 8);

      // Camera transitions to romantic cinematic angle
      this.camera.position.x = Math.sin(progress * Math.PI) * 3;
      this.camera.position.y = 2.8 + progress * 0.8;
      this.camera.position.z = this.arijit.group.position.z + 4.5;
      this.camera.lookAt(0, 1.8, rescueZ);

      // Villain spins comically away
      this.maleHod.group.position.z += 0.1;
      this.maleHod.update(0.03, 'DEFEATED');
      this.femaleHod.update(0.03, 'DEFEATED');

      if (progress >= 1) {
        clearInterval(rescueInterval);
        // Both in sweet reunion embrace
        this.arijit.update(0.03, 'CELEBRATE');
        this.ayantika.update(0.03, 'REUNION');

        // Show rescue dialog modal
        setTimeout(() => {
          this.uiManager.showRescueModal();
        }, 1200);
      }
    }, 30);
  }

  update(delta) {
    if (this.state === GAME_STATES.RUNNING) {
      // 1. Advance distance & score
      const stepDist = this.speed * delta;
      this.distance += stepDist;
      this.score += Math.floor(stepDist * 1.5);

      // Player forward movement along -Z
      this.arijit.group.position.z -= stepDist;
      const pZ = this.arijit.group.position.z;

      // 2. Smooth lane switching
      this.playerX += (this.targetPlayerX - this.playerX) * (14 * delta);
      this.arijit.group.position.x = this.playerX;

      // 3. Jump Physics
      if (this.isJumping) {
        this.playerVy += this.gravity * delta;
        this.playerY += this.playerVy * delta;

        if (this.playerY <= 0) {
          this.playerY = 0;
          this.playerVy = 0;
          this.isJumping = false;
        }
      }
      this.arijit.group.position.y = this.playerY;

      // 4. Slide Timer
      if (this.isSliding) {
        this.slideTimer -= delta;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      // 5. Update Arijit animation
      let arijitAction = 'RUNNING';
      if (this.isJumping) arijitAction = 'JUMPING';
      else if (this.isSliding) arijitAction = 'SLIDING';
      this.arijit.update(delta, arijitAction, this.speed);

      // 6. Update Villain pursuit position & animation
      // Assistant HOD chases comically ~5.2 units behind Arijit, matching lane with slight lag
      this.maleHod.group.position.z = pZ + 5.2;
      this.maleHod.group.position.x += (this.playerX - this.maleHod.group.position.x) * (6 * delta);
      this.maleHod.update(delta, 'CHASE', this.speed);

      // 6b. Update Hostage Duo (Female HOD holding Ayantika ahead on the track!)
      // Ayantika is ALWAYS VISIBLE down the track ahead, coming nearer with each correct answer
      this.targetHostageLeadDistance = Math.max(16, 140 - (this.currentQuestionIndex * 25));
      this.hostageLeadDistance += (this.targetHostageLeadDistance - this.hostageLeadDistance) * (2.5 * delta);
      this.hostageDuo.position.z = pZ - this.hostageLeadDistance;
      this.hostageDuo.position.x = Math.sin(Date.now() * 0.0018) * 0.8;
      this.femaleHod.update(delta, 'SCOLDING');
      this.ayantika.update(delta, 'CAPTIVE');

      // 7. Update Camera (elevated perspective so player sees obstacles far in advance)
      this.camera.position.x = this.playerX * 0.35;
      this.camera.position.y = 4.4 + (this.playerY * 0.25);
      this.camera.position.z = pZ + 6.8;
      this.camera.lookAt(this.playerX * 0.25, 1.8 + (this.playerY * 0.2), pZ - 40);

      // 8. Update Environment chunks
      this.environment.update(pZ);

      // 9. Continuous Obstacle Pre-Spawning (kept 130m ahead so obstacles are always visible long before arrival)
      while (this.furthestObstacleZ > pZ - 130) {
        this.obstacles.spawnPattern(this.furthestObstacleZ);
        this.furthestObstacleZ -= 26 + Math.random() * 8;
      }

      // Assistant HOD Comical Syllabus Throw Attack
      this.bookThrowCooldown -= delta;
      if (this.bookThrowCooldown <= 0 && this.distance > 40) {
        this.maleHod.triggerThrow();
        this.obstacles.throwBookFromHOD(this.maleHod.group.position, pZ);
        soundManager.playVillainSound();
        this.bookThrowCooldown = 6.0 + Math.random() * 4.0;
      }

      this.obstacles.update(delta, pZ);

      // High Score persistence
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('rescue_motku_high_score', String(this.highScore));
      }

      // Invulnerability flicker after collision
      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer -= delta;
        this.arijit.group.visible = Math.floor(Date.now() / 90) % 2 === 0;
      } else {
        this.arijit.group.visible = true;
      }

      // Collision Check
      const collisionPlayer = {
        x: this.playerX,
        y: this.playerY,
        z: pZ,
        isJumping: this.isJumping,
        isSliding: this.isSliding
      };

      if (this.invulnerableTimer <= 0 && this.obstacles.checkCollision(collisionPlayer)) {
        this.lives--;
        this.invulnerableTimer = 2.4;
        soundManager.playVillainSound();
        this.particles.createHeartBurst(this.arijit.group.position, 16, 0xff1493);

        if (this.lives <= 0) {
          // Out of lives!
          this.state = GAME_STATES.GAME_OVER;
          this.uiManager.showGameOver(
            this.distance,
            this.coins,
            this.score,
            "Assistant HOD caught you with surprise exam papers! 📚🏃‍♂️ Try again to reach Motku!"
          );
          return;
        }
      }

      // 10. Coin Spawning & Pickup
      if (pZ < this.nextCoinZ) {
        this.coinManager.spawnPattern(this.nextCoinZ, 4);
        this.nextCoinZ -= 16 + Math.random() * 10;
      }
      this.coinManager.update(delta, pZ);

      const pickedCoins = this.coinManager.checkPickup(collisionPlayer);
      if (pickedCoins.length > 0) {
        pickedCoins.forEach(pos => {
          this.coins++;
          this.score += 25;
          soundManager.playCoin();
          this.particles.createCoinSparkle(pos);
        });
      }

      // 11. Checkpoint Trigger (Time Countdown OR Distance Milestone)
      this.checkpointTimeLeft -= delta;
      const distanceMilestone = (this.currentQuestionIndex + 1) * 85;
      const reachedDistanceMilestone = this.distance >= distanceMilestone;

      if (this.checkpointTimeLeft <= 0 || reachedDistanceMilestone) {
        // Check if rescue is already triggered or ready!
        if (this.isRescueReady) {
          this.triggerFinalRescue();
          return;
        }

        // Pause runner and show Quiz Checkpoint
        this.state = GAME_STATES.QUIZ;
        this.uiManager.showHUD(false);
        soundManager.stopBgm();
        this.uiManager.showQuizCheckpoint(this.currentQuestionIndex);
        return;
      }

      // 12. Check if Rescue is ready and distance reached
      if (this.isRescueReady && this.checkpointTimeLeft < QUIZ_CONFIG.currentIntervalSeconds - 4) {
        this.triggerFinalRescue();
        return;
      }

      // 13. Update HUD stats
      this.uiManager.updateHUD(
        this.distance,
        this.coins,
        this.score,
        this.checkpointTimeLeft,
        this.lives,
        this.highScore
      );

      // 14. Update Particles
      this.particles.update(delta, pZ);

    } else if (this.state === GAME_STATES.INTRO) {
      // Gentle cinematic camera sway in opening scene
      const time = Date.now() * 0.001;
      this.camera.position.x = Math.sin(time * 0.5) * 1.8;
      this.camera.position.y = 2.4 + Math.cos(time * 0.4) * 0.2;
      this.camera.lookAt(0, 1.2, -4.0);

      this.femaleHod.update(delta, 'SCOLDING');
      this.ayantika.update(delta, 'CAPTIVE');
      this.maleHod.update(delta, 'STAND_ANGRY');
      this.arijit.update(delta, 'RUNNING', 2);
      this.particles.update(delta, 0);

    } else if (this.state === GAME_STATES.RESCUE) {
      this.particles.update(delta, this.arijit.group.position.z);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
