# 🎬 CENA 4 — Acima dos Prédios (Cresce para 20m)
## Duração: 7.0s (18.0–25.0)
## Arquivo: cena-4-prompt.md

### 🌍 AMBIENTE
- **Descrição:** O personagem agora está gigante (20m), muito acima dos prédios urbanos (que parecem maquetes). A câmera recuou significativamente para mostrar a escala. O céu mudou para azul profundo (#4A90D9 → #1E90FF). Nuvens brancas começam a aparecer na altura do peito do personagem. A cidade abaixo é visível como um mapa em miniatura — ruas são linhas, carros são pontos, prédios são blocos coloridos. Vento forte sopra (partículas de poeira e folhas voam horizontalmente). Sombras dos prédios são minúsculas comparadas à sombra gigante do personagem.
- **Cor de Fundo:** #4A90D9 → #1E90FF (transição para azul mais profundo)
- **Atmosfera:** Grandiosidade, isolamento, perspectiva aérea impressionante
- **Elementos Ambientais:** Partículas aumentam (500 partículas), nuvens volumétricas aparecem, vento forte horizontal, sombras dinâmicas gigantes no chão

### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (mesmo lugar, continuando a crescer verticalmente)
- **Escala:** 4.4x → 11.0x (cresce de 8m para 20m durante os 7 segundos)
- **Pose:** shocked → tense (expressão de tensão ao perceber a altura)
- **Ação:** Continua crescendo com expressão de pânico crescente. Mãos ainda próximas ao rosto mas começando a se afastar. Olhos olhando para baixo (vertigem). Cabelos e roupas balançam com o vento forte. Pernas tremem levemente (medo de altura).
- **Expressão:** pânico → tenso (olhos arregalados, boca semi-aberta, sobrancelhas levantadas)
- **Rotação Y:** 0 radianos (olhando para frente/câmera)

### 📷 CÂMERA
- **Tipo:** WIDE SHOT → EXTREME WIDE (recua dramaticamente)
- **Posição:** [0, 4.0, 10] → [0, 8.0, 16] (sobe e recua muito para mostrar escala)
- **LookAt:** [0, 3.5, 0] → [0, 7.0, 0] (sobe para acompanhar crescimento)
- **FOV:** 55° → 60° (aumenta para mostrar mais cenário aéreo)
- **Shake:** 0.025 → 0.035 (aumenta com vento e drama)
- **Movimento GSAP:** Câmera sobe e recua dramaticamente com power2.inOut, mantendo personagem centralizado enquanto cresce para 20m. Leve rotação no eixo X para dar sensação de olhar de baixo para cima.

### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem (acima da cabeça) | posição dinâmica [0, charHeight+2, 0] | cor #FF6B35 | animação: bounce vertical yoyo
- **Seta 2:** Aponta para as nuvens que aparecem | posição [5, 15, -5] | cor #FFFFFF | animação: pulse opacity + float
- **Seta 3:** Aponta para a cidade minúscula abaixo | posição [0, -2, 0] | cor #FFD700 | animação: pulse scale
- **Halo 1:** Ao redor do personagem | raio dinâmico (5.0 → 12.0 conforme cresce) | cor #FF6B35 | opacity 0.2 pulsando
- **Halo 2:** Ao redor das nuvens | raio 3.0 | cor #FFFFFF | opacity 0.1 pulsando
- **Texto 3D Dinâmico:** "8.0m" → "20.0m" (atualiza conforme cresce) | posição [3.0, charHeight/2, 0] | cor #FFFFFF com outline preto | tamanho 0.5
- **Texto Comparativo:** "ACIMA DOS PRÉDIOS!" aparece quando atinge 15m | posição [0, 18, 0] | cor #FFD700 | fade-in no segundo 4
- **Linha de Comparação:** Linha tracejada vertical do chão ao topo do personagem vs altura dos prédios | cor #FFFFFF | opacity 0.6

### 🏗️ ELEMENTOS 3D (20 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Chão/Cidade (vista aérea) | PlaneGeometry | 50x50 | [0, -0.01, 0] | #808080 | Standard metalness=0.1 roughness=0.9 |
| 2 | Grid de ruas | LineSegments | 50x50 | [0, 0.01, 0] | #FFFFFF | LineBasicMaterial opacity=0.3 |
| 3 | Prédio 1 (agora minúsculo) | BoxGeometry | 3x8x2.5 | [-6, 4, -6] | #8899AA | Standard metalness=0.2 roughness=0.7 |
| 4 | Prédio 2 (agora minúsculo) | BoxGeometry | 2.5x12x2.5 | [6, 6, -7] | #778899 | Standard metalness=0.2 roughness=0.7 |
| 5 | Prédio 3 (agora minúsculo) | BoxGeometry | 4x6x2 | [0, 3, -9] | #99AABB | Standard metalness=0.2 roughness=0.7 |
| 6 | Prédios extras (cidade) | BoxGeometry x20 | variados | random [-20..20, h/2, -20..-5] | variados | Standard metalness=0.2 roughness=0.7 |
| 7 | Carros (pontos minúsculos) | BoxGeometry x10 | 0.3x0.1x0.15 | random | variados | Standard metalness=0.6 roughness=0.4 |
| 8 | Nuvem 1 (aparece) | SphereGeometry x3 | r=2+1.5+1.2 | [-8, 12, -8] | #FFFFFF | Standard transparent opacity=0.7 |
| 9 | Nuvem 2 (aparece) | SphereGeometry x3 | r=2.5+1.8+1.4 | [10, 15, -10] | #F0F0FF | Standard transparent opacity=0.6 |
| 10 | Nuvem 3 (aparece) | SphereGeometry x2 | r=1.5+1.0 | [0, 10, -5] | #FFFFFF | Standard transparent opacity=0.5 |
| 11 | Poste luz 1 (minúsculo) | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [-3, 1.75, 1] | #555555 + #FFDD44 | Standard metalness=0.7 + Basic emissive |
| 12 | Poste luz 2 (minúsculo) | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [3, 1.75, 1] | #555555 + #FFDD44 | Standard metalness=0.7 + Basic emissive |
| 13 | Árvore (minúscula) | CylinderGeometry + SphereGeometry | r=0.12,h=1.5 + r=0.9 | [-2, 0.75, 2] | #5C3A1E + #228B22 | Standard roughness=0.9 + 0.8 |
| 14 | NPC 1 (ponto minúsculo) | CapsuleGeometry | h=1.7 | [-1.5, 0.85, 3] | #FFB74D | Standard roughness=0.8 |
| 15 | NPC 2 (ponto minúsculo) | CapsuleGeometry | h=1.6 | [1.8, 0.8, 3.5] | #FFCC80 | Standard roughness=0.8 |
| 16 | Sombra gigante personagem | PlaneGeometry circular | raio=charScale*2.5 | [0, 0.005, 0] | #000000 | Basic transparent opacity=0.4 |
| 17 | Partículas vento/folhas | Points geometry x100 | spread 40x20x40 | [random] | #8BC34A + #FFFFFF | PointsMaterial size=0.1 |
| 18 | Linha comparação vertical | LineGeometry | dinâmica | [0→0, 0→20, 0→0] | #FFFFFF | LineBasicMaterial linewidth=2 dashed |
| 19 | Indicador de altitude | Sprite texto | "ALTITUDE: 20m" | [4, 10, 0] | #00D4FF | SpriteMaterial |
| 20 | Bússola/orientação | RingGeometry + setas | r=1.5 | [0, 0.02, 8] | #FFFFFF | Basic transparent opacity=0.5 |

### 💡 ILUMINAÇÃO PBR
- **Key Light:** DirectionalLight | intensidade 3.2 → 3.5 (mais dramático com altitude) | cor #FFF5E0 | posição [5, 15, 4] | sombras ON (PCFSoft, mapSize 2048)
- **Fill Light:** DirectionalLight | intensidade 0.6 → 0.8 (mais fill com céu aberto) | cor #B0C4DE | posição [-4, 8, 3]
- **Rim Light:** DirectionalLight | intensidade 2.8 → 3.5 (destaca silhueta contra céu) | cor #1E90FF | posição [0, 10, -6]
- **Ambient:** AmbientLight | intensidade 0.4 → 0.5 | cor #404060
- **Hemisphere:** HemisphereLight | sky #4A90D9 → #1E90FF | ground #444444 | intensidade 0.5 → 0.6
- **Point Lights:** 2x PointLight nos postes | intensidade 1.5 → 0.5 (perdem importância com altitude) | cor #FFDD44 | distância 5

### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=0.8 → 1.0 (mais brilho nas nuvens e luzes) | radius=0.4 | threshold=0.8
- **SSAO:** radius=0.5 | intensity=1.8 → 2.0 (mais profundidade aérea) | bias=0.025
- **DOF:** focus=10.0 → 16.0 (ajusta com câmera recuando) | aperture=0.002 | maxblur=0.015 → 0.02 (fundo mais desfocado)
- **Color Correction:** saturation=1.3 → 1.4 | contrast=1.15 → 1.2 | brightness=1.0 → 1.05
- **Tone Mapping:** ACESFilmicToneMapping | exposure=1.5 → 1.6

### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 0-5s: Personagem continua crescendo de 4.4x para 11.0x
tl.to(character.scale, {
  x: 11.0, y: 11.0, z: 11.0,
  duration: 5,
  ease: "power1.inOut"
}, 0);

// 0-5s: Câmera sobe e recua dramaticamente
tl.to(camera.position, {
  y: 8.0, z: 16,
  duration: 5,
  ease: "power2.inOut",
  onUpdate: () => camera.lookAt(0, character.scale.y * 0.7, 0)
}, 0);

// 0-1s: Expressão muda para tenso (medo de altura)
tl.to(character.mouth.scale, { y: 1.2, duration: 0.3 }, 0);
tl.to(character.leftEyelid.scale, { y: 0.4, duration: 0.2 }, 0);
tl.to(character.rightEyelid.scale, { y: 0.4, duration: 0.2 }, 0);
tl.to(character.leftBrow.rotation, { z: 0.2, duration: 0.3 }, 0);
tl.to(character.rightBrow.rotation, { z: -0.2, duration: 0.3 }, 0);

// 1-2s: Mãos se afastam do rosto lentamente
tl.to(character.leftShoulderPivot.rotation, { z: 0.3, x: 0, duration: 1 }, 1);
tl.to(character.rightShoulderPivot.rotation, { z: -0.3, x: 0, duration: 1 }, 1);

// 2-3s: Cabeça olha para baixo (vertigem)
tl.to(head.rotation, { x: 0.4, duration: 0.5 }, 2);

// 2-4s: Nuvens aparecem com fade-in e flutuam
tl.from(cloud1.material, { opacity: 0, duration: 1 }, 2);
tl.from(cloud2.material, { opacity: 0, duration: 1 }, 2.5);
tl.from(cloud3.material, { opacity: 0, duration: 1 }, 3);
tl.to(cloud1.position, { x: -10, duration: 5, ease: "none" }, 2);
tl.to(cloud2.position, { x: 12, duration: 5, ease: "none" }, 2.5);

// 3-4s: Seta das nuvens aparece
tl.set(arrowNuvens, { visible: true }, 3);
tl.from(arrowNuvens.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 3);
tl.to(arrowNuvens.material, { opacity: 0.5, duration: 0.5, repeat: -1, yoyo: true }, 3.4);

// 4-5s: Texto "ACIMA DOS PRÉDIOS!" aparece
tl.from(textComparativo.material, { opacity: 0, duration: 0.5 }, 4);
tl.from(textComparativo.position, { y: 20, duration: 0.5, ease: "back.out(1.7)" }, 4);

// 4-6s: Seta da cidade abaixo aparece
tl.set(arrowCidade, { visible: true }, 4.5);
tl.from(arrowCidade.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 4.5);
tl.to(arrowCidade.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5, repeat: -1, yoyo: true }, 5);

// 5-7s: Indicador de altitude aparece
tl.from(indicadorAltitude.material, { opacity: 0, duration: 0.5 }, 5);

// Contínuo: Seta do personagem segue a altura
gsap.to(arrowPersonagem.position, {
  y: () => character.scale.y * 1.8 + 2,
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
  duration: 5,
  ease: "none"
}, 0);

// Contínuo: Partículas de vento voam horizontalmente
gsap.to(particulasVento.position, { x: 20, duration: 3, repeat: -1, ease: "none" });
gsap.to(particulasVento.rotation, { y: Math.PI * 2, duration: 10, repeat: -1, ease: "none" });

// Contínuo: Cabelos e roupas balançam com vento
gsap.to(character.hair.rotation, { z: 0.15, duration: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(character.hoodie.rotation, { z: 0.08, duration: 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" });

// Contínuo: Pernas tremem (medo de altura)
gsap.to(character.leftLeg.rotation, { z: 0.05, duration: 0.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(character.rightLeg.rotation, { z: -0.05, duration: 0.1, repeat: -1, yoyo: true, ease: "sine.inOut" });

// Contínuo: Sombra gigante expande
gsap.to(sombraGigante.scale, {
  x: () => character.scale.x * 2.5,
  y: () => character.scale.y * 2.5,
  duration: 0.1,
  repeat: -1,
  ease: "none"
});

// Contínuo: Nuvens derivam suavemente
gsap.to(cloud1.position, { x: "-=2", duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(cloud2.position, { x: "+=2", duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
```

### 🎙️ NARRAÇÃO DESTA CENA
"Terceiro passo: você passa dos prédios. Vinte metros. O céu fica mais azul."

### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** CONTÍNUO (sem corte — o personagem continua crescendo)
- **Duração:** 0.5s de crossfade suave na cor do céu (#1E90FF → #FFB347 dourado)
- **Efeito:** A escala continua aumentando, a câmera continua recuando, e o personagem entra nas nuvens — visão fica parcialmente obscurecida por nuvens brancas