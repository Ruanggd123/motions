# 🎬 ROTEIRO — "E Se Você Crescesse a Cada Passo?" (v3 — Passo + Régua + Comparativo)
## Duração: 48 segundos | 6 passos
## Formato: Vertical 9:16 (720x1280)
## Conceito: Loop simples — personagem dá 1 passo → para → régua aparece → comparativo com objeto ao lado → narração da altura → próximo passo

---

### PASSO 1 — Rua Normal (Início)
- **Duração total:** 8s (0–8)
- **Anda:** 2s (personagem dá 1 passo para a direita, de x=0 para x=2)
- **Para:** 0.5s (personagem para em x=2, pose idle)
- **Altura antes:** 1.8m | **Altura depois:** 1.8m (não cresce neste passo — é o baseline)
- **Objeto comparativo:** Poste de luz | altura=3.5m | posição_x=4
- **Régua:** marca 1.8m | cor=#FF6B35 | posição=[3.5, 0.9, 0] (ao lado direito do personagem)
- **Texto altura:** "1.8 METROS" | cor=#FFFFFF | posição=[3.5, 2.2, 0]
- **Texto comparativo:** null (primeiro passo — só estabelece a baseline)
- **Seta:** null
- **Halo:** null
- **Narração:** "Imagine que a cada passo que você dá... você cresce. Mas por enquanto, você tem 1 metro e 80. Normal."
- **Câmera:** pos=[2, 2, 8] lookAt=[2, 1, 0] fov=45
- **Ambiente:** Rua urbana — calçada cinza, grama verde nas laterais, céu azul #87CEEB, poste de luz à frente, prédio ao fundo
- **Cor fundo:** #87CEEB

---

### PASSO 2 — Primeiro Passo (Cresce para 4m = Poste)
- **Duração total:** 8s (8–16)
- **Anda:** 2s (personagem dá 1 passo para a direita, de x=2 para x=4)
- **Para:** 0.5s (personagem para em x=4, pose shocked)
- **Altura antes:** 1.8m | **Altura depois:** 4.0m (cresce durante a animação de parada)
- **Objeto comparativo:** Poste de luz | altura=3.5m | posição_x=6
- **Régua:** marca 4.0m | cor=#FF6B35 | posição=[5.5, 2.0, 0]
- **Texto altura:** "4.0 METROS" | cor=#FFFFFF | posição=[5.5, 4.5, 0]
- **Texto comparativo:** "= POSTE!" | cor=#00D4FF | posição=[6, 4.2, 0]
- **Seta:** aponta para o poste | posição=[6, 3.8, 0] | cor=#00D4FF
- **Halo:** ao redor do poste | cor=#00D4FF | raio=0.8 | posição=[6, 1.75, 0]
- **Narração:** "Primeiro passo: você cresce! Agora você tem 4 metros. Do tamanho de um poste de luz!"
- **Câmera:** pos=[4, 2.5, 9] lookAt=[4, 2, 0] fov=48
- **Ambiente:** Mesma rua — poste de luz ao lado serve de comparação, prédios ao fundo, céu azul
- **Cor fundo:** #87CEEB

---

### PASSO 3 — Segundo Passo (Cresce para 8m = Prédio)
- **Duração total:** 8s (16–24)
- **Anda:** 2s (personagem dá 1 passo para a direita, de x=4 para x=6)
- **Para:** 0.5s (personagem para em x=6, pose shocked)
- **Altura antes:** 4.0m | **Altura depois:** 8.0m
- **Objeto comparativo:** Prédio de 3 andares | altura=8m | posição_x=9
- **Régua:** marca 8.0m | cor=#FF6B35 | posição=[7.5, 4.0, 0]
- **Texto altura:** "8.0 METROS" | cor=#FFFFFF | posição=[7.5, 8.5, 0]
- **Texto comparativo:** "= PRÉDIO!" | cor=#FFD700 | posição=[9, 8.5, 0]
- **Seta:** aponta para o prédio | posição=[9, 8.0, 0] | cor=#FFD700
- **Halo:** ao redor do prédio | cor=#FFD700 | raio=1.5 | posição=[9, 4, -5]
- **Narração:** "Segundo passo: 8 metros! Você agora é do tamanho de um prédio de 3 andares!"
- **Câmera:** pos=[6, 4, 12] lookAt=[6, 4, 0] fov=52
- **Ambiente:** Rua urbana — prédio de 3 andares ao lado serve de comparação, outros prédios ao fundo, céu azul escurecendo levemente
- **Cor fundo:** #6BB3D9

---

### PASSO 4 — Terceiro Passo (Cresce para 20m = Acima dos Prédios)
- **Duração total:** 8s (24–32)
- **Anda:** 2s (personagem dá 1 passo para a direita, de x=6 para x=8)
- **Para:** 0.5s (personagem para em x=8, pose tense)
- **Altura antes:** 8.0m | **Altura depois:** 20.0m
- **Objeto comparativo:** Prédio alto de 6 andares | altura=18m | posição_x=12
- **Régua:** marca 20.0m | cor=#FF6B35 | posição=[9.5, 10.0, 0]
- **Texto altura:** "20 METROS" | cor=#FFFFFF | posição=[9.5, 21.0, 0]
- **Texto comparativo:** "MAIOR QUE O PRÉDIO!" | cor=#FF6B35 | posição=[12, 19.0, 0]
- **Seta:** aponta para o topo do prédio | posição=[12, 18.0, 0] | cor=#FF6B35
- **Halo:** ao redor do prédio | cor=#FF6B35 | raio=2.0 | posição=[12, 9, -6]
- **Narração:** "Terceiro passo: 20 metros! Você passou dos prédios! O céu fica mais azul lá em cima."
- **Câmera:** pos=[8, 8, 18] lookAt=[8, 10, 0] fov=56
- **Ambiente:** Vista elevada — prédios parecem menores abaixo, nuvens começam a aparecer no horizonte, céu azul profundo
- **Cor fundo:** #4A90D9

---

### PASSO 5 — Quarto Passo (Cresce para 50m = Nuvens)
- **Duração total:** 8s (32–40)
- **Anda:** 2s (personagem dá 1 passo para a direita, de x=8 para x=10)
- **Para:** 0.5s (personagem para em x=10, pose tense)
- **Altura antes:** 20.0m | **Altura depois:** 50.0m
- **Objeto comparativo:** Nuvem grande | altura=30m (visual) | posição_x=14, y=25
- **Régua:** marca 50.0m | cor=#FF6B35 | posição=[11.5, 25.0, 0]
- **Texto altura:** "50 METROS" | cor=#FFFFFF | posição=[11.5, 52.0, 0]
- **Texto comparativo:** "ATRAVESSA AS NUVENS!" | cor=#FFFFFF | posição=[14, 35.0, 0]
- **Seta:** aponta para as nuvens | posição=[14, 30.0, 0] | cor=#FFFFFF
- **Halo:** ao redor das nuvens | cor=#FFFFFF | raio=3.0 | posição=[14, 25, -8]
- **Narração:** "Quarto passo: 50 metros! Você atravessa as nuvens! Aviões desviam de você!"
- **Câmera:** pos=[10, 18, 28] lookAt=[10, 25, 0] fov=60
- **Ambiente:** Céu aberto — nuvens volumétricas ao redor, cidade minúscula lá embaixo, céu azul profundo com tons dourados
- **Cor fundo:** #1E90FF

---

### PASSO 6 — CTA Final (Cresce para 100m+ = Terra na Mão)
- **Duração total:** 8s (40–48)
- **Anda:** 2s (personagem dá 1 passo para a direita, de x=10 para x=12)
- **Para:** 0.5s (personagem para em x=12, pose pointing)
- **Altura antes:** 50.0m | **Altura depois:** 100.0m+
- **Objeto comparativo:** Terra (globo) | altura=visual 15m | posição_x=12, y=-20
- **Régua:** marca 100m+ | cor=#FF6B35 | posição=[13.5, 50.0, 0]
- **Texto altura:** "100+ METROS" | cor=#FFFFFF | posição=[13.5, 105.0, 0]
- **Texto comparativo:** "TERRA NA SUA MÃO!" | cor=#39FF14 | posição=[12, -10.0, 0]
- **Seta:** aponta para a Terra | posição=[12, -15.0, 0] | cor=#39FF14
- **Halo:** ao redor da Terra | cor=#39FF14 | raio=4.0 | posição=[12, -20, -15]
- **Narração:** "Quinto passo: 100 metros! A Terra inteira é uma bola na sua mão. Você continuaria andando... ou pararia para sempre?"
- **Câmera:** pos=[12, 30, 40] lookAt=[12, 20, -5] fov=65
- **Ambiente:** Espaço — Terra visível abaixo como esfera azul, estrelas ao fundo, nebulosas coloridas, céu negro estrelado
- **Cor fundo:** #050510

---

### Notas de Produção
- **Loop obrigatório:** Cada passo segue EXATAMENTE: anda → para → régua aparece → texto altura → comparativo (seta+halo+texto) → pausa → transição
- **Visão lateral fixa:** Câmera sempre olha de lado (eixo Z), personagem anda no eixo X
- **Câmera suave:** Segue personagem com lerp (fator 0.05), sobe levemente conforme cresce
- **Régua obrigatória:** Aparece em TODO passo, marca a altura atual, cor laranja #FF6B35
- **Comparativo obrigatório:** Seta + halo + texto aparecem juntos em todo passo (exceto passo 1)
- **Zero fundo preto:** Sempre há ambiente visível (céu azul → azul profundo → espaço estrelado)
- **Personagem nunca cresce continuamente:** Cresce APENAS quando para, durante a animação de parada
- **Transições suaves:** Régua/texto/seta/halo desaparecem com fade-out antes do próximo passo