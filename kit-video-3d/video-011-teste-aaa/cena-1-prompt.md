# 🎬 CENA 1 — Rua Normal (Início)
## Duração: 6.0s (0.0–6.0)
## Arquivo: cena-1-prompt.md

### 🌍 AMBIENTE
- **Descrição:** Rua urbana tranquila em dia ensolarado. Calçada cinza larga, grama verde nas laterais, prédios residenciais de 3-5 andares ao fundo com janelas iluminadas amarelas. Céu azul claro (#87CEEB) com algumas nuvens brancas esparsas. Postes de luz com lâmpadas amarelas acesas mesmo de dia (estilo cartoon). Um carro vermelho estacionado à direita, um azul à esquerda. Árvore com copa esférica verde à esquerda do personagem. Banco de praça marrom à direita.
- **Cor de Fundo:** #87CEEB (céu azul claro)
- **Atmosfera:** Ensolarado, calmo, cotidiano normal antes do extraordinário acontecer
- **Elementos Ambientais:** Partículas de poeira flutuando suavemente no ar (200 partículas, tamanho 0.03, opacity 0.4), sombras suaves no chão

### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (centro da cena, em pé na calçada)
- **Escala:** 1.0x (altura real ~1.8m)
- **Pose:** idle (parado, respirando naturalmente)
- **Ação:** Olhando ao redor com curiosidade, cabeça virando levemente para os lados, mãos relaxadas ao lado do corpo. Expressão neutra/curiosa — ele ainda não sabe que vai crescer.
- **Expressão:** neutro → curioso (transição suave nos últimos 2 segundos)
- **Rotação Y:** 0 radianos (olhando para frente/câmera)

### 📷 CÂMERA
- **Tipo:** MEDIUM SHOT (enquadramento médio, personagem ocupa ~60% da altura)
- **Posição:** [0, 1.5, 6] (frente ao personagem, altura dos olhos, 6 unidades de distância)
- **LookAt:** [0, 1.0, 0] (centro do torso do personagem)
- **FOV:** 45°
- **Shake:** 0.005 (handheld sutil cinematográfico)
- **Movimento GSAP:** Câmera estática nos primeiros 3s, depois leve dolly-in suave (z: 6→5.5) nos últimos 3s para criar intimidade antes do crescimento

### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem | posição [0, 2.5, 0] (acima da cabeça) | cor #FF6B35 (laranja vibrante) | animação: bounce vertical yoyo (y: +=0.3, duration: 0.6, repeat: -1)
- **Halo 1:** Ao redor do personagem | raio 1.2 | cor #FF6B35 | opacity 0.2 pulsando (0.1↔0.3, duration: 1.0, repeat: -1)
- **Texto 3D:** "1.8m" | posição [1.5, 1.0, 0] (ao lado direito do personagem) | cor #FFFFFF com outline preto | tamanho 0.3 | aparece com fade-in no segundo 2

### 🏗️ ELEMENTOS 3D (12 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Chão/Calçada | PlaneGeometry | 20x20 | [0, -0.01, 0] | #808080 | Standard metalness=0.1 roughness=0.9 |
| 2 | Grama lateral esq | PlaneGeometry | 4x20 | [-6, -0.005, 0] | #4CAF50 | Standard roughness=0.95 |
| 3 | Grama lateral dir | PlaneGeometry | 4x20 | [6, -0.005, 0] | #4CAF50 | Standard roughness=0.95 |
| 4 | Poste luz 1 | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [-3, 1.75, 1] | #555555 + #FFDD44(emissive) | Standard metalness=0.7 + Basic emissive |
| 5 | Poste luz 2 | CylinderGeometry + SphereGeometry | r=0.06,h=3.5 + r=0.12 | [3, 1.75, 1] | #555555 + #FFDD44(emissive) | Standard metalness=0.7 + Basic emissive |
| 6 | Carro vermelho | BoxGeometry x2 (corpo+teto) + CylinderGeometry x4 (rodas) | 1.8x0.6x0.9 | [3.5, 0.35, -1] | #CC2222 | Standard metalness=0.6 roughness=0.4 |
| 7 | Carro azul | BoxGeometry x2 + CylinderGeometry x4 | 1.8x0.6x0.9 | [-3.5, 0.35, -1] | #2244AA | Standard metalness=0.6 roughness=0.4 |
| 8 | Árvore | CylinderGeometry(tronco) + SphereGeometry(copa) | r=0.12,h=1.5 + r=0.9 | [-2, 0.75, 2] | #5C3A1E + #228B22 | Standard roughness=0.9 + 0.8 |
| 9 | Banco praça | BoxGeometry | 1.2x0.35x0.4 | [2, 0.25, 2] | #8B4513 | Standard roughness=0.85 |
| 10 | Prédio 1 (esq) | BoxGeometry + PlaneGeometry x8(janelas) | 3x8x2.5 | [-6, 4, -6] | #8899AA + #FFEE88(janelas) | Standard metalness=0.2 + Basic emissive(janelas) |
| 11 | Prédio 2 (dir) | BoxGeometry + PlaneGeometry x12(janelas) | 2.5x12x2.5 | [6, 6, -7] | #778899 + #FFEE88(janelas) | Standard metalness=0.2 + Basic emissive(janelas) |
| 12 | Prédio 3 (centro) | BoxGeometry + PlaneGeometry x6(janelas) | 4x6x2 | [0, 3, -9] | #99AABB + #FFEE88(janelas) | Standard metalness=0.2 + Basic emissive(janelas) |

### 💡 ILUMINAÇÃO PBR
- **Key Light:** DirectionalLight | intensidade 2.5 | cor #FFF5E0 (branco quente) | posição [5, 8, 4] | sombras ON (PCFSoft, mapSize 2048)
- **Fill Light:** DirectionalLight | intensidade 1.0 | cor #B0C4DE (azul aço frio) | posição [-4, 4, 3] | sombras OFF
- **Rim Light:** DirectionalLight | intensidade 1.8 | cor #87CEEB (azul céu) | posição [0, 3, -6] | sombras OFF
- **Ambient:** AmbientLight | intensidade 0.6 | cor #404060
- **Hemisphere:** HemisphereLight | sky #87CEEB | ground #444444 | intensidade 0.5
- **Point Lights:** 2x PointLight nos postes | intensidade 0.8 | cor #FFDD44 | distância 5 | decay 2

### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=0.4 | radius=0.3 | threshold=0.85 (só nas lâmpadas dos postes e janelas)
- **SSAO:** radius=0.5 | intensity=1.2 | bias=0.025 (profundidade nos pés do personagem e base dos objetos)
- **DOF:** focus=6.0 (distância da câmera ao personagem) | aperture=0.002 | maxblur=0.008 (fundo levemente desfocado)
- **Color Correction:** saturation=1.1 | contrast=1.05 | brightness=1.0 (cores vibrantes estilo cartoon)
- **Tone Mapping:** ACESFilmicToneMapping | exposure=1.3

### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

// 0-1s: Personagem aparece com scale-up elástico
tl.from(character.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "back.out(1.7)" }, 0);

// 0-1s: Câmera entra de cima suavemente
tl.from(camera.position, { y: 4, z: 10, duration: 1.2, ease: "power3.out" }, 0);

// 1-2s: Seta aparece acima do personagem com bounce
tl.from(arrow.position, { y: 4, duration: 0.5, ease: "back.out(2)" }, 1);
tl.to(arrow.position, { y: "+=0.3", duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1.5);

// 1.5-2.5s: Halo pulsante aparece
tl.from(halo.material, { opacity: 0, duration: 0.5 }, 1.5);
tl.to(halo.material, { opacity: 0.3, duration: 1.0, repeat: -1, yoyo: true, ease: "sine.inOut" }, 2);

// 2-3s: Texto "1.8m" aparece com fade ao lado do personagem
tl.from(textMesh.material, { opacity: 0, duration: 0.5 }, 2);
tl.from(textMesh.position, { x: 2.5, duration: 0.5, ease: "power2.out" }, 2);

// 3-6s: Câmera faz dolly-in sutil
tl.to(camera.position, { z: 5.5, duration: 3, ease: "power1.inOut" }, 3);

// 4-6s: Personagem vira cabeça levemente (curiosidade)
tl.to(head.rotation, { y: 0.15, duration: 1, ease: "power2.inOut" }, 4);
tl.to(head.rotation, { y: -0.1, duration: 1, ease: "power2.inOut" }, 5);

// Partículas ambientais: rotação contínua
gsap.to(particles.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: "none" });
```

### 🎙️ NARRAÇÃO DESTA CENA
"Imagine que a cada passo que você dá... você cresce."

### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** CONTÍNUO (sem corte — o personagem começa a crescer na mesma cena)
- **Duração:** 0.5s de crossfade suave na cor do céu
- **Efeito:** A escala do personagem começa a aumentar suavemente, a câmera começa a recuar, e a seta muda para apontar para o poste ao lado com texto "4m = POSTE"