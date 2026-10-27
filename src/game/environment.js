/**
 * Operation: Rescue Motku - Environment & Track System
 * Magical sunset forest & ancient temple-inspired running track with 3 lanes,
 * recycling track chunks, warm sunset lighting, pillars, lanterns, and rescue pavilion.
 */
import * as THREE from 'three';

export const LANE_WIDTH = 2.4;
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH]; // Left: -2.4, Center: 0, Right: +2.4
export const CHUNK_LENGTH = 40;
export const NUM_CHUNKS = 6;

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];

    // --- Romantic Sunset Sky & Lighting ---
    // Clear distant linear fog so obstacles 80+ meters down the track are 100% visible
    this.scene.fog = new THREE.Fog(0x521838, 95, 360);

    // Hemisphere Light (Sunset sky pink to warm ground amber)
    this.hemiLight = new THREE.HemisphereLight(0xffb6c1, 0x4a1525, 0.85);
    this.scene.add(this.hemiLight);

    // Directional Sunset Sun
    this.sunLight = new THREE.DirectionalLight(0xffa07a, 1.4);
    this.sunLight.position.set(20, 25, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    // Warm Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffe4e1, 0.4);
    this.scene.add(this.ambientLight);

    // Giant Glowing Sunset Sun Sphere on the horizon
    const sunGeo = new THREE.SphereGeometry(18, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(0, 8, -250);
    this.scene.add(this.sunMesh);

    // Glowing Sun Halo
    const haloGeo = new THREE.RingGeometry(18, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffa07a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 8, -249);
    this.scene.add(halo);

    // --- Textures & Materials for Track ---
    // Ground / Path Stone Texture
    const trackCanvas = document.createElement('canvas');
    trackCanvas.width = 256;
    trackCanvas.height = 256;
    const tctx = trackCanvas.getContext('2d');
    tctx.fillStyle = '#261b24'; // Dark ancient temple flagstone
    tctx.fillRect(0, 0, 256, 256);

    // Stone tile grid
    tctx.strokeStyle = '#3d2b3a';
    tctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 64) {
      tctx.beginPath();
      tctx.moveTo(x, 0);
      tctx.lineTo(x, 256);
      tctx.stroke();
    }
    for (let y = 0; y <= 256; y += 64) {
      tctx.beginPath();
      tctx.moveTo(0, y);
      tctx.lineTo(256, y);
      tctx.stroke();
    }

    // Golden decorative edge lines for lanes
    tctx.fillStyle = '#b38a4b';
    tctx.fillRect(80, 0, 6, 256);
    tctx.fillRect(170, 0, 6, 256);

    const trackTex = new THREE.CanvasTexture(trackCanvas);
    trackTex.wrapS = THREE.RepeatWrapping;
    trackTex.wrapT = THREE.RepeatWrapping;
    trackTex.repeat.set(1, 4);

    this.trackMat = new THREE.MeshLambertMaterial({ map: trackTex });
    this.grassMat = new THREE.MeshLambertMaterial({ color: 0x1a121d }); // Dark enchanted earth/grass
    this.pillarMat = new THREE.MeshLambertMaterial({ color: 0x4a3b48 }); // Carved temple stone
    this.goldMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, metalness: 0.8, roughness: 0.2 });
    this.lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xffd27d });
    this.foliageMat = new THREE.MeshLambertMaterial({ color: 0xbd4b77 }); // Magical rose-pink leaves
    this.trunkMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f });

    // Initialize track chunks
    for (let i = 0; i < NUM_CHUNKS; i++) {
      const zPos = -i * CHUNK_LENGTH;
      const chunk = this.createTrackChunk(zPos);
      this.chunks.push(chunk);
      this.scene.add(chunk);
    }

    // Final Rescue Pavilion (hidden until rescue)
    this.pavilion = this.createRescuePavilion();
    this.pavilion.visible = false;
    this.scene.add(this.pavilion);
  }

  createTrackChunk(zPos) {
    const chunk = new THREE.Group();
    chunk.position.z = zPos;

    // Track surface (width = 3 lanes + shoulders = 8.5)
    const trackGeo = new THREE.PlaneGeometry(8.5, CHUNK_LENGTH);
    const trackMesh = new THREE.Mesh(trackGeo, this.trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0;
    trackMesh.receiveShadow = true;
    chunk.add(trackMesh);

    // Left and Right terrain borders
    const sideGeo = new THREE.PlaneGeometry(25, CHUNK_LENGTH);
    const leftSide = new THREE.Mesh(sideGeo, this.grassMat);
    leftSide.rotation.x = -Math.PI / 2;
    leftSide.position.set(-16.75, -0.05, 0);
    chunk.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, this.grassMat);
    rightSide.rotation.x = -Math.PI / 2;
    rightSide.position.set(16.75, -0.05, 0);
    chunk.add(rightSide);

    // Decorative side curbs
    const curbGeo = new THREE.BoxGeometry(0.5, 0.25, CHUNK_LENGTH);
    const leftCurb = new THREE.Mesh(curbGeo, this.pillarMat);
    leftCurb.position.set(-4.5, 0.1, 0);
    const rightCurb = new THREE.Mesh(curbGeo, this.pillarMat);
    rightCurb.position.set(4.5, 0.1, 0);
    chunk.add(leftCurb, rightCurb);

    // Ancient Temple Pillars & Glowing Lanterns along edges
    for (let z = -CHUNK_LENGTH / 2 + 5; z < CHUNK_LENGTH / 2; z += 12) {
      [-5.2, 5.2].forEach(x => {
        // Pillar Base & Column
        const pillarGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.8, 8);
        const pillar = new THREE.Mesh(pillarGeo, this.pillarMat);
        pillar.position.set(x, 1.9, z);
        pillar.castShadow = true;
        chunk.add(pillar);

        // Pillar Cap (Gold)
        const capGeo = new THREE.BoxGeometry(0.9, 0.2, 0.9);
        const cap = new THREE.Mesh(capGeo, this.goldMat);
        cap.position.set(x, 3.9, z);
        chunk.add(cap);

        // Hanging Temple Lantern
        const lanternGeo = new THREE.OctahedronGeometry(0.28, 0);
        const lantern = new THREE.Mesh(lanternGeo, this.lanternGlowMat);
        lantern.position.set(x * 0.9, 3.2, z);
        chunk.add(lantern);
      });
    }

    // Magical Sunset Trees on outer banks
    for (let z = -CHUNK_LENGTH / 2 + 8; z < CHUNK_LENGTH / 2; z += 16) {
      [-8.5, 8.5].forEach(x => {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 4);

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4.5, 6);
        const trunk = new THREE.Mesh(trunkGeo, this.trunkMat);
        trunk.position.y = 2.25;
        treeGroup.add(trunk);

        // Foliage (fluffy pink/rose canopy)
        const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8), this.foliageMat);
        canopy1.position.y = 4.6;
        const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), this.foliageMat);
        canopy2.position.set(0.6, 5.4, 0.4);
        treeGroup.add(canopy1, canopy2);

        chunk.add(treeGroup);
      });
    }

    // Floating Temple Arch every chunk
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    const beamGeo = new THREE.BoxGeometry(10.5, 0.5, 0.6);
    const beam = new THREE.Mesh(beamGeo, this.pillarMat);
    beam.position.y = 4.5;
    archGroup.add(beam);

    // Gold heart crest on center of arch
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16), this.goldMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 4.5, 0.35);
    archGroup.add(crest);

    chunk.add(archGroup);

    return chunk;
  }

  createRescuePavilion() {
    const pav = new THREE.Group();

    // Raised dais / temple platform
    const daisGeo = new THREE.CylinderGeometry(6, 6.5, 1.2, 24);
    const dais = new THREE.Mesh(daisGeo, this.pillarMat);
    dais.position.y = 0.6;
    pav.add(dais);

    // Decorative carpet / rose petal dais
    const carpetGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.05, 24);
    const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshLambertMaterial({ color: 0x9e1b40 }));
    carpet.position.y = 1.23;
    pav.add(carpet);

    // 4 Temple Columns
    const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    angles.forEach(ang => {
      const px = Math.cos(ang) * 4.2;
      const pz = Math.sin(ang) * 4.2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.5, 12), this.pillarMat);
      col.position.set(px, 3.4, pz);
      pav.add(col);
    });

    // Pavilion Dome
    const domeGeo = new THREE.ConeGeometry(5.2, 2.5, 24);
    const dome = new THREE.Mesh(domeGeo, this.goldMat);
    dome.position.y = 6.8;
    pav.add(dome);

    // Floating heart beacon at top
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), this.lanternGlowMat);
    beacon.position.y = 8.4;
    pav.add(beacon);

    return pav;
  }

  update(playerZ) {
    // Keep sun aligned with player Z so it stays at the horizon
    this.sunMesh.position.z = playerZ - 250;
    this.sunLight.position.z = playerZ + 10;
    this.sunLight.target.position.z = playerZ - 20;
    this.sunLight.target.updateMatrixWorld();

    // Recycle chunks when player passes them
    for (const chunk of this.chunks) {
      if (chunk.position.z > playerZ + CHUNK_LENGTH) {
        // Find furthest chunk
        let minZ = Infinity;
        for (const c of this.chunks) {
          if (c.position.z < minZ) minZ = c.position.z;
        }
        chunk.position.z = minZ - CHUNK_LENGTH;
      }
    }
  }

  showPavilionAt(zPos) {
    this.pavilion.position.set(0, 0, zPos);
    this.pavilion.visible = true;
  }
}
