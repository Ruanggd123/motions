/**
 * PlanetEarth.js
 * Sistema 3D do Planeta Terra de Alta Resolução com Continentes Reconhecíveis,
 * Oceanos Profundos, Sistemas de Nuvens Translúcidas, Halo Atmosférico Glow
 * e Campo Cósmico de Estrelas 3D.
 */

export function createEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Oceanos Globais com Profundidade Gradual
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0.00, '#034078'); // Ártico
    oceanGrad.addColorStop(0.25, '#0077b6');
    oceanGrad.addColorStop(0.50, '#001e3d'); // Fossa equatorial profunda
    oceanGrad.addColorStop(0.75, '#0077b6');
    oceanGrad.addColorStop(1.00, '#034078'); // Antártica
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // 2. Plataformas Costeiras Submarinas (Turquesa / Ciano nas praias)
    function drawCoastalShelf(pts, width = 20) {
        ctx.save();
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        pts.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt[0], pt[1]);
            else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    // 3. Continentes com Relevo e Biomas Naturais
    function drawContinent(pts, landColor, detailColor = null, desertPts = null) {
        ctx.save();
        ctx.fillStyle = landColor;
        ctx.beginPath();
        pts.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt[0], pt[1]);
            else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.closePath();
        ctx.fill();

        if (detailColor) {
            ctx.fillStyle = detailColor;
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            pts.forEach((pt, i) => {
                const cx = pt[0] + 8;
                const cy = pt[1] + 6;
                if (i === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
            });
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        if (desertPts) {
            ctx.fillStyle = '#d97706'; // Areia Dourada do Deserto
            ctx.beginPath();
            desertPts.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt[0], pt[1]);
                else ctx.lineTo(pt[0], pt[1]);
            });
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    // MAPA GEOGRÁFICO REALISTA (Projeção Cilíndrica Equirretangular 2048 x 1024)
    // AMÉRICA DO NORTE
    const northAmerica = [
        [220, 160], [340, 130], [480, 160], [560, 220], [520, 320],
        [460, 380], [420, 440], [380, 480], [340, 430], [350, 350],
        [290, 300], [240, 240], [210, 180]
    ];
    drawCoastalShelf(northAmerica, 18);
    drawContinent(northAmerica, '#15803d', '#166534');

    // AMÉRICA DO SUL (Brasil, Andes e Patagônia)
    const southAmerica = [
        [440, 490], [540, 510], [630, 590], [600, 710], [520, 830],
        [450, 880], [430, 750], [400, 620], [420, 530]
    ];
    drawCoastalShelf(southAmerica, 18);
    drawContinent(southAmerica, '#16a34a', '#14532d');

    // EUROPA & ESCANDINÁVIA
    const europe = [
        [950, 180], [1050, 150], [1120, 190], [1160, 250], [1080, 310],
        [980, 320], [930, 270], [940, 210]
    ];
    drawCoastalShelf(europe, 16);
    drawContinent(europe, '#4ade80', '#15803d');

    // ÁFRICA (Com o grande deserto do Saara)
    const africa = [
        [950, 330], [1120, 320], [1210, 390], [1250, 520], [1170, 660],
        [1090, 740], [1030, 760], [970, 620], [930, 460]
    ];
    const saharaDesert = [
        [960, 340], [1110, 330], [1190, 400], [1130, 470], [970, 470], [940, 390]
    ];
    drawCoastalShelf(africa, 20);
    drawContinent(africa, '#15803d', '#14532d', saharaDesert);

    // ÁSIA (China, Índia, Sibéria e Arábia)
    const asia = [
        [1170, 150], [1420, 120], [1680, 160], [1800, 250], [1700, 390],
        [1550, 450], [1440, 510], [1330, 440], [1250, 330], [1190, 230]
    ];
    const gobiDesert = [
        [1400, 290], [1560, 280], [1580, 350], [1440, 360]
    ];
    drawCoastalShelf(asia, 22);
    drawContinent(asia, '#16a34a', '#166534', gobiDesert);

    // AUSTRÁLIA & OCEANIA
    const australia = [
        [1580, 610], [1740, 590], [1800, 670], [1740, 760], [1620, 750], [1560, 680]
    ];
    const outback = [
        [1600, 620], [1720, 610], [1760, 690], [1640, 710]
    ];
    drawCoastalShelf(australia, 18);
    drawContinent(australia, '#ca8a04', '#a16207', outback);

    // CALOTAS POLARES REALISTAS E ORGÂNICAS (SEM O OVO BRANCO GIGANTE!)
    ctx.fillStyle = '#ffffff';
    // Polo Norte Sutil
    ctx.beginPath();
    ctx.ellipse(1024, 18, 1024, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antártica Orgânica
    ctx.beginPath();
    ctx.ellipse(1024, 1005, 1024, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. SISTEMAS DE NUVENS TRANSLÚCIDAS E ESPIRAIS ATMOSFÉRICAS REALISTAS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    function drawCloudSwirl(cx, cy, radius, arms = 2) {
        ctx.save();
        ctx.translate(cx, cy);
        for (let a = 0; a < arms; a++) {
            ctx.rotate((Math.PI * 2) / arms);
            ctx.beginPath();
            for (let r = 8; r < radius; r += 6) {
                const angle = r * 0.09;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r * 0.45;
                ctx.ellipse(x, y, r * 0.16, r * 0.09, angle, 0, Math.PI * 2);
            }
            ctx.fill();
        }
        ctx.restore();
    }

    drawCloudSwirl(460, 240, 95, 2);
    drawCloudSwirl(1350, 210, 110, 2);
    drawCloudSwirl(790, 580, 85, 2);

    // Faixas Equador / Alísios Delicadas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = 0; i < 28; i++) {
        const x = (i * 75) % 2048;
        const y = 480 + Math.sin(i * 0.5) * 55;
        ctx.beginPath();
        ctx.ellipse(x, y, 80, 16, Math.sin(i) * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 24; i++) {
        const x = (i * 88 + 150) % 2048;
        const y = 290 + Math.cos(i * 0.6) * 65;
        ctx.beginPath();
        ctx.ellipse(x, y, 90, 20, 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

export function createPlanetEarthSystem(THREE) {
    const root = new THREE.Group();
    root.name = "PlanetEarthSystem";

    // 1. GLOBO TERRESTRE PRINCIPAL
    const earthRadius = 3.85;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 48);
    const earthTexture = createEarthTexture();
    earthTexture.encoding = THREE.sRGBEncoding;

    const earthMat = new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.60,
        metalness: 0.05
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.name = "EarthGlobe";
    // Ângulo onde o Equador e os continentes ficam nítidos e virados para a câmera
    earthMesh.rotation.y = 1.65;
    earthMesh.rotation.x = -0.10;
    root.add(earthMesh);

    // 2. HALO ATMOSFÉRICO GLOW (A fina linha azul da atmosfera terrestre)
    const atmoGeo = new THREE.SphereGeometry(earthRadius * 1.022, 48, 36);
    const atmoMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.40,
        transparent: true,
        opacity: 0.32,
        roughness: 0.9,
        side: THREE.FrontSide
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    atmoMesh.name = "AtmosphereGlow";
    root.add(atmoMesh);

    // 3. CAMPO CÓSMICO DE ESTRELAS 3D
    const starsCount = 1000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    const starSizes = new Float32Array(starsCount);

    for (let i = 0; i < starsCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 26.0 + Math.random() * 30.0;

        starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);
        starSizes[i] = 1.0 + Math.random() * 2.5;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
        color: 0xf8fafc,
        size: 0.11,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true
    });
    const starField = new THREE.Points(starGeo, starMat);
    starField.name = "CosmicStarfield";
    root.add(starField);

    // 4. GOTAS DE CAFÉ EM MICROGRAVIDADE
    const coffeeDropsGroup = new THREE.Group();
    coffeeDropsGroup.name = "ZeroGCoffeeDrops";
    const dropMat = new THREE.MeshStandardMaterial({
        color: 0x3b1d11,
        roughness: 0.15,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95
    });

    const drops = [];
    for (let i = 0; i < 16; i++) {
        const size = 0.016 + Math.random() * 0.026;
        const drop = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 12), dropMat);
        drop.position.set(
            (Math.random() - 0.5) * 0.5,
            0.8 + (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        coffeeDropsGroup.add(drop);
        drops.push({
            mesh: drop,
            seed: Math.random() * 10,
            speed: 0.6 + Math.random() * 1.2,
            basePos: drop.position.clone()
        });
    }
    root.add(coffeeDropsGroup);

    return {
        root,
        earthMesh,
        atmoMesh,
        starField,
        coffeeDropsGroup,
        drops,
        update: (time, isZeroG) => {
            earthMesh.rotation.y = time * 0.07 + 1.65;
            atmoMesh.rotation.y = time * 0.08 + 1.65;

            if (isZeroG) {
                coffeeDropsGroup.visible = true;
                drops.forEach(d => {
                    d.mesh.position.x = d.basePos.x + Math.sin(time * d.speed + d.seed) * 0.09;
                    d.mesh.position.y = d.basePos.y + Math.cos(time * d.speed * 0.8 + d.seed) * 0.12;
                    d.mesh.position.z = d.basePos.z + Math.sin(time * d.speed * 1.1 + d.seed) * 0.09;
                });
            } else {
                coffeeDropsGroup.visible = false;
            }
        }
    };
}
