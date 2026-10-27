/**
 * Operation: Rescue Motku - Arijit ("Ghengis Khan") 3D Avatar
 * Procedurally modeled 3D character inspired by Arijit's photograph:
 * Short black hair, black glasses, friendly face, maroon kurta with white embroidery,
 * backpack straps, and fully animated running, jumping, and sliding limbs.
 */
import * as THREE from 'three';

export class ArijitAvatar {
  constructor() {
    this.group = new THREE.Group();

    // Create Kurta Texture with white embroidery pattern on shoulder/chest
    const kurtaCanvas = document.createElement('canvas');
    kurtaCanvas.width = 256;
    kurtaCanvas.height = 256;
    const kctx = kurtaCanvas.getContext('2d');
    // Rich maroon base (#5c1324)
    kctx.fillStyle = '#5c1324';
    kctx.fillRect(0, 0, 256, 256);

    // Light embroidered geometric band on right chest/shoulder
    kctx.strokeStyle = '#f8ecd5';
    kctx.lineWidth = 3;
    kctx.fillStyle = '#f8ecd5';

    // Draw traditional Kantha-style diamond patterns
    for (let y = 10; y < 140; y += 22) {
      for (let x = 140; x < 240; x += 22) {
        kctx.beginPath();
        kctx.moveTo(x + 11, y);
        kctx.lineTo(x + 22, y + 11);
        kctx.lineTo(x + 11, y + 22);
        kctx.lineTo(x, y + 11);
        kctx.closePath();
        kctx.stroke();
        // Inner dot
        kctx.beginPath();
        kctx.arc(x + 11, y + 11, 2.5, 0, Math.PI * 2);
        kctx.fill();
      }
    }
    // Vertical stitch lines
    kctx.beginPath();
    kctx.moveTo(136, 0);
    kctx.lineTo(136, 256);
    kctx.moveTo(244, 0);
    kctx.lineTo(244, 256);
    kctx.stroke();

    const kurtaTexture = new THREE.CanvasTexture(kurtaCanvas);

    // Materials
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 }); // Warm Bengali skin tone
    this.kurtaMat = new THREE.MeshLambertMaterial({ map: kurtaTexture });
    this.pantsMat = new THREE.MeshLambertMaterial({ color: 0xe8e4dc }); // Off-white churidar
    this.shoesMat = new THREE.MeshLambertMaterial({ color: 0x3d2314 }); // Dark brown mojari
    this.hairMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    this.glassesMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
    this.lensMat = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.45,
      shininess: 90
    });
    this.strapMat = new THREE.MeshLambertMaterial({ color: 0x1976d2 }); // Blue backpack strap

    // --- Build Hierarchy ---
    // Root anchor for crouch/slide and jump
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Torso (Kurta)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, this.kurtaMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.root.add(this.torso);

    // Kurta lower flare / tunic skirt
    const skirtGeo = new THREE.BoxGeometry(0.74, 0.45, 0.48);
    this.skirt = new THREE.Mesh(skirtGeo, this.kurtaMat);
    this.skirt.position.y = -0.55;
    this.torso.add(this.skirt);

    // Backpack strap on right shoulder
    const strapGeo = new THREE.BoxGeometry(0.12, 0.92, 0.47);
    const strap = new THREE.Mesh(strapGeo, this.strapMat);
    strap.position.set(0.24, 0, 0);
    this.torso.add(strap);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.15, 12);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = 0.52;
    this.torso.add(neck);

    // Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.78;
    this.torso.add(this.headGroup);

    // Face / Head
    const headGeo = new THREE.BoxGeometry(0.48, 0.52, 0.48);
    const head = new THREE.Mesh(headGeo, this.skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Hair (Short styled black hair)
    const hairTopGeo = new THREE.BoxGeometry(0.52, 0.18, 0.52);
    const hairTop = new THREE.Mesh(hairTopGeo, this.hairMat);
    hairTop.position.set(0, 0.24, -0.02);
    this.headGroup.add(hairTop);

    const hairBackGeo = new THREE.BoxGeometry(0.5, 0.35, 0.12);
    const hairBack = new THREE.Mesh(hairBackGeo, this.hairMat);
    hairBack.position.set(0, 0.08, -0.22);
    this.headGroup.add(hairBack);

    // Glasses - Frames
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.05, 0.25);
    this.headGroup.add(glassesGroup);

    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), this.glassesMat);
    frameL.position.x = -0.12;
    const lensL = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.10), this.lensMat);
    lensL.position.set(-0.12, 0, 0.022);
    glassesGroup.add(frameL, lensL);

    const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), this.glassesMat);
    frameR.position.x = 0.12;
    const lensR = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.10), this.lensMat);
    lensR.position.set(0.12, 0, 0.022);
    glassesGroup.add(frameR, lensR);

    // Glasses Bridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.04), this.glassesMat);
    glassesGroup.add(bridge);

    // Mischievous Smile
    const smileCanvas = document.createElement('canvas');
    smileCanvas.width = 64;
    smileCanvas.height = 32;
    const sctx = smileCanvas.getContext('2d');
    sctx.strokeStyle = '#5a2d22';
    sctx.lineWidth = 3;
    sctx.beginPath();
    sctx.arc(32, 10, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    sctx.stroke();
    const smileTex = new THREE.CanvasTexture(smileCanvas);
    const smileMat = new THREE.MeshBasicMaterial({ map: smileTex, transparent: true });
    const smileMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), smileMat);
    smileMesh.position.set(0, -0.14, 0.25);
    this.headGroup.add(smileMesh);

    // --- Arms (Left & Right) ---
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.46, 0.32, 0);
    this.torso.add(this.leftArm);

    const armGeo = new THREE.BoxGeometry(0.18, 0.72, 0.18);
    const leftArmMesh = new THREE.Mesh(armGeo, this.kurtaMat);
    leftArmMesh.position.y = -0.32;
    this.leftArm.add(leftArmMesh);

    const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const leftHand = new THREE.Mesh(handGeo, this.skinMat);
    leftHand.position.y = -0.7;
    this.leftArm.add(leftHand);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.46, 0.32, 0);
    this.torso.add(this.rightArm);

    const rightArmMesh = new THREE.Mesh(armGeo, this.kurtaMat);
    rightArmMesh.position.y = -0.32;
    this.rightArm.add(rightArmMesh);

    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.y = -0.7;
    this.rightArm.add(rightHand);

    // --- Legs (Left & Right) ---
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.19, 0.9, 0);
    this.root.add(this.leftLeg);

    const legGeo = new THREE.BoxGeometry(0.2, 0.85, 0.22);
    const leftLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    leftLegMesh.position.y = -0.42;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    const shoeGeo = new THREE.BoxGeometry(0.22, 0.14, 0.32);
    const leftShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    leftShoe.position.set(0, -0.85, 0.05);
    this.leftLeg.add(leftShoe);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.19, 0.9, 0);
    this.root.add(this.rightLeg);

    const rightLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    rightLegMesh.position.y = -0.42;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    rightShoe.position.set(0, -0.85, 0.05);
    this.rightLeg.add(rightShoe);

    this.animTime = 0;
  }

  update(delta, action = 'RUNNING', speed = 12) {
    this.animTime += delta * (speed * 0.9);

    if (action === 'RUNNING') {
      // Natural running stride
      const stride = Math.sin(this.animTime);
      this.leftLeg.rotation.x = stride * 0.75;
      this.rightLeg.rotation.x = -stride * 0.75;

      this.leftArm.rotation.x = -stride * 0.7;
      this.rightArm.rotation.x = stride * 0.7;

      // Slight vertical bob
      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.animTime * 2)) * 0.08;
      this.torso.rotation.z = Math.sin(this.animTime) * 0.05;
      this.headGroup.rotation.y = -Math.sin(this.animTime) * 0.04;

      // Reset crouch & pitch
      this.root.position.y = 0;
      this.torso.rotation.x = 0.08; // Slight forward lean while running
      this.skirt.scale.set(1, 1, 1);

    } else if (action === 'JUMPING') {
      // Arms raised, legs tucked
      this.leftArm.rotation.x = -2.2;
      this.rightArm.rotation.x = -2.2;
      this.leftLeg.rotation.x = -0.6;
      this.rightLeg.rotation.x = 0.4;
      this.torso.rotation.x = 0.15;
      this.torso.position.y = 1.4;

    } else if (action === 'SLIDING') {
      // Low crouch slide pose
      this.root.position.y = -0.45;
      this.torso.rotation.x = -0.7; // Lean back
      this.torso.position.y = 1.1;
      this.leftLeg.rotation.x = -1.2; // Slide legs forward
      this.rightLeg.rotation.x = -1.1;
      this.leftArm.rotation.x = 0.6;
      this.rightArm.rotation.x = 0.6;

    } else if (action === 'CELEBRATE') {
      // Reunion embrace / celebration
      const wave = Math.sin(this.animTime * 0.5);
      this.leftArm.rotation.x = -1.6 + wave * 0.2;
      this.leftArm.rotation.z = -0.6;
      this.rightArm.rotation.x = -1.6 - wave * 0.2;
      this.rightArm.rotation.z = 0.6;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.torso.position.y = 1.35;
      this.torso.rotation.x = 0;
      this.torso.rotation.z = 0;
      this.root.position.y = 0;
    }
  }
}
