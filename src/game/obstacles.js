/**
 * Operation: Rescue Motku - High-Visibility & Comical Obstacle System
 * Features clearly visible obstacles with ground warning halos:
 * - "Eishob prem kore kichu hobena" hanging banner (Slide or dodge)
 * - "Porte bosho!" giant red syllabus tower (Jump or dodge)
 * - "You deserve better" dramatic dialog sign (Lane switch)
 * - Thrown syllabus textbooks tossed by the Assistant HOD!
 */
import * as THREE from 'three';
import { LANES } from './environment.js';

export const OBSTACLE_TYPES = {
  PREM_KORE_LABH_NEI: 'PREM_KORE_LABH_NEI', // Hanging banner: "Eishob prem kore kichu hobena" (Slide under)
  PORTE_BOSHO: 'PORTE_BOSHO',               // Giant glowing syllabus book tower: "Porte bosho!" (Jump/Dodge)
  YOU_DESERVE_BETTER: 'YOU_DESERVE_BETTER', // Dramatic floating text sign: "You deserve better" (Dodge)
  FALLEN_LOG: 'FALLEN_LOG',                 // Glowing ancient log (Jump)
  THROWN_BOOK: 'THROWN_BOOK'               // Flying book thrown by Assistant HOD!
};

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.activeObstacles = [];
    this.thrownProjectiles = [];

    // Helper textures for fun phrases
    this.phraseTextures = {
      prem: this.createTextTexture('“Eishob prem kore kichu hobena!” 💔', '#ff0055', '#ffffff'),
      porte: this.createTextTexture('📚 PORTE BOSHO! 📚', '#ff2200', '#ffff00'),
      better: this.createTextTexture('“You deserve better” 🥀', '#7b1fa2', '#ffffff'),
      surpriseTest: this.createTextTexture('⚠️ SURPRISE CLASS TEST ⚠️', '#e65100', '#ffffff')
    };

    // Shared high-visibility materials
    this.warningHaloGeo = new THREE.RingGeometry(0.75, 1.05, 24);
    this.warningHaloGeo.rotateX(-Math.PI / 2);
    this.warningHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x664400,
      metalness: 0.8
    });

    this.neonBannerMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    this.pillarMat = new THREE.MeshLambertMaterial({ color: 0x3d271d });
  }

  // Generates high-contrast canvas texture with bold text and glowing border
  createTextTexture(text, bgColor = '#d50000', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 512, 128);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#1a000d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);

    // Glowing border
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(5, 5, 502, 118);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(text, 256, 64);

    return new THREE.CanvasTexture(canvas);
  }

  // Create high-visibility 3D obstacle with warning halo on track
  createObstacleMesh(type) {
    const group = new THREE.Group();

    // 1. Bright Ground Warning Halo (visible 40m away)
    const halo = new THREE.Mesh(this.warningHaloGeo, this.warningHaloMat);
    halo.position.y = 0.04;
    group.add(halo);

    if (type === OBSTACLE_TYPES.PREM_KORE_LABH_NEI) {
      // Hanging Neon Banner: "Eishob prem kore kichu hobena"
      // Clearance underneath for SLIDE (bottom height = 0.95m)
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8), this.pillarMat);
      postL.position.set(-1.05, 1.3, 0);
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8), this.pillarMat);
      postR.position.set(1.05, 1.3, 0);

      // Hanging Signboard with Phrase
      const bannerGeo = new THREE.BoxGeometry(2.1, 0.7, 0.1);
      const bannerMat = new THREE.MeshBasicMaterial({ map: this.phraseTextures.prem });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.y = 1.7; // Clear below for sliding!

      // Glowing hazard light on top
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0055 })
      );
      beacon.position.set(0, 2.15, 0);

      group.add(postL, postR, banner, beacon);

    } else if (type === OBSTACLE_TYPES.PORTE_BOSHO) {
      // Giant Glowing Red Book Tower: "Porte bosho!"
      const towerGeo = new THREE.BoxGeometry(1.9, 1.3, 0.6);
      const towerMat = new THREE.MeshLambertMaterial({
        color: 0xb71c1c,
        emissive: 0x330000
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 0.65;
      tower.castShadow = true;

      // Text sign on front
      const signGeo = new THREE.PlaneGeometry(1.8, 0.55);
      const signMat = new THREE.MeshBasicMaterial({ map: this.phraseTextures.porte });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 0.65, 0.31);

      // Warning exclamation mark topper
      const topper = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), this.goldTrimMat);
      topper.position.set(0, 1.45, 0);

      group.add(tower, sign, topper);

    } else if (type === OBSTACLE_TYPES.YOU_DESERVE_BETTER) {
      // Dramatic Floating Dialog Sign: "You deserve better"
      const signGeo = new THREE.BoxGeometry(2.0, 1.0, 0.15);
      const signMat = new THREE.MeshBasicMaterial({ map: this.phraseTextures.better });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.y = 1.2;

      // Broken heart icon hovering
      const heartIcon = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.28),
        new THREE.MeshBasicMaterial({ color: 0x9c27b0 })
      );
      heartIcon.position.set(0, 1.9, 0);

      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8), this.pillarMat);
      stand.position.y = 0.4;

      group.add(sign, heartIcon, stand);

    } else if (type === OBSTACLE_TYPES.FALLEN_LOG) {
      // High-Visibility Ancient Log with glowing moss & flower
      const logGeo = new THREE.CylinderGeometry(0.35, 0.38, 2.1, 12);
      logGeo.rotateZ(Math.PI / 2);
      const logMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
      const log = new THREE.Mesh(logGeo, logMat);
      log.position.y = 0.35;
      log.castShadow = true;

      // Glowing warning strips
      const stripL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.39, 0.15, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd600 })
      );
      stripL.rotateZ(Math.PI / 2);
      stripL.position.set(-0.6, 0.35, 0);

      const stripR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.39, 0.15, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd600 })
      );
      stripR.rotateZ(Math.PI / 2);
      stripR.position.set(0.6, 0.35, 0);

      group.add(log, stripL, stripR);
    }

    return group;
  }

  // Spawn obstacles with high visibility and fair spacing
  spawnPattern(zPos) {
    const laneIndices = [0, 1, 2];
    laneIndices.sort(() => Math.random() - 0.5);

    // Initial safe runway: if within 75m, do not block center lane
    if (Math.abs(zPos) < 75) {
      const centerIdx = laneIndices.indexOf(1);
      if (centerIdx !== -1) laneIndices.splice(centerIdx, 1);
    }

    // Maximum 1 or 2 obstacles per row, never all 3
    const count = Math.random() < 0.65 ? 1 : 2;

    const obstaclePool = [
      OBSTACLE_TYPES.PREM_KORE_LABH_NEI,
      OBSTACLE_TYPES.PORTE_BOSHO,
      OBSTACLE_TYPES.YOU_DESERVE_BETTER,
      OBSTACLE_TYPES.FALLEN_LOG
    ];

    for (let i = 0; i < count; i++) {
      const laneIdx = laneIndices[i];
      const type = obstaclePool[Math.floor(Math.random() * obstaclePool.length)];
      const mesh = this.createObstacleMesh(type);
      mesh.position.set(LANES[laneIdx], 0, zPos);

      this.scene.add(mesh);

      this.activeObstacles.push({
        type,
        laneIdx,
        x: LANES[laneIdx],
        z: zPos,
        mesh
      });
    }
  }

  // Assistant HOD throws a flying syllabus textbook forward!
  throwBookFromHOD(villainPos, playerZ) {
    const targetLaneIdx = Math.floor(Math.random() * 3);
    const targetX = LANES[targetLaneIdx];
    // Lands 45-65m ahead of player so the player clearly sees it coming!
    const targetZ = playerZ - (45 + Math.random() * 20);

    // Create flying book projectile
    const bookGeo = new THREE.BoxGeometry(1.0, 0.3, 0.8);
    const bookMat = new THREE.MeshLambertMaterial({
      color: 0xff1744,
      emissive: 0x660000
    });
    const bookMesh = new THREE.Mesh(bookGeo, bookMat);
    bookMesh.position.set(villainPos.x, villainPos.y + 1.8, villainPos.z - 0.5);
    bookMesh.castShadow = true;

    // Glowing warning reticle on ground where the book will land
    const reticleGeo = new THREE.RingGeometry(0.65, 1.1, 16);
    reticleGeo.rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.85
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.set(targetX, 0.05, targetZ);

    this.scene.add(bookMesh);
    this.scene.add(reticle);

    this.thrownProjectiles.push({
      mesh: bookMesh,
      reticle: reticle,
      startX: villainPos.x,
      startY: villainPos.y + 1.8,
      startZ: villainPos.z,
      targetX: targetX,
      targetZ: targetZ,
      progress: 0,
      speed: 0.9, // Gives 2.5-3.5 seconds of clear flight time
      active: true,
      x: targetX,
      z: targetZ
    });
  }

  // Check collision with player
  checkCollision(player) {
    const hitZThreshold = 0.55;
    const hitXThreshold = 0.50;

    // 1. Active track obstacles
    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];
      const dz = Math.abs(obs.z - player.z);
      const dx = Math.abs(obs.x - player.x);

      if (dz < hitZThreshold && dx < hitXThreshold) {
        if (obs.type === OBSTACLE_TYPES.FALLEN_LOG) {
          if (player.y > 0.42) continue; // Safely jumped!
          return true;
        }

        if (obs.type === OBSTACLE_TYPES.PREM_KORE_LABH_NEI) {
          if (player.isSliding) continue; // Safely slid underneath!
          return true;
        }

        if (obs.type === OBSTACLE_TYPES.PORTE_BOSHO) {
          if (player.y > 0.85) continue; // Jumped over
          return true;
        }

        if (obs.type === OBSTACLE_TYPES.YOU_DESERVE_BETTER) {
          // Requires lane switch
          return true;
        }

        return true;
      }
    }

    // 2. Thrown projectiles
    for (let i = 0; i < this.thrownProjectiles.length; i++) {
      const proj = this.thrownProjectiles[i];
      if (!proj.active) continue;

      const dz = Math.abs(proj.mesh.position.z - player.z);
      const dx = Math.abs(proj.mesh.position.x - player.x);
      const dy = Math.abs(proj.mesh.position.y - player.y);

      if (dz < 0.65 && dx < 0.55 && dy < 0.8) {
        if (player.isSliding || player.y > 0.5) continue;
        return true;
      }
    }

    return false;
  }

  update(delta, playerZ) {
    // Pulse ground halos for high visibility
    const pulse = 0.5 + Math.sin(Date.now() * 0.008) * 0.25;
    this.warningHaloMat.opacity = pulse;

    // Update active static obstacles
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.z > playerZ + 8) {
        this.scene.remove(obs.mesh);
        obs.mesh.traverse(child => {
          if (child.isMesh) child.geometry.dispose();
        });
        this.activeObstacles.splice(i, 1);
      }
    }

    // Update thrown projectiles
    for (let i = this.thrownProjectiles.length - 1; i >= 0; i--) {
      const proj = this.thrownProjectiles[i];
      proj.progress += delta * proj.speed;

      // Arc flight physics
      const t = Math.min(1, proj.progress);
      proj.mesh.position.x = THREE.MathUtils.lerp(proj.startX, proj.targetX, t);
      proj.mesh.position.z = THREE.MathUtils.lerp(proj.startZ, proj.targetZ, t);
      // High parabola arc: y = 1.6 + 4*sin(pi*t)
      proj.mesh.position.y = 0.3 + Math.sin(t * Math.PI) * 3.5;
      proj.mesh.rotation.x += delta * 12;
      proj.mesh.rotation.y += delta * 8;

      // Pulse landing reticle
      proj.reticle.scale.set(1 + Math.sin(Date.now() * 0.015) * 0.2, 1, 1);

      // Clean up after player passes landing point
      if (proj.mesh.position.z > playerZ + 8 || proj.progress > 2.5) {
        this.scene.remove(proj.mesh);
        this.scene.remove(proj.reticle);
        proj.mesh.geometry.dispose();
        proj.reticle.geometry.dispose();
        this.thrownProjectiles.splice(i, 1);
      }
    }
  }

  clear() {
    for (const obs of this.activeObstacles) {
      this.scene.remove(obs.mesh);
      obs.mesh.traverse(child => {
        if (child.isMesh) child.geometry.dispose();
      });
    }
    this.activeObstacles = [];

    for (const proj of this.thrownProjectiles) {
      this.scene.remove(proj.mesh);
      this.scene.remove(proj.reticle);
    }
    this.thrownProjectiles = [];
  }
}
