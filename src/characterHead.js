export function buildCharacterHead(THREE, upperBodyPivot, makePart, makeTaperedLimb, COLORS) {
    const neck = makeTaperedLimb(0.10, 0.062, 0.072, COLORS.skin, 0.009);
    neck.position.set(0, 0.50, 0);
    upperBodyPivot.add(neck);

    const headPivot = new THREE.Group();
    headPivot.name = 'head';
    headPivot.position.set(0, 0.54, 0);
    upperBodyPivot.add(headPivot);

    const skull = makePart(new THREE.SphereGeometry(0.245, 28, 22), COLORS.skin, { outlineWidth: 0.011 });
    skull.scale.set(0.98, 1.04, 0.92);
    skull.position.set(0, 0.21, 0);
    headPivot.add(skull);

    [-1, 1].forEach(side => {
        const ear = makePart(new THREE.SphereGeometry(0.045, 12, 10), COLORS.skin, { outlineWidth: 0.006 });
        ear.position.set(side * 0.238, 0.19, -0.01);
        ear.scale.set(0.42, 0.82, 0.60);
        headPivot.add(ear);
    });

    const nose = makePart(new THREE.SphereGeometry(0.022, 14, 10), COLORS.skin, { outlineWidth: 0.005 });
    nose.position.set(0, 0.178, 0.232);
    headPivot.add(nose);

    const eyesGroup = new THREE.Group();
    eyesGroup.name = 'eyes';
    eyesGroup.position.set(0, 0.215, 0);
    headPivot.add(eyesGroup);

    [-1, 1].forEach(side => {
        const eyeSocket = new THREE.Group();
        eyeSocket.position.set(side * 0.085, 0, 0.218);

        const sclera = makePart(new THREE.SphereGeometry(0.050, 16, 12), 0xffffff, { outlineWidth: 0.005 });
        sclera.scale.set(0.95, 1.12, 0.40);
        eyeSocket.add(sclera);

        const pupilGroup = new THREE.Group();
        pupilGroup.name = side === -1 ? 'leftPupil' : 'rightPupil';

        const iris = makePart(new THREE.SphereGeometry(0.032, 12, 10), 0x6b3e1e, { outline: false });
        iris.scale.set(0.95, 1.08, 0.35);
        iris.position.set(0, 0, 0.013);
        pupilGroup.add(iris);

        const pupil = makePart(new THREE.SphereGeometry(0.018, 10, 8), 0x111118, { outline: false });
        pupil.scale.set(0.95, 1.08, 0.35);
        pupil.position.set(0, 0, 0.019);
        pupilGroup.add(pupil);

        const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        shine1.position.set(0.011, 0.013, 0.029);
        pupilGroup.add(shine1);

        const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        shine2.position.set(-0.009, -0.009, 0.028);
        pupilGroup.add(shine2);

        eyeSocket.add(pupilGroup);

        const eyelid = makePart(new THREE.SphereGeometry(0.052, 14, 10), COLORS.skin, { outline: false });
        eyelid.name = side === -1 ? 'leftEyelid' : 'rightEyelid';
        eyelid.position.set(0, 0.02, 0.015);
        eyelid.scale.set(1.0, 0.01, 0.45);
        eyelid.visible = false;
        eyeSocket.add(eyelid);

        eyesGroup.add(eyeSocket);
    });

    [-1, 1].forEach(side => {
        const browPivot = new THREE.Group();
        browPivot.name = side === -1 ? 'leftBrow' : 'rightBrow';
        browPivot.position.set(side * 0.086, 0.298, 0.224);

        const browMesh = makePart(new THREE.CapsuleGeometry(0.012, 0.056, 8, 10), 0x4a2c18, { outlineWidth: 0.005 });
        browMesh.rotation.z = Math.PI / 2 + side * -0.08;
        browPivot.add(browMesh);

        headPivot.add(browPivot);
    });

    const mouthPivot = new THREE.Group();
    mouthPivot.name = 'mouth';
    mouthPivot.position.set(0, 0.122, 0.225);

    const mouthClosed = makePart(new THREE.CapsuleGeometry(0.006, 0.038, 6, 8), COLORS.mouthDark, { outline: false });
    mouthClosed.rotation.z = Math.PI / 2;
    mouthClosed.name = 'mouthClosed';
    mouthPivot.add(mouthClosed);

    const mouthOpen = makePart(new THREE.SphereGeometry(0.025, 12, 10), COLORS.mouthDark, { outlineWidth: 0.004 });
    mouthOpen.scale.set(0.85, 1.1, 0.4);
    mouthOpen.visible = false;
    mouthOpen.name = 'mouthOpen';
    mouthPivot.add(mouthOpen);

    headPivot.add(mouthPivot);

    const hairGroup = new THREE.Group();
    hairGroup.name = 'hair';
    hairGroup.position.set(0, 0.21, 0);

    const hairCap = makePart(new THREE.SphereGeometry(0.252, 24, 18), 0x4a2c18, { outlineWidth: 0.011 });
    hairCap.position.set(0, 0.085, -0.035);
    hairCap.scale.set(1.04, 0.86, 1.02);
    hairGroup.add(hairCap);

    for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 1.2 - Math.PI * 0.6;
        const strand = makePart(new THREE.CapsuleGeometry(0.042, 0.095, 8, 10), 0x5c3820, { outlineWidth: 0.007 });
        strand.position.set(Math.sin(angle) * 0.14, 0.21 + (i % 2) * 0.02, 0.10 + Math.cos(angle) * 0.08);
        strand.rotation.z = Math.PI / 2 + angle * 0.25;
        strand.rotation.x = -0.2;
        hairGroup.add(strand);
    }

    headPivot.add(hairGroup);
}

