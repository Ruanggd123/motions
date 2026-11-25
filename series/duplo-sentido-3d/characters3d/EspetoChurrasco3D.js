/**
 * EspetoChurrasco3D.js -- Prop Comico Cartoon 3D v3 (Linguica Gigante Curva 1.3m + Fly-By na Lente + Cogumelo de Farofa!)
 *
 * Upgrades v3 (Cartoon Distortion & Viral Meme-Retention):
 * - LINGUICA ARTESANAL RIDICULAMENTE ENORME (~1.30m de comprimento!) composta por 5 gomos gordinhos
 *   curvados em arco comico com elastico rubber-wobble (balanca e entorta nas pontas como borracha!).
 * - `preSlip` (0..1) ativo ja em B3 (escorregando sorrateiramente enquanto o Voce se gaba!) e extremo
 *   em B4 (pendurada na ponta afiada do espeto tremendo e pingando!).
 * - Em B5, a linguica gigante DECOLA DO ESPETO, PASSA COLADA NA LENTE DA CAMERA (fly-by gigante em
 *   primeiro plano com stretch de velocidade!), ricocheteia na tigela vermelha de farofa e detona um
 *   COGUMELO NUCLEAR DOURADO DE FAROFA (48 particulas + 16 nuvens em haste + chapeu de cogumelo!),
 *   pousando empanada de farofa na tabua de corte em B6!
 */
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

  class EspetoChurrasco3D {
    constructor(opts = {}) {
      const T = global.THREE;
      if (!T) throw new Error('THREE.js nao carregado para EspetoChurrasco3D');
      this.T = T;
      this.group = new T.Group();
      this.group.name = 'EspetoChurrasco3D';

      this.scale = opts.scale !== undefined ? opts.scale : 1.0;

      // Espeto nas maos (alinhado ao longo do eixo local X: cabo em -X, ponta afiada em +X!)
      this.skewerGroup = new T.Group();
      this.skewerGroup.scale.setScalar(this.scale);
      this.group.add(this.skewerGroup);

      // Grupo mundial para linguica voadora, fumaca e COGUMELO GIGANTE DE FAROFA DOURADA!
      this.worldLayer = new T.Group();
      this.group.add(this.worldLayer);

      this._buildMaterials(T);
      this._buildSkewerAndSausage(T);
      this._buildEffects(T);
    }

    _buildMaterials(T) {
      this.mats = {
        steel: new T.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.14 }),
        woodHandle: new T.MeshStandardMaterial({ color: 0x92400e, roughness: 0.56, metalness: 0.04 }),
        woodRing: new T.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.74, roughness: 0.24 }),
        sausageMain: new T.MeshStandardMaterial({ color: 0xb45309, roughness: 0.22, metalness: 0.10 }),
        sausageGloss: new T.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.16, metalness: 0.12 }),
        grillMark: new T.MeshStandardMaterial({ color: 0x451a03, roughness: 0.72 }),
        sausageTip: new T.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.34 }),
        dripGold: new T.MeshStandardMaterial({
          color: 0xfde047,
          emissive: 0xd97706,
          emissiveIntensity: 0.30,
          transparent: true,
          opacity: 0.92,
          roughness: 0.08
        }),
        steamWhite: new T.MeshStandardMaterial({
          color: 0xf8fafc,
          transparent: true,
          opacity: 0.50,
          roughness: 0.90,
          depthWrite: false
        }),
        farofaGold: new T.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xca8a04,
          emissiveIntensity: 0.16,
          roughness: 0.80
        }),
        farofaToast: new T.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.84
        }),
        farofaLight: new T.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xeab308,
          emissiveIntensity: 0.14,
          roughness: 0.86
        }),
        farofaCloudStem: new T.MeshStandardMaterial({
          color: 0xfde047,
          emissive: 0xd97706,
          emissiveIntensity: 0.14,
          transparent: true,
          opacity: 0.78,
          roughness: 0.92,
          depthWrite: false
        }),
        farofaCloudCap: new T.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xeab308,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.82,
          roughness: 0.92,
          depthWrite: false
        })
      };
    }

    /**
     * Constroi uma LINGUICA ARTESANAL GIGANTE (~1.24m!) curvada em arco continuo com 5 gomos
     * sobrepostos em spline elastica (ZERO frestas entre gomos mesmo em dobra extrema e fly-by!).
     */
    _createGiantCurvedSausage(T, withCrumbCoat) {
      const sg = new T.Group();
      const linkXs = [-0.42, -0.21, 0.0, 0.21, 0.42];
      const baseCurveYs = [-0.056, -0.014, 0.012, -0.014, -0.056];
      const baseSlopeZs = [0.22, 0.11, 0.0, -0.11, -0.22];
      const links = [];

      linkXs.forEach((lx, idx) => {
        const lg = new T.Group();
        lg.position.set(lx, baseCurveYs[idx], 0);
        lg.rotation.z = baseSlopeZs[idx];

        const rad = idx === 2 ? 0.082 : (idx === 1 || idx === 3 ? 0.079 : 0.075);
        const cyl = new T.Mesh(
          new T.CylinderGeometry(rad, rad, 0.225, 18),
          idx % 2 === 1 ? this.mats.sausageGloss : this.mats.sausageMain
        );
        cyl.rotation.z = Math.PI / 2;
        cyl.castShadow = true;
        lg.add(cyl);

        // Pontas arredondadas generosas que se encaixam com sobreposicao real nos gomos vizinhos!
        [-0.112, 0.112].forEach((ex) => {
          const cap = new T.Mesh(new T.SphereGeometry(rad * 0.99, 14, 10), this.mats.sausageMain);
          cap.scale.set(0.76, 1.0, 1.0);
          cap.position.x = ex;
          lg.add(cap);
        });

        // 3 listras escuras de grelha por gomo
        [-0.060, 0.0, 0.060].forEach((gx) => {
          const mark = new T.Mesh(new T.TorusGeometry(rad + 0.002, 0.0062, 6, 16), this.mats.grillMark);
          mark.rotation.y = Math.PI / 2;
          mark.rotation.z = 0.22;
          mark.position.x = gx;
          lg.add(mark);
        });

        // Nozinhos das pontas da tripa artesanal nas extremidades
        if (idx === 0) {
          const tipL = new T.Mesh(new T.SphereGeometry(0.032, 10, 8), this.mats.sausageTip);
          tipL.scale.set(1.5, 0.8, 0.8);
          tipL.position.x = -0.155;
          lg.add(tipL);
        }
        if (idx === 4) {
          const tipR = new T.Mesh(new T.SphereGeometry(0.032, 10, 8), this.mats.sausageTip);
          tipR.scale.set(1.5, 0.8, 0.8);
          tipR.position.x = 0.155;
          lg.add(tipR);
        }

        sg.add(lg);
        links.push({
          group: lg,
          u: (idx - 2) / 2.0, // -1, -0.5, 0, +0.5, +1 (curva spline continua!)
          baseX: lx,
          baseY: baseCurveYs[idx],
          baseRotZ: baseSlopeZs[idx]
        });
      });

      sg.userData.links = links;

      // Cobertura de farofa dourada empanada apos atravessar a explosao em B5!
      if (withCrumbCoat) {
        const crumbGroup = new T.Group();
        crumbGroup.visible = false;
        const crumbGeo = new T.DodecahedronGeometry(0.019, 0);
        for (let i = 0; i < 30; i++) {
          const ang = (i * 2.39996) % (Math.PI * 2);
          const cx = -0.46 + (i / 29) * 0.92;
          const u = cx / 0.46;
          const archY = 0.012 - u * u * 0.068;
          const r = 0.080;
          const c = new T.Mesh(
            crumbGeo,
            i % 3 === 0 ? this.mats.farofaToast : (i % 2 === 0 ? this.mats.farofaGold : this.mats.farofaLight)
          );
          c.position.set(cx, archY + Math.sin(ang) * r, Math.cos(ang) * r);
          c.scale.setScalar(0.75 + (i % 4) * 0.26);
          crumbGroup.add(c);
        }
        sg.add(crumbGroup);
        sg.userData.crumbGroup = crumbGroup;
      }

      return sg;
    }

    _buildSkewerAndSausage(T) {
      // Cabo de madeira torneado na esquerda (-0.64 .. -0.40)
      const handle = new T.Mesh(new T.CylinderGeometry(0.030, 0.025, 0.25, 14), this.mats.woodHandle);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = -0.54;
      handle.castShadow = true;
      this.skewerGroup.add(handle);

      const ferrule = new T.Mesh(new T.CylinderGeometry(0.031, 0.031, 0.034, 14), this.mats.woodRing);
      ferrule.rotation.z = Math.PI / 2;
      ferrule.position.x = -0.40;
      this.skewerGroup.add(ferrule);

      // Lamina longa de inox do espeto (-0.39 .. +0.72) para comportar a linguica gigante!
      const blade = new T.Mesh(new T.BoxGeometry(1.12, 0.016, 0.026), this.mats.steel);
      blade.position.x = 0.16;
      blade.castShadow = true;
      this.skewerGroup.add(blade);

      // Ponta afiada brilhante de inox na direita
      const tip = new T.Mesh(new T.ConeGeometry(0.020, 0.10, 6), this.mats.steel);
      tip.rotation.z = -Math.PI / 2;
      tip.position.x = 0.76;
      this.skewerGroup.add(tip);

      // Linguica gigante curva 1.3m espetada no espeto (escorrega e balanca feito borracha!)
      this.sausageOnSkewer = this._createGiantCurvedSausage(T, false);
      this.sausageOnSkewer.position.set(0.14, 0, 0);
      this.skewerGroup.add(this.sausageOnSkewer);

      // Linguica no mundo (voa colada na lente em B5a, ricocheteia na tigela e pousa empanada!)
      this.flyingSausage = this._createGiantCurvedSausage(T, true);
      this.flyingSausage.scale.setScalar(this.scale);
      this.flyingSausage.visible = false;
      this.worldLayer.add(this.flyingSausage);
    }

    _buildEffects(T) {
      // Gotinhas brilhantes de gordura quente pingando da linguica gigante
      this.drips = [];
      const dripGeo = new T.SphereGeometry(0.018, 8, 6);
      for (let i = 0; i < 10; i++) {
        const d = new T.Mesh(dripGeo, this.mats.dripGold);
        d.visible = false;
        this.skewerGroup.add(d);
        this.drips.push({ mesh: d, seed: i * 0.17, xOff: -0.36 + i * 0.088 });
      }

      // Fumacinha quente aromatica subindo da linguica
      this.steamPuffs = [];
      const steamGeo = new T.SphereGeometry(0.058, 10, 8);
      for (let i = 0; i < 8; i++) {
        const s = new T.Mesh(steamGeo, this.mats.steamWhite);
        s.visible = false;
        this.worldLayer.add(s);
        this.steamPuffs.push({ mesh: s, seed: i * 0.19, xSpread: (i - 3.5) * 0.10 });
      }

      // 48 PARTICULAS DE FAROFA DOURADA + MIGALHAS TOSTADAS EXPLODINDO NO AR!
      this.farofaParticles = [];
      const farofaGeo = new T.DodecahedronGeometry(0.036, 0);
      for (let i = 0; i < 48; i++) {
        const mat = i % 4 === 0
          ? this.mats.farofaToast
          : (i % 3 === 0 ? this.mats.farofaLight : this.mats.farofaGold);
        const f = new T.Mesh(farofaGeo, mat);
        f.visible = false;
        this.worldLayer.add(f);
        this.farofaParticles.push({
          mesh: f,
          angle: (i / 48) * Math.PI * 2 + (i % 5) * 0.19,
          radius: 0.26 + (i % 7) * 0.115,
          peakY: 0.42 + (i % 6) * 0.15,
          size: 0.65 + (i % 4) * 0.30,
          spinRate: (i % 2 === 0 ? 1 : -1) * (6.0 + (i % 4) * 2.5),
          settleX: Math.cos((i / 48) * Math.PI * 2 + 0.3) * (0.14 + (i % 5) * 0.08),
          settleZ: Math.sin((i / 48) * Math.PI * 2 + 0.3) * (0.11 + (i % 4) * 0.07)
        });
      }

      // COGUMELO NUCLEAR DE FAROFA DOURADA (6 nuvens de haste + 10 nuvens de chapeu gigante!)
      this.mushroomStem = [];
      const stemGeo = new T.SphereGeometry(0.145, 12, 10);
      for (let i = 0; i < 6; i++) {
        const m = new T.Mesh(stemGeo, this.mats.farofaCloudStem);
        m.visible = false;
        this.worldLayer.add(m);
        this.mushroomStem.push({
          mesh: m,
          hRatio: i / 5.0,
          ox: Math.sin(i * 2.1) * 0.055,
          oz: Math.cos(i * 1.9) * 0.055,
          baseScale: 0.85 + (1 - Math.abs(i / 5.0 - 0.5)) * 0.35
        });
      }

      this.mushroomCap = [];
      const capGeo = new T.SphereGeometry(0.195, 14, 10);
      for (let i = 0; i < 10; i++) {
        const isCenter = i < 2;
        const m = new T.Mesh(capGeo, i % 2 === 0 ? this.mats.farofaCloudCap : this.mats.farofaCloudStem);
        m.visible = false;
        this.worldLayer.add(m);
        this.mushroomCap.push({
          mesh: m,
          isCenter,
          angle: ((i - 2) / 8) * Math.PI * 2,
          ringR: isCenter ? 0.04 : (0.30 + (i % 2) * 0.11),
          yOff: isCenter ? (0.18 + i * 0.08) : (0.04 + (i % 3) * 0.055),
          baseScale: isCenter ? 1.48 : (1.05 + (i % 3) * 0.18)
        });
      }
    }

    _animateRubberLinks(sausageGroup, t, wobbleAmp, droopExtra) {
      const links = sausageGroup && sausageGroup.userData && sausageGroup.userData.links;
      if (!links) return;
      // Curva spline continua y(u) = A*u^2 + B*u com derivada analitica dy/dx -> ZERO frestas entre gomos!
      const flexArch = -(0.068 + droopExtra * 0.90) + Math.sin(t * 13.0) * wobbleAmp * 0.045;
      const whipTilt = Math.cos(t * 10.5) * wobbleAmp * 0.032;
      const swayZ = Math.sin(t * 11.5) * wobbleAmp * 0.022;
      for (let i = 0; i < links.length; i++) {
        const lk = links[i];
        const u = lk.u;
        const yVal = 0.012 + flexArch * (u * u) + whipTilt * u;
        const slope = (2.0 * flexArch * u + whipTilt) / 0.42;
        // Encurtamento horizontal proporcional ao arco mantem os gomos sempre encaixados!
        const xPull = 1.0 - Math.min(0.08, Math.abs(flexArch) * 0.42);
        lk.group.position.set(lk.baseX * xPull, yVal, swayZ * (u * u));
        lk.group.rotation.z = clamp(Math.atan(slope), -0.58, 0.58);
        lk.group.rotation.y = -swayZ * u * 1.4;
      }
    }

    /**
     * Atualiza espeto + linguica gigante 1.3m 100% deterministicamente:
     * - pos: {x, y, z} centro entre as maos (SEMPRE y <= 0.79 -> zero oclusao facial!)
     * - rotY, rotZ, spinX: orientacao e giro do espeto
     * - sizzleAmp: intensidade de gordura/fumaca (0..1)
     * - wobbleAmp: intensidade do balanco elastico rubber-hose da linguica gigante (0..1.5)
     * - preSlip: 0..1 deslizando ate a ponta afiada (ja comeca sorrateiro em B3 e explode em B4!)
     * - slipProg: 0 (no espeto) -> 1 (fly-by colado na lente em B5a -> acerta tigela -> cogumelo de farofa!)
     * - flybyPos: {x, y, z} ponto proximo da lente da camera para o fly-by gigante em B5a!
     * - impactPos: {x, y, z} centro da tigela vermelha de farofa
     * - landingPos: {x, y, z} centro da tabua de corte onde pousa empanada em B6
     * - explosionAge: 0..1 progresso do cogumelo nuclear de farofa (independente para manter o pico lindo em B5b!)
     */
    update(time, opts = {}) {
      const t = Number(time) || 0;
      const pos = opts.pos || { x: 0, y: 0.72, z: 0.30 };
      const rotY = opts.rotY || 0;
      const rotZ = opts.rotZ || 0;
      const spinX = opts.spinX || 0;
      const sizzleAmp = clamp(opts.sizzleAmp !== undefined ? opts.sizzleAmp : 0.85, 0, 1);
      const wobbleAmp = clamp(opts.wobbleAmp !== undefined ? opts.wobbleAmp : 0.55, 0, 1.8);
      const preSlip = clamp(opts.preSlip || 0, 0, 1);
      const slipProg = clamp(opts.slipProg || 0, 0, 1);
      const flyby = opts.flybyPos || { x: -0.18, y: 1.46, z: 2.85 };
      const impact = opts.impactPos || { x: -0.95, y: 0.94, z: -0.88 };
      const landing = opts.landingPos || { x: -0.72, y: 0.93, z: -0.86 };
      const explosionP = opts.explosionP !== undefined
        ? clamp(opts.explosionP, 0, 1)
        : clamp((slipProg - 0.64) / 0.36, 0, 1);

      this.skewerGroup.position.set(pos.x, pos.y, pos.z);
      this.skewerGroup.rotation.set(spinX, rotY, rotZ);

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Posicao base da linguica deslizando pra ponta (+X local)
      const slideLocalX = 0.14 + preSlip * 0.42 + clamp(slipProg / 0.08, 0, 1) * 0.22;
      const launchLocalX = (0.14 + preSlip * 0.42 + 0.22) * this.scale;

      // Posicao mundial exata na ponta do espeto no instante do lancamento
      const originX = pos.x + cosY * cosZ * launchLocalX;
      const originY = pos.y + sinZ * launchLocalX;
      const originZ = pos.z - sinY * cosZ * launchLocalX;

      let sausageWorldX = pos.x + cosY * cosZ * (slideLocalX * this.scale);
      let sausageWorldY = pos.y + sinZ * (slideLocalX * this.scale);
      let sausageWorldZ = pos.z - sinY * cosZ * (slideLocalX * this.scale);

      const crumbGroup = this.flyingSausage.userData.crumbGroup;

      if (slipProg < 0.08) {
        // Ainda no espeto: curva gigante + rubber wobble + escorregando pra ponta em B3/B4!
        this.sausageOnSkewer.visible = true;
        const wob = preSlip * (1 - clamp(slipProg / 0.08, 0, 1) * 0.3);
        this.sausageOnSkewer.position.set(
          slideLocalX,
          Math.sin(t * 19.0) * 0.012 * wob,
          Math.cos(t * 15.0) * 0.008 * wob
        );
        this.sausageOnSkewer.rotation.set(
          0,
          Math.cos(t * 14.0) * 0.095 * wob,
          Math.sin(t * 17.0) * 0.14 * wob - preSlip * 0.12
        );
        this._animateRubberLinks(this.sausageOnSkewer, t, wobbleAmp + preSlip * 0.65, preSlip * 0.065);
        this.flyingSausage.visible = false;
        if (crumbGroup) crumbGroup.visible = false;
      } else {
        // LANCAMENTO CARTOON: 1) Voa COLADA NA LENTE DA CAMERA! 2) Ricocheteia na tigela! 3) Pousa empanada!
        this.sausageOnSkewer.visible = false;
        this.flyingSausage.visible = true;

        if (slipProg < 0.42) {
          // Estagio 1: Zoom pra frente em arco exagerado bem perto da lente da camera!
          const p1 = clamp((slipProg - 0.08) / 0.34, 0, 1);
          const ease1 = Math.sin(p1 * Math.PI * 0.5);
          sausageWorldX = lerp(originX, flyby.x, ease1);
          sausageWorldY = lerp(originY, flyby.y, ease1) + Math.sin(p1 * Math.PI) * 0.26;
          sausageWorldZ = lerp(originZ, flyby.z, ease1);

          this.flyingSausage.position.set(sausageWorldX, sausageWorldY, sausageWorldZ);
          // Stretch cartoon de velocidade + giro comico colado na lente!
          const speedStretch = 1.0 + Math.sin(p1 * Math.PI) * 0.32;
          const speedSq = 1.0 / Math.sqrt(speedStretch);
          this.flyingSausage.scale.set(this.scale * speedStretch, this.scale * speedSq, this.scale * speedSq);
          this.flyingSausage.rotation.set(
            p1 * Math.PI * 2.2,
            lerp(rotY, 0.42, p1),
            lerp(rotZ, -0.35 + p1 * 0.85, p1)
          );
          this._animateRubberLinks(this.flyingSausage, t, 1.35, 0.05);
        } else if (slipProg < 0.66) {
          // Estagio 2: Ricocheteia da lente direto pra dentro da tigela vermelha de farofa!
          const p2 = clamp((slipProg - 0.42) / 0.24, 0, 1);
          const arc2 = Math.sin(p2 * Math.PI) * 0.44;
          sausageWorldX = lerp(flyby.x, impact.x, p2);
          sausageWorldY = lerp(flyby.y, impact.y, p2) + arc2;
          sausageWorldZ = lerp(flyby.z, impact.z, p2);

          this.flyingSausage.position.set(sausageWorldX, sausageWorldY, sausageWorldZ);
          const stretch2 = 1.0 + Math.sin(p2 * Math.PI) * 0.28;
          const sq2 = 1.0 / Math.sqrt(stretch2);
          this.flyingSausage.scale.set(this.scale * stretch2, this.scale * sq2, this.scale * sq2);
          this.flyingSausage.rotation.set(
            Math.PI * 2.2 + p2 * Math.PI * 2.3,
            lerp(0.42, 0.28, p2),
            lerp(0.50, Math.PI * 1.6, p2)
          );
          this._animateRubberLinks(this.flyingSausage, t, 1.20, 0.02);
        } else {
          // Estagio 3: Quica da tigela de farofa para cima da tabua de corte (EMPANADA NA FAROFA!)
          const landP = clamp((slipProg - 0.66) / 0.34, 0, 1);
          const bounceArc = Math.sin(landP * Math.PI) * 0.26 + Math.abs(Math.sin(landP * Math.PI * 2.0)) * Math.pow(1 - landP, 1.4) * 0.12;
          const settleP = clamp(landP * 1.35, 0, 1);
          sausageWorldX = lerp(impact.x, landing.x, settleP);
          sausageWorldY = lerp(impact.y, landing.y, settleP) + bounceArc;
          sausageWorldZ = lerp(impact.z, landing.z, settleP);

          // Na tabua, escala 0.72 para caber linda e empanada sobre a tabua sem varar a mesa!
          const boardScale = this.scale * lerp(1.0, 0.72, settleP);
          const squashBounce = 1.0 - Math.sin(settleP * Math.PI) * 0.18;
          this.flyingSausage.position.set(sausageWorldX, sausageWorldY, sausageWorldZ);
          this.flyingSausage.scale.set(boardScale / Math.sqrt(squashBounce), boardScale * squashBounce, boardScale / Math.sqrt(squashBounce));
          this.flyingSausage.rotation.set(
            lerp(Math.PI * 4.5, Math.PI * 4.0, settleP),
            0.28,
            lerp(Math.PI * 1.6, Math.PI * 2.0, settleP)
          );
          this._animateRubberLinks(this.flyingSausage, t, 0.22 * (1 - settleP * 0.8), 0.0);
        }

        if (crumbGroup) {
          const coatP = clamp((slipProg - 0.65) / 0.12, 0, 1);
          crumbGroup.visible = coatP > 0.02;
          crumbGroup.scale.setScalar(0.35 + coatP * 0.65);
        }
      }

      // Gotinhas brilhantes de gordura quente pingando enquanto esta no espeto
      const showDrips = sizzleAmp > 0.08 && slipProg < 0.08;
      const dripRate = 1.55 + preSlip * 1.05;
      for (let i = 0; i < this.drips.length; i++) {
        const dr = this.drips[i];
        dr.mesh.visible = showDrips;
        if (showDrips) {
          const cyc = (t * dripRate + dr.seed) % 1;
          dr.mesh.position.set(dr.xOff + slideLocalX, -0.085 - cyc * cyc * 0.46, 0);
          dr.mesh.scale.setScalar((0.70 + (1 - cyc) * 0.62) * sizzleAmp * (1 + preSlip * 0.30));
        }
      }

      // Fumaca quente aromatica subindo da linguica
      const showSteam = sizzleAmp > 0.05;
      for (let i = 0; i < this.steamPuffs.length; i++) {
        const sp = this.steamPuffs[i];
        sp.mesh.visible = showSteam;
        if (showSteam) {
          const cyc = (t * 0.58 + sp.seed) % 1;
          sp.mesh.position.set(
            sausageWorldX + sp.xSpread + Math.sin(t * 2.1 + sp.seed * 7) * 0.06,
            sausageWorldY + 0.09 + cyc * 0.56,
            sausageWorldZ + Math.cos(t * 1.8 + sp.seed * 5) * 0.05
          );
          sp.mesh.scale.setScalar((0.46 + cyc * 1.18) * (1 - cyc * 0.45) * sizzleAmp);
        }
      }

      // 48 PARTICULAS DE FAROFA DOURADA + MIGALHAS TOSTADAS EXPLODINDO E ESPALHANDO NA MESA!
      const showFarofa = explosionP > 0.01;
      for (let i = 0; i < this.farofaParticles.length; i++) {
        const fp = this.farofaParticles[i];
        fp.mesh.visible = showFarofa;
        if (showFarofa) {
          const spread = Math.sin(Math.min(1, explosionP * 1.20) * Math.PI * 0.5);
          const airArc = Math.sin(explosionP * Math.PI);
          const lift = airArc * fp.peakY;
          const settleMix = clamp((explosionP - 0.72) / 0.28, 0, 1);
          const burstX = impact.x + Math.cos(fp.angle) * fp.radius * spread * 1.48;
          const burstZ = impact.z + Math.sin(fp.angle) * fp.radius * spread * 1.32;
          const tableY = landing.y - 0.045;
          const fx = lerp(burstX, landing.x + fp.settleX * 1.95, settleMix * 0.45);
          const fz = lerp(burstZ, landing.z + fp.settleZ * 1.95, settleMix * 0.45);
          const fy = Math.max(tableY, impact.y + lift - explosionP * explosionP * 0.05);

          fp.mesh.position.set(fx, fy, fz);
          fp.mesh.rotation.set(t * fp.spinRate * (1 - settleMix), t * fp.spinRate * 0.7, 0);
          fp.mesh.scale.setScalar(fp.size * lerp(1.22, 0.72, settleMix));
        }
      }

      // MASSIVE GOLDEN FAROFA MUSHROOM CLOUD (haste vertical + chapeu gigante dourado, abaixo da placa!)
      const riseEnv = Math.sin(Math.min(1, explosionP * 2.5) * Math.PI * 0.5);
      const fadeEnv = 1.0 - clamp((explosionP - 0.78) / 0.22, 0, 1);
      const cloudVis = explosionP > 0.01 && fadeEnv > 0.03;
      const stemTopY = impact.y + 0.10 + riseEnv * 0.64;

      for (let i = 0; i < this.mushroomStem.length; i++) {
        const st = this.mushroomStem[i];
        st.mesh.visible = cloudVis;
        if (cloudVis) {
          const wobX = Math.sin(t * 7.0 + i * 1.4) * 0.025;
          st.mesh.position.set(
            impact.x + st.ox + wobX,
            lerp(impact.y + 0.05, stemTopY, st.hRatio),
            impact.z + st.oz
          );
          const sc = st.baseScale * (0.45 + riseEnv * 0.85) * (0.35 + fadeEnv * 0.65);
          st.mesh.scale.set(sc * 0.92, sc * 1.05, sc * 0.92);
        }
      }

      for (let i = 0; i < this.mushroomCap.length; i++) {
        const cp = this.mushroomCap[i];
        cp.mesh.visible = cloudVis;
        if (cloudVis) {
          const capExpand = 0.35 + riseEnv * 1.05;
          const swirl = t * 0.8;
          cp.mesh.position.set(
            impact.x + Math.cos(cp.angle + swirl) * cp.ringR * capExpand,
            stemTopY + cp.yOff * riseEnv + Math.sin(t * 6.0 + i) * 0.025,
            impact.z + Math.sin(cp.angle + swirl) * cp.ringR * capExpand * 0.85
          );
          const sc = cp.baseScale * (0.35 + riseEnv * 0.95) * (0.25 + fadeEnv * 0.75);
          cp.mesh.scale.set(sc * 1.15, sc * 0.84, sc * 1.10);
        }
      }
    }
  }

  global.EspetoChurrasco3D = EspetoChurrasco3D;
})(typeof window !== 'undefined' ? window : globalThis);
