/**
 * CityDiorama.js
 * Cenário 3D da Cidade Moderna em Diorama (Avenida, Edifícios com Fachadas Detalhadas,
 * Cafeteria com Toldo, Táxi de Nova York, Carros, Faixa de Pedestre e Mobiliário Urbano).
 * 
 * Separa a arquitetura da cidade (que desce no vácuo) dos objetos urbanos dinâmicos
 * (Táxi, Banco, Hidrante, Carro) que decolam e flutuam no espaço sideral.
 */

export function createCityDiorama(THREE) {
    const cityGroup = new THREE.Group();
    cityGroup.name = "CityBuildingsAndRoad";

    const dynamicPropsGroup = new THREE.Group();
    dynamicPropsGroup.name = "DynamicUrbanProps";

    // ==========================================
    // 1. TEXTURAS PROCEDURAIS DE CALÇADA EM GRANITO ACONCHEGANTE
    // ==========================================
    function createSidewalkTexture() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');

        // Fundo em tom de pedra granito suave e agradável aos olhos (Sem brilho branco cego!)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, 512, 512);

        // Grade de lajotas elegantes com rejunte escuro
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        for (let i = 0; i <= 512; i += 64) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }

        // Granulação e textura de pedra
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let i = 0; i < 500; i++) {
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 3);
        return tex;
    }

    const sidewalkTex = createSidewalkTexture();

    // ==========================================
    // 2. RUA, ASFALTO, FAIXAS E CALÇADA
    // ==========================================
    // Avenida Asfaltada (Frente: z = 1.95)
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.35, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88 })
    );
    road.position.set(0, -0.18, 1.95);
    road.receiveShadow = true;
    cityGroup.add(road);

    // Linhas Amarelas Duplas no Centro da Pista
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let x = -9.5; x <= 9.5; x += 1.8) {
        const dash1 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.08), yellowLineMat);
        dash1.rotation.x = -Math.PI / 2;
        dash1.position.set(x, 0.002, 1.90);
        cityGroup.add(dash1);

        const dash2 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.08), yellowLineMat);
        dash2.rotation.x = -Math.PI / 2;
        dash2.position.set(x, 0.002, 2.05);
        cityGroup.add(dash2);
    }

    // Faixa de Pedestres Branca (Zebra Crossing) no centro
    const zebraMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let z = 0.65; z <= 3.25; z += 0.38) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.20), zebraMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0.0, 0.003, z);
        cityGroup.add(stripe);
    }

    // Calçada de Granito Aconchegante (Meio: z = -0.95)
    const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.38, 3.4),
        new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.72 })
    );
    sidewalk.position.set(0, -0.16, -0.95);
    sidewalk.receiveShadow = true;
    cityGroup.add(sidewalk);

    // Meio-Fio de Granito
    const curb = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.40, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65 })
    );
    curb.position.set(0, -0.15, 0.43);
    curb.receiveShadow = true;
    cityGroup.add(curb);

    // Faixa Tátil de Alerta Amarela junto ao meio-fio
    const tactileMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const tactileStrip = new THREE.Mesh(new THREE.PlaneGeometry(22, 0.22), tactileMat);
    tactileStrip.rotation.x = -Math.PI / 2;
    tactileStrip.position.set(0, 0.035, 0.22);
    cityGroup.add(tactileStrip);

    // ==========================================
    // 3. SKYLINE DE EDIFÍCIOS DETALHADOS CONTÍNUOS
    // ==========================================
    function createDetailedBuilding({
        x, width, height, depth, wallColor, roofColor,
        isCafe = false, isTownhouse = false, isModernLoft = false
    }) {
        const bGroup = new THREE.Group();
        bGroup.position.set(x, 0, -3.2);

        // Parede Principal
        const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.78 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        bGroup.add(body);

        // Cornija do Telhado
        const cornice = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.16, 0.22, depth + 0.16),
            new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.55 })
        );
        cornice.position.y = height + 0.11;
        bGroup.add(cornice);

        // Janelas Proporcionais com Luz Aconchegante Interior
        const winCols = Math.max(2, Math.floor(width / 0.72));
        const winRows = Math.max(2, Math.floor((height - 1.3) / 0.90));
        const winLitMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfde047,
            emissiveIntensity: 0.65,
            roughness: 0.2
        });
        const winDarkMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.15,
            metalness: 0.4
        });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

        for (let r = 0; r < winRows; r++) {
            for (let c = 0; c < winCols; c++) {
                const wx = -((winCols - 1) * 0.62) / 2 + c * 0.62;
                const wy = 1.45 + r * 0.88;
                const isLit = (r * 2 + c) % 3 !== 0;

                const frame = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.54, 0.06), frameMat);
                frame.position.set(wx, wy, depth / 2 + 0.02);
                bGroup.add(frame);

                const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.44), isLit ? winLitMat : winDarkMat);
                pane.position.set(wx, wy, depth / 2 + 0.052);
                bGroup.add(pane);

                if (isTownhouse && r === 0) {
                    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
                    const balcony = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.24, 0.18), balconyMat);
                    balcony.position.set(wx, wy - 0.22, depth / 2 + 0.11);
                    bGroup.add(balcony);
                }
            }
        }

        // TÉRREO: CAFETERIA COM TOLDO LISTRADO E VITRINE
        if (isCafe) {
            const awning = new THREE.Mesh(
                new THREE.BoxGeometry(width * 0.85, 0.18, 0.65),
                new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 })
            );
            awning.position.set(0, 1.05, depth / 2 + 0.26);
            awning.rotation.x = 0.22;
            bGroup.add(awning);

            const signBoard = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.25, 0.06),
                new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
            );
            signBoard.position.set(0, 1.42, depth / 2 + 0.06);
            bGroup.add(signBoard);

            const shopWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(width * 0.72, 0.75),
                new THREE.MeshStandardMaterial({
                    color: 0xfef08a,
                    emissive: 0xfde047,
                    emissiveIntensity: 0.75,
                    roughness: 0.2
                })
            );
            shopWindow.position.set(0, 0.50, depth / 2 + 0.04);
            bGroup.add(shopWindow);
        }

        if (isModernLoft) {
            const acUnit = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.32, 0.35),
                new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.5 })
            );
            acUnit.position.set(0.35, height + 0.25, 0);
            bGroup.add(acUnit);
        }

        return bGroup;
    }

    // Fachada Urbana Contínua com Cafeteria e Loja no Campo Central de Visão
    cityGroup.add(createDetailedBuilding({
        x: -3.45, width: 2.3, height: 4.8, depth: 1.8,
        wallColor: 0x334155, roofColor: 0x0f172a, isModernLoft: true
    })); // 1. Edifício Moderno Oeste

    cityGroup.add(createDetailedBuilding({
        x: -1.15, width: 2.3, height: 4.6, depth: 1.8,
        wallColor: 0xb45309, roofColor: 0x78350f, isCafe: true
    })); // 2. Cafeteria Terracota Central com Toldo Vermelho e Vitrine Dourada

    cityGroup.add(createDetailedBuilding({
        x: 1.15, width: 2.3, height: 5.1, depth: 1.8,
        wallColor: 0x1e3a8a, roofColor: 0x0f172a, isTownhouse: true
    })); // 3. Boutique Azul Real com Sacadas de Ferro e Floreiras

    cityGroup.add(createDetailedBuilding({
        x: 3.45, width: 2.3, height: 4.3, depth: 1.8,
        wallColor: 0x15803d, roofColor: 0x14532d, isCafe: false
    })); // 4. Livraria Verde Floresta Leste

    // Árvores da calçada
    function createCityTree(x, z, scale = 1.0) {
        const tree = new THREE.Group();
        tree.position.set(x, 0, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.16, 1.6, 12),
            new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 })
        );
        trunk.position.y = 0.8;
        trunk.castShadow = true;
        tree.add(trunk);

        const leafMatA = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 });
        const leafMatB = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 });

        const crown1 = new THREE.Mesh(new THREE.SphereGeometry(0.72, 16, 16), leafMatA);
        crown1.position.set(0, 1.85, 0);
        crown1.castShadow = true;
        tree.add(crown1);

        const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 14), leafMatB);
        crown2.position.set(0.35, 2.05, 0.18);
        crown2.castShadow = true;
        tree.add(crown2);

        const crown3 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 14), leafMatB);
        crown3.position.set(-0.32, 1.95, -0.15);
        crown3.castShadow = true;
        tree.add(crown3);

        return tree;
    }

    cityGroup.add(createCityTree(-2.4, -1.8, 1.0));
    cityGroup.add(createCityTree(2.5, -1.8, 1.0));

    // ==========================================
    // 4. OBJETOS URBANOS DINÂMICOS (QUE DECOLAM NO ESPAÇO)
    // ==========================================
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.35 });

    // 4.1 Poste de Luz
    const lampPostGroup = new THREE.Group();
    lampPostGroup.name = "LampPost";
    lampPostGroup.position.set(-2.0, 0, 0.15);
    cityGroup.add(lampPostGroup);

    const postPole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 2.8, 16), ironMat);
    postPole.position.y = 1.4;
    postPole.castShadow = true;
    lampPostGroup.add(postPole);

    const postBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.28, 16), ironMat);
    postBase.position.y = 0.14;
    lampPostGroup.add(postBase);

    const postArm = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 16, Math.PI * 0.65), ironMat);
    postArm.position.set(0.12, 2.75, 0);
    postArm.rotation.z = -Math.PI * 0.45;
    lampPostGroup.add(postArm);

    const lampGlass = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfde047,
            emissiveIntensity: 0.95,
            roughness: 0.2
        })
    );
    lampGlass.position.set(0.28, 2.65, 0);
    lampPostGroup.add(lampGlass);

    const lampLight = new THREE.PointLight(0xfef08a, 0.85, 8);
    lampLight.position.set(0.28, 2.65, 0);
    lampPostGroup.add(lampLight);

    // 4.2 Banco da Praça (OBJETO DINÂMICO DE GRAVIDADE ZERO)
    const benchGroup = new THREE.Group();
    benchGroup.name = "ParkBench";
    benchGroup.position.set(1.45, 0, -0.85);
    benchGroup.rotation.y = -0.25;
    dynamicPropsGroup.add(benchGroup);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.55 });
    const benchLegL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.44), ironMat);
    benchLegL.position.set(-0.58, 0.19, 0);
    benchGroup.add(benchLegL);

    const benchLegR = benchLegL.clone();
    benchLegR.position.x = 0.58;
    benchGroup.add(benchLegR);

    for (let s = -0.16; s <= 0.16; s += 0.08) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.025, 0.06), woodMat);
        slat.position.set(0, 0.38, s);
        slat.castShadow = true;
        benchGroup.add(slat);
    }
    for (let b = 0.48; b <= 0.68; b += 0.08) {
        const slatB = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 0.025), woodMat);
        slatB.position.set(0, b, -0.19);
        slatB.castShadow = true;
        benchGroup.add(slatB);
    }

    // 4.3 Hidrante Urbano Vermelho (OBJETO DINÂMICO DE GRAVIDADE ZERO)
    const hydrantGroup = new THREE.Group();
    hydrantGroup.name = "FireHydrant";
    hydrantGroup.position.set(-1.45, 0, 0.15);
    dynamicPropsGroup.add(hydrantGroup);

    const redPaint = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.1 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.3 });

    const hCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.45, 16), redPaint);
    hCylinder.position.y = 0.225;
    hCylinder.castShadow = true;
    hydrantGroup.add(hCylinder);

    const hCap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), redPaint);
    hCap.position.y = 0.45;
    hydrantGroup.add(hCap);

    const valveL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.10, 12), brassMat);
    valveL.rotation.z = Math.PI / 2;
    valveL.position.set(-0.13, 0.26, 0);
    hydrantGroup.add(valveL);

    const valveR = valveL.clone();
    valveR.position.x = 0.13;
    hydrantGroup.add(valveR);

    // 4.4 Táxi de Nova York (OBJETO DINÂMICO DE GRAVIDADE ZERO)
    function createYellowTaxi() {
        const car = new THREE.Group();
        car.name = "YellowTaxi";

        const yellowPaint = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.1 });
        const darkTrim = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.5 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.15 });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.35, 0.85), yellowPaint);
        chassis.position.y = 0.30;
        chassis.castShadow = true;
        car.add(chassis);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.32, 0.78), yellowPaint);
        cabin.position.set(-0.08, 0.62, 0);
        cabin.castShadow = true;
        car.add(cabin);

        const windshield = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.28), glassMat);
        windshield.rotation.y = Math.PI / 2;
        windshield.rotation.x = -0.22;
        windshield.position.set(0.42, 0.62, 0);
        car.add(windshield);

        const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.28), glassMat);
        rearWindow.rotation.y = -Math.PI / 2;
        rearWindow.rotation.x = -0.22;
        rearWindow.position.set(-0.58, 0.62, 0);
        car.add(rearWindow);

        const taxiSign = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.11, 0.14),
            new THREE.MeshStandardMaterial({
                color: 0xffedd5,
                emissive: 0xfde047,
                emissiveIntensity: 0.85,
                roughness: 0.3
            })
        );
        taxiSign.position.set(-0.08, 0.82, 0);
        car.add(taxiSign);

        const bumperF = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.88), chromeMat);
        bumperF.position.set(0.85, 0.22, 0);
        car.add(bumperF);

        const bumperR = bumperF.clone();
        bumperR.position.x = -0.85;
        car.add(bumperR);

        const wheelGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.11, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const hubcapGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);

        function createWheel(wx, wz) {
            const wGroup = new THREE.Group();
            wGroup.position.set(wx, 0.17, wz);
            wGroup.rotation.x = Math.PI / 2;

            const tire = new THREE.Mesh(wheelGeo, wheelMat);
            wGroup.add(tire);

            const hub = new THREE.Mesh(hubcapGeo, chromeMat);
            wGroup.add(hub);

            return wGroup;
        }

        car.add(createWheel(-0.48, -0.42));
        car.add(createWheel(0.48, -0.42));
        car.add(createWheel(-0.48, 0.42));
        car.add(createWheel(0.48, 0.42));

        return car;
    }

    const yellowTaxi = createYellowTaxi();
    yellowTaxi.position.set(-1.85, 0, 1.65);
    dynamicPropsGroup.add(yellowTaxi);

    function createRedCar() {
        const car = new THREE.Group();
        car.name = "RedCar";

        const redPaint = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.35, metalness: 0.1 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.5 });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.32, 0.80), redPaint);
        chassis.position.y = 0.28;
        chassis.castShadow = true;
        car.add(chassis);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.30, 0.74), redPaint);
        cabin.position.set(-0.06, 0.58, 0);
        cabin.castShadow = true;
        car.add(cabin);

        const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.10, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

        function createWheel(wx, wz) {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.position.set(wx, 0.16, wz);
            w.rotation.x = Math.PI / 2;
            return w;
        }

        car.add(createWheel(-0.44, -0.40));
        car.add(createWheel(0.44, -0.40));
        car.add(createWheel(-0.44, 0.40));
        car.add(createWheel(0.44, 0.40));

        return car;
    }

    const redCar = createRedCar();
    redCar.position.set(1.95, 0, 2.15);
    redCar.rotation.y = Math.PI;
    dynamicPropsGroup.add(redCar);

    return {
        cityGroup,
        dynamicPropsGroup,
        yellowTaxi,
        redCar,
        benchGroup,
        hydrantGroup,
        lampPostGroup
    };
}
