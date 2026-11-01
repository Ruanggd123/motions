/**
 * StylizedCharacter.js
 * Personagem 3D Estilizado de Alta Fidelidade (Padrão Pixar / Chibi Moderno)
 * 
 * - Articulação 100% contínua e sem frestas ou cortes estranhos nas juntas
 * - Cabelo com corte moderno em franja lateral esculpida e mechas volumosas
 * - Moletom streetwear com gola drapeada, cordões dourados e bolso frontal
 * - Calça jeans anatômica e tênis chunky streetwear
 * - Caneca de café em cerâmica com arte latte
 */

export function createStylizedCharacter(THREE) {
    const root = new THREE.Group();
    root.name = "CharacterRoot";

    const squashPivot = new THREE.Group();
    squashPivot.name = "CharacterSquashPivot";
    root.add(squashPivot);

    // ==========================================
    // 1. MATERIAIS DE ALTA QUALIDADE
    // ==========================================
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffdfc4,
        roughness: 0.45,
        metalness: 0.02
    });

    const blushMat = new THREE.MeshStandardMaterial({
        color: 0xf87171,
        transparent: true,
        opacity: 0.45,
        roughness: 0.6
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723, // Castanho escuro elegante
        roughness: 0.35,
        metalness: 0.08
    });

    const hoodieMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Azul Royal vibrante
        roughness: 0.70,
        metalness: 0.04
    });

    const hoodieTrimMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.82
    });

    const hoodieInnerMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.6
    });

    const cordMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5
    });

    const agletMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.85,
        roughness: 0.2
    });

    const pantsMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Jeans Índigo escuro
        roughness: 0.80
    });

    const sneakerSoleMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.35
    });

    const sneakerAccentMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.45
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.08
    });

    const irisMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.12
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0f1d });
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyebrowMat = new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.5 });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });

    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.05 });
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3b1d11, roughness: 0.12 });

    // ==========================================
    // 2. CORPO, PELVIS CONTÍNUA E MOLETOM
    // ==========================================
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.66;
    squashPivot.add(pelvis);

    // Bloco anatômico da cintura/pelve em jeans (Elimina qualquer vão entre camisa e calça!)
    const pelvisBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.18, 0.14, 20),
        pantsMat
    );
    pelvisBase.position.y = 0.02;
    pelvisBase.castShadow = true;
    pelvis.add(pelvisBase);

    const torso = new THREE.Group();
    pelvis.add(torso);

    // Corpo Cilíndrico suave do Moletom
    const torsoBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.23, 0.46, 24),
        hoodieMat
    );
    torsoBody.position.y = 0.24;
    torsoBody.castShadow = true;
    torsoBody.receiveShadow = true;
    torso.add(torsoBody);

    // Barra elástica inferior sobreposta ao jeans
    const waistRib = new THREE.Mesh(
        new THREE.CylinderGeometry(0.235, 0.235, 0.07, 24),
        hoodieTrimMat
    );
    waistRib.position.y = 0.04;
    torso.add(waistRib);

    // Bolso Canguru Frontal
    const pouch = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.16, 0.11),
        hoodieMat
    );
    pouch.position.set(0, 0.17, 0.18);
    pouch.rotation.x = -0.06;
    torso.add(pouch);

    // Gola / Capuz Volumoso Dobrado nas Costas
    const hoodCollar = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.06, 12, 24, Math.PI * 1.5),
        hoodieMat
    );
    hoodCollar.position.set(0, 0.46, -0.04);
    hoodCollar.rotation.x = Math.PI * 0.45;
    hoodCollar.rotation.z = Math.PI * 0.75;
    torso.add(hoodCollar);

    const hoodLining = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.02, 8, 20),
        hoodieInnerMat
    );
    hoodLining.position.set(0, 0.46, 0.02);
    hoodLining.rotation.x = Math.PI * 0.5;
    torso.add(hoodLining);

    // Cordões pendurados com ponteiras metálicas
    function createDrawstring(xPos) {
        const cGroup = new THREE.Group();
        cGroup.position.set(xPos, 0.42, 0.21);

        const cord = new THREE.Mesh(
            new THREE.CylinderGeometry(0.010, 0.010, 0.18, 8),
            cordMat
        );
        cord.position.y = -0.09;
        cGroup.add(cord);

        const aglet = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.014, 0.035, 8),
            agletMat
        );
        aglet.position.y = -0.19;
        cGroup.add(aglet);

        return cGroup;
    }
    torso.add(createDrawstring(-0.06), createDrawstring(0.06));

    // ==========================================
    // 3. CABEÇA, ROSTO E CABELO MODERNO ESCULPIDO
    // ==========================================
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 0.10, 16),
        skinMat
    );
    neck.position.y = 0.48;
    torso.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.68;
    torso.add(headGroup);

    // Crânio esculpido proporcional
    const headMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 32, 32),
        skinMat
    );
    headMesh.scale.set(1.0, 1.05, 1.02);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Orelhas
    function createEar(sign) {
        const ear = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 12, 12),
            skinMat
        );
        ear.scale.set(0.45, 1.0, 0.75);
        ear.position.set(sign * 0.245, 0.01, -0.02);
        return ear;
    }
    headGroup.add(createEar(-1), createEar(1));

    // Bochechas coradas (Blush)
    function createBlush(sign) {
        const b = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 10, 10),
            blushMat
        );
        b.scale.set(1.0, 0.45, 0.25);
        b.position.set(sign * 0.14, -0.04, 0.21);
        return b;
    }
    headGroup.add(createBlush(-1), createBlush(1));

    // Nariz sutil
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 12, 12),
        skinMat
    );
    nose.position.set(0, -0.01, 0.245);
    headGroup.add(nose);

    // CABELO MODERNO COM FRANJA LATERAL ESCULPIDA (SEM TRUFAS / ESPINHOS)
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    // Cúpula superior e traseira do cabelo
    const hairDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.258, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.60),
        hairMat
    );
    hairDome.position.set(0, 0.04, -0.015);
    hairGroup.add(hairDome);

    // Volume superior com corte levemente texturizado
    const hairTopVolume = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 20, 20),
        hairMat
    );
    hairTopVolume.scale.set(1.04, 0.70, 1.12);
    hairTopVolume.position.set(0, 0.17, 0.01);
    hairTopVolume.rotation.x = -0.12;
    hairGroup.add(hairTopVolume);

    // Franja Lateral Contínua e Elegante (Curva esculpida sobre a testa)
    const fringeMain = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.055, 10, 20, Math.PI * 0.75),
        hairMat
    );
    fringeMain.position.set(0.04, 0.13, 0.18);
    fringeMain.rotation.set(0.35, 0.15, -0.45);
    hairGroup.add(fringeMain);

    // Mecha suave de destaque na franja
    const fringeAccent = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 14, 14),
        hairMat
    );
    fringeAccent.scale.set(1.4, 0.65, 0.7);
    fringeAccent.position.set(-0.06, 0.15, 0.22);
    fringeAccent.rotation.set(0.2, -0.1, -0.3);
    hairGroup.add(fringeAccent);

    // Mechas laterais suaves junto às orelhas
    const sideHairL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), hairMat);
    sideHairL.scale.set(0.5, 1.2, 0.8);
    sideHairL.position.set(-0.24, 0.06, 0.04);
    hairGroup.add(sideHairL);

    const sideHairR = sideHairL.clone();
    sideHairR.position.x = 0.24;
    hairGroup.add(sideHairR);

    // ==========================================
    // 4. OLHOS PIXAR EXPRESSIVOS COM BRILHO DUPLO
    // ==========================================
    function createPixarEye(sign) {
        const eye = new THREE.Group();
        eye.position.set(sign * 0.088, 0.03, 0.215);

        const white = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), eyeWhiteMat);
        white.scale.set(0.85, 1.1, 0.45);
        eye.add(white);

        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), irisMat);
        iris.scale.set(0.85, 1.05, 0.35);
        iris.position.set(0, 0, 0.016);
        eye.add(iris);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.020, 14, 14), pupilMat);
        pupil.scale.set(0.85, 1.0, 0.3);
        pupil.position.set(0, 0, 0.025);
        eye.add(pupil);

        const spark1 = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), sparkMat);
        spark1.position.set(0.009, 0.012, 0.032);
        eye.add(spark1);

        const spark2 = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), sparkMat);
        spark2.position.set(-0.008, -0.010, 0.032);
        eye.add(spark2);

        return eye;
    }
    const leftEye = createPixarEye(-1);
    const rightEye = createPixarEye(1);
    headGroup.add(leftEye, rightEye);

    // Sobrancelhas anatômicas
    function createEyebrow(sign) {
        const eb = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.016, 0.025), eyebrowMat);
        eb.position.set(sign * 0.09, 0.10, 0.228);
        eb.rotation.z = sign * -0.15;
        return eb;
    }
    const leftEyebrow = createEyebrow(-1);
    const rightEyebrow = createEyebrow(1);
    headGroup.add(leftEyebrow, rightEyebrow);

    // Boca expressiva (Sorriso & 'O' de Surpresa)
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.08, 0.228);
    headGroup.add(mouthGroup);

    const mouthSmile = new THREE.Mesh(
        new THREE.TorusGeometry(0.032, 0.009, 8, 16, Math.PI),
        mouthMat
    );
    mouthSmile.rotation.z = Math.PI;
    mouthGroup.add(mouthSmile);

    const mouthSurprise = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.009, 8, 16),
        mouthMat
    );
    mouthSurprise.visible = false;
    mouthGroup.add(mouthSurprise);

    // ==========================================
    // 5. BRAÇOS, JUNTAS ESFÉRICAS E CANECA DE CERÂMICA
    // ==========================================
    function createArm(isLeft) {
        const sign = isLeft ? -1 : 1;
        const shoulderPivot = new THREE.Group();
        shoulderPivot.position.set(sign * 0.22, 0.40, 0.0);

        // Ombro arredondado embutido
        const shoulderCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.072, 14, 14),
            hoodieMat
        );
        shoulderPivot.add(shoulderCap);

        // Braço superior contínuo
        const upperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.050, 0.22, 14),
            hoodieMat
        );
        upperArm.position.y = -0.11;
        upperArm.castShadow = true;
        shoulderPivot.add(upperArm);

        // Cotovelo com esfera de articulação
        const elbowPivot = new THREE.Group();
        elbowPivot.position.y = -0.22;
        shoulderPivot.add(elbowPivot);

        const elbowCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.050, 12, 12),
            hoodieMat
        );
        elbowPivot.add(elbowCap);

        // Antebraço
        const forearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.050, 0.044, 0.18, 14),
            hoodieMat
        );
        forearm.position.y = -0.09;
        forearm.castShadow = true;
        elbowPivot.add(forearm);

        // Punho elástico
        const cuff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.048, 0.048, 0.04, 14),
            hoodieTrimMat
        );
        cuff.position.y = -0.18;
        elbowPivot.add(cuff);

        // Mão estilizada esculpida
        const hand = new THREE.Mesh(
            new THREE.SphereGeometry(0.044, 14, 14),
            skinMat
        );
        hand.scale.set(0.9, 1.1, 0.9);
        hand.position.y = -0.22;
        elbowPivot.add(hand);

        return { shoulderPivot, elbowPivot, hand };
    }

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    torso.add(leftArm.shoulderPivot, rightArm.shoulderPivot);

    // Caneca de Café Cerâmica com Alça e Líquido
    const mugGroup = new THREE.Group();
    mugGroup.position.set(0.04, -0.02, 0.06);
    rightArm.hand.add(mugGroup);

    const mugBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.040, 0.10, 18),
        ceramicMat
    );
    mugBody.castShadow = true;
    mugGroup.add(mugBody);

    const mugLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.041, 0.041, 0.015, 16),
        coffeeMat
    );
    mugLiquid.position.y = 0.045;
    mugGroup.add(mugLiquid);

    const mugHandle = new THREE.Mesh(
        new THREE.TorusGeometry(0.030, 0.009, 8, 14, Math.PI * 1.2),
        ceramicMat
    );
    mugHandle.position.set(0.048, 0, 0);
    mugHandle.rotation.y = Math.PI * 0.5;
    mugGroup.add(mugHandle);

    // ==========================================
    // 6. PERNAS, JEANS ANATÔMICO E TÊNIS CHUNKY
    // ==========================================
    function createLeg(isLeft) {
        const sign = isLeft ? -1 : 1;
        const hipPivot = new THREE.Group();
        hipPivot.position.set(sign * 0.10, -0.02, 0.0);

        // Capuz da articulação do quadril (Encaixa 100% dentro da pelve sem fresta!)
        const hipJointCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.076, 14, 14),
            pantsMat
        );
        hipPivot.add(hipJointCap);

        // Coxa em jeans
        const thigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.076, 0.068, 0.32, 16),
            pantsMat
        );
        thigh.position.y = -0.16;
        thigh.castShadow = true;
        hipPivot.add(thigh);

        // Joelho Pivot com Esfera de Articulação (Zero furos ao flexionar!)
        const kneePivot = new THREE.Group();
        kneePivot.position.y = -0.32;
        hipPivot.add(kneePivot);

        const kneeCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.068, 14, 14),
            pantsMat
        );
        kneePivot.add(kneeCap);

        // Canela em jeans
        const shin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.068, 0.060, 0.30, 16),
            pantsMat
        );
        shin.position.y = -0.15;
        shin.castShadow = true;
        kneePivot.add(shin);

        // Barra da calça dobrada sobre o tênis
        const pantsCuff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.068, 0.068, 0.04, 16),
            pantsMat
        );
        pantsCuff.position.y = -0.29;
        kneePivot.add(pantsCuff);

        // TÊNIS CHUNKY STREETWEAR
        const shoe = new THREE.Group();
        shoe.position.set(0, -0.31, 0.04);
        kneePivot.add(shoe);

        // Sola plataforma grossa
        const sole = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.055, 0.22),
            sneakerSoleMat
        );
        sole.position.set(0, -0.025, 0.02);
        sole.castShadow = true;
        shoe.add(sole);

        // Corpo estilizado do tênis
        const upper = new THREE.Mesh(
            new THREE.BoxGeometry(0.11, 0.075, 0.20),
            sneakerAccentMat
        );
        upper.position.set(0, 0.035, 0.015);
        shoe.add(upper);

        // Biqueira frontal branca
        const toeCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 12, 10),
            sneakerSoleMat
        );
        toeCap.scale.set(1.0, 0.6, 0.8);
        toeCap.position.set(0, 0.025, 0.095);
        shoe.add(toeCap);

        return { hipPivot, kneePivot, shoe };
    }

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    pelvis.add(leftLeg.hipPivot, rightLeg.hipPivot);

    return {
        root,
        squashPivot,
        pelvis,
        torso,
        headGroup,
        leftEye,
        rightEye,
        leftEyebrow,
        rightEyebrow,
        mouthSmile,
        mouthSurprise,
        leftArm,
        rightArm,
        mugGroup,
        leftLeg,
        rightLeg,
        setEmotion: (emotion) => {
            if (emotion === 'shock' || emotion === 'panic') {
                mouthSmile.visible = false;
                mouthSurprise.visible = true;
                leftEyebrow.rotation.z = 0.35;
                rightEyebrow.rotation.z = -0.35;
                leftEyebrow.position.y = 0.13;
                rightEyebrow.position.y = 0.13;
            } else if (emotion === 'happy' || emotion === 'calm') {
                mouthSmile.visible = true;
                mouthSurprise.visible = false;
                leftEyebrow.rotation.z = -0.15;
                rightEyebrow.rotation.z = 0.15;
                leftEyebrow.position.y = 0.10;
                rightEyebrow.position.y = 0.10;
            }
        }
    };
}
