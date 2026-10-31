/**
 * StylizedHero.js
 * Personagem 3D Estilizado de Alta Fidelidade (Padrão Pixar / Chibi Moderno)
 * 
 * Estrutura:
 * - Cabeça esculpida com bochechas coradas e orelhas
 * - Cabelo volumoso em mechas em camadas com reflexo especular
 * - Olhos expressivos com íris azul safira, pupila e duplo brilho reflexivo
 * - Sobrancelhas dinâmicas 3D para expressões faciais (calmo, surpreso, pânico, alívio)
 * - Boca expressiva articulada
 * - Moletom streetwear com capuz drapeado nas costas, cordões com ponteiras metálicas e bolso canguru
 * - Calça jogger com vincos anatômicos
 * - Tênis chunky streetwear com sola plataforma grossa e detalhes coloridos
 * - Caneca de café em cerâmica com arte latte e vapor flutuante
 */

export function createStylizedHero(THREE) {
    const heroGroup = new THREE.Group();
    heroGroup.name = "HeroRoot";

    const pivot = new THREE.Group();
    pivot.name = "HeroSquashPivot";
    heroGroup.add(pivot);

    // ==========================================
    // MATERIAIS DE ALTA FIDELIDADE
    // ==========================================
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffdfc4,
        roughness: 0.42,
        metalness: 0.05
    });

    const blushMat = new THREE.MeshStandardMaterial({
        color: 0xf87171,
        transparent: true,
        opacity: 0.42,
        roughness: 0.6
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: 0x2b1810,
        roughness: 0.28,
        metalness: 0.12
    });

    const hoodieMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8, // Azul celeste vibrante
        roughness: 0.78,
        metalness: 0.05
    });

    const hoodieTrimMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.85
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
        color: 0x1e293b, // Slate escuro
        roughness: 0.8
    });

    const sneakerSoleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35
    });

    const sneakerAccentMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.4
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.05
    });

    const irisMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8, // Safira profundo
        roughness: 0.1
    });

    const pupilMat = new THREE.MeshBasicMaterial({
        color: 0x0a0f1d
    });

    const specularSparkMat = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    const eyebrowMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b18,
        roughness: 0.4
    });

    const mouthMat = new THREE.MeshBasicMaterial({
        color: 0x991b1b
    });

    const mugCeramicMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.12,
        metalness: 0.05
    });

    const coffeeLiquidMat = new THREE.MeshStandardMaterial({
        color: 0x3d1c06,
        roughness: 0.15
    });

    const latteArtMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        roughness: 0.3
    });

    // ==========================================
    // CORPO & TORSO (MOLETOM STREETWEAR)
    // ==========================================
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.72;
    pivot.add(pelvis);

    const torso = new THREE.Group();
    pelvis.add(torso);

    // Moletom - Tronco cônico estilizado
    const hoodieBodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.52, 24);
    const hoodieBody = new THREE.Mesh(hoodieBodyGeo, hoodieMat);
    hoodieBody.position.y = 0.26;
    hoodieBody.castShadow = true;
    hoodieBody.receiveShadow = true;
    torso.add(hoodieBody);

    // Barra elástica inferior do moletom
    const waistRibGeo = new THREE.CylinderGeometry(0.285, 0.285, 0.07, 24);
    const waistRib = new THREE.Mesh(waistRibGeo, hoodieTrimMat);
    waistRib.position.y = 0.02;
    torso.add(waistRib);

    // Bolso Canguru frontal
    const pouchGeo = new THREE.BoxGeometry(0.28, 0.18, 0.12);
    const pouch = new THREE.Mesh(pouchGeo, hoodieMat);
    pouch.position.set(0, 0.18, 0.20);
    pouch.rotation.x = -0.08;
    torso.add(pouch);

    // Capuz drapeado nas costas (3D)
    const hoodDrapeGeo = new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hoodDrape = new THREE.Mesh(hoodDrapeGeo, hoodieMat);
    hoodDrape.position.set(0, 0.46, -0.16);
    hoodDrape.rotation.x = 2.2;
    torso.add(hoodDrape);

    // Cordões do capuz pendurados
    function createDrawstring(xPos) {
        const cordGroup = new THREE.Group();
        cordGroup.position.set(xPos, 0.44, 0.24);

        const cordGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8);
        const cord = new THREE.Mesh(cordGeo, cordMat);
        cord.position.y = -0.11;
        cordGroup.add(cord);

        const agletGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 8);
        const aglet = new THREE.Mesh(agletGeo, agletMat);
        aglet.position.y = -0.23;
        cordGroup.add(aglet);

        return cordGroup;
    }
    const leftCord = createDrawstring(-0.07);
    const rightCord = createDrawstring(0.07);
    torso.add(leftCord);
    torso.add(rightCord);

    // ==========================================
    // PESCOÇO & CABEÇA ESTILIZADA
    // ==========================================
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.10, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.54;
    torso.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.72;
    torso.add(headGroup);

    // Crânio / Rosto
    const headGeo = new THREE.SphereGeometry(0.32, 28, 28);
    headGeo.scale(1.0, 1.08, 1.02);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Bochechas coradas
    const blushGeo = new THREE.SphereGeometry(0.075, 12, 12);
    blushGeo.scale(1, 0.5, 0.3);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.19, -0.05, 0.26);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.19, -0.05, 0.26);
    headGroup.add(rightBlush);

    // Orelhas
    const earGeo = new THREE.SphereGeometry(0.07, 12, 12);
    earGeo.scale(0.5, 1, 0.7);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.33, 0.02, 0.0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.33, 0.02, 0.0);
    headGroup.add(rightEar);

    // Cabelo moderno volumoso em camadas
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    // Cúpula superior do cabelo
    const hairCapGeo = new THREE.SphereGeometry(0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.06, -0.02);
    hairGroup.add(hairCap);

    // Mechas frontais estilizadas (Franja)
    for (let i = -2; i <= 2; i++) {
        const lockGeo = new THREE.ConeGeometry(0.08, 0.18, 8);
        const lock = new THREE.Mesh(lockGeo, hairMat);
        lock.position.set(i * 0.09, 0.28, 0.25 - Math.abs(i) * 0.03);
        lock.rotation.set(0.65, 0, i * -0.22);
        hairGroup.add(lock);
    }

    // ==========================================
    // OLHOS PIXAR VIBRANTES COM BRILHO DUPLO
    // ==========================================
    function createExpressiveEye(isLeft) {
        const eyeGroup = new THREE.Group();
        const eyeX = isLeft ? -0.12 : 0.12;
        eyeGroup.position.set(eyeX, 0.05, 0.27);

        // Esclera branca
        const scleraGeo = new THREE.SphereGeometry(0.075, 16, 16);
        scleraGeo.scale(0.85, 1.15, 0.5);
        const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
        eyeGroup.add(sclera);

        // Íris Azul Safira
        const irisGeo = new THREE.CircleGeometry(0.046, 16);
        const iris = new THREE.Mesh(irisGeo, irisMat);
        iris.position.set(0, 0, 0.038);
        eyeGroup.add(iris);

        // Pupila
        const pupilGeo = new THREE.CircleGeometry(0.028, 16);
        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        pupil.position.set(0, 0, 0.040);
        eyeGroup.add(pupil);

        // Brilho especular 1 (Maior)
        const spark1Geo = new THREE.CircleGeometry(0.014, 10);
        const spark1 = new THREE.Mesh(spark1Geo, specularSparkMat);
        spark1.position.set(0.016, 0.016, 0.042);
        eyeGroup.add(spark1);

        // Brilho especular 2 (Menor)
        const spark2Geo = new THREE.CircleGeometry(0.007, 8);
        const spark2 = new THREE.Mesh(spark2Geo, specularSparkMat);
        spark2.position.set(-0.014, -0.014, 0.042);
        eyeGroup.add(spark2);

        return eyeGroup;
    }
    const leftEye = createExpressiveEye(true);
    const rightEye = createExpressiveEye(false);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Sobrancelhas articuladas 3D
    function createEyebrow(isLeft) {
        const browGroup = new THREE.Group();
        const xPos = isLeft ? -0.13 : 0.13;
        browGroup.position.set(xPos, 0.17, 0.28);

        const browGeo = new THREE.BoxGeometry(0.095, 0.024, 0.03);
        const brow = new THREE.Mesh(browGeo, eyebrowMat);
        browGroup.add(brow);
        return browGroup;
    }
    const leftEyebrow = createEyebrow(true);
    const rightEyebrow = createEyebrow(false);
    headGroup.add(leftEyebrow);
    headGroup.add(rightEyebrow);

    // Boca expressiva (Torus + plano interno)
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.10, 0.28);

    const mouthMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.014, 8, 18, Math.PI),
        mouthMat
    );
    mouthMesh.rotation.z = Math.PI; // Padrão: Sorriso
    mouthGroup.add(mouthMesh);
    headGroup.add(mouthGroup);

    // ==========================================
    // BRAÇOS ARTICULADOS & CANECA DE CAFÉ
    // ==========================================
    function createArm(isLeft) {
        const armPivot = new THREE.Group();
        const sideSign = isLeft ? -1 : 1;
        armPivot.position.set(sideSign * 0.30, 0.45, 0.0);

        // Ombro / Braço superior
        const upperArmGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.26, 12);
        const upperArm = new THREE.Mesh(upperArmGeo, hoodieMat);
        upperArm.position.y = -0.13;
        armPivot.add(upperArm);

        // Cotovelo / Antebraço
        const forearmPivot = new THREE.Group();
        forearmPivot.position.y = -0.26;
        armPivot.add(forearmPivot);

        const forearmGeo = new THREE.CylinderGeometry(0.065, 0.060, 0.24, 12);
        const forearm = new THREE.Mesh(forearmGeo, hoodieMat);
        forearm.position.y = -0.12;
        forearmPivot.add(forearm);

        // Punho elástico
        const cuffGeo = new THREE.CylinderGeometry(0.066, 0.066, 0.045, 12);
        const cuff = new THREE.Mesh(cuffGeo, hoodieTrimMat);
        cuff.position.y = -0.22;
        forearmPivot.add(cuff);

        // Mão esculpida
        const handGeo = new THREE.SphereGeometry(0.055, 12, 12);
        handGeo.scale(0.85, 1.1, 0.85);
        const hand = new THREE.Mesh(handGeo, skinMat);
        hand.position.y = -0.27;
        forearmPivot.add(hand);

        return { armPivot, forearmPivot, hand };
    }

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    torso.add(leftArm.armPivot);
    torso.add(rightArm.armPivot);

    // Caneca de Café Cerâmica com Latte Art e Vapor
    const mugGroup = new THREE.Group();
    mugGroup.name = "CoffeeMug";
    rightArm.hand.add(mugGroup);
    mugGroup.position.set(0.06, -0.04, 0.08);

    // Corpo da caneca
    const mugGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.12, 16);
    const mug = new THREE.Mesh(mugGeo, mugCeramicMat);
    mug.castShadow = true;
    mugGroup.add(mug);

    // Alça da caneca
    const handleGeo = new THREE.TorusGeometry(0.038, 0.012, 8, 16, Math.PI * 1.2);
    const handle = new THREE.Mesh(handleGeo, mugCeramicMat);
    handle.position.set(0.07, 0, 0);
    handle.rotation.y = Math.PI / 2;
    mugGroup.add(handle);

    // Líquido de café quente
    const coffeeLiquidGeo = new THREE.CircleGeometry(0.058, 16);
    const coffeeLiquid = new THREE.Mesh(coffeeLiquidGeo, coffeeLiquidMat);
    coffeeLiquid.position.y = 0.058;
    coffeeLiquid.rotation.x = -Math.PI / 2;
    mugGroup.add(coffeeLiquid);

    // Coração Latte Art
    const latteGeo = new THREE.CircleGeometry(0.024, 12);
    const latteArt = new THREE.Mesh(latteGeo, latteArtMat);
    latteArt.position.set(0, 0.059, 0);
    latteArt.rotation.x = -Math.PI / 2;
    mugGroup.add(latteArt);

    // ==========================================
    // PERNAS & TÊNIS CHUNKY STREETWEAR
    // ==========================================
    function createLeg(isLeft) {
        const legPivot = new THREE.Group();
        const sideSign = isLeft ? -1 : 1;
        legPivot.position.set(sideSign * 0.13, 0.0, 0.0);

        // Coxa com calça jogger
        const thighGeo = new THREE.CylinderGeometry(0.095, 0.085, 0.34, 14);
        const thigh = new THREE.Mesh(thighGeo, pantsMat);
        thigh.position.y = -0.17;
        thigh.castShadow = true;
        legPivot.add(thigh);

        // Joelho / Canela
        const shinPivot = new THREE.Group();
        shinPivot.position.y = -0.34;
        legPivot.add(shinPivot);

        const shinGeo = new THREE.CylinderGeometry(0.082, 0.070, 0.32, 14);
        const shin = new THREE.Mesh(shinGeo, pantsMat);
        shin.position.y = -0.16;
        shin.castShadow = true;
        shinPivot.add(shin);

        // Barra dobrada da jogger
        const pantCuffGeo = new THREE.CylinderGeometry(0.074, 0.074, 0.05, 14);
        const pantCuff = new THREE.Mesh(pantCuffGeo, pantsMat);
        pantCuff.position.y = -0.30;
        shinPivot.add(pantCuff);

        // Tênis Chunky Platform
        const sneakerGroup = new THREE.Group();
        sneakerGroup.position.set(0, -0.33, 0.04);
        shinPivot.add(sneakerGroup);

        // Sola Grossa Plataforma
        const soleGeo = new THREE.BoxGeometry(0.12, 0.065, 0.25);
        const sole = new THREE.Mesh(soleGeo, sneakerSoleMat);
        sole.castShadow = true;
        sole.receiveShadow = true;
        sneakerGroup.add(sole);

        // Corpo Superior do Tênis
        const upperGeo = new THREE.BoxGeometry(0.115, 0.085, 0.22);
        const upper = new THREE.Mesh(upperGeo, sneakerAccentMat);
        upper.position.set(0, 0.065, -0.01);
        sneakerGroup.add(upper);

        // Biqueira Branca
        const toeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.065, 12, 1, false, 0, Math.PI);
        const toe = new THREE.Mesh(toeGeo, sneakerSoleMat);
        toe.position.set(0, 0.04, 0.08);
        toe.rotation.x = Math.PI / 2;
        sneakerGroup.add(toe);

        return { legPivot, shinPivot, sneakerGroup };
    }

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    pelvis.add(leftLeg.legPivot);
    pelvis.add(rightLeg.legPivot);

    return {
        root: heroGroup,
        pivot,
        pelvis,
        torso,
        headGroup,
        headMesh,
        hairGroup,
        leftEye,
        rightEye,
        leftEyebrow,
        rightEyebrow,
        mouthMesh,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        mugGroup,
        coffeeLiquid,

        // Função de expressão facial rápida
        setExpression(type) {
            if (type === 'calm') {
                mouthMesh.rotation.z = Math.PI; // Sorriso
                mouthMesh.scale.set(1, 1, 1);
                leftEyebrow.rotation.z = 0.05;
                rightEyebrow.rotation.z = -0.05;
                leftEyebrow.position.y = 0.17;
                rightEyebrow.position.y = 0.17;
            } else if (type === 'shock') {
                mouthMesh.rotation.z = 0; // Boca em 'O' de susto
                mouthMesh.scale.set(1.4, 1.4, 1.4);
                leftEyebrow.rotation.z = -0.35;
                rightEyebrow.rotation.z = 0.35;
                leftEyebrow.position.y = 0.22;
                rightEyebrow.position.y = 0.22;
            } else if (type === 'panic') {
                mouthMesh.rotation.z = 0; // Boca aberta gritando
                mouthMesh.scale.set(1.9, 2.2, 1.4);
                leftEyebrow.rotation.z = -0.55;
                rightEyebrow.rotation.z = 0.55;
                leftEyebrow.position.y = 0.24;
                rightEyebrow.position.y = 0.24;
            } else if (type === 'relief') {
                mouthMesh.rotation.z = Math.PI; // Sorriso de alívio
                mouthMesh.scale.set(1.2, 0.9, 1.0);
                leftEyebrow.rotation.z = 0.1;
                rightEyebrow.rotation.z = -0.1;
                leftEyebrow.position.y = 0.16;
                rightEyebrow.position.y = 0.16;
            }
        }
    };
}
