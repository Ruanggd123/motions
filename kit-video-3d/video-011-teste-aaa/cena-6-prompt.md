# 🎬 CENA 6 — Terra na Mão (Cresce para 100m+)
## Duração: 7.0s (32.0–39.0)
## Arquivo: cena-6-prompt.md
### 🌍 AMBIENTE
- **Descrição:** O personagem agora está colossal, acima da atmosfera terrestre. O céu é azul escuro profundo (#0a0a2e) transicionando para o negro do espaço estrelado. A curvatura da Terra é claramente visível abaixo — continentes verdes/azuis, nuvens brancas rodopiando, cidades como pontos de luz dourada à noite. A Lua aparece ao lado como referência de escala. Satélites artificiais passam como pequenos pontos brilhantes. A atmosfera terrestre é uma fina linha azul brilhante (limbo atmosférico) separando a Terra do espaço. Estrelas começam a aparecer no fundo com cintilação sutil.
- **Cor de Fundo:** #0a0a2e → #050510 (transição para espaço profundo)
- **Atmosfera:** Cósmica, solitária, vertiginosa, perspectiva divina
- **Elementos Ambientais:** Estrelas cintilantes (particles), nebulosa distante colorida, Terra rotacionando lentamente, Lua estática, satélites orbitando, limbo atmosférico brilhante, partículas de poeira espacial
### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (continuando a crescer verticalmente)
- **Escala:** 28.0x → 55.0x (cresce de 50m para 100m+ durante os 7 segundos)
- **Pose:** tense → shocked extremo (expressão de choque cósmico)
- **Ação:** Cresce além da atmosfera. Mãos se abrem em gesto de "o que está acontecendo?". Olhos arregalados ao máximo olhando para a Terra abaixo. Boca aberta em espanto silencioso. Cabelos flutuam levemente (gravidade reduzida). Corpo treme com a grandiosidade do momento.
- **Expressão:** assustado → choque cósmico (olhos arregalados ao máximo, boca aberta, sobrancelhas levantadas ao máximo)
- **Rotação Y:** 0 radianos (olhando para frente/câmera)
### 📷 CÂMERA
- **Tipo:** EXTREME WIDE → EPIC SPACE SHOT
- **Posição:** [0, 15.0, 25] → [0, 25.0, 40] (recua dramaticamente para mostrar Terra + personagem)
- **LookAt:** [0, 14.0, 0] → [0, 20.0, -5] (desce levemente para incluir Terra no frame)
- **FOV:** 65° → 70° (aumenta para capturar a imensidão)
- **Shake:** 0.05 → 0.03 (diminui — espaço é silencioso e estável)
- **Movimento GSAP:** Câmera recua suavemente com power2.inOut, mantendo personagem e Terra no frame. Leve rotação para revelar a curvatura terrestre.
### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem (acima da cabeça) | posição dinâmica [0, charHeight+4, 0] | cor #FF6B35 | animação: bounce vertical yoyo
- **Seta 2:** Aponta para a Terra abaixo | posição [0, -15, -10] | cor #39FF14 (verde neon) | animação: pulse scale + glow
- **Seta 3:** Aponta para a Lua | posição [luaX, luaY+2, luaZ] | cor #CCCCCC | animação: float suave
- **Halo 1:** Ao redor do personagem | raio dinâmico (30.0 → 60.0 conforme cresce) | cor #FF6B35 | opacity 0.2 pulsando
- **Halo 2:** Ao redor da Terra | raio 12.0 | cor #39FF14 | opacity 0.15 pulsando
- **Texto 3D Dinâmico:** "50.0m" → "100.0m+" (atualiza conforme cresce) | posição [5.0, charHeight/2, 0] | cor #FFFFFF com outline preto | tamanho 0.7
- **Texto Comparativo:** "TERRA NA SUA MÃO!" aparece no segundo 3 | posição [0, -10, -5] | cor #39FF14 | fade-in com glow intenso
- **Linha de Comparação:** Linha tracejada do personagem até a Terra | cor #39FF14 | opacity 0.6
### 🏗️ ELEMENTOS 3D (25 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Globo Terrestre (oceano) | SphereGeometry | r=8.0 | [0, -12, -15] | #1565C0 | Standard metalness=0.2 roughness=0.4 |
| 2 | Continentes (massa terrestre) | SphereGeometry partial | r=8.05 | [0, -12, -15] | #2E7D32 | Standard roughness=0.8 |
| 3 | Nuvens terrestres | SphereGeometry x20 agrupadas | r=0.5-1.5 | [random on globe surface +0.2] | #FFFFFF | Standard transparent opacity=0.6 |
| 4 | Limbo atmosférico | RingGeometry/Sphere shell | r=8.3 | [0, -12, -15] | #4FC3F7 | Basic transparent opacity=0.3 |
| 5 | Luzes das cidades (noturnas) | Points geometry x200 | r=8.06 surface | [on globe night side] | #FFDD44 | PointsMaterial size=0.08 emissive |
| 6 | Lua | SphereGeometry | r=2.0 | [12, 5, -20] | #CCCCCC | Standard metalness=0.1 roughness=0.9 |
| 7 | Crateras lunares | CircleGeometry x10 | r=0.1-0.3 | [on moon surface] | #AAAAAA | Standard roughness=0.95 |
| 8 | Satélite 1 | BoxGeometry + panels | 0.3x0.1x0.5 | [orbit path] | #AAAAAA | Standard metalness=0.8 roughness=0.2 |
| 9 | Satélite 2 | BoxGeometry + panels | 0.2x0.08x0.4 | [orbit path] | #999999 | Standard metalness=0.8 roughness=0.2 |
| 10 | Estrelas background | Points geometry x1000 | spread 200x200x200 | [random far] | #FFFFFF | PointsMaterial size=0.15 |
| 11 | Estrelas cintilantes | Points geometry x200 | spread 100x100x100 | [random mid] | #FFFFFF | PointsMaterial size=0.25 transparent |
| 12 | Nebulosa distante 1 | SphereGeometry | r=15.0 | [-30, 10, -50] | #9C27B0 | Basic transparent opacity=0.08 |
| 13 | Nebulosa distante 2 | SphereGeometry | r=12.0 | [25, -5, -45] | #E91E63 | Basic transparent opacity=0.06 |
| 14 | Galáxia espiral distante | RingGeometry | rInner=2, rOuter=8 | [40, 15, -60] | #BBDEFB | Basic transparent opacity=0.1 |
| 15 | Poeira espacial | Points geometry x500 | spread 80x80x80 | [random near] | #FFFFFF | PointsMaterial size=0.05 transparent opacity=0.3 |
| 16 | Camada de nuvens (deixada para trás) | PlaneGeometry | 100x100 | [0, -25, -20] | #FFFFFF | Standard transparent opacity=0.4 |
| 17 | Sombra do personagem na Terra | CircleGeometry | r=charScale*0.5 | [on globe surface] | #000000 | Basic transparent opacity=0.2 |
| 18 | Indicador altitude cósmica | Sprite texto | "ALTITUDE: 100km+" | [6, 20, 0] | #00D4FF | SpriteMaterial |
| 19 | Medidor gravidade | Sprite texto | "GRAVIDADE: 0.2G" | [-6, 18, 0] | #FF6B35 | SpriteMaterial |
| 20 | Linha comparação personagem-Terra | LineGeometry | dinâmica | [0→0, charY→-12, 0→-15] | #39FF14 | LineBasicMaterial linewidth=2 dashed |
| 21 | Anel orbital (decorativo) | RingGeometry | rInner=10, rOuter=10.2 | [0, -12, -15] rotX=1.2 | #FFFFFF | Basic transparent opacity=0.2 |
| 22 | Partículas brilho solar | Points geometry x100 | spread 30x30x30 | [random top] | #FFF5E0 | PointsMaterial size=0.1 transparent |
| 23 | Sol (fora de frame, luz) | DirectionalLight target | - | [50, 30, 20] | #FFF5E0 | Light only |
| 24 | Reflexo atmosférico | Sprite glow | r=5 | [0, -4, -15] | #4FC3F7 | SpriteMaterial transparent opacity=0.15 |
| 25 | Bússola espacial | RingGeometry + setas | r=2.5 | [0, 0.02, 15] | #FFFFFF | Basic transparent opacity=0.4 |
### 💡 ILUMINAÇÃO PBR
- **Key Light (Sol):** DirectionalLight | intensidade 4.0 → 4.5 (luz solar direta) | cor #FFF5E0 | posição [50, 30, 20] | sombras ON (PCFSoft, mapSize 2048)
- **Fill Light (Terra):** DirectionalLight | intensidade 1.2 → 1.5 (reflexo azul da Terra) | cor #4FC3F7 | posição [0, -10, -15]
- **Rim Light (Espaço):** DirectionalLight | intensidade 4.5 → 5.0 (destaca silhueta contra espaço) | cor #87CEEB | posição [0, 20, -10]
- **Ambient:** AmbientLight | intensidade 0.7 → 0.5 (espaço é escuro) | cor #1a1a2e
- **Hemisphere:** HemisphereLight | sky #0a0a2e | ground #000000 | intensidade 0.3
- **Point Lights:** Luzes das cidades | intensidade 0.5 | cor #FFDD44 | distância 20 | múltiplos pontos na Terra
- **Spot Light:** Brilho atmosférico | intensidade 1.5 | cor #4FC3F7 | ângulo 0.5 | penumbra 0.8 | posição [0, -4, -15]
### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=1.5 → 2.0 (brilho intenso nas estrelas, limbo atmosférico e luzes) | radius=0.6 | threshold=0.6
- **SSAO:** radius=0.5 | intensity=2.5 → 3.0 (profundidade cósmica) | bias=0.025
- **DOF:** focus=25.0 → 40.0 (ajusta com câmera recuando) | aperture=0.001 | maxblur=0.03 → 0.04 (estrelas desfocadas ao fundo)
- **Color Correction:** saturation=1.5 → 1.6 | contrast=1.3 → 1.4 | brightness=1.1 → 1.15
- **Tone Mapping:** ACESFilmicToneMapping | exposure=1.8 → 2.0
- **Lens Flare:** Simulado via sprites brilhantes na direção do sol
### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
// 0-5s: Personagem continua crescendo de 28.0x para 55.0x
tl.to(character.scale, {
x: 55.0, y: 55.0, z: 55.0,
duration: 5,
ease: "power1.inOut"
}, 0);
// 0-5s: Câmera recua dramaticamente para mostrar Terra
tl.to(camera.position, {
y: 25.0, z: 40,
duration: 5,
ease: "power2.inOut",
onUpdate: () => camera.lookAt(0, character.scale.y * 0.4, -5)
}, 0);
// 0-1s: Expressão muda para choque cósmico
tl.to(character.mouth.scale, { y: 2.5, x: 1.5, duration: 0.3 }, 0); // Boca aberta ao máximo
tl.to(character.leftEyelid.scale, { y: 0.05, duration: 0.2 }, 0); // Olhos arregalados ao máximo
tl.to(character.rightEyelid.scale, { y: 0.05, duration: 0.2 }, 0);
tl.to(character.leftBrow.rotation, { z: 0.4, x: -0.3, duration: 0.3 }, 0);
tl.to(character.rightBrow.rotation, { z: -0.4, x: -0.3, duration: 0.3 }, 0);
// 1-2s: Mãos se abrem em gesto de espanto
tl.to(character.leftShoulderPivot.rotation, {
z: 1.5, x: -0.3,
duration: 0.8,
ease: "back.out(1.5)"
}, 1);
tl.to(character.rightShoulderPivot.rotation, {
z: -1.5, x: -0.3,
duration: 0.8,
ease: "back.out(1.5)"
}, 1);
// 1-3s: Cabeça olha para baixo (vendo a Terra)
tl.to(head.rotation, { x: 0.5, duration: 1 }, 1.5);
// 2-4s: Terra rotaciona lentamente
gsap.to(terra.rotation, {
y: Math.PI * 2,
duration: 60,
repeat: -1,
ease: "none"
});
// 2-3s: Seta da Terra aparece com glow
tl.set(arrowTerra, { visible: true }, 2);
tl.from(arrowTerra.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 2);
tl.to(arrowTerra.material, {
emissiveIntensity: 0.8,
duration: 0.5,
repeat: -1,
yoyo: true
}, 2.4);
// 3-4s: Texto "TERRA NA SUA MÃO!" aparece com glow intenso
tl.from(textoComparativo.material, { opacity: 0, duration: 0.5 }, 3);
tl.from(textoComparativo.position, { y: -15, duration: 0.5, ease: "back.out(1.7)" }, 3);
tl.to(textoComparativo.material, {
emissiveIntensity: 1.0,
duration: 0.5,
repeat: -1,
yoyo: true
}, 3.5);
// 3-5s: Seta da Lua aparece
tl.set(arrowLua, { visible: true }, 3.5);
tl.from(arrowLua.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 3.5);
tl.to(arrowLua.position, {
y: "+=0.3",
duration: 1,
repeat: -1,
yoyo: true,
ease: "sine.inOut"
}, 4);
// 4-6s: Satélites orbitam
gsap.to(satelite1.position, {
x: "-=20",
duration: 4,
repeat: -1,
ease: "none"
});
gsap.to(satelite2.position, {
x: "+=15",
duration: 3,
repeat: -1,
ease: "none"
});
// 5-7s: Indicadores cósmicos aparecem
tl.from(indicadorAltitude.material, { opacity: 0, duration: 0.5 }, 5);
tl.from(medidorGravidade.material, { opacity: 0, duration: 0.5 }, 5.5);
// Contínuo: Estrelas cintilam
gsap.to(estrelasCintilantes.material, {
opacity: 0.3,
duration: 0.5,
repeat: -1,
yoyo: true,
ease: "steps(3)"
});
// Contínuo: Nebulosas pulsam suavemente
gsap.to(nebulosa1.scale, {
x: 1.05, y: 1.05, z: 1.05,
duration: 3,
repeat: -1,
yoyo: true,
ease: "sine.inOut"
});
gsap.to(nebulosa2.scale, {
x: 1.03, y: 1.03, z: 1.03,
duration: 4,
repeat: -1,
yoyo: true,
ease: "sine.inOut"
});
// Contínuo: Poeira espacial flutua
gsap.to(poeiraEspacial.rotation, {
y: Math.PI * 2,
duration: 30,
repeat: -1,
ease: "none"
});
// Contínuo: Cabelos flutuam (gravidade reduzida)
gsap.to(character.hair.rotation, {
z: 0.1, x: 0.05,
duration: 1.5,
repeat: -1,
yoyo: true,
ease: "sine.inOut"
});
// Contínuo: Seta do personagem segue a altura
gsap.to(arrowPersonagem.position, {
y: () => character.scale.y * 1.8 + 4,
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
const altura = (character.scale.y * 1.8).toFixed(0);
updateTextSprite(heightLabel, `${altura}m+`);
},
duration: 5,
ease: "none"
}, 0);
// Contínuo: Limbo atmosférico brilha
gsap.to(limboAtmosferico.material, {
opacity: 0.4,
duration: 2,
repeat: -1,
yoyo: true,
ease: "sine.inOut"
});
// Contínuo: Sombra na Terra expande
gsap.to(sombraTerra.scale, {
x: () => character.scale.x * 0.5,
y: () => character.scale.y * 0.5,
duration: 0.1,
repeat: -1,
ease: "none"
});
```
### 🎙️ NARRAÇÃO DESTA CENA
"Quinto passo: cem metros. A Terra inteira é uma bola na sua mão."
### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** CONTÍNUO (sem corte — o personagem continua crescendo no espaço)
- **Duração:** 0.5s de crossfade suave na intensidade do bloom
- **Efeito:** A escala estabiliza em 55x, o personagem para de crescer, e a pergunta final aparece — momento de reflexão cósmica