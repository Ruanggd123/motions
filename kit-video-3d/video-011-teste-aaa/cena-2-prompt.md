# 🎬 CENA 2 — Primeiro Passo (Cresce para 4m)
## Duração: 6.0s (6.0–12.0)
## Arquivo: cena-2-prompt.md

### 🌍 AMBIENTE
- **Descrição:** Mesma rua urbana da Cena 1, mas agora o personagem está crescendo. O poste de luz ao lado serve como referência de escala — quando o personagem atinge 4m, ele fica da mesma altura que o poste. As pessoas na calçada (NPCs simples) olham para cima assustadas. Carros param no meio da rua. O céu continua azul claro (#87CEEB) mas começa a escurecer levemente nas bordas (transição sutil para a próxima cena). Sombras ficam mais longas conforme o personagem cresce.
- **Cor de Fundo:** #87CEEB → #6BB3D9 (transição gradual no final)
- **Atmosfera:** Surpresa, caos inicial, pessoas reagindo ao extraordinário
- **Elementos Ambientais:** Partículas de poeira aumentam (300 partículas), sombras dinâmicas se alongam, vento sutil nas árvores

### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (mesmo lugar, mas crescendo verticalmente)
- **Escala:** 1.0x → 2.2x (cresce de 1.8m para 4m durante os 6 segundos)
- **Pose:** idle → shocked (transição suave aos 2 segundos)
- **Ação:** Começa parado, depois cresce suavemente com expressão de surpresa. Mãos vão para o rosto quando percebe que está crescendo. Olhos arregalam. Boca abre em "O" de espanto.
- **Expressão:** neutro → curioso (0-2s) → chocado (2-6s)
- **Rotação Y:** 0 radianos (olhando para frente/câmera)

### 📷 CÂMERA
- **Tipo:** MEDIUM SHOT → LOW ANGLE (transição conforme personagem cresce)
- **Posição:** [0, 1.5, 6] → [0, 2.5, 7] (sobe e recua para manter enquadramento)
- **LookAt:** [0, 1.0, 0] → [0, 2.0, 0] (sobe para acompanhar o crescimento)
- **FOV:** 45° → 50° (aumenta levemente para mostrar mais do cenário)
- **Shake:** 0.005 → 0.015 (aumenta com o caos)
- **Movimento GSAP:** Câmera sobe e recua suavemente com power2.inOut, mantendo o personagem centralizado enquanto cresce

### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem (acima da cabeça) | posição dinâmica [0, charHeight+1, 0] | cor #FF6B35 | animação: bounce vertical yoyo
- **Seta 2:** Aponta para o poste ao lado | posição [-3, 3.5, 1] | cor #00D4FF (ciano) | animação: pulse opacity
- **Halo 1:** Ao redor do personagem | raio dinâmico (1.2 → 2.5 conforme cresce) | cor #FF6B35 | opacity 0.2 pulsando
- **Halo 2:** Ao redor do poste | raio 0.8 | cor #00D4FF | opacity 0.15 pulsando
- **Texto 3D Dinâmico:** "1.8m" → "4.0m" (atualiza conforme cresce) | posição [1.5, charHeight/2, 0] | cor #FFFFFF com outline preto | tamanho 0.3
- **Texto Comparativo:** "= POSTE!" aparece quando atinge 4m | posição [-3, 4.5, 1] | cor #00D4FF | fade-in no segundo 5

### 🏗️ ELEMENTOS 3D (15 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Chão/Calçada | PlaneGeometry | 20x20 | [0, -0.01, 0] | #808080 | Standard metalness=0.1 roughness=0.9 |
| 2 | Grama lateral esq | PlaneGeometry | 4x20 | [-6, -0.005, 0] | #4CAF50 | Standard roughness=0.95 |
| 3 | Grama lateral dir | PlaneGeometry | 4x20 | [6, -0.005, 0] | #4CAF50 | Standard roughness=0.95 |
| 4 | Poste luz 1 (referência) | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [-3, 1.75, 1] | #555555 + #FFDD44(emissive) | Standard metalness=0.7 + Basic emissive |
| 5 | Poste luz 2 | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [3, 1.75, 1] | #555555 + #FFDD44(emissive) | Standard metalness=0.7 + Basic emissive |
| 6 | Carro vermelho (parado) | BoxGeometry x2 + CylinderGeometry x4 | 1.8x0.6x0.9 | [3.5, 0.35, -1] | #CC2222 | Standard metalness=0.6 roughness=0.4 |
| 7 | Carro azul (parado) | BoxGeometry x2 + CylinderGeometry x4 | 1.8x0.6x0.9 | [-3.5, 0.35, -1] | #2244AA | Standard metalness=0.6 roughness=0.4 |
| 8 | Árvore (balançando) | CylinderGeometry + SphereGeometry | r=0.12,h=1.5 + r=0.9 | [-2, 0.75, 2] | #5C3A1E + #228B22 | Standard roughness=0.9 + 0.8 |
| 9 | Banco praça | BoxGeometry | 1.2x0.35x0.4 | [2, 0.25, 2] | #8B4513 | Standard roughness=0.85 |
| 10 | Prédio 1 (esq) | BoxGeometry + PlaneGeometry x8 | 3x8x2.5 | [-6, 4, -6] | #8899AA + #FFEE88 | Standard metalness=0.2 + Basic emissive |
| 11 | Prédio 2 (dir) | BoxGeometry + PlaneGeometry x12 | 2.5x12x2.5 | [6, 6, -7] | #778899 + #FFEE88 | Standard metalness=0.2 + Basic emissive |
| 12 | Prédio 3 (centro) | BoxGeometry + PlaneGeometry x6 | 4x6x2 | [0, 3, -9] | #99AABB + #FFEE88 | Standard metalness=0.2 + Basic emissive |
| 13 | NPC 1 (pessoa assustada) | CapsuleGeometry simplificada | h=1.7 | [-1.5, 0.85, 3] | #FFB74D (pele) + #5D4037 (roupa) | Standard roughness=0.8 |
| 14 | NPC 2 (pessoa apontando) | CapsuleGeometry simplificada | h=1.6 | [1.8, 0.8, 3.5] | #FFCC80 (pele) + #1565C0 (roupa) | Standard roughness=0.8 |
| 15 | Linha de comparação (personagem vs poste) | LineGeometry | dinâmica | [0→-3, 0→3.5, 0→1] | #FFFFFF | LineBasicMaterial linewidth=2 |

### 💡 ILUMINAÇÃO PBR
- **Key Light:** DirectionalLight | intensidade 2.5 → 2.8 (aumenta com drama) | cor #FFF5E0 | posição [5, 8, 4] | sombras ON (PCFSoft, mapSize 2048)
- **Fill Light:** DirectionalLight | intensidade 1.0 → 0.8 (diminui para mais contraste) | cor #B0C4DE | posição [-4, 4, 3]
- **Rim Light:** DirectionalLight | intensidade 1.8 → 2.2 (destaca silhueta crescendo) | cor #87CEEB | posição [0, 3, -6]
- **Ambient:** AmbientLight | intensidade 0.6 → 0.5 | cor #404060
- **Hemisphere:** HemisphereLight | sky #87CEEB → #6BB3D9 | ground #444444 | intensidade 0.5
- **Point Lights:** 2x PointLight nos postes | intensidade 0.8 → 1.2 (brilham mais com o caos) | cor #FFDD44 | distância 5

### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=0.4 → 0.6 (aumenta com drama) | radius=0.3 | threshold=0.85
- **SSAO:** radius=0.5 | intensity=1.2 → 1.5 (mais profundidade) | bias=0.025
- **DOF:** focus=6.0 → 7.0 (ajusta com câmera recuando) | aperture=0.002 | maxblur=0.008 → 0.012 (fundo mais desfocado)
- **Color Correction:** saturation=1.1 → 1.2 | contrast=1.05 → 1.1 | brightness=1.0
- **Tone Mapping:** ACESFilmicToneMapping | exposure=1.3 → 1.4

### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 0-2s: Personagem começa a crescer suavemente
tl.to(character.scale, { 
  x: 2.2, y: 2.2, z: 2.2, 
  duration: 4, 
  ease: "power1.inOut" 
}, 0);

// 0-2s: Câmera sobe e recua para acompanhar
tl.to(camera.position, { 
  y: 2.5, z: 7, 
  duration: 4, 
  ease: "power2.inOut",
  onUpdate: () => camera.lookAt(0, character.scale.y * 0.8, 0)
}, 0);

// 1-2s: Expressão muda para chocado
tl.to(character.mouth.scale, { y: 1.5, duration: 0.3 }, 1.5);
tl.to(character.leftEyelid.scale, { y: 0.3, duration: 0.2 }, 1.5); // Olhos arregalam
tl.to(character.rightEyelid.scale, { y: 0.3, duration: 0.2 }, 1.5);

// 1.5-2.5s: Mãos vão para o rosto
tl.to(character.leftShoulderPivot.rotation, { z: 1.2, x: -0.5, duration: 0.5 }, 1.5);
tl.to(character.rightShoulderPivot.rotation, { z: -1.2, x: -0.5, duration: 0.5 }, 1.5);

// 2-4s: Seta do poste aparece e pulsa
tl.set(arrowPoste, { visible: true }, 2);
tl.from(arrowPoste.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 2);
tl.to(arrowPoste.material, { opacity: 0.5, duration: 0.5, repeat: -1, yoyo: true }, 2.4);

// 3-5s: Texto comparativo "= POSTE!" aparece
tl.from(textComparativo.material, { opacity: 0, duration: 0.5 }, 4.5);
tl.from(textComparativo.position, { y: 5, duration: 0.5, ease: "back.out(1.7)" }, 4.5);

// 4-6s: NPCs reagem (olham para cima, apontam)
tl.to(npc1.head.rotation, { x: -0.5, duration: 0.5 }, 3);
tl.to(npc2.rightArm.rotation, { z: -1.5, x: -0.3, duration: 0.5 }, 3.5);

// 5-6s: Linha de comparação aparece (personagem ↔ poste)
tl.from(linhaComparacao.material, { opacity: 0, duration: 0.5 }, 5);

// Contínuo: Seta do personagem segue a altura
gsap.to(arrowPersonagem.position, {
  y: () => character.scale.y * 1.8 + 1,
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

// Contínuo: Partículas aumentam
gsap.to(particles.material, { opacity: 0.6, duration: 4 }, 0);
gsap.to(particles.rotation, { y: Math.PI * 2, duration: 15, repeat: -1, ease: "none" });

// Contínuo: Árvores balançam com vento
gsap.to(tree.canopy.rotation, { z: 0.1, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
```

### 🎙️ NARRAÇÃO DESTA CENA
"Primeiro passo: você fica do tamanho de um poste. Quatro metros de altura. As pessoas olham assustadas."

### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** CONTÍNUO (sem corte — o personagem continua crescendo na mesma cena)
- **Duração:** 0.5s de crossfade suave na cor do céu (#6BB3D9 → #4A90D9)
- **Efeito:** A escala continua aumentando, a câmera continua recuando, e novos elementos aparecem (prédios ficam menores em comparação)