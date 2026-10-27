/**
 * Operation: Rescue Motku - Collectible Coins System
 * Generates sparkling gold coins in lanes, spins them, detects player pickup,
 * and handles scoring and effects.
 */
import * as THREE from 'three';
import { LANES } from './environment.js';

export class CoinManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];

    // Coin geometry: 3D golden cylinder with embossed heart/rim
    this.coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    this.coinGeo.rotateX(Math.PI / 2); // Face forward

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x4a3500
    });

    this.rotAngle = 0;
  }

  // Spawn a row or line of coins
  spawnPattern(zStart, count = 4, laneIdx = null) {
    if (laneIdx === null) {
      laneIdx = Math.floor(Math.random() * 3);
    }
    const x = LANES[laneIdx];

    for (let i = 0; i < count; i++) {
      const z = zStart - i * 2.5;

      const mesh = new THREE.Mesh(this.coinGeo, this.coinMat);
      mesh.position.set(x, 1.0, z);
      mesh.castShadow = true;

      this.scene.add(mesh);
      this.coins.push({
        x,
        y: 1.0,
        z,
        mesh,
        collected: false
      });
    }
  }

  // Check collision with player
  checkPickup(player) {
    const collectedCoins = [];
    const pickupRadius = 1.1;

    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      if (coin.collected) continue;

      const dx = coin.x - player.x;
      const dy = coin.y - player.y;
      const dz = coin.z - player.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < pickupRadius) {
        coin.collected = true;
        this.scene.remove(coin.mesh);
        collectedCoins.push({ x: coin.x, y: coin.y, z: coin.z });
      }
    }

    return collectedCoins;
  }

  update(delta, playerZ) {
    this.rotAngle += delta * 4.0;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];

      if (coin.collected || coin.z > playerZ + 8) {
        if (!coin.collected) {
          this.scene.remove(coin.mesh);
        }
        this.coins.splice(i, 1);
        continue;
      }

      // Spin coin
      coin.mesh.rotation.y = this.rotAngle;
      // Gentle bobbing
      coin.mesh.position.y = coin.y + Math.sin(this.rotAngle + coin.z) * 0.1;
    }
  }

  clear() {
    for (const c of this.coins) {
      this.scene.remove(c.mesh);
    }
    this.coins = [];
  }
}
