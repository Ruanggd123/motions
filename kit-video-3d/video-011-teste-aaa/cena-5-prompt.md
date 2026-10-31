# 🎬 CENA 5 — Atravessa Nuvens (Cresce para 50m)
## Duração: 7.0s (25.0–32.0)
## Arquivo: cena-5-prompt.md

### 🌍 AMBIENTE
- **Descrição:** O personagem agora está gigante (50m), atravessando uma camada densa de nuvens brancas e fofas. A visão é parcialmente obscurecida pela neblina das nuvens, criando um efeito etéreo e misterioso. Acima das nuvens, o céu é azul profundo (#1E90FF). Abaixo, através de aberturas nas nuvens, vê-se a cidade como um mapa em miniatura com luzes pontilhadas. Um avião comercial pequeno passa voando ao lado do personagem, desviando assustado. Raios de sol (god rays) penetram as nuvens criando volumetria dramática.
- **Cor de Fundo:** #1E90FF → #FFB347 (transição para dourado/pôr do sol no final)
- **Atmosfera:** Etéreo, misterioso, grandioso, perigo aéreo (avião desviando)
- **Elementos Ambientais:** Nuvens volumétricas densas (múltiplas camadas), god rays (raios de luz volumétricos), partículas de vapor/condensação, vento forte horizontal, avião passando

### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (continuando a crescer verticalmente)
- **Escala:** 11.0x → 28.0x (cresce de 20m para 50m durante os 7 segundos)
- **Pose:** tense → mais tense (expressão de tensão extrema com vento e altura)
- **Ação:** Cresce atravessando as nuvens. Cabelos e roupas balançam violentamente com o vento. Mãos tentam se proteger do vento. Olhos semicerrados contra o vento e a luz. Expressão de quem está em uma situação perigosa mas fascinante.
- **Expressão:** tenso → assustado (olhos semicerrados, boca contraída, sobrancelhas franzidas)
- **Rotação Y:** 0 radianos (olhando para frente/câmera)

### 📷 CÂMERA
- **Tipo:** EXTREME WIDE → DYNAMIC TRACKING (acompanha o crescimento dramático)
- **Posição:** [0, 8.0, 16] → [0, 15.0, 25] (sobe e recua muito para mostrar escala épica)
- **LookAt:** [0, 7.0, 0] → [0, 14.0, 0] (sobe para acompanhar crescimento)
- **FOV:** 60° → 65° (aumenta para capturar a grandiosidade)
- **Shake:** 0.035 → 0.05 (aumenta com vento e drama)
- **Movimento GSAP:** Câmera sobe e recua dramaticamente com power2.inOut, mantendo personagem centralizado enquanto cresce para 50m. Leve rotação no eixo Z para dar sensação de instabilidade no vento.

### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem (acima da cabeça) | posição dinâmica [0, charHeight+3, 0] | cor #FF6B35 | animação: bounce vertical yoyo + shake horizontal (vento)
- **Seta 2:** Aponta para o avião que passa | posição dinâmica (segue o avião) | cor #FF0000 (vermelho alerta) | animação: pulse rápido + track
- **Seta 3:** Aponta para as nuvens | posição [8, 20, -8] | cor #FFFFFF | animação: float suave
- **Halo 1:** Ao redor do personagem | raio dinâmico (12.0 → 30.0 conforme cresce) | cor #FF6B35 | opacity 0.2 pulsando
- **Halo 2:** Ao redor do avião | raio 1.5 | cor #FF0000 | opacity 0.3 pulsando rápido
- **Texto 3D Dinâmico:** "20.0m" → "50.0m" (atualiza conforme cresce) | posição [4.0, charHeight/2, 0] | cor #FFFFFF com outline preto | tamanho 0.6
- **Texto Alerta:** "️ AVIÃO!" aparece quando avião se aproxima | posição [aviãoX, aviãoY+2, aviãoZ] | cor #FF0000 | fade-in rápido + shake
- **Texto Comparativo:** "ATRAVESSA AS NUVENS!" aparece no segundo 3 | posição [0, 25, 0] | cor #FFFFFF | fade-in com glow

### 🏗️ ELEMENTOS 3D (22 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Camada de nuvens inferior | PlaneGeometry + noise displacement | 100x100 | [0, 8, -20] | #FFFFFF | Standard transparent opacity=0.6 |
| 2 | Nuvem volumétrica 1 | SphereGeometry x5 agrupadas | r=3+2.5+2+1.8+1.5 | [-10, 15, -15] | #FFFFFF | Standard transparent opacity=0.7 |
| 3 | Nuvem volumétrica 2 | SphereGeometry x5 agrupadas | r=3.5+2.8+2.2+1.8+1.5 | [12, 18, -18] | #F8F8FF | Standard transparent opacity=0.65 |
| 4 | Nuvem volumétrica 3 | SphereGeometry x4 agrupadas | r=2.5+2+1.5+1.2 | [0, 12, -10] | #FFFFFF | Standard transparent opacity=0.6 |
| 5 | Nuvem volumétrica 4 | SphereGeometry x6 agrupadas | r=4+3+2.5+2+1.5+1.2 | [-15, 20, -25] | #F0F0FF | Standard transparent opacity=0.7 |
| 6 | Nuvem volumétrica 5 | SphereGeometry x4 agrupadas | r=3+2.5+2+1.5 | [18, 22, -22] | #FFFFFF | Standard transparent opacity=0.65 |
| 7 | Avião comercial (fuselagem) | CylinderGeometry + ConeGeometry | r=0.4,h=3 + r=0.4,h=0.8 | [20, 16, -5] → [-20, 16, -5] | #DDDDDD | Standard metalness=0.6 roughness=0.3 |
| 8 | Avião comercial (asas) | BoxGeometry | 4x0.05x0.8 | [mesma do avião] | #CCCCCC | Standard metalness=0.6 roughness=0.3 |
| 9 | Avião comercial (cauda) | BoxGeometry | 0.8x0.6x0.05 | [mesma do avião] | #CCCCCC | Standard metalness=0.6 roughness=0.3 |
| 10 | God ray 1 | PlaneGeometry alongado | 2x30 | [-5, 15, -12] rotZ=0.3 | #FFF5E0 | Basic transparent opacity=0.15 |
| 11 | God ray 2 | PlaneGeometry alongado | 1.5x25 | [5, 18, -15] rotZ=-0.2 | #FFF5E0 | Basic transparent opacity=0.12 |
| 12 | God ray 3 | PlaneGeometry alongado | 2.5x35 | [0, 20, -18] rotZ=0.1 | #FFF5E0 | Basic transparent opacity=0.18 |
| 13 | Partículas vapor/condensação | Points geometry x300 | spread 60x40x60 | [random around character] | #FFFFFF | PointsMaterial size=0.08 transparent opacity=0.5 |
| 14 | Cidade abaixo (visível através de aberturas) | BoxGeometry x30 | variados pequenos | [random, -5, random] | variados escuros | Standard emissive=0.2 (luzes da cidade) |
| 15 | Luzes da cidade (pontos) | Points geometry x100 | spread 40x0x40 | [random, -4.9, random] | #FFDD44 | PointsMaterial size=0.15 |
| 16 | Sombra gigante nas nuvens | PlaneGeometry circular | raio=charScale*3 | [0, 8.1, 0] | #000000 | Basic transparent opacity=0.2 |
| 17 | Indicador de altitude | Sprite texto | "ALTITUDE: 50m" | [5, 15, 0] | #00D4FF | SpriteMaterial |
| 18 | Medidor de vento | Sprite setas horizontais | "💨 80 km/h" | [-5, 12, 0] | #FFFFFF | SpriteMaterial |
| 19 | Prédio referência (agora minúsculo abaixo) | BoxGeometry | 2.5x12x2.5 | [6, -5, -7] | #778899 | Standard metalness=0.2 roughness=0.7 |
| 20 | Linha comparação vertical | LineGeometry | dinâmica | [0→0, 0→50, 0→0] | #FFFFFF | LineBasicMaterial linewidth=2 dashed |
| 21 | Anel de choque nas nuvens | RingGeometry | rInner=charScale*1.5, rOuter=charScale*2 | [0, charHeight*0.6, 0] | #FFFFFF | Basic transparent opacity=0.3 |
| 22 | Bússola/orientação aérea | RingGeometry + setas | r=2 | [0, 0.02, 12] | #FFFFFF | Basic transparent opacity=0.5 |

### 💡 ILUMINAÇÃO PBR
- **Key Light:** DirectionalLight | intensidade 3.5 → 4.0 (sol forte acima das nuvens) | cor #FFF5E0 | posição [5, 25, 4] | sombras ON (PCFSoft, mapSize 2048)
- **Fill Light:** DirectionalLight | intensidade 0.8 → 1.2 (luz difusa das nuvens) | cor #B0C4DE | posição [-4, 15, 3]
- **Rim Light:** DirectionalLight | intensidade 3.5 → 4.5 (destaca silhueta contra céu) | cor #1E90FF | posição [0, 20, -6]
- **Ambient:** AmbientLight | intensidade 0.5 → 0.7 (mais luz ambiente nas nuvens) | cor #404060
- **Hemisphere:** HemisphereLight | sky #1E90FF → #FFB347 | ground #444444 | intensidade 0.6 → 0.7
- **Point Lights:** Luzes da cidade abaixo | intensidade 0.3 | cor #FFDD44 | distância 50 | múltiplos pontos
- **Spot Light:** God ray simulation | intensidade 2.0 | cor #FFF5E0 | ângulo 0.3 | penumbra 0.5 | posição [0, 30, -10]

### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=1.0 → 1.5 (brilho intenso nos god rays e luzes) | radius=0.5 | threshold=0.7
- **SSAO:** radius=0.5 | intensity=2.0 → 2.5 (profundidade nas nuvens) | bias=0.025
- **DOF:** focus=16.0 → 25.0 (ajusta com câmera recuando) | aperture=0.002 | maxblur=0.02 → 0.03 (nuvens desfocadas ao fundo)
- **Color Correction:** saturation=1.4 → 1.5 | contrast=1.2 → 1.3 | brightness=1.05 → 1.1
- **Tone Mapping:** ACESFilmicToneMapping | exposure=1.6 → 1.8
- **Volumetric Fog:** Simulado via partículas densas + transparência nas nuvens

### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 0-5s: Personagem continua crescendo de 11.0x para 28.0x
tl.to(character.scale, {
  x: 28.0, y: 28.0, z: 28.0,
  duration: 5,
  ease: "power1.inOut"
}, 0);

// 0-5s: Câmera sobe e recua dramaticamente
tl.to(camera.position, {
  y: 15.0, z: 25,
  duration: 5,
  ease: "power2.inOut",
  onUpdate: () => camera.lookAt(0, character.scale.y * 0.6, 0)
}, 0);

// 0-1s: Expressão muda para assustado com vento
tl.to(character.mouth.scale, { y: 0.8, x: 1.2, duration: 0.3 }, 0); // Boca contraída
tl.to(character.leftEyelid.scale, { y: 0.6, duration: 0.2 }, 0); // Olhos semicerrados
tl.to(character.rightEyelid.scale, { y: 0.6, duration: 0.2 }, 0);
tl.to(character.leftBrow.rotation, { z: 0.3, x: -0.2, duration: 0.3 }, 0); // Sobrancelhas franzidas
tl.to(character.rightBrow.rotation, { z: -0.3, x: -0.2, duration: 0.3 }, 0);

// 0-7s: Cabelos e roupas balançam violentamente com vento
gsap.to(character.hair.rotation, { 
  z: 0.25, x: 0.1, 
  duration: 0.2, 
  repeat: -1, 
  yoyo: true, 
  ease: "sine.inOut" 
});
gsap.to(character.hoodie.rotation, { 
  z: 0.15, x: 0.08, 
  duration: 0.25, 
  repeat: -1, 
  yoyo: true, 
  ease: "sine.inOut" 
});

// 1-2s: Mãos vão para proteger do vento
tl.to(character.leftShoulderPivot.rotation, { 
  z: 0.8, x: -0.8, 
  duration: 0.5 
}, 1);
tl.to(character.rightShoulderPivot.rotation, { 
  z: -0.8, x: -0.8, 
  duration: 0.5 
}, 1);

// 2-4s: Avião entra em cena pela direita
tl.from(aviao.position, { 
  x: 30, 
  duration: 0.1 
}, 2);
tl.to(aviao.position, { 
  x: -25, 
  duration: 2, 
  ease: "power1.inOut" 
}, 2);
tl.to(aviao.rotation, { 
  z: 0.2, 
  duration: 0.5, 
  yoyo: true, 
  repeat: 3 
}, 2.5); // Avião treme/desvia

// 2.5-3s: Texto de alerta "⚠️ AVIÃO!" aparece
tl.set(textoAlerta, { visible: true }, 2.5);
tl.from(textoAlerta.material, { opacity: 0, duration: 0.2 }, 2.5);
tl.to(textoAlerta.position, { 
  x: "-=25", 
  duration: 2, 
  ease: "power1.inOut" 
}, 2.5); // Segue o avião
tl.to(textoAlerta.scale, { 
  x: 1.2, y: 1.2, 
  duration: 0.2, 
  repeat: -1, 
  yoyo: true 
}, 2.5);

// 3-4s: Seta do avião aparece e trackeia
tl.set(arrowAviao, { visible: true }, 3);
tl.to(arrowAviao.position, { 
  x: "-=25", 
  duration: 1.5, 
  ease: "power1.inOut" 
}, 3);
tl.to(arrowAviao.material, { 
  opacity: 0.5, 
  duration: 0.2, 
  repeat: -1, 
  yoyo: true 
}, 3);

// 3-5s: Texto "ATRAVESSA AS NUVENS!" aparece com glow
tl.from(textoComparativo.material, { opacity: 0, duration: 0.5 }, 3);
tl.from(textoComparativo.position, { y: 28, duration: 0.5, ease: "back.out(1.7)" }, 3);
tl.to(textoComparativo.material, { 
  emissiveIntensity: 0.5, 
  duration: 0.5, 
  repeat: -1, 
  yoyo: true 
}, 3.5);

// 4-6s: Seta das nuvens aparece
tl.set(arrowNuvens, { visible: true }, 4);
tl.from(arrowNuvens.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.out(2)" }, 4);
tl.to(arrowNuvens.position, { 
  y: "+=0.5", 
  duration: 1, 
  repeat: -1, 
  yoyo: true, 
  ease: "sine.inOut" 
}, 4.4);

// 5-7s: Indicador de altitude e medidor de vento aparecem
tl.from(indicadorAltitude.material, { opacity: 0, duration: 0.5 }, 5);
tl.from(medidorVento.material, { opacity: 0, duration: 0.5 }, 5.5);

// Contínuo: Seta do personagem segue a altura com shake do vento
gsap.to(arrowPersonagem.position, {
  y: () => character.scale.y * 1.8 + 3,
  x: () => Math.sin(Date.now() * 0.01) * 0.3, // Shake horizontal
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

// Contínuo: Nuvens derivam e pulsam
gsap.to(cloud1.position, { x: "-=3", duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(cloud2.position, { x: "+=3", duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(cloud3.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });

// Contínuo: God rays pulsam suavemente
gsap.to(godRay1.material, { opacity: 0.2, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(godRay2.material, { opacity: 0.15, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(godRay3.material, { opacity: 0.22, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });

// Contínuo: Partículas de vapor flutuam
gsap.to(particulasVapor.position, { y: "+=2", duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to(particulasVapor.rotation, { y: Math.PI * 2, duration: 10, repeat: -1, ease: "none" });

// Contínuo: Anel de choque expande conforme personagem cresce
gsap.to(anelChoque.scale, {
  x: () => character.scale.x * 2,
  y: () => character.scale.y * 2,
  duration: 0.1,
  repeat: -1,
  ease: "none"
});
gsap.to(anelChoque.material, { 
  opacity: 0.15, 
  duration: 0.5, 
  repeat: -1, 
  yoyo: true 
});

// Contínuo: Luzes da cidade piscam abaixo
gsap.to(luzesCidade.material, { 
  opacity: 0.8, 
  duration: 0.3, 
  repeat: -1, 
  yoyo: true, 
  ease: "steps(2)" 
});

// Contínuo: Sombra nas nuvens expande
gsap.to(sombraNuvens.scale, {
  x: () => character.scale.x * 3,
  y: () => character.scale.y * 3,
  duration: 0.1,
  repeat: -1,
  ease: "none"
});
```

### 🎙️ NARRAÇÃO DESTA CENA
"Quarto passo: cinquenta metros. Você atravessa as nuvens. Aviões desviam de você."

### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** CONTÍNUO (sem corte — o personagem continua crescendo)
- **Duração:** 0.5s de crossfade suave na cor do céu (#FFB347 → #0a0a2e espaço)
- **Efeito:** As nuvens ficam para baixo, o céu escurece para azul noturno/espaço, estrelas começam a aparecer, a Terra curva fica visível abaixo