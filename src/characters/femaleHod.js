/**
 * Operation: Rescue Motku - Evil Female HOD 3D Character
 * Modeled as requested: A strict academic woman wearing a traditional saree
 * with glasses and a tight bun, holding Ayantika hostage comically.
 */
import * as THREE from 'three';

export class FemaleHodAvatar {
  constructor() {
    this.group = new THREE.Group();

    // Saree Texture (Strict dark maroon/grey silk saree with golden border)
    const sareeCanvas = document.createElement('canvas');
    sareeCanvas.width = 256;
    sareeCanvas.height = 256;
    const sctx = sareeCanvas.getContext('2d');
    sctx.fillStyle = '#4a1122'; // Strict academic maroon
    sctx.fillRect(0, 0, 256, 256);

    // Golden strict border
    sctx.fillStyle = '#b8860b';
    sctx.fillRect(0, 0, 32, 256);
    sctx.fillRect(224, 0, 32, 256);

    // Pallu stripes
    sctx.fillStyle = '#2c3539';
    sctx.fillRect(32, 0, 60, 256);

    const sareeTexture = new THREE.CanvasTexture(sareeCanvas);

    // Materials
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xd9a882 });
    this.sareeMat = new THREE.MeshLambertMaterial({ map: sareeTexture });
    this.hairMat = new THREE.MeshLambertMaterial({ color: 0x1f1917 }); // Dark hair with grey hints
    this.glassesMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
    this.rulerMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b }); // Wooden academic ruler

    this.root = new THREE.Group();
    this.group.add(this.root);

    // Torso (Saree Blouse & Draping)
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.9, 0.46);
    this.torso = new THREE.Mesh(torsoGeo, this.sareeMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.root.add(this.torso);

    // Long Saree Skirt
    const skirtGeo = new THREE.CylinderGeometry(0.36, 0.48, 1.1, 16);
    this.skirt = new THREE.Mesh(skirtGeo, this.sareeMat);
    this.skirt.position.y = -0.72;
    this.torso.add(this.skirt);

    // Pallu Draped Over Shoulder
    const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.0, 0.5), this.sareeMat);
    pallu.position.set(0.22, 0, 0.05);
    pallu.rotation.z = -0.15;
    this.torso.add(pallu);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.15, 12), this.skinMat);
    neck.position.y = 0.5;
    this.torso.add(neck);

    // Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.75;
    this.torso.add(this.headGroup);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.46), this.skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Strict Academic Bun Hair
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.5), this.hairMat);
    hairTop.position.set(0, 0.24, -0.02);
    this.headGroup.add(hairTop);

    // Big bun at back of head
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), this.hairMat);
    bun.position.set(0, 0.12, -0.28);
    this.headGroup.add(bun);

    // Strict Glasses
    const glasses = new THREE.Group();
    glasses.position.set(0, 0.06, 0.25);
    this.headGroup.add(glasses);

    const fL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.04), this.glassesMat);
    fL.position.x = -0.11;
    const fR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.04), this.glassesMat);
    fR.position.x = 0.11;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.04), this.glassesMat);
    glasses.add(fL, fR, bridge);

    // Stern/Frowning Mouth
    const frownCanvas = document.createElement('canvas');
    frownCanvas.width = 64;
    frownCanvas.height = 32;
    const fctx = frownCanvas.getContext('2d');
    fctx.strokeStyle = '#5a1212';
    fctx.lineWidth = 3;
    fctx.beginPath();
    fctx.arc(32, 26, 14, 1.1 * Math.PI, 1.9 * Math.PI); // Frown arc
    fctx.stroke();
    const frownTex = new THREE.CanvasTexture(frownCanvas);
    const frownMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.1),
      new THREE.MeshBasicMaterial({ map: frownTex, transparent: true })
    );
    frownMesh.position.set(0, -0.12, 0.24);
    this.headGroup.add(frownMesh);

    // Left Arm: firmly gripping Ayantika hostage!
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.45, 0.32, 0);
    this.torso.add(this.leftArm);

    const armGeo = new THREE.BoxGeometry(0.16, 0.72, 0.16);
    const lArmMesh = new THREE.Mesh(armGeo, this.sareeMat);
    lArmMesh.position.y = -0.32;
    this.leftArm.add(lArmMesh);

    // Grip hand
    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), this.skinMat);
    lHand.position.set(0, -0.7, 0.05);
    this.leftArm.add(lHand);

    // Right Arm: waving wooden ruler / syllabus scoldingly!
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.45, 0.32, 0);
    this.torso.add(this.rightArm);

    const rArmMesh = new THREE.Mesh(armGeo, this.sareeMat);
    rArmMesh.position.y = -0.32;
    this.rightArm.add(rArmMesh);

    // Wooden Ruler
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.02), this.rulerMat);
    ruler.position.set(0, -0.72, 0.25);
    ruler.rotation.x = 1.1;
    this.rightArm.add(ruler);

    this.animTime = 0;
  }

  update(delta, mode = 'SCOLDING') {
    this.animTime += delta * 3.5;

    if (mode === 'SCOLDING') {
      // Holding arm forward firmly clutching Ayantika
      this.leftArm.rotation.x = -1.3;
      this.leftArm.rotation.z = -0.3;

      // Right arm shaking ruler aggressively
      this.rightArm.rotation.x = -1.6 + Math.sin(this.animTime * 2) * 0.45;
      this.rightArm.rotation.z = 0.2;

      this.headGroup.rotation.y = Math.sin(this.animTime) * 0.2;
      this.headGroup.rotation.x = 0.1;
      this.torso.position.y = 1.35 + Math.sin(this.animTime * 0.5) * 0.02;

    } else if (mode === 'DEFEATED') {
      // Saree-wearing HOD comically spins and faints into syllabus papers!
      this.root.rotation.x = -0.7;
      this.root.rotation.z += delta * 3.5;
      this.leftArm.rotation.x = 2.0;
      this.rightArm.rotation.x = 2.0;
    }
  }
}
