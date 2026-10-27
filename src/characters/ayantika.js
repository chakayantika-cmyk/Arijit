/**
 * Operation: Rescue Motku - Ayantika ("Motku") 3D Character
 * Modeled as requested: A young Bengali woman with glasses, black hair,
 * wearing a stylish T-shirt, blue denim jeans, and white sneakers.
 */
import * as THREE from 'three';

export class AyantikaAvatar {
  constructor() {
    this.group = new THREE.Group();

    // T-shirt texture (cute peach-rose tee with a small heart badge)
    const tShirtCanvas = document.createElement('canvas');
    tShirtCanvas.width = 128;
    tShirtCanvas.height = 128;
    const tctx = tShirtCanvas.getContext('2d');
    tctx.fillStyle = '#ff7597'; // Cute rose-pink tee
    tctx.fillRect(0, 0, 128, 128);

    // Heart badge on chest
    tctx.fillStyle = '#ffffff';
    tctx.beginPath();
    tctx.arc(44, 40, 10, 0, Math.PI * 2);
    tctx.arc(60, 40, 10, 0, Math.PI * 2);
    tctx.fill();
    tctx.beginPath();
    tctx.moveTo(34, 44);
    tctx.lineTo(52, 64);
    tctx.lineTo(70, 44);
    tctx.closePath();
    tctx.fill();

    const tShirtTexture = new THREE.CanvasTexture(tShirtCanvas);

    // Materials
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xe5bfa7 }); // Bengali skin tone
    this.tShirtMat = new THREE.MeshLambertMaterial({ map: tShirtTexture });
    this.jeansMat = new THREE.MeshLambertMaterial({ color: 0x224b7a }); // Classic denim blue jeans
    this.shoesMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White sneakers
    this.hairMat = new THREE.MeshLambertMaterial({ color: 0x141010 });
    this.glassesMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
    this.lensMat = new THREE.MeshPhongMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.5,
      shininess: 90
    });

    // Root
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Torso (T-shirt)
    const torsoGeo = new THREE.BoxGeometry(0.62, 0.78, 0.38);
    this.torso = new THREE.Mesh(torsoGeo, this.tShirtMat);
    this.torso.position.y = 1.34;
    this.torso.castShadow = true;
    this.root.add(this.torso);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.14, 12), this.skinMat);
    neck.position.y = 0.45;
    this.torso.add(neck);

    // Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.68;
    this.torso.add(this.headGroup);

    // Face
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.44), this.skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Black Hair (feminine shoulder-length cut)
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.48), this.hairMat);
    hairTop.position.set(0, 0.22, -0.02);
    this.headGroup.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.16), this.hairMat);
    hairBack.position.set(0, -0.08, -0.2);
    this.headGroup.add(hairBack);

    const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.34), this.hairMat);
    hairSideL.position.set(-0.23, -0.06, 0);
    const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.34), this.hairMat);
    hairSideR.position.set(0.23, -0.06, 0);
    this.headGroup.add(hairSideL, hairSideR);

    // Black Glasses
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.04, 0.23);
    this.headGroup.add(glassesGroup);

    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 0.04), this.glassesMat);
    frameL.position.x = -0.11;
    const lensL = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.09), this.lensMat);
    lensL.position.set(-0.11, 0, 0.022);
    glassesGroup.add(frameL, lensL);

    const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 0.04), this.glassesMat);
    frameR.position.x = 0.11;
    const lensR = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.09), this.lensMat);
    lensR.position.set(0.11, 0, 0.022);
    glassesGroup.add(frameR, lensR);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.04), this.glassesMat);
    glassesGroup.add(bridge);

    // Sweet Smile
    const smileCanvas = document.createElement('canvas');
    smileCanvas.width = 64;
    smileCanvas.height = 32;
    const sctx = smileCanvas.getContext('2d');
    sctx.strokeStyle = '#c2185b';
    sctx.lineWidth = 3;
    sctx.beginPath();
    sctx.arc(32, 10, 14, 0.1 * Math.PI, 0.9 * Math.PI);
    sctx.stroke();
    const smileTex = new THREE.CanvasTexture(smileCanvas);
    const smileMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.1),
      new THREE.MeshBasicMaterial({ map: smileTex, transparent: true })
    );
    smileMesh.position.set(0, -0.12, 0.23);
    this.headGroup.add(smileMesh);

    // Arms
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.38, 0.26, 0);
    this.torso.add(this.leftArm);

    const armGeo = new THREE.BoxGeometry(0.15, 0.62, 0.15);
    const leftArmMesh = new THREE.Mesh(armGeo, this.skinMat);
    leftArmMesh.position.y = -0.28;
    this.leftArm.add(leftArmMesh);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.38, 0.26, 0);
    this.torso.add(this.rightArm);

    const rightArmMesh = new THREE.Mesh(armGeo, this.skinMat);
    rightArmMesh.position.y = -0.28;
    this.rightArm.add(rightArmMesh);

    // Legs (Blue Denim Jeans)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.95, 0);
    this.root.add(this.leftLeg);

    const legGeo = new THREE.BoxGeometry(0.2, 0.88, 0.22);
    const lLegMesh = new THREE.Mesh(legGeo, this.jeansMat);
    lLegMesh.position.y = -0.44;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);

    const shoeGeo = new THREE.BoxGeometry(0.22, 0.14, 0.3);
    const lShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    lShoe.position.set(0, -0.88, 0.04);
    this.leftLeg.add(lShoe);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.95, 0);
    this.root.add(this.rightLeg);

    const rLegMesh = new THREE.Mesh(legGeo, this.jeansMat);
    rLegMesh.position.y = -0.44;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);

    const rShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    rShoe.position.set(0, -0.88, 0.04);
    this.rightLeg.add(rShoe);

    this.animTime = 0;
  }

  update(delta, mode = 'CAPTIVE') {
    this.animTime += delta * 3.0;

    if (mode === 'CAPTIVE') {
      // Held hostage pose: waving free hand desperately to Arijit!
      this.leftArm.rotation.x = -1.2;
      this.leftArm.rotation.z = 0.3;

      // Right arm waving excitedly
      this.rightArm.rotation.x = -2.3;
      this.rightArm.rotation.z = Math.sin(this.animTime * 2.5) * 0.4 + 0.3;

      this.torso.position.y = 1.34 + Math.sin(this.animTime) * 0.03;
      this.headGroup.rotation.y = Math.sin(this.animTime * 0.8) * 0.2;

    } else if (mode === 'WAVING') {
      this.leftArm.rotation.x = -0.5;
      this.rightArm.rotation.x = -2.4;
      this.rightArm.rotation.z = Math.sin(this.animTime * 2.5) * 0.4;

    } else if (mode === 'REUNION') {
      // Warm loving embrace
      this.leftArm.rotation.x = -1.5;
      this.leftArm.rotation.z = 0.5;
      this.rightArm.rotation.x = -1.5;
      this.rightArm.rotation.z = -0.5;
      this.torso.position.y = 1.34;
      this.headGroup.rotation.x = -0.1;
    }
  }
}
