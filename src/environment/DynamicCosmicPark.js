/**
 * DynamicCosmicPark.js
 * Ambiente Dinâmico 3D: Do Parque Ensolarado ao Espaço Cósmico (Estratocanto e Vácuo)
 * 
 * Modos:
 * - Parque Ensolarado (Céu azul, árvores cerejeira, caminho de pedra, banco, poste, hidrante)
 * - Vácuo e Órbita Espacial (Céu preto estrelado, Terra curva gigante no horizonte, nebulosas e detritos flutuantes)
 * - Reentrada e Queda Livre (Linhas de vento/velocidade supersônicas, nuvens velozes e impacto amortecido)
 */

export function createDynamicCosmicPark(THREE, scene) {
    const parkGroup = new THREE.Group();
    parkGroup.name = "ParkElements";
    scene.add(parkGroup);

    const spaceGroup = new THREE.Group();
    spaceGroup.name = "SpaceElements";
    spaceGroup.visible = false;
    scene.add(spaceGroup);

    // ==========================================
    // PARTE 1: CENÁRIO DO PARQUE
    // ==========================================
    // Chão de grama estilizada
    const groundGeo = new THREE.CylinderGeometry(14, 14, 0.6, 48);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x86efac, // Verde menta vivo
        roughness: 0.85,
        metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    parkGroup.add(ground);

    // Colinas decorativas suaves ao fundo
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 });
    const hill1 = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 24), hillMat);
    hill1.position.set(-8, -3.8, -7);
    parkGroup.add(hill1);

    const hill2 = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 24), hillMat);
    hill2.position.set(7, -4.5, -9);
    parkGroup.add(hill2);

    // Caminho de pedras (Cobblestone path)
    const stoneGeo = new THREE.BoxGeometry(0.85, 0.04, 0.42);
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.92
    });
    for (let i = -7; i <= 6; i++) {
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        stone.position.set(
            Math.sin(i * 0.28) * 0.15,
            0.02,
            i * 0.55
        );
        stone.rotation.y = (Math.random() - 0.5) * 0.15;
        stone.receiveShadow = true;
        parkGroup.add(stone);
    }

    // Árvore Cerejeira Sakura Estilizada
    function createSakuraTree(x, z, scale = 1.0) {
        const tree = new THREE.Group();
        tree.position.set(x, 0, z);
        tree.scale.set(scale, scale, scale);

        // Tronco marrom orgânico
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
        const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 2.4, 12);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Copa de flores rosa sakura
        const sakuraMat = new THREE.MeshStandardMaterial({
            color: 0xfbcfe8, // Rosa pastel
            roughness: 0.75
        });
        const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 16), sakuraMat);
        canopy1.position.set(0, 2.5, 0);
        canopy1.castShadow = true;
        tree.add(canopy1);

        const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), sakuraMat);
        canopy2.position.set(0.45, 2.8, 0.35);
        canopy2.castShadow = true;
        tree.add(canopy2);

        const canopy3 = new THREE.Mesh(new THREE.SphereGeometry(0.70, 16, 16), sakuraMat);
        canopy3.position.set(-0.40, 2.65, -0.25);
        canopy3.castShadow = true;
        tree.add(canopy3);

        return tree;
    }

    parkGroup.add(createSakuraTree(-2.8, -1.8, 1.1));
    parkGroup.add(createSakuraTree(3.2, -3.2, 1.25));
    parkGroup.add(createSakuraTree(-3.5, 2.2, 0.95));

    // Banco de Praça Ripada
    const benchGroup = new THREE.Group();
    benchGroup.position.set(1.4, 0, 0.2);
    benchGroup.rotation.y = -0.45;
    parkGroup.add(benchGroup);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });

    // Pés de ferro
    const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.55);
    const leftBenchLeg = new THREE.Mesh(legGeo, ironMat);
    leftBenchLeg.position.set(-0.65, 0.22, 0);
    leftBenchLeg.castShadow = true;
    benchGroup.add(leftBenchLeg);

    const rightBenchLeg = new THREE.Mesh(legGeo, ironMat);
    rightBenchLeg.position.set(0.65, 0.22, 0);
    rightBenchLeg.castShadow = true;
    benchGroup.add(rightBenchLeg);

    // Ripas de madeira do assento e encosto
    const slatGeo = new THREE.BoxGeometry(1.5, 0.04, 0.12);
    for (let s = -1; s <= 1; s++) {
        const slat = new THREE.Mesh(slatGeo, woodMat);
        slat.position.set(0, 0.45, s * 0.14);
        slat.castShadow = true;
        benchGroup.add(slat);
    }
    const backSlatGeo = new THREE.BoxGeometry(1.5, 0.12, 0.04);
    for (let b = 0; b <= 1; b++) {
        const backSlat = new THREE.Mesh(backSlatGeo, woodMat);
        backSlat.position.set(0, 0.65 + b * 0.16, -0.22);
        backSlat.castShadow = true;
        benchGroup.add(backSlat);
    }

    // Poste de Luz Vitoriano
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-1.6, 0, -0.6);
    parkGroup.add(lampGroup);

    const lampPostGeo = new THREE.CylinderGeometry(0.06, 0.12, 2.8, 12);
    const lampPost = new THREE.Mesh(lampPostGeo, ironMat);
    lampPost.position.y = 1.4;
    lampPost.castShadow = true;
    lampGroup.add(lampPost);

    const lanternGeo = new THREE.BoxGeometry(0.3, 0.45, 0.3);
    const lanternMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfef08a,
        emissiveIntensity: 0.6,
        roughness: 0.1
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 2.85;
    lampGroup.add(lantern);

    // Hidrante Clássico Vermelho
    const hydrantGroup = new THREE.Group();
    hydrantGroup.position.set(-1.3, 0, 1.4);
    parkGroup.add(hydrantGroup);

    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, metalness: 0.2 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });

    const hydrantBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.55, 16), redMat);
    hydrantBody.position.y = 0.27;
    hydrantBody.castShadow = true;
    hydrantGroup.add(hydrantBody);

    const hydrantTop = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), redMat);
    hydrantTop.position.y = 0.54;
    hydrantGroup.add(hydrantTop);

    const capL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), silverMat);
    capL.position.set(-0.14, 0.35, 0);
    capL.rotation.z = Math.PI / 2;
    hydrantGroup.add(capL);

    const capR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), silverMat);
    capR.position.set(0.14, 0.35, 0);
    capR.rotation.z = Math.PI / 2;
    hydrantGroup.add(capR);

    // Folhas flutuantes no parque
    const leafGeo = new THREE.ConeGeometry(0.06, 0.14, 4);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });
    const leaves = [];
    for (let i = 0; i < 28; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const lx = (Math.random() - 0.5) * 6;
        const lz = (Math.random() - 0.5) * 6;
        const ly = 0.05 + Math.random() * 0.15;
        leaf.position.set(lx, ly, lz);
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        parkGroup.add(leaf);
        leaves.push({
            mesh: leaf,
            initY: ly,
            speed: 0.3 + Math.random() * 0.45,
            rotSpeed: 0.8 + Math.random() * 1.2
        });
    }

    // Gotas de Café em Suspensão Zero-G
    const blobGeo = new THREE.SphereGeometry(0.024, 10, 10);
    const coffeeBlobs = [];
    for (let i = 0; i < 9; i++) {
        const b = new THREE.Mesh(blobGeo, new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.1 }));
        b.visible = false;
        scene.add(b);
        coffeeBlobs.push(b);
    }

    // ==========================================
    // PARTE 2: ESPAÇO SIDERAL & ESTRATOSFERA (QUADROS 5 A 8)
    // ==========================================
    // Campo de Estrelas Cintilantes (2.500 partículas)
    const starCount = 2200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const radius = 25 + Math.random() * 45;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = Math.abs(radius * Math.sin(phi) * Math.sin(theta)) + 1.0; // Mais estrelas para o alto
        starPos[i * 3 + 2] = radius * Math.cos(phi);

        // Tons de estrelas: branco, azul-celeste, âmbar suave
        const cType = Math.random();
        if (cType > 0.8) {
            starColors[i * 3] = 0.6; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
        } else if (cType > 0.65) {
            starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.7;
        } else {
            starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
        }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.0
    });
    const starField = new THREE.Points(starGeo, starMat);
    spaceGroup.add(starField);

    // Globo da Terra Curva no Horizonte Inferior
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -32, -8);
    spaceGroup.add(earthGroup);

    const earthGeo = new THREE.SphereGeometry(30, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Oceano azul profundo
        roughness: 0.45,
        metalness: 0.1
    });
    const earthSphere = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthSphere);

    // Brilho Atmosférico Azul na Curvatura
    const atmoGeo = new THREE.SphereGeometry(30.6, 48, 48);
    const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmoSphere = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoSphere);

    // ==========================================
    // PARTE 3: REENTRADA, ONDA DE CHOQUE E LINHAS DE VENTO
    // ==========================================
    // Anel de Onda Gravitacional
    const shockRingGeo = new THREE.RingGeometry(0.3, 0.85, 48);
    shockRingGeo.rotateX(-Math.PI / 2);
    const shockRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
    });
    const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
    shockRing.position.set(0, 0.05, 0);
    scene.add(shockRing);

    // Linhas de Vento / Velocidade da Queda Livre (Beats 9-10)
    const windLineCount = 65;
    const windGeo = new THREE.BufferGeometry();
    const windPos = new Float32Array(windLineCount * 6);
    for (let i = 0; i < windLineCount; i++) {
        const wx = (Math.random() - 0.5) * 3.5;
        const wz = (Math.random() - 0.5) * 3.5;
        const wy = Math.random() * 8;
        windPos[i * 6] = wx; windPos[i * 6 + 1] = wy; windPos[i * 6 + 2] = wz;
        windPos[i * 6 + 3] = wx; windPos[i * 6 + 4] = wy + 1.2; windPos[i * 6 + 5] = wz;
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
    const windMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0
    });
    const windLines = new THREE.LineSegments(windGeo, windMat);
    scene.add(windLines);

    return {
        parkGroup,
        spaceGroup,
        benchGroup,
        hydrantGroup,
        lampGroup,
        leaves,
        coffeeBlobs,
        starField,
        starMat,
        earthGroup,
        shockRing,
        shockRingMat,
        windLines,
        windMat,

        // Função de transição ambiental contínua
        updateEnvironment(t, mode, u, timeInBeat) {
            // Rotação suave da Terra no horizonte cósmico
            earthGroup.rotation.y = t * 0.04;
            earthGroup.rotation.z = Math.sin(t * 0.03) * 0.08;

            // Transição para o Espaço Cósmico (Beats 5 a 8: personFloating, risingFast, fullZeroG, vacuumPanic, apexHeight)
            const isCosmic = (mode === 'fullZeroG' || mode === 'vacuumPanic' || mode === 'apexHeight' || mode === 'risingFast');

            if (isCosmic) {
                spaceGroup.visible = true;
                const cosmicIntensity = mode === 'risingFast' ? u : (mode === 'apexHeight' ? 1.0 : 0.85);

                // Céu escurece para o vácuo espacial profundo
                const skyR = 0.75 * (1 - cosmicIntensity) + 0.01 * cosmicIntensity;
                const skyG = 0.88 * (1 - cosmicIntensity) + 0.02 * cosmicIntensity;
                const skyB = 0.97 * (1 - cosmicIntensity) + 0.06 * cosmicIntensity;
                scene.background.setRGB(skyR, skyG, skyB);
                scene.fog.color.setRGB(skyR, skyG, skyB);
                scene.fog.near = 12 * (1 - cosmicIntensity) + 40 * cosmicIntensity;
                scene.fog.far = 28 * (1 - cosmicIntensity) + 85 * cosmicIntensity;

                starMat.opacity = cosmicIntensity * 0.95;

                // Parque afasta-se para baixo e ganha transparência atmosférica
                parkGroup.position.y = -cosmicIntensity * 3.8;
                earthGroup.position.y = -34 + cosmicIntensity * 8.5;
            } else if (mode === 'gravitySnap' || mode === 'fallingFast') {
                // Reentrada atmosférica rápida
                spaceGroup.visible = true;
                const fallProgress = timeInBeat / 4.0;
                const returnRatio = Math.max(0, 1.0 - fallProgress);

                scene.background.setRGB(
                    0.01 * returnRatio + 0.75 * (1 - returnRatio),
                    0.02 * returnRatio + 0.88 * (1 - returnRatio),
                    0.06 * returnRatio + 0.97 * (1 - returnRatio)
                );
                starMat.opacity = returnRatio * 0.6;
                parkGroup.position.y = -returnRatio * 2.5;

                // Linhas de vento / velocidade supersônica
                windMat.opacity = Math.sin(Math.min(1.0, fallProgress) * Math.PI) * 0.85;
                const pos = windGeo.attributes.position.array;
                for (let i = 1; i < pos.length; i += 3) {
                    pos[i] += 0.45; // Linhas sobem velozmente dando a sensação de queda
                    if (pos[i] > 8.0) pos[i] = 0.0;
                }
                windGeo.attributes.position.needsUpdate = true;
            } else {
                // Parque ensolarado padrão
                spaceGroup.visible = false;
                starMat.opacity = 0.0;
                windMat.opacity = 0.0;
                parkGroup.position.y = 0;
                scene.background.setHex(0xbfe0f7);
                scene.fog.color.setHex(0xbfe0f7);
                scene.fog.near = 14;
                scene.fog.far = 32;
            }
        }
    };
}
