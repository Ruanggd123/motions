# 🎬 CENA 3 — Segundo Passo (Cresce para 8m = Prédio)
## Duração: 6.0s (12.0–18.0)
## Arquivo: cena-3-prompt.md

### 🌍 AMBIENTE
- **Descrição:** Mesma rua urbana, mas agora o personagem está gigante comparado aos prédios baixos (3-5 andares). Os prédios que antes pareciam altos agora são menores que ele. Carros na rua parecem brinquedos. Pessoas correm assustadas. O céu começa a ficar mais azul profundo (#4A90D9) nas bordas superiores. Sombras do personagem cobrem a rua inteira. Vento começa a soprar (árvores balançam mais forte).
- **Cor de Fundo:** #6BB3D9 → #4A90D9 (transição gradual)
- **Atmosfera:** Caos crescente, pânico inicial, escala impressionante
- **Elementos Ambientais:** Partículas de poeira aumentam (400 partículas), sombras dinâmicas gigantes, vento forte nas árvores e roupas dos NPCs

### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (mesmo lugar, continuando a crescer)
- **Escala:** 2.2x → 4.4x (cresce de 4m para 8m durante os 6 segundos)
- **Pose:** shocked → mais shocked (expressão de choque extremo)
- **Ação:** Continua crescendo com expressão de pânico. Mãos ainda no rosto, olhos arregalados ao máximo. Boca aberta em grito silencioso. Cabeça olhando para baixo (vendo as pessoas minúsculas).
- **Expressão:** chocado (mantém) → pânico (intensifica)
- **Rotação Y:** 0 radianos (olhando para frente/câmera)

### 📷 CÂMERA
- **Tipo:** LOW ANGLE → WIDE SHOT (recua mais para mostrar escala)
- **Posição:** [0, 2.5, 7] → [0, 4.0, 10] (sobe e recua significativamente)
- **LookAt:** [0, 2.0, 0] → [0, 3.5, 0] (sobe para acompanhar crescimento)
- **FOV:** 50° → 55° (aumenta para mostrar mais cenário)
- **Shake:** 0.015 → 0.025 (aumenta com o caos)
- **Movimento GSAP:** Câmera sobe e recua dramaticamente com power2.inOut, mantendo personagem centralizado enquanto cresce para 8m

### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem (acima da cabeça) | posição dinâmica [0, charHeight+1.5, 0] | cor #FF6B35 | animação: bounce vertical yoyo
- **Seta 2:** Aponta para o prédio mais alto ao lado | posição [6, 8, -7] | cor #FFD700 (dourado) | animação: pulse opacity
- **Halo 1:** Ao redor do personagem | raio dinâmico (2.5 → 5.0 conforme cresce) | cor #FF6B35 | opacity 0.2 pulsando
- **Halo 2:** Ao redor do prédio | raio 1.5 | cor #FFD700 | opacity 0.15 pulsando
- **Texto 3D Dinâmico:** "4.0m" → "8.0m" (atualiza conforme cresce) | posição [2.0, charHeight/2, 0] | cor #FFFFFF com outline preto | tamanho 0.4
- **Texto Comparativo:** "= PRÉDIO!" aparece quando atinge 8m | posição [6, 9, -7] | cor #FFD700 | fade-in no segundo 5
- **Linha de Comparação:** Linha tracejada vertical do chão ao topo do personagem vs prédio | cor #FFFFFF | opacity 0.6

### 🏗️ ELEMENTOS 3D (18 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Chão/Calçada | PlaneGeometry | 30x30 | [0, -0.01, 0] | #808080 | Standard metalness=0.1 roughness=0.9 |
| 2 | Grama lateral esq | PlaneGeometry | 6x30 | [-9, -0.005, 0] | #4CAF50 | Standard roughness=0.95 |
| 3 | Grama lateral dir | PlaneGeometry | 6x30 | [9, -0.005, 0] | #4CAF50 | Standard roughness=0.95 |
| 4 | Poste luz 1 (agora pequeno) | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [-3, 1.75, 1] | #555555 + #FFDD44(emissive) | Standard metalness=0.7 + Basic emissive |
| 5 | Poste luz 2 (agora pequeno) | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [3, 1.75, 1] | #555555 + #FFDD44(emissive) | Standard metalness=0.7 + Basic emissive |
| 6 | Carro vermelho (minúsculo) | BoxGeometry x2 + CylinderGeometry x4 | 1.8x0.6x0.9 | [3.5, 0.35, -1] | #CC2222 | Standard metalness=0.6 roughness=0.4 |
| 7 | Carro azul (minúsculo) | BoxGeometry x2 + CylinderGeometry x4 | 1.8x0.6x0.9 | [-3.5, 0.35, -1] | #2244AA | Standard metalness=0.6 roughness=0.4 |
| 8 | Árvore (balançando forte) | CylinderGeometry + SphereGeometry | r=0.12,h=1.5 + r=0.9 | [-2, 0.75, 2] | #5C3A1E + #228B22 | Standard roughness=0.9 + 0.8 |
| 9 | Banco praça (minúsculo) | BoxGeometry | 1.2x0.35x0.4 | [2, 0.25, 2] | #8B4513 | Standard roughness=0.85 |
| 10 | Prédio 1 (esq, agora menor) | BoxGeometry + PlaneGeometry x8 | 3x8x2.5 | [-6, 4, -6] | #8899AA + #FFEE88 | Standard metalness=0.2 + Basic emissive |
| 11 | Prédio 2 (dir, referência 12m) | BoxGeometry + PlaneGeometry x12 | 2.5x12x2.5 | [6, 6, -7] | #778899 + #FFEE88 | Standard metalness=0.2 + Basic emissive |
| 12 | Prédio 3 (centro, agora menor) | BoxGeometry + PlaneGeometry x6 | 4x6x2 | [0, 3, -9] | #99AABB + #FFEE88 | Standard metalness=0.2 + Basic emissive |
| 13 | NPC 1 (correndo assustado) | CapsuleGeometry simplificada | h=1.7 | [-1.5, 0.85, 3] | #FFB74D + #5D4037 | Standard roughness=0.8 |
| 14 | NPC 2 (apontando para cima) | CapsuleGeometry simplificada | h=1.6 | [1.8, 0.8, 3.5] | #FFCC80 + #1565C0 | Standard roughness=0.8 |
| 15 | NPC 3 (novo, caindo de joelhos) | CapsuleGeometry simplificada | h=1.5 | [0, 0.5, 4] | #FFE0B2 + #388E3C | Standard roughness=0.8 |
| 16 | Linha comparação vertical | LineGeometry | dinâmica | [0→6, 0→8, 0→-7] | #FFFFFF | LineBasicMaterial linewidth=2 dashed |
| 17 | Sombra gigante personagem | PlaneGeometry circular | raio=charScale*2 | [0, 0.005, 0] | #000000 | Basic transparent opacity=0.3 |
| 18 | Partículas vento (folhas) | Points geometry x50 | spread 20x10x20 | [random] | #8BC34A | PointsMaterial size=0.08 |

### 💡 ILUMINAÇÃO PBR
- **Key Light:** DirectionalLight | intensidade 2.8 → 3.2 (mais dramático) | cor #FFF5E0 | posição [5, 10, 4] | sombras ON (PCFSoft, mapSize 2048)
- **Fill Light:** DirectionalLight | intensidade 0.8 → 0.6 (mais contraste) | cor #B0C4DE | posição [-4, 4, 3]
- **Rim Light:** DirectionalLight | intensidade 2.2 → 2.8 (destaca silhueta gigante) | cor #4A90D9 | posição [0, 5, -6]
- **Ambient:** AmbientLight | intensidade 0.5 → 0.4 | cor #404060
- **Hemisphere:** HemisphereLight | sky #6BB3D9 → #4A90D9 | ground #444444 | intensidade 0.5
- **Point Lights:** 2x PointLight nos postes | intensidade 1.2 → 1.5 | cor #FFDD44 | distância 5

### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=0.6 → 0.8 (mais drama) | radius=0.3 | threshold=0.85
- **SSAO:** radius=0.5 | intensity=1.5 → 1.8 (mais profundidade) | bias=0.025
- **DOF:** focus=7.0 → 10.0 (ajusta com câmera recuando) | aperture=0.002 | maxblur=0.012 → 0.015 (fundo mais desfocado)
- **Color Correction:** saturation=1.2 → 1.3 | contrast=1.1 → 1.15 | brightness=1.0
- **Tone Mapping:** ACESFilmicToneMapping | exposure=1.4 → 1.5

### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 0-4s: Personagem continua crescendo de 2.2x para 4.4x
tl.to(character.scale, {
  x: 4.4, y: 4.4, z: 4.4,
  duration: 4,
  ease: "power1.inOut"
}, 0);

// 0-4s: Câmera sobe e recua dramaticamente
tl.to(camera.position, {
  y: 4.0, z: 10,
  duration: 4,
  ease: "power2.inOut",
  onUpdate: () => camera.lookAt(0, character.scale.y * 0.8, 0)
}, 0);

// 0-1s: Expressão intensifica para pânico
tl.to(character.mouth.scale, { y: 2.0, duration: 0.3 }, 0);
tl.to(character.leftEyelid.scale, { y: 0.1, duration: 0.2 }, 0); // Olhos arregalam ao máximo
tl.to(character.rightEyelid.scale, { y: 0.1, duration: 0.2 }, 0);

// 1-2s: Cabeça olha para baixo (vendo pessoas minúsculas)
tl.to(head.rotation, { x: 0.3, duration: 0.5 }, 1);

// 2-3s: Seta do prédio aparece e pulsa
tl.set(arrowPredio, { visible: true }, 2);
tl.from(arrowPredio.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 2);
tl.to(arrowPredio.material, { opacity: 0.5, duration: 0.5, repeat: -1, yoyo: true }, 2.4);

// 3-4s: NPCs reagem dramaticamente
tl.to(npc1.position, { x: -3, z: 5, duration: 1, ease: "power2.out" }, 2.5); // Corre
tl.to(npc2.rotation, { y: Math.PI, duration: 0.5 }, 3); // Vira e corre
tl.to(npc3.rotation, { x: -Math.PI/2, duration: 0.5 }, 3.2); // Cai de joelhos

// 4-5s: Texto comparativo "= PRÉDIO!" aparece
tl.from(textComparativo.material, { opacity: 0, duration: 0.5 }, 4.5);
tl.from(textComparativo.position, { y: 10, duration: 0.5, ease: "back.out(1.7)" }, 4.5);

// 5-6s: Linha de comparação aparece (personagem ↔ prédio)
tl.from(linhaComparacao.material, { opacity: 0, duration: 0.5 }, 5);

// 5-6s: Sombra gigante expande
tl.from(sombraGigante.scale, { x: 0.5, y: 0.5, duration: 1, ease: "power2.out" }, 5);

// Contínuo: Seta do personagem segue a altura
gsap.to(arrowPersonagem.position, {
  y: () => character.scale.y * 1.8 + 1.5,
  duration: 0.1,
  repeat: -1,
  ease: "none"
});

// Contínuo: Halo expande com o personagem
gsap.to(haloPersonagem.scale, {
  x: () => character.scale.x * 1.2,
  y: () => character.scale.y * 1.2,
  duration: 0.1,
  repeat: -1,
  ease: "none"
});

// Contínuo: Texto de altura atualiza
gsap.to(heightLabel, {
  onUpdate: function() {
    const altura = (character.scale.y * 1.8).toFixed(1);
    updateTextSprite(heightLabel, `${altura}m`);
  },
  duration: 4,
  ease: "none"
}, 0);

// Contínuo: Partículas de vento/folhas voam
gsap.to(particulasVento.rotation, { y: Math.PI * 4, duration: 6, repeat: -1, ease: "none" });
gsap.to(particulasVento.position, { x: 5, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });

// Contínuo: Árvores balançam forte com vento
gsap.to(tree.canopy.rotation, { z: 0.2, duration: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });

// Contínuo: Sombra do personagem cresce
gsap.to(sombraGigante.scale, {
  x: () => character.scale.x * 2,
  y: () => character.scale.y * 2,
  duration: 0.1,
  repeat: -1,
  ease: "none"
});
```

### 🎙️ NARRAÇÃO DESTA CENA
"Segundo passo: do tamanho de um prédio. Oito metros. Carros param. Sirenes tocam."

### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** CONTÍNUO (sem corte — o personagem continua crescendo)
- **Duração:** 0.5s de crossfade suave na cor do céu (#4A90D9 → #1E90FF)
- **Efeito:** A escala continua aumentando, a câmera continua recuando, e o personagem passa dos prédios — nuvens começam a aparecer no topo da tela