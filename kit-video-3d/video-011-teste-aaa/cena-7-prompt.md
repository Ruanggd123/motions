# 🎬 CENA 7 — CTA Final (Pergunta Cósmica)
## Duração: 6.0s (39.0–45.0)
## Arquivo: cena-7-prompt.md
### 🌍 AMBIENTE
- **Descrição:** O personagem parou de crescer (estabilizado em 55x / ~100m). Está flutuando no espaço profundo, com a Terra visível abaixo como uma esfera azul brilhante. O espaço ao redor é negro pontilhado de estrelas cintilantes. Nebulosas coloridas (roxo, rosa, azul) decoram o fundo distante. A Lua está ao lado como referência. O clima é de reflexão cósmica — silêncio, grandiosidade, pergunta existencial. Partículas douradas flutuam lentamente ao redor do personagem como poeira estelar mágica.
- **Cor de Fundo:** #050510 (espaço profundo quase negro com estrelas)
- **Atmosfera:** Reflexiva, cósmica, questionadora, momento de decisão
- **Elementos Ambientais:** Estrelas cintilantes, nebulosas coloridas, partículas douradas flutuantes, Terra rotacionando lentamente, Lua estática, brilho atmosférico terrestre
### 🧑 PERSONAGEM
- **Posição:** [0, 0, 0] (estabilizado, sem crescer mais)
- **Escala:** 55.0x (fixo — parou de crescer)
- **Pose:** pointing (apontando para a câmera/espectador)
- **Ação:** Para de crescer. Olha diretamente para a câmera (quebra a quarta parede). Aponta com o dedo indicador direito para o espectador. Expressão muda de choque para questionamento — sobrancelhas levemente levantadas, boca fechada em linha neutra, olhos fixos na câmera. Cabeça inclina levemente para o lado (curiosidade).
- **Expressão:** questionador (olhos fixos na câmera, sobrancelhas levantadas, boca neutra, cabeça inclinada)
- **Rotação Y:** 0 radianos (olhando diretamente para a câmera)
### 📷 CÂMERA
- **Tipo:** MEDIUM CLOSE-UP (enquadramento mais íntimo para o CTA)
- **Posição:** [0, 20.0, 30] → [0, 18.0, 25] (aproxima suavemente para criar intimidade)
- **LookAt:** [0, 18.0, 0] (centro do rosto/peito do personagem)
- **FOV:** 50° (mais fechado para foco no personagem)
- **Shake:** 0.01 (mínimo — momento de calma e reflexão)
- **Movimento GSAP:** Câmera faz dolly-in suave com power2.inOut, aproximando do personagem para criar conexão emocional com o espectador
### ➡️ SETAS E INDICADORES VISUAIS
- **Seta 1:** Aponta para o personagem (ao lado, não acima) | posição [3, 20, 0] | cor #FF6B35 | animação: pulse scale suave
- **Seta 2:** Aponta para a Terra abaixo | posição [0, -10, -10] | cor #39FF14 | animação: float suave
- **Halo 1:** Ao redor do personagem | raio 60.0 (fixo) | cor #FF6B35 | opacity 0.15 pulsando lentamente
- **Halo 2:** Ao redor da Terra | raio 12.0 | cor #39FF14 | opacity 0.1 pulsando
- **Texto 3D Principal:** "VOCÊ CONTINUARIA" | posição [0, 28, 0] | cor #FFFFFF com outline preto | tamanho 1.2 | aparece com fade-in + scale-up elástico
- **Texto 3D Secundário:** "ANDANDO..." | posição [0, 26, 0] | cor #FF6B35 | tamanho 1.0 | aparece 0.5s depois com slide-in da esquerda
- **Texto 3D Terciário:** "OU PARARIA" | posição [0, 24, 0] | cor #FFFFFF | tamanho 1.0 | aparece 1.0s depois com slide-in da direita
- **Texto 3D Final:** "PARA SEMPRE?" | posição [0, 22, 0] | cor #00D4FF | tamanho 1.2 | aparece 1.5s depois com glow pulsante
- **Botão Visual 1:** " ANDAR" | posição [-4, 20, 2] | cor #FF6B35 | BoxGeometry arredondado | pulse scale
- **Botão Visual 2:** "🛑 PARAR" | posição [4, 20, 2] | cor #00D4FF | BoxGeometry arredondado | pulse scale
### 🏗️ ELEMENTOS 3D (20 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Globo Terrestre | SphereGeometry | r=8.0 | [0, -12, -15] | #1565C0 | Standard metalness=0.2 roughness=0.4 |
| 2 | Continentes | SphereGeometry partial | r=8.05 | [0, -12, -15] | #2E7D32 | Standard roughness=0.8 |
| 3 | Nuvens terrestres | SphereGeometry x15 | r=0.5-1.2 | [on globe +0.2] | #FFFFFF | Standard transparent opacity=0.5 |
| 4 | Limbo atmosférico | Sphere shell | r=8.3 | [0, -12, -15] | #4FC3F7 | Basic transparent opacity=0.25 |
| 5 | Luzes das cidades | Points x150 | r=8.06 | [night side] | #FFDD44 | PointsMaterial size=0.08 emissive |
| 6 | Lua | SphereGeometry | r=2.0 | [12, 5, -20] | #CCCCCC | Standard roughness=0.9 |
| 7 | Estrelas background | Points x800 | spread 200³ | [random far] | #FFFFFF | PointsMaterial size=0.15 |
| 8 | Estrelas cintilantes | Points x150 | spread 100³ | [random mid] | #FFFFFF | PointsMaterial size=0.25 transparent |
| 9 | Nebulosa roxa | SphereGeometry | r=15.0 | [-30, 10, -50] | #9C27B0 | Basic transparent opacity=0.08 |
| 10 | Nebulosa rosa | SphereGeometry | r=12.0 | [25, -5, -45] | #E91E63 | Basic transparent opacity=0.06 |
| 11 | Nebulosa azul | SphereGeometry | r=10.0 | [0, 20, -55] | #2196F3 | Basic transparent opacity=0.05 |
| 12 | Partículas douradas | Points x300 | spread 40³ | [around character] | #FFD700 | PointsMaterial size=0.08 transparent |
| 13 | Texto "VOCÊ CONTINUARIA" | Sprite/TextGeometry | 1.2 | [0, 28, 0] | #FFFFFF | SpriteMaterial emissive |
| 14 | Texto "ANDANDO..." | Sprite/TextGeometry | 1.0 | [0, 26, 0] | #FF6B35 | SpriteMaterial emissive |
| 15 | Texto "OU PARARIA" | Sprite/TextGeometry | 1.0 | [0, 24, 0] | #FFFFFF | SpriteMaterial emissive |
| 16 | Texto "PARA SEMPRE?" | Sprite/TextGeometry | 1.2 | [0, 22, 0] | #00D4FF | SpriteMaterial emissive |
| 17 | Botão "ANDAR" | BoxGeometry arredondado | 2x0.8x0.2 | [-4, 20, 2] | #FF6B35 | Standard emissive=0.3 |
| 18 | Botão "PARAR" | BoxGeometry arredondado | 2x0.8x0.2 | [4, 20, 2] | #00D4FF | Standard emissive=0.3 |
| 19 | Anel orbital decorativo | RingGeometry | rInner=10,rOuter=10.2 | [0,-12,-15] rotX=1.2 | #FFFFFF | Basic transparent opacity=0.15 |
| 20 | Brilho solar (lens flare) | Sprite glow | r=3 | [50, 30, 20] | #FFF5E0 | SpriteMaterial transparent opacity=0.2 |
### 💡 ILUMINAÇÃO PBR
- **Key Light (Sol):** DirectionalLight | intensidade 4.5 | cor #FFF5E0 | posição [50, 30, 20] | sombras ON
- **Fill Light (Terra):** DirectionalLight | intensidade 1.5 | cor #4FC3F7 | posição [0, -10, -15]
- **Rim Light (Espaço):** DirectionalLight | intensidade 5.0 | cor #87CEEB | posição [0, 20, -10]
- **Ambient:** AmbientLight | intensidade 0.5 | cor #1a1a2e
- **Hemisphere:** HemisphereLight | sky #050510 | ground #000000 | intensidade 0.3
- **Point Lights:** Luzes cidades | intensidade 0.5 | cor #FFDD44 | múltiplos na Terra
- **Spot Light:** Brilho nos textos | intensidade 2.0 | cor #FFFFFF | ângulo 0.4 | posição [0, 25, 5]
### 🎨 PÓS-PROCESSAMENTO
- **Bloom:** strength=2.0 (brilho intenso nas estrelas, textos e limbo) | radius=0.6 | threshold=0.6
- **SSAO:** radius=0.5 | intensity=3.0 | bias=0.025
- **DOF:** focus=25.0 | aperture=0.001 | maxblur=0.04 (estrelas desfocadas)
- **Color Correction:** saturation=1.6 | contrast=1.4 | brightness=1.15
- **Tone Mapping:** ACESFilmicToneMapping | exposure=2.0
### 🎞️ ANIMAÇÕES GSAP
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
// 0-1s: Câmera aproxima suavemente (dolly-in)
tl.to(camera.position, {
y: 18.0, z: 25,
duration: 1,
ease: "power2.inOut",
onUpdate: () => camera.lookAt(0, 18, 0)
}, 0);
// 0-0.5s: Personagem vira para a câmera e aponta
tl.to(character.rotation, { y: 0, duration: 0.3 }, 0);
tl.to(character.rightShoulderPivot.rotation, {
z: -1.5, x: -1.2,
duration: 0.5,
ease: "back.out(1.7)"
}, 0.2);
// 0.5-1s: Expressão muda para questionador
tl.to(character.mouth.scale, { y: 0.8, x: 1.0, duration: 0.3 }, 0.5);
tl.to(character.leftEyelid.scale, { y: 0.7, duration: 0.2 }, 0.5);
tl.to(character.rightEyelid.scale, { y: 0.7, duration: 0.2 }, 0.5);
tl.to(character.leftBrow.rotation, { z: 0.15, x: -0.1, duration: 0.3 }, 0.5);
tl.to(character.rightBrow.rotation, { z: -0.15, x: -0.1, duration: 0.3 }, 0.5);
tl.to(head.rotation, { z: 0.1, duration: 0.5 }, 0.7); // Cabeça inclina
// 1-2s: Texto "VOCÊ CONTINUARIA" aparece com scale-up elástico
tl.from(texto1.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: "back.out(2)" }, 1);
tl.from(texto1.material, { opacity: 0, duration: 0.3 }, 1);
// 1.5-2.5s: Texto "ANDANDO..." slide-in da esquerda
tl.from(texto2.position, { x: -5, duration: 0.5, ease: "power3.out" }, 1.5);
tl.from(texto2.material, { opacity: 0, duration: 0.3 }, 1.5);
// 2-3s: Texto "OU PARARIA" slide-in da direita
tl.from(texto3.position, { x: 5, duration: 0.5, ease: "power3.out" }, 2);
tl.from(texto3.material, { opacity: 0, duration: 0.3 }, 2);
// 2.5-3.5s: Texto "PARA SEMPRE?" aparece com glow pulsante
tl.from(texto4.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" }, 2.5);
tl.from(texto4.material, { opacity: 0, duration: 0.3 }, 2.5);
tl.to(texto4.material, {
emissiveIntensity: 1.0,
duration: 0.5,
repeat: -1,
yoyo: true
}, 3);
// 3-4s: Botões "ANDAR" e "PARAR" aparecem com bounce
tl.from(botaoAndar.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "back.out(2)" }, 3);
tl.from(botaoParar.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "back.out(2)" }, 3.2);
// 3.5s+: Botões pulsam alternadamente
tl.to(botaoAndar.scale, {
x: 1.1, y: 1.1, z: 1.1,
duration: 0.6,
repeat: -1,
yoyo: true,
ease: "sine.inOut"
}, 3.5);
tl.to(botaoParar.scale, {
x: 1.1, y: 1.1, z: 1.1,
duration: 0.6,
repeat: -1,
yoyo: true,
ease: "sine.inOut",
delay: 0.3
}, 3.5);
// Contínuo: Terra rotaciona lentamente
gsap.to(terra.rotation, { y: Math.PI * 2, duration: 60, repeat: -1, ease: "none" });
// Contínuo: Estrelas cintilam
gsap.to(estrelasCintilantes.material, {
opacity: 0.3, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(3)"
});
// Contínuo: Nebulosas pulsam
gsap.to(nebulosaRoxa.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 3, repeat: -1, yoyo: true });
gsap.to(nebulosaRosa.scale, { x: 1.03, y: 1.03, z: 1.03, duration: 4, repeat: -1, yoyo: true });
// Contínuo: Partículas douradas flutuam
gsap.to(particulasDouradas.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: "none" });
gsap.to(particulasDouradas.position, { y: "+=1", duration: 3, repeat: -1, yoyo: true });
// Contínuo: Halo do personagem pulsa lentamente
gsap.to(haloPersonagem.material, {
opacity: 0.2, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut"
});
// Contínuo: Seta lateral pulsa
gsap.to(arrowPersonagem.scale, {
x: 1.2, y: 1.2, z: 1.2,
duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut"
});
```
### 🎙️ NARRAÇÃO DESTA CENA
"Você continuaria andando... ou pararia para sempre?"
### 🔄 TRANSIÇÃO PARA PRÓXIMA CENA
- **Tipo:** FADE OUT SUAVE (vídeo termina)
- **Duração:** 1.0s de fade para negro com estrelas
- **Efeito:** Textos e botões permanecem visíveis durante o fade, criando momento de reflexão final. Partículas douradas continuam flutuando até o último frame.