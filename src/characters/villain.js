/**
 * Operation: Rescue Motku - Assistant HOD (Villain) 3D Character
 * Comical strict academic professor with thick spectacles, mustache, syllabus papers,
 * red grading pen, comical running chase animation and dramatic defeat reaction.
 */
import * as THREE from 'three';

export class VillainAvatar {
  constructor() {
    this.group = new THREE.Group();

    // Materials
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xd9a882 });
    this.suitMat = new THREE.MeshLambertMaterial({ color: 0x2b3842 }); // Formal dark academic suit/shirt
    this.pantsMat = new THREE.MeshLambertMaterial({ color: 0x1f2429 });
    this.hairMat = new THREE.MeshLambertMaterial({ color: 0x777777 }); // Grey receding hair
    this.tieMat = new THREE.MeshLambertMaterial({ color: 0xb22222 }); // Strict red tie
    this.glassesMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
    this.paperMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.penMat = new THREE.MeshLambertMaterial({ color: 0xd50000 }); // Evil red pen

    this.root = new THREE.Group();
    this.group.add(this.root);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.75, 0.95, 0.5);
    this.torso = new THREE.Mesh(torsoGeo, this.suitMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.root.add(this.torso);

    // Red Tie
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.05), this.tieMat);
    tie.position.set(0, -0.05, 0.26);
    this.torso.add(tie);

    // Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.8;
    this.torso.add(this.headGroup);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.54, 0.5), this.skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Receding Grey Hair (sides & back, bald crown)
    const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.52), this.hairMat);
    hairL.position.set(-0.25, 0.05, 0);
    const hairR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.52), this.hairMat);
    hairR.position.set(0.25, 0.05, 0);
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), this.hairMat);
    hairBack.position.set(0, 0.02, -0.24);
    this.headGroup.add(hairL, hairR, hairBack);

    // Thick Academic Glasses
    const glasses = new THREE.Group();
    glasses.position.set(0, 0.06, 0.27);
    this.headGroup.add(glasses);

    const fL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.05), this.glassesMat);
    fL.position.x = -0.12;
    const fR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.05), this.glassesMat);
    fR.position.x = 0.12;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.05), this.glassesMat);
    glasses.add(fL, fR, bridge);

    // Stern Mustache
    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.06), this.hairMat);
    mustache.position.set(0, -0.1, 0.27);
    this.headGroup.add(mustache);

    // Arms
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.48, 0.35, 0);
    this.torso.add(this.leftArm);

    const armGeo = new THREE.BoxGeometry(0.18, 0.75, 0.18);
    const lArmMesh = new THREE.Mesh(armGeo, this.suitMat);
    lArmMesh.position.y = -0.35;
    this.leftArm.add(lArmMesh);

    // Holding Exam Question Papers in left hand
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.04), this.paperMat);
    paper.position.set(0, -0.75, 0.15);
    paper.rotation.x = -0.5;
    this.leftArm.add(paper);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.48, 0.35, 0);
    this.torso.add(this.rightArm);

    const rArmMesh = new THREE.Mesh(armGeo, this.suitMat);
    rArmMesh.position.y = -0.35;
    this.rightArm.add(rArmMesh);

    // Holding Red Grading Pen in right hand
    const redPen = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), this.penMat);
    redPen.position.set(0, -0.75, 0.1);
    redPen.rotation.x = 1.2;
    this.rightArm.add(redPen);

    // Legs
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.88, 0);
    this.root.add(this.leftLeg);

    const legGeo = new THREE.BoxGeometry(0.22, 0.88, 0.24);
    const lLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    lLegMesh.position.y = -0.44;
    this.leftLeg.add(lLegMesh);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.88, 0);
    this.root.add(this.rightLeg);

    const rLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    rLegMesh.position.y = -0.44;
    this.rightLeg.add(rLegMesh);

    this.animTime = 0;
    this.throwTimer = 0;
  }

  triggerThrow() {
    this.throwTimer = 0.65;
  }

  update(delta, mode = 'CHASE', speed = 12) {
    this.animTime += delta * (speed * 0.9);
    if (this.throwTimer > 0) {
      this.throwTimer -= delta;
    }

    if (mode === 'CHASE') {
      // Comical frantic pursuit run: waving papers, shaking pen
      const stride = Math.sin(this.animTime);
      this.leftLeg.rotation.x = stride * 0.85;
      this.rightLeg.rotation.x = -stride * 0.85;

      if (this.throwTimer > 0) {
        // Dramatic overhead book toss
        this.leftArm.rotation.x = -2.8 + Math.cos(this.throwTimer * 8) * 1.5;
        this.leftArm.rotation.z = -0.4;
      } else {
        this.leftArm.rotation.x = -stride * 0.8 + 0.3;
        this.leftArm.rotation.z = 0;
      }

      this.rightArm.rotation.x = stride * 0.9 - 0.4;
      this.rightArm.rotation.z = Math.sin(this.animTime * 2) * 0.3;

      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.animTime * 2)) * 0.1;
      this.torso.rotation.x = 0.2; // Aggressive forward lean
      this.torso.rotation.z = Math.sin(this.animTime) * 0.12;

      this.headGroup.rotation.y = Math.sin(this.animTime) * 0.2;
      this.root.position.y = 0;
      this.root.rotation.set(0, 0, 0);

    } else if (mode === 'STAND_ANGRY') {
      // Standing and furiously waving red pen
      this.torso.position.y = 1.35;
      this.torso.rotation.set(0, 0, 0);
      this.leftLeg.rotation.set(0, 0, 0);
      this.rightLeg.rotation.set(0, 0, 0);

      this.rightArm.rotation.x = -1.8 + Math.sin(this.animTime * 2) * 0.4;
      this.leftArm.rotation.x = -0.8;
      this.headGroup.rotation.y = Math.sin(this.animTime) * 0.2;

    } else if (mode === 'DEFEATED') {
      // Comically tripping, spinning around and scrambling away
      this.root.rotation.x = -0.6;
      this.root.rotation.z += delta * 4;
      this.root.position.y = 0.3 + Math.sin(this.animTime * 4) * 0.2;
      this.leftArm.rotation.x = 2.0;
      this.rightArm.rotation.x = 2.0;
    }
  }
}
