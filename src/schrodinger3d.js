import * as THREE from 'three';
import { createCharacter, applyPose, animateBreathing } from './character3d.js';

/**
 * Schrodinger3DScene — Cenário Quântico de Alta Fidelidade (O Paradoxo do Gato de Schrödinger)
 * 
 * Totalmente reconstruído para:
 * 1. VISIBILIDADE CRISTALINA: Estúdio claro com iluminação de três pontos + holofotes internos no gato e mecanismo.
 * 2. SINCRONIZAÇÃO NARRATIVA PERFEITA: Cada segundo e fala do roteiro possui animação e enquadramento dedicados.
 * 3. ZERO TREMORES E ZERO BOTÕES: Animação limpa e poses dinâmicas no estilo Pixar.
 */
export class Schrodinger3DScene {
  constructor() {
    this.root = new THREE.Group();
    this.time = 0;

    // Subgrupos de cena
    this.createQuantumLabEnvironment();
    this.createSchrodingerBox();
    this.createRadioactiveAtomMechanism();
    this.createSuperpositionCat();
    this.createMultiverseRift();
    this.createHolographicHUD();
    this.createObserverHand();
    this.createPresenter();
    this.createCelebrationParticles();
  }

  // ─── 1. LABORATÓRIO QUÂNTICO FUTURISTA (BRILHANTE E NÍTIDO) ──────────────
  createQuantumLabEnvironment() {
    this.labGroup = new THREE.Group();

    // Plataforma circular da bancada (Ardósia técnica de alta visibilidade com anel emissivo)
    const tableGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.22, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.75,
    });
    this.tableMesh = new THREE.Mesh(tableGeo, tableMat);
    this.tableMesh.position.set(0, -0.11, 0);
    this.tableMesh.receiveShadow = true;
    this.labGroup.add(this.tableMesh);

    // Anel perimetral neon vibrante
    const ringGeo = new THREE.TorusGeometry(5.22, 0.045, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.labGroup.add(ringMesh);

    // Guias ópticas concêntricas no piso
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.015, 8, 48).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 })
    );
    innerRing.position.set(0, 0.002, 0);
    this.labGroup.add(innerRing);

    const midRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.9, 0.015, 8, 64).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.75 })
    );
    midRing.position.set(0, 0.002, 0);
    this.labGroup.add(midRing);

    // Fundo arquitetônico com colunas de LED verticais (Moderno e bem iluminado)
    this.wallGroup = new THREE.Group();
    this.wallGroup.position.set(0, 2.5, -4.0);

    for (let i = -4; i <= 4; i++) {
      const panelGeo = new THREE.BoxGeometry(0.85, 5.0, 0.12);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.7,
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(i * 1.05, 0, 0);
      this.wallGroup.add(panel);

      if (i < 4) {
        const stripGeo = new THREE.BoxGeometry(0.04, 4.8, 0.05);
        const stripMat = new THREE.MeshBasicMaterial({
          color: (i % 2 === 0) ? 0x06b6d4 : 0x3b82f6,
        });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(i * 1.05 + 0.525, 0, 0.05);
        this.wallGroup.add(strip);
      }
    }
    this.labGroup.add(this.wallGroup);

    // Telas de Telemetria Quântica na parede de fundo
    this.createLabMonitors();

    // Colimador laser superior de contenção quântica
    this.topLaserEmitter = new THREE.Group();
    this.topLaserEmitter.position.set(0, 4.3, 0);
    const emitterCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.65, 0.7, 32),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
    );
    this.topLaserEmitter.add(emitterCone);

    // Feixe laser límpido
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.45, 3.8, 16);
    this.laserBeam = new THREE.Mesh(
      beamGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    this.laserBeam.position.set(0, -2.1, 0);
    this.topLaserEmitter.add(this.laserBeam);

    this.labGroup.add(this.topLaserEmitter);
    this.root.add(this.labGroup);
  }

  createLabMonitors() {
    this.monitorsGroup = new THREE.Group();
    this.monitorsGroup.position.set(0, 3.1, -3.9);

    // Monitor 1: Gráfico da Função de Onda Quântica Ψ(t)
    const canvas1 = document.createElement('canvas');
    canvas1.width = 512;
    canvas1.height = 300;
    const ctx1 = canvas1.getContext('2d');
    ctx1.fillStyle = '#090d16';
    ctx1.fillRect(0, 0, 512, 300);
    ctx1.lineWidth = 4;
    ctx1.strokeStyle = '#00ffcc';
    ctx1.strokeRect(6, 6, 500, 288);
    ctx1.fillStyle = '#00ffcc';
    ctx1.font = 'bold 22px monospace';
    ctx1.fillText('MONITOR QUÂNTICO — Ψ(t)', 20, 35);
    ctx1.fillStyle = '#38bdf8';
    ctx1.font = '16px monospace';
    ctx1.fillText('ESTADO: COERÊNCIA PURA [50% / 50%]', 20, 60);

    this.monitorTexture1 = new THREE.CanvasTexture(canvas1);
    const mon1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), new THREE.MeshBasicMaterial({ map: this.monitorTexture1 }));
    mon1.position.set(-2.2, 0, 0);
    this.monitorsGroup.add(mon1);

    // Moldura metálica
    const frame1 = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.98, 0.05), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 }));
    frame1.position.set(-2.2, 0, -0.03);
    this.monitorsGroup.add(frame1);

    // Monitor 2: Telemetria da Câmara
    const canvas2 = document.createElement('canvas');
    canvas2.width = 512;
    canvas2.height = 300;
    const ctx2 = canvas2.getContext('2d');
    ctx2.fillStyle = '#090d16';
    ctx2.fillRect(0, 0, 512, 300);
    ctx2.lineWidth = 4;
    ctx2.strokeStyle = '#f59e0b';
    ctx2.strokeRect(6, 6, 500, 288);
    ctx2.fillStyle = '#f59e0b';
    ctx2.font = 'bold 22px monospace';
    ctx2.fillText('STATUS: CÂMARA DE SCHRÖDINGER', 20, 35);
    ctx2.fillStyle = '#10b981';
    ctx2.font = 'bold 20px monospace';
    ctx2.fillText('• ISÓTOPO Cs-137: ATIVO', 20, 85);
    ctx2.fillStyle = '#e2e8f0';
    ctx2.font = '18px monospace';
    ctx2.fillText('• DETECTOR GEIGER: PRONTO', 20, 135);
    ctx2.fillText('• MARTELO MAGNÉTICO: SUSPENSO', 20, 180);
    ctx2.fillText('• FRASCO CIANETO: SELADO', 20, 225);
    ctx2.fillStyle = '#06b6d4';
    ctx2.font = 'bold 18px monospace';
    ctx2.fillText('SUPERPOSIÇÃO: ATIVA', 20, 270);

    const mon2Texture = new THREE.CanvasTexture(canvas2);
    const mon2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), new THREE.MeshBasicMaterial({ map: mon2Texture }));
    mon2.position.set(2.2, 0, 0);
    this.monitorsGroup.add(mon2);

    const frame2 = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.98, 0.05), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 }));
    frame2.position.set(2.2, 0, -0.03);
    this.monitorsGroup.add(frame2);

    this.labGroup.add(this.monitorsGroup);
  }

  // ─── 2. A CAIXA DE SCHRÖDINGER (CÂMARA MODULAR DE VISIBILIDADE MÁXIMA) ───
  createSchrodingerBox() {
    this.boxGroup = new THREE.Group();
    this.boxGroup.position.set(0, 0.95, 0);

    // Painéis internos claros (Branco/Cinza fosco reflexivo para manter tudo super visível)
    const innerPanelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.25,
    });
    const outerFrameMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.2,
    });

    // Parede de fundo da caixa
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.9, 0.1), innerPanelMat);
    backWall.position.set(0, 0, -0.95);
    backWall.receiveShadow = true;
    this.boxGroup.add(backWall);

    // Piso e teto da caixa
    const floorWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.95), innerPanelMat);
    floorWall.position.set(0, -0.9, 0);
    floorWall.receiveShadow = true;
    this.boxGroup.add(floorWall);

    const ceilWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.95), innerPanelMat);
    ceilWall.position.set(0, 0.9, 0);
    this.boxGroup.add(ceilWall);

    // Paredes laterais com janelas de acrílico translúcido para entrada lateral de luz
    for (let x of [-1.25, 1.25]) {
      const wallSide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.75, 1.95), outerFrameMat);
      wallSide.position.set(x, 0, 0);
      this.boxGroup.add(wallSide);
    }

    // Moldura frontal chanfrada com acabamento industrial premium
    for (let x of [-1.25, 1.25]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.85, 0.14), outerFrameMat);
      pillar.position.set(x, 0, 0.95);
      this.boxGroup.add(pillar);
    }
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.14), outerFrameMat);
    topBar.position.set(0, 0.9, 0.95);
    this.boxGroup.add(topBar);

    const botBar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.14), outerFrameMat);
    botBar.position.set(0, -0.9, 0.95);
    this.boxGroup.add(botBar);

    // ── Porta Frontal Deslizante Motorizada ─────────────────────────────────
    this.frontDoor = new THREE.Group();
    this.frontDoor.position.set(0, 0, 1.01);

    // Painel de proteção mecânica da porta
    const doorGeo = new THREE.BoxGeometry(2.38, 1.68, 0.05);
    this.doorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    this.doorMesh = new THREE.Mesh(doorGeo, this.doorMat);
    this.frontDoor.add(this.doorMesh);

    // Janela de quartzo central com grade de telemetria
    const glassGeo = new THREE.BoxGeometry(1.7, 1.15, 0.02);
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      transparent: true,
      opacity: 0.35,
    });
    this.glassWindow = new THREE.Mesh(glassGeo, this.glassMat);
    this.glassWindow.position.set(0, 0, 0.035);
    this.frontDoor.add(this.glassWindow);

    // Faixas de aviso de perigo na porta
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 0.02), stripeMat);
    s1.position.set(0, 0.72, 0.035);
    this.frontDoor.add(s1);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 0.02), stripeMat);
    s2.position.set(0, -0.72, 0.035);
    this.frontDoor.add(s2);

    this.boxGroup.add(this.frontDoor);

    // ── ILUMINAÇÃO INTERNA DE ALTA POTÊNCIA (Garante visão perfeita) ────────
    // Luz quente difusa interna principal
    this.interiorLightMain = new THREE.PointLight(0xfffbeb, 6.5, 4.5);
    this.interiorLightMain.position.set(0, 0.65, 0.25);
    this.boxGroup.add(this.interiorLightMain);

    // Luz ciano de preenchimento interno
    this.interiorLightCyan = new THREE.PointLight(0x06b6d4, 4.5, 3.8);
    this.interiorLightCyan.position.set(-0.6, 0.5, 0.4);
    this.boxGroup.add(this.interiorLightCyan);

    // Spotlight focado no gato
    this.catSpot = new THREE.SpotLight(0xfff7ed, 5.0);
    this.catSpot.position.set(0, 0.85, 0.7);
    this.catSpot.target.position.set(0, -0.2, 0.2);
    this.boxGroup.add(this.catSpot);
    this.boxGroup.add(this.catSpot.target);

    this.root.add(this.boxGroup);
  }

  // ─── 3. O MECANISMO INTERNO LETAL (ÁTOMO, GEIGER, MARTELO E FRASCO) ──────
  createRadioactiveAtomMechanism() {
    this.mechanismGroup = new THREE.Group();
    this.mechanismGroup.position.set(0, 0.95, 0);

    // ── 3A. Armadilha Óptica do Átomo de Césio-137 (Lado Esquerdo Superior)
    this.atomTrapGroup = new THREE.Group();
    this.atomTrapGroup.position.set(-0.65, 0.4, -0.15);

    // Bobinas de confinamento magnético em cobre brilhante
    for (let rot of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
      const coilGeo = new THREE.TorusGeometry(0.25, 0.025, 16, 32);
      coilGeo.rotateX(rot);
      const coilMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      this.atomTrapGroup.add(coil);
    }

    // Núcleo do átomo de Césio-137 (Esfera verde radioativa pulsante)
    const nucleusGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x4ade80,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    this.atomNucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    this.atomTrapGroup.add(this.atomNucleus);

    // Órbitas eletrônicas fluorescentes
    this.electronOrbits = [];
    for (let e = 0; e < 3; e++) {
      const orbitRing = new THREE.Group();
      orbitRing.rotation.set(e * 0.8, e * 1.1, e * 0.5);

      const ringGuide = new THREE.Mesh(
        new THREE.TorusGeometry(0.2 + e * 0.05, 0.008, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x86efac, transparent: true, opacity: 0.6 })
      );
      orbitRing.add(ringGuide);

      const electron = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x4ade80 })
      );
      electron.position.set(0.2 + e * 0.05, 0, 0);
      orbitRing.add(electron);

      this.electronOrbits.push(orbitRing);
      this.atomTrapGroup.add(orbitRing);
    }

    // Partículas de emissão gama/alfa
    this.decayParticles = [];
    for (let p = 0; p < 16; p++) {
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 })
      );
      spark.userData = {
        radius: 0.12 + Math.random() * 0.28,
        angle: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 2.0,
      };
      this.decayParticles.push(spark);
      this.atomTrapGroup.add(spark);
    }

    // Card holográfico flutuante 3D: "ÁTOMO RADIOATIVO (Cs-137)"
    this.atomCard = this.createHoloCard('ÁTOMO RADIOATIVO', 'ISÓTOPO Cs-137 ☢', '#22c55e', 1.05, 0.45);
    this.atomCard.position.set(0, 0.45, 0.1);
    this.atomTrapGroup.add(this.atomCard);

    this.mechanismGroup.add(this.atomTrapGroup);

    // ── 3B. Detector Geiger-Müller (Tubo com mostrador de ponteiro)
    this.geigerGroup = new THREE.Group();
    this.geigerGroup.position.set(-0.18, 0.38, -0.15);

    // Tubo detector metálico
    const tubeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.42, 24);
    tubeGeo.rotateZ(Math.PI / 2);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
    const geigerTube = new THREE.Mesh(tubeGeo, tubeMat);
    this.geigerGroup.add(geigerTube);

    // Mostrador analógico circular branco de alto contraste
    const dialGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 32);
    dialGeo.rotateX(Math.PI / 2);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(0, 0.16, 0.06);
    this.geigerGroup.add(dial);

    // Ponteiro vermelho do detector
    this.needlePivot = new THREE.Group();
    this.needlePivot.position.set(0, 0.16, 0.09);
    const needleGeo = new THREE.BoxGeometry(0.015, 0.14, 0.01);
    needleGeo.translate(0, 0.06, 0);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    this.needlePivot.add(needle);
    this.geigerGroup.add(this.needlePivot);

    // Fio condutor de sinal elétrico vermelho
    const wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, 0.38, -0.15),
      new THREE.Vector3(0.3, 0.46, -0.15),
      new THREE.Vector3(0.42, 0.48, -0.15),
    ]);
    const wireGeo = new THREE.TubeGeometry(wireCurve, 16, 0.014, 8, false);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    this.mechanismGroup.add(wire);

    // Card holográfico flutuante 3D: "DETECTOR GEIGER-MÜLLER"
    this.geigerCard = this.createHoloCard('DETECTOR GEIGER', 'SENSIBILIDADE ATÔMICA', '#f59e0b', 1.05, 0.45);
    this.geigerCard.position.set(0, 0.46, 0.1);
    this.geigerGroup.add(this.geigerCard);

    this.mechanismGroup.add(this.geigerGroup);

    // ── 3C. Martelo Eletromagnético Articulado
    this.hammerPivot = new THREE.Group();
    this.hammerPivot.position.set(0.42, 0.45, -0.15);

    // Braço mecânico do martelo
    const armGeo = new THREE.BoxGeometry(0.045, 0.45, 0.045);
    armGeo.translate(0, -0.22, 0);
    const hammerArm = new THREE.Mesh(
      armGeo,
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    this.hammerPivot.add(hammerArm);

    // Cabeça pesada do martelo de aço
    const headGeo = new THREE.BoxGeometry(0.18, 0.1, 0.12);
    headGeo.translate(0.05, -0.42, 0);
    const hammerHead = new THREE.Mesh(
      headGeo,
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.1 })
    );
    this.hammerPivot.add(hammerHead);

    this.hammerPivot.rotation.z = 0.25; // Posição erguida inicial
    this.mechanismGroup.add(this.hammerPivot);

    // ── 3D. Frasco de Cianeto Borossilicato (Vidro Erlenmeyer com Veneno Brilhante)
    this.flaskGroup = new THREE.Group();
    this.flaskGroup.position.set(0.48, -0.38, -0.15);

    // Corpo de vidro cônico translúcido
    const flaskGlassGeo = new THREE.ConeGeometry(0.22, 0.48, 24, 1, true);
    const flaskGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.7,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1,
    });
    const flaskGlass = new THREE.Mesh(flaskGlassGeo, flaskGlassMat);
    flaskGlass.position.set(0, 0.24, 0);
    this.flaskGroup.add(flaskGlass);

    // Gargalo do frasco
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.16, 16),
      flaskGlassMat
    );
    neckMesh.position.set(0, 0.52, 0);
    this.flaskGroup.add(neckMesh);

    // Rolha de vedação
    const cork = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.09, 16),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
    );
    cork.position.set(0, 0.58, 0);
    this.flaskGroup.add(cork);

    // Líquido tóxico ciano brilhante borbulhante
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 1.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    this.liquidMesh = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 20), liquidMat);
    this.liquidMesh.position.set(0, 0.14, 0);
    this.flaskGroup.add(this.liquidMesh);

    // Bolhas que sobem no veneno
    this.poisonBubbles = [];
    for (let b = 0; b < 6; b++) {
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.85 })
      );
      bubble.userData = { yOffset: Math.random() * 0.22, speed: 0.2 + Math.random() * 0.3 };
      this.poisonBubbles.push(bubble);
      this.flaskGroup.add(bubble);
    }

    // Card holográfico flutuante 3D: "MARTELO & FRASCO DE VENENO"
    this.hammerCard = this.createHoloCard('MARTELO & VENENO', 'MECANISMO LETAL ☠', '#ef4444', 1.1, 0.45);
    this.hammerCard.position.set(0, 0.95, 0.1);
    this.flaskGroup.add(this.hammerCard);

    this.mechanismGroup.add(this.flaskGroup);
    this.root.add(this.mechanismGroup);
  }

  // ─── 4. O GATO 3D EM SUPERPOSIÇÃO QUÂNTICA DUAL (PIXAR STYLE) ────────────
  createSuperpositionCat() {
    this.catGroup = new THREE.Group();
    this.catGroup.position.set(-0.1, 0.42, 0.25);

    // Subgrupo Gato Vivo (Lado Esquerdo: Pelagem Dourada/Laranja vibrante)
    this.aliveCat = new THREE.Group();
    this.buildFelineRig(this.aliveCat, false);
    this.catGroup.add(this.aliveCat);

    // Subgrupo Gato Fantasma/Onda (Lado Direito: Holograma Ciano Quântico Translúcido)
    this.ghostCat = new THREE.Group();
    this.buildFelineRig(this.ghostCat, true);
    this.ghostCat.position.set(0.04, 0, 0);
    this.catGroup.add(this.ghostCat);

    // Anéis de interferência de onda quântica flutuantes
    this.quantumWaveRings = [];
    for (let w = 0; w < 4; w++) {
      const waveGeo = new THREE.TorusGeometry(0.5 + w * 0.14, 0.014, 12, 48).rotateX(Math.PI / 2);
      const wave = new THREE.Mesh(
        waveGeo,
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 - w * 0.08 })
      );
      wave.userData = { baseRadius: 0.5 + w * 0.14, phase: w * 0.8 };
      this.quantumWaveRings.push(wave);
      this.catGroup.add(wave);
    }

    // Nebulosa de partículas quânticas ao redor do gato
    this.quantumNebulaParticles = [];
    for (let q = 0; q < 32; q++) {
      const qMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        new THREE.MeshBasicMaterial({
          color: (q % 2 === 0) ? 0x00ffcc : 0x38bdf8,
          transparent: true,
          opacity: 0.85,
        })
      );
      qMesh.userData = {
        radius: 0.25 + Math.random() * 0.5,
        speed: 1.2 + Math.random() * 2.0,
        yBase: 0.1 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      };
      this.quantumNebulaParticles.push(qMesh);
      this.catGroup.add(qMesh);
    }

    // Novelinho de lã colorido para o gato brincar (Cena 4)
    this.yarnBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.7 })
    );
    this.yarnBall.position.set(0.35, 0.09, 0.35);
    this.yarnBall.visible = false;
    this.catGroup.add(this.yarnBall);

    this.root.add(this.catGroup);
  }

  buildFelineRig(parentGroup, isGhost = false) {
    const furColor = isGhost ? 0x06b6d4 : 0xf59e0b;
    const bellyColor = isGhost ? 0x38bdf8 : 0xfef3c7;
    const innerEarColor = isGhost ? 0x67e8f9 : 0xf472b6;

    let bodyMat, bellyMat, earMat, eyeMat;

    if (isGhost) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: furColor,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.55,
      });
      bellyMat = bodyMat;
      earMat = bodyMat;
      eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    } else {
      bodyMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.45, metalness: 0.05 });
      bellyMat = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.5 });
      earMat = new THREE.MeshStandardMaterial({ color: innerEarColor, roughness: 0.4 });
      eyeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.15 });
    }

    // 1. Tronco / Corpo felino
    const torsoGeo = new THREE.CapsuleGeometry(0.24, 0.36, 16, 24);
    torsoGeo.rotateZ(Math.PI / 2);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.set(0, 0.22, 0);
    torso.castShadow = !isGhost;
    parentGroup.add(torso);
    parentGroup.userData.torso = torso;

    // Peito / Barriga fofa clara
    if (!isGhost) {
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), bellyMat);
      belly.scale.set(1.1, 0.8, 0.9);
      belly.position.set(0, 0.18, 0.08);
      parentGroup.add(belly);

      const chestTuft = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), bellyMat);
      chestTuft.scale.set(0.85, 1.15, 0.75);
      chestTuft.position.set(0.18, 0.26, 0);
      parentGroup.add(chestTuft);
    }

    // 2. Cabeça felina expressiva
    const headPivot = new THREE.Group();
    headPivot.position.set(0.28, 0.38, 0);

    const headGeo = new THREE.SphereGeometry(0.22, 24, 24);
    headGeo.scale(1.05, 0.95, 1.0);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.castShadow = !isGhost;
    headPivot.add(headMesh);

    // Bochechas e bigodes
    const cheekMat = isGhost ? bodyMat : bellyMat;
    for (let zSide of [-1, 1]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), cheekMat);
      cheek.scale.set(1.2, 0.85, 0.95);
      cheek.position.set(0.14, -0.06, zSide * 0.065);
      headPivot.add(cheek);

      const whiskerMat = new THREE.MeshBasicMaterial({ color: isGhost ? 0xa5f3fc : 0xffffff });
      for (let w = -1; w <= 1; w++) {
        const whiskerGeo = new THREE.CylinderGeometry(0.003, 0.001, 0.22, 6);
        whiskerGeo.rotateZ(Math.PI / 2);
        whiskerGeo.rotateY(zSide * (Math.PI / 8) + w * 0.12);
        const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
        whisker.position.set(0.16, -0.06 + w * 0.025, zSide * 0.11);
        headPivot.add(whisker);
      }
    }

    // Focinho e nariz
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), cheekMat);
    muzzle.scale.set(1.3, 0.75, 1.0);
    muzzle.position.set(0.15, -0.05, 0);
    headPivot.add(muzzle);

    const noseGeo = new THREE.ConeGeometry(0.032, 0.035, 3);
    noseGeo.rotateZ(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, new THREE.MeshStandardMaterial({ color: isGhost ? 0x67e8f9 : 0xf43f5e, roughness: 0.3 }));
    nose.position.set(0.245, -0.028, 0);
    headPivot.add(nose);

    // Orelhas
    for (let zSide of [-1, 1]) {
      const earGroup = new THREE.Group();
      earGroup.position.set(0.02, 0.17, zSide * 0.12);
      earGroup.rotation.z = -0.22;
      earGroup.rotation.x = zSide * 0.28;

      const outerEar = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.17, 4), bodyMat);
      outerEar.scale.set(1.1, 1.0, 0.55);
      earGroup.add(outerEar);

      const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.13, 4), earMat);
      innerEar.scale.set(1.0, 1.0, 0.4);
      innerEar.position.set(0.015, -0.01, 0);
      earGroup.add(innerEar);

      headPivot.add(earGroup);
    }

    // Olhos verdes esmeralda expressivos com brilho especular
    for (let zSide of [-1, 1]) {
      const eyeSclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.052, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      eyeSclera.scale.set(0.6, 1.0, 0.85);
      eyeSclera.position.set(0.18, 0.035, zSide * 0.085);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), eyeMat);
      iris.position.set(0.02, 0, 0);
      eyeSclera.add(iris);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x090d16 })
      );
      pupil.position.set(0.025, 0, 0);
      iris.add(pupil);

      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      catchlight.position.set(0.03, 0.01, 0.008);
      iris.add(catchlight);

      headPivot.add(eyeSclera);
    }

    parentGroup.add(headPivot);
    parentGroup.userData.head = headPivot;

    // 3. Patinhas dianteiras e traseiras
    for (let xPos of [-0.14, 0.14]) {
      for (let zSide of [-0.11, 0.11]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 12), bodyMat);
        leg.position.set(xPos, 0.09, zSide);
        parentGroup.add(leg);

        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), cheekMat);
        paw.scale.set(1.2, 0.7, 1.0);
        paw.position.set(xPos + 0.02, 0.02, zSide);
        parentGroup.add(paw);
      }
    }

    // 4. Rabinho felino expressivo
    const tailPivot = new THREE.Group();
    tailPivot.position.set(-0.25, 0.26, 0);
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.12, 0.14, 0),
      new THREE.Vector3(-0.06, 0.32, 0.04),
    ]);
    const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.035, 8, false), bodyMat);
    tailPivot.add(tailMesh);
    parentGroup.add(tailPivot);
    parentGroup.userData.tail = tailPivot;
  }

  // ─── 5. RAMIFICAÇÃO QUÂNTICA DE MULTIVERSO (CENA 4) ──────────────────────
  createMultiverseRift() {
    this.multiverseGroup = new THREE.Group();
    this.multiverseGroup.position.set(0, 1.2, 0);
    this.multiverseGroup.visible = false;

    // Fenda quântica divisória central (Portal de luz vertical)
    const riftGeo = new THREE.PlaneGeometry(0.08, 2.4);
    const riftMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    this.riftPlane = new THREE.Mesh(riftGeo, riftMat);
    this.multiverseGroup.add(this.riftPlane);

    // Cards dos universos A e B
    this.cardUniverseA = this.createHoloCard('UNIVERSO A: VIVO', 'MARTELO TRAVADO 💚', '#10b981', 1.05, 0.45);
    this.cardUniverseA.position.set(-0.7, 0.85, 0.1);
    this.multiverseGroup.add(this.cardUniverseA);

    this.cardUniverseB = this.createHoloCard('UNIVERSO B: ONDA', 'MARTELO DISPAROU ☠', '#06b6d4', 1.05, 0.45);
    this.cardUniverseB.position.set(0.7, 0.85, 0.1);
    this.multiverseGroup.add(this.cardUniverseB);

    // Partículas de fenda
    this.riftParticles = [];
    for (let i = 0; i < 24; i++) {
      const rp = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: (i % 2 === 0) ? 0xec4899 : 0x00ffcc, transparent: true, opacity: 0.8 })
      );
      rp.position.set((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 0.4);
      this.riftParticles.push(rp);
      this.multiverseGroup.add(rp);
    }

    this.root.add(this.multiverseGroup);
  }

  // ─── 6. HUD HOLOGRÁFICO (EQUAÇÃO PSI E CARDS 50/50) ──────────────────────
  createHolographicHUD() {
    this.hudGroup = new THREE.Group();
    this.hudGroup.position.set(0, 2.25, 0);

    // Placa superior da Equação Quântica de Schrödinger
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.roundRect(10, 10, 1004, 236, 24);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#00ffcc';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('|Ψ⟩ =  ½√2 |VIVO⟩  +  ½√2 |MORTO⟩', 512, 105);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('SUPERPOSIÇÃO QUÂNTICA PURA', 512, 185);

    const tex = new THREE.CanvasTexture(canvas);
    this.hudPlaque = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.55),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
    );
    this.hudGroup.add(this.hudPlaque);

    // Medidores de probabilidade 50% VIVO e 50% MORTO
    this.dialLeft = this.createProbabilityGauge('50% VIVO', '#10b981', -1.05, -0.65);
    this.dialRight = this.createProbabilityGauge('50% MORTO', '#06b6d4', 1.05, -0.65);
    this.hudGroup.add(this.dialLeft);
    this.hudGroup.add(this.dialRight);

    // Curva senoidal luminosa da onda
    const wavePoints = [];
    for (let x = -1.1; x <= 1.1; x += 0.05) {
      wavePoints.push(new THREE.Vector3(x, Math.sin(x * 6) * 0.12, 0));
    }
    this.sineWaveLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(wavePoints),
      new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 3 })
    );
    this.sineWaveLine.position.set(0, -0.5, 0.1);
    this.hudGroup.add(this.sineWaveLine);

    this.root.add(this.hudGroup);
  }

  createProbabilityGauge(labelText, strokeColor, xPos, yPos) {
    const group = new THREE.Group();
    group.position.set(xPos, yPos, 0);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.roundRect(10, 10, 492, 236, 20);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 256, 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('PROBABILIDADE', 256, 190);

    const texture = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.42),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95 })
    );
    group.add(mesh);
    return group;
  }

  createHoloCard(title, subtitle, strokeColor, width = 1.1, height = 0.45) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.roundRect(10, 10, 748, 300, 24);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 384, 120);

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 32px monospace';
    ctx.fillText(subtitle, 384, 215);

    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
    );
  }

  // ─── 7. A MÃO DO OBSERVADOR ROBÓTICO (CENA 5: COLAPSO DA ONDA) ───────────
  createObserverHand() {
    this.observerGroup = new THREE.Group();
    this.observerGroup.position.set(0, 1.15, 2.4);
    this.observerGroup.visible = false;

    // Braço robótico articulado
    const armGeo = new THREE.CylinderGeometry(0.08, 0.11, 0.8, 16);
    armGeo.rotateX(Math.PI / 2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const arm = new THREE.Mesh(armGeo, armMat);
    this.observerGroup.add(arm);

    // Garra / Mão
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.15), armMat);
    palm.position.set(0, 0, -0.45);
    this.observerGroup.add(palm);

    for (let f = -1; f <= 1; f++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.16), armMat);
      finger.position.set(f * 0.055, 0, -0.58);
      this.observerGroup.add(finger);
    }

    // Card do Colapso
    this.collapseCard = this.createHoloCard('ATO DE OBSERVAÇÃO', 'COLAPSO DA FUNÇÃO Ψ', '#ec4899', 1.25, 0.48);
    this.collapseCard.position.set(0, 0.55, -0.3);
    this.observerGroup.add(this.collapseCard);

    this.root.add(this.observerGroup);
  }

  // ─── 8. O NARRADOR PIXAR ARTICULADO (ATUAÇÃO SUAVE E SEM TREMORES) ────────
  createPresenter() {
    this.presenterGroup = new THREE.Group();
    // Posicionado à esquerda da câmara, visível dentro do enquadramento vertical 9:16
    this.presenterGroup.position.set(-0.65, 0, 0.95);
    this.presenterGroup.rotation.y = 0.45;

    this.character = createCharacter({ scale: 1.0, celShading: true });
    this.presenterGroup.add(this.character);
    this.root.add(this.presenterGroup);
  }

  // ─── 9. PARTÍCULAS DE CELEBRAÇÃO / VITÓRIA (CENA 6) ──────────────────────
  createCelebrationParticles() {
    this.celebrationGroup = new THREE.Group();
    this.celebrationParticles = [];
    const colors = [0xfbbf24, 0x10b981, 0x38bdf8, 0xec4899, 0xa855f7];

    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
      );
      p.userData = {
        xBase: (Math.random() - 0.5) * 2.2,
        yBase: 1.0 + Math.random() * 2.0,
        zBase: 0.5 + Math.random() * 1.5,
        speed: 0.8 + Math.random() * 1.5,
      };
      this.celebrationParticles.push(p);
      this.celebrationGroup.add(p);
    }

    // Card da Vitória
    this.victoryCard = this.createHoloCard('O GATO ESTÁ SALVO!', 'NENHUM GATINHO FOI FERIDO 🐱💛', '#10b981', 1.35, 0.5);
    this.victoryCard.position.set(0, 1.65, 0.8);
    this.celebrationGroup.add(this.victoryCard);

    this.celebrationGroup.visible = false;
    this.root.add(this.celebrationGroup);
  }

  // ─── 10. ATUALIZAÇÃO CONTÍNUA DINÂMICA (UPDATE LOOP) ─────────────────────
  update(time, sceneId = 1) {
    this.time = time;

    // ── 10A. Narrador Pixar Humanoide com Atuação Suave
    animateBreathing(this.character, time);

    let pose = 'thinking';
    if (sceneId === 1) {
      pose = (time > 6.0) ? 'presenting' : 'thinking';
      this.presenterGroup.position.set(-0.65, 0, 0.95);
      this.presenterGroup.visible = true;
    } else if (sceneId === 2 || sceneId === 3 || sceneId === 4 || sceneId === 5) {
      // Nas cenas macro de foco técnico interno, retira o apresentador do centro para clareza máxima
      this.presenterGroup.visible = false;
    } else if (sceneId === 6) {
      // Cena 6: Volta para a celebração vitoriosa!
      pose = 'celebrate_dance';
      this.presenterGroup.position.set(-0.65, 0, 0.95);
      this.presenterGroup.visible = true;
    }

    applyPose(this.character, pose, time);

    // ── 10B. Átomo de Césio-137
    if (this.atomNucleus) {
      const pulse = 1.0 + Math.sin(time * 4.0) * 0.18;
      this.atomNucleus.scale.set(pulse, pulse, pulse);
    }
    this.electronOrbits.forEach((orb, idx) => {
      orb.rotation.y += (idx + 1) * 0.03;
      orb.rotation.z += (idx + 1) * 0.02;
    });
    this.decayParticles.forEach((p, idx) => {
      p.userData.angle += p.userData.speed * 0.04;
      p.position.x = Math.cos(p.userData.angle + idx) * p.userData.radius;
      p.position.y = Math.sin(p.userData.angle + idx) * p.userData.radius;
    });

    // ── 10C. Detector Geiger e Martelo
    if (this.needlePivot) {
      // Na cena 2, quando fala do átomo decaindo, a agulha dá um pulo forte!
      const intensity = (sceneId === 2 && time > 23.0) ? 0.8 : 0.3;
      const jitter = Math.sin(time * 8.0) * intensity + Math.cos(time * 12.0) * (intensity * 0.5);
      this.needlePivot.rotation.z = -0.3 + jitter;
    }

    if (this.hammerPivot) {
      if (sceneId === 2 && time > 23.5) {
        // Cena 2 (final): Martelo desce em golpe de suspense pairando logo acima do frasco
        const dropProgress = Math.min(1.0, (time - 23.5) * 1.5);
        this.hammerPivot.rotation.z = 0.25 - dropProgress * 0.85; // Desce até bater/pairar
      } else if (sceneId === 4) {
        // Cena 4: Demonstração do universo onde o martelo bateu
        this.hammerPivot.rotation.z = -0.7;
      } else if (sceneId === 6) {
        // Cena 6: Martelo travado no alto em total segurança
        this.hammerPivot.rotation.z = 0.35;
      } else {
        this.hammerPivot.rotation.z = 0.25;
      }
    }

    // Bolhas do veneno subindo
    this.poisonBubbles.forEach(b => {
      b.position.y = 0.08 + ((b.userData.yOffset + time * b.userData.speed) % 0.22);
      b.position.x = Math.sin(time * 2.5 + b.userData.yOffset) * 0.04;
    });

    // ── 10D. Anatomia Feline e Superposição
    const catBreath = 1.0 + Math.sin(time * 2.0) * 0.025;
    if (this.aliveCat.userData.torso) this.aliveCat.userData.torso.scale.set(catBreath, catBreath, 1);
    if (this.ghostCat.userData.torso) this.ghostCat.userData.torso.scale.set(catBreath, catBreath, 1);

    const catHeadTurn = Math.sin(time * 1.2) * 0.12;
    if (this.aliveCat.userData.head) this.aliveCat.userData.head.rotation.y = catHeadTurn;
    if (this.ghostCat.userData.head) this.ghostCat.userData.head.rotation.y = catHeadTurn;

    const tailWag = Math.sin(time * 2.5) * 0.25;
    if (this.aliveCat.userData.tail) this.aliveCat.userData.tail.rotation.z = tailWag;
    if (this.ghostCat.userData.tail) this.ghostCat.userData.tail.rotation.z = tailWag;

    // Pulsação do Gato Fantasma
    if (this.ghostCat) {
      const ghostAlpha = 0.5 + Math.sin(time * 4.0) * 0.25;
      this.ghostCat.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.opacity = ghostAlpha;
        }
      });
    }

    // Anéis de onda quântica expandindo
    this.quantumWaveRings.forEach(ring => {
      const phase = (time * 0.8 + ring.userData.phase) % 1.0;
      const currentRadius = ring.userData.baseRadius + phase * 0.35;
      ring.scale.set(currentRadius / ring.userData.baseRadius, currentRadius / ring.userData.baseRadius, 1);
      ring.material.opacity = (1.0 - phase) * 0.5;
    });

    // Nebulosa de partículas quânticas
    this.quantumNebulaParticles.forEach((q, i) => {
      const ang = time * q.userData.speed + q.userData.phase;
      q.position.x = Math.cos(ang) * q.userData.radius;
      q.position.z = Math.sin(ang) * q.userData.radius;
      q.position.y = q.userData.yBase + Math.sin(time * 3 + i) * 0.05;
    });

    // Atualização da curva senoidal do HUD
    if (this.sineWaveLine) {
      const positions = this.sineWaveLine.geometry.attributes.position.array;
      let pIdx = 1;
      for (let x = -1.1; x <= 1.1; x += 0.05) {
        positions[pIdx] = Math.sin(x * 6 + time * 4.0) * 0.12;
        pIdx += 3;
      }
      this.sineWaveLine.geometry.attributes.position.needsUpdate = true;
    }

    // ── 10E. Comportamento Específico de Cada Cena
    if (sceneId === 1) {
      // Cena 1: Introdução, caixa selada
      this.frontDoor.position.y = 0;
      this.doorMat.opacity = 0.9;
      this.multiverseGroup.visible = false;
      this.observerGroup.visible = false;
      this.celebrationGroup.visible = false;
      this.catGroup.position.set(-0.1, 0.42, 0.25);
      this.aliveCat.visible = true;
      this.ghostCat.visible = true;
      this.yarnBall.visible = false;

      // Cards visíveis
      this.hudGroup.visible = false;
      this.atomCard.visible = false;
      this.geigerCard.visible = false;
      this.hammerCard.visible = false;
    } else if (sceneId === 2) {
      // Cena 2: Mecanismo Letal (Porta totalmente aberta)
      this.frontDoor.position.y = -1.8;
      this.doorMat.opacity = 0.1;
      this.multiverseGroup.visible = false;
      this.observerGroup.visible = false;
      this.celebrationGroup.visible = false;
      this.hudGroup.visible = false;
      this.yarnBall.visible = false;

      // Ativa cards conforme o momento da narração
      this.atomCard.visible = (time >= 16.0 && time < 19.5);
      this.geigerCard.visible = (time >= 18.5 && time < 22.5);
      this.hammerCard.visible = (time >= 21.0);
    } else if (sceneId === 3) {
      // Cena 3: Superposição Quântica (Gato Vivo + Gato Fantasma)
      this.frontDoor.position.y = -1.8;
      this.multiverseGroup.visible = false;
      this.observerGroup.visible = false;
      this.celebrationGroup.visible = false;
      this.hudGroup.visible = true; // Placa da Equação Ψ e 50/50
      this.yarnBall.visible = false;

      this.atomCard.visible = false;
      this.geigerCard.visible = false;
      this.hammerCard.visible = false;

      // Gatos posicionados lado a lado no centro
      this.aliveCat.position.set(-0.25, 0, 0);
      this.ghostCat.position.set(0.25, 0, 0);
      this.aliveCat.visible = true;
      this.ghostCat.visible = true;
    } else if (sceneId === 4) {
      // Cena 4: Ramificação de Multiverso
      this.frontDoor.position.y = -1.8;
      this.multiverseGroup.visible = true;
      this.observerGroup.visible = false;
      this.celebrationGroup.visible = false;
      this.hudGroup.visible = false;

      // Separa os gatos para os dois universos
      this.aliveCat.position.set(-0.55, 0, 0.1);
      this.ghostCat.position.set(0.55, 0, 0.1);
      this.aliveCat.visible = true;
      this.ghostCat.visible = true;
      this.yarnBall.visible = true;

      // Novelinho de lã se move brincando com o gato vivo
      this.yarnBall.position.set(-0.35 + Math.sin(time * 3) * 0.08, 0.09, 0.35);

      // Partículas da fenda dimensional oscilando
      this.riftParticles.forEach((rp, i) => {
        rp.position.y += Math.sin(time * 3 + i) * 0.01;
      });
    } else if (sceneId === 5) {
      // Cena 5: Mão do Observador & Colapso Quântico
      this.frontDoor.position.y = -0.5;
      this.doorMat.opacity = 0.5;
      this.multiverseGroup.visible = false;
      this.observerGroup.visible = true;
      this.celebrationGroup.visible = false;
      this.hudGroup.visible = false;
      this.yarnBall.visible = false;

      // Movimento da mão em direção à caixa
      const handAdvance = Math.min(1.0, (time - 56.62) / 3.0);
      this.observerGroup.position.z = 2.4 - handAdvance * 0.6;

      // Flash do colapso quântico
      if (time > 61.5) {
        const collapseSpeed = (time - 61.5) * 2.0;
        // O gato fantasma é absorvido rapidamente
        const fade = Math.max(0, 1.0 - collapseSpeed);
        this.ghostCat.traverse(child => {
          if (child.isMesh && child.material) child.material.opacity = fade * 0.55;
        });
        if (fade <= 0) this.ghostCat.visible = false;

        this.aliveCat.position.set(0, 0, 0);
        this.aliveCat.visible = true;
      }
    } else if (sceneId === 6) {
      // Cena 6: Revelação Vitoriosa! O Gato Pula pra Frente Livre e Feliz
      this.frontDoor.position.y = -1.8;
      this.multiverseGroup.visible = false;
      this.observerGroup.visible = false;
      this.celebrationGroup.visible = true;
      this.hudGroup.visible = false;
      this.yarnBall.visible = false;

      this.ghostCat.visible = false;
      this.aliveCat.visible = true;

      // Animação do pulo triunfante do gato para a frente da bancada
      const jumpTime = Math.min(1.0, (time - 70.01) / 1.8);
      const jumpArc = Math.sin(jumpTime * Math.PI) * 0.35;
      this.catGroup.position.set(0, 0.42 + jumpArc, 0.25 + jumpTime * 0.85);

      // Partículas de celebração caindo suavemente
      this.celebrationParticles.forEach(p => {
        p.position.y = p.userData.yBase - ((time * p.userData.speed) % 2.5);
        p.position.x = p.userData.xBase + Math.sin(time * 2 + p.userData.yBase) * 0.1;
        p.position.z = p.userData.zBase;
      });
    }
  }
}
