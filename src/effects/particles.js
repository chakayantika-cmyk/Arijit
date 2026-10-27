/**
 * Operation: Rescue Motku - Particle & Visual Effects Engine
 * Renders romantic 3D floating hearts, rose petals, gold coin sparkles, and celebration confetti.
 */
import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.bursts = [];

    // Ambient floating particles along the track (hearts, dust, gold glints)
    this.ambientCount = 120;
    const ambientGeo = new THREE.BufferGeometry();
    const ambientPositions = new Float32Array(this.ambientCount * 3);
    const ambientColors = new Float32Array(this.ambientCount * 3);
    const ambientScales = new Float32Array(this.ambientCount);

    const palette = [
      new THREE.Color(0xff69b4), // Hot pink
      new THREE.Color(0xffb6c1), // Light pink
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xff8da1), // Rose
      new THREE.Color(0xe6e6fa)  // Lavender
    ];

    for (let i = 0; i < this.ambientCount; i++) {
      ambientPositions[i * 3 + 0] = (Math.random() - 0.5) * 16;
      ambientPositions[i * 3 + 1] = 0.5 + Math.random() * 5;
      ambientPositions[i * 3 + 2] = -Math.random() * 80;

      const col = palette[Math.floor(Math.random() * palette.length)];
      ambientColors[i * 3 + 0] = col.r;
      ambientColors[i * 3 + 1] = col.g;
      ambientColors[i * 3 + 2] = col.b;

      ambientScales[i] = 0.15 + Math.random() * 0.25;
    }

    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeo.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));

    // Custom heart/sparkle texture via canvas
    const heartCanvas = document.createElement('canvas');
    heartCanvas.width = 64;
    heartCanvas.height = 64;
    const ctx = heartCanvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    // Draw heart path
    ctx.beginPath();
    ctx.moveTo(32, 20);
    ctx.bezierCurveTo(32, 12, 20, 6, 12, 16);
    ctx.bezierCurveTo(4, 26, 16, 44, 32, 56);
    ctx.bezierCurveTo(48, 44, 60, 26, 52, 16);
    ctx.bezierCurveTo(44, 6, 32, 12, 32, 20);
    ctx.closePath();
    ctx.fill();

    this.heartTexture = new THREE.CanvasTexture(heartCanvas);

    const ambientMat = new THREE.PointsMaterial({
      size: 0.45,
      map: this.heartTexture,
      transparent: true,
      vertexColors: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.ambientPoints = new THREE.Points(ambientGeo, ambientMat);
    this.scene.add(this.ambientPoints);
  }

  update(delta, playerZ) {
    // Keep ambient hearts flowing around player
    const positions = this.ambientPoints.geometry.attributes.position.array;
    for (let i = 0; i < this.ambientCount; i++) {
      const zIdx = i * 3 + 2;
      const yIdx = i * 3 + 1;

      // Gentle wave
      positions[yIdx] += Math.sin(Date.now() * 0.003 + i) * 0.005;

      // Wrap around player's current Z position
      if (positions[zIdx] > playerZ + 5) {
        positions[zIdx] = playerZ - 75 - Math.random() * 10;
        positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
      }
    }
    this.ambientPoints.geometry.attributes.position.needsUpdate = true;

    // Update active particle bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life -= delta;
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        this.bursts.splice(i, 1);
        continue;
      }

      const pArray = b.mesh.geometry.attributes.position.array;
      for (let j = 0; j < b.count; j++) {
        pArray[j * 3 + 0] += b.velocities[j * 3 + 0] * delta;
        pArray[j * 3 + 1] += b.velocities[j * 3 + 1] * delta;
        pArray[j * 3 + 2] += b.velocities[j * 3 + 2] * delta;

        // Gravity or drift
        b.velocities[j * 3 + 1] -= b.gravity * delta;
      }
      b.mesh.geometry.attributes.position.needsUpdate = true;
      b.mesh.material.opacity = Math.max(0, b.life / b.maxLife);
    }
  }

  // Trigger romantic heart burst at a position (e.g. correct answer or coin)
  createHeartBurst(pos, count = 25, colorHex = 0xff3366) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = pos.x;
      positions[i * 3 + 1] = pos.y + 0.5;
      positions[i * 3 + 2] = pos.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      velocities[i * 3 + 0] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = 2.5 + Math.random() * 4.0;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      map: this.heartTexture,
      transparent: true,
      color: colorHex,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);

    this.bursts.push({
      mesh,
      velocities,
      count,
      life: 1.2,
      maxLife: 1.2,
      gravity: 4.0
    });
  }

  // Gold sparkle burst for coins
  createCoinSparkle(pos) {
    const count = 16;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0;
      velocities[i * 3 + 0] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = 1.5 + Math.random() * 2.5;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.35,
      color: 0xffd700,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);

    this.bursts.push({
      mesh,
      velocities,
      count,
      life: 0.6,
      maxLife: 0.6,
      gravity: 3.0
    });
  }

  // Grand celebration confetti shower (rose petals & gold confetti)
  createConfettiShower(pos, count = 180) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const confettiPalette = [
      new THREE.Color(0xff1493), // Deep pink
      new THREE.Color(0xff69b4), // Hot pink
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x9370db), // Lavender
      new THREE.Color(0xff4500)  // Sunset coral
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = pos.x + (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = pos.y + 2 + Math.random() * 6;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 10;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      velocities[i * 3 + 0] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = 0.5 + Math.random() * 2.0;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;

      const col = confettiPalette[Math.floor(Math.random() * confettiPalette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.45,
      map: this.heartTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);

    this.bursts.push({
      mesh,
      velocities,
      count,
      life: 3.5,
      maxLife: 3.5,
      gravity: 0.8 // Soft floating drift
    });
  }

  dispose() {
    this.scene.remove(this.ambientPoints);
    this.ambientPoints.geometry.dispose();
    this.ambientPoints.material.dispose();
    for (const b of this.bursts) {
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
    }
    this.bursts = [];
  }
}
