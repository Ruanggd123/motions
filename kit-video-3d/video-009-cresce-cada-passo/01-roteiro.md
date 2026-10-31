# 🎬 ROTEIRO v14 — "E Se Você Crescesse a Cada Passo?"
## Nicho: Sobrevivência / Situações Absurdas
## Formato: Escalada progressiva com sofrimento do personagem
## Duração: 50 segundos | ~140 palavras
## STATUS: AGUARDANDO APROVAÇÃO DO USUÁRIO (FASE A)

---

### Texto Corrido (Pronto para Narração — FASE C depois)
Imagine que a cada passo que você dá... você cresce.

Primeiro passo: você fica do tamanho de um poste. As pessoas olham assustadas.

Segundo passo: do tamanho de um prédio. Carros param. Sirenes tocam.

Terceiro passo: você atravessa nuvens. Aviões desviam de você.

Quarto passo: teleportado para o meio da China. A Muralha parece um brinquedo.

Quinto passo: o oceano só molha seus tornozelos. Navios são formiguinhas.

Sexto passo: a Terra inteira é uma bola na sua mão. Você consegue ver cidades como pontos de luz.

Mas tem um problema... você não para de crescer. E não tem como voltar.

Você continuaria andando... ou pararia para sempre?

---

## CENA 1 — RUA_NORMAL_PRIMEIRO_PASSO
- **AMBIENTE:** Cidade urbana
- **COR_FUNDO:** #87CEEB (céu azul claro)
- **DURAÇÃO:** 6.0s (0.0–6.0)
- **CÂMERA:** tipo=MEDIUM pos=[3,2,6] lookAt=[0,1.5,0] fov=42 shake=0.0
- **PERSONAGEM:** estado=PARADO_OBSERVANDO pos=[0,0,0] escala=1.0x → CRESCENDO escala=2.5x no final rotY=0
- **DESTAQUE_LUMINOSO:** null (cena introdutória)
- **NARRAÇÃO:** "Imagine que a cada passo que você dá... você cresce." | emoção=CURIOSO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_2

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (10 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Chão/Calçada | PlaneGeometry | 20x20 | [0,-0.01,0] | #808080 | Standard metalness=0.1 roughness=0.9 |
| 2 | Poste de luz 1 | CylinderGeometry | r=0.08, h=4 | [-3,2,2] | #444444 | Standard metalness=0.7 roughness=0.3 |
| 3 | Poste de luz 2 | CylinderGeometry | r=0.08, h=4 | [3,2,-1] | #444444 | Standard metalness=0.7 roughness=0.3 |
| 4 | Lâmpada poste 1 | SphereGeometry | r=0.15 | [-3,4.1,2] | #FFDD44 | Basic (emissive) |
| 5 | Lâmpada poste 2 | SphereGeometry | r=0.15 | [3,4.1,-1] | #FFDD44 | Basic (emissive) |
| 6 | Carro estacionado 1 | BoxGeometry | 1.8x0.8x0.7 | [-2,0.4,3] | #CC2222 | Standard metalness=0.6 roughness=0.4 |
| 7 | Carro estacionado 2 | BoxGeometry | 1.8x0.8x0.7 | [2.5,0.4,2.5] | #2244AA | Standard metalness=0.6 roughness=0.4 |
| 8 | Árvore 1 (tronco) | CylinderGeometry | r=0.12, h=1.5 | [-4,0.75,0] | #5C3A1E | Standard metalness=0.0 roughness=0.9 |
| 9 | Árvore 1 (copa) | SphereGeometry | r=0.8 | [-4,2.0,0] | #228B22 | Standard metalness=0.0 roughness=0.8 |
| 10 | Prédio fundo 1 | BoxGeometry | 3x6x2 | [-6,3,-5] | #AABBCC | Standard metalness=0.2 roughness=0.7 |
| 11 | Prédio fundo 2 | BoxGeometry | 2.5x8x2 | [5,4,-6] | #99AABB | Standard metalness=0.2 roughness=0.7 |
| 12 | Banco de praça | BoxGeometry | 1.2x0.4x0.4 | [1.5,0.2,1] | #8B4513 | Standard metalness=0.1 roughness=0.8 |

---

## CENA 2 — TAMANHO_PREDIO_SEGUNDO_PASSO
- **AMBIENTE:** Cidade urbana (mesma base, câmera diferente)
- **COR_FUNDO:** #87CEEB (céu azul)
- **DURAÇÃO:** 6.0s (6.0–12.0)
- **CÂMERA:** tipo=LOW_ANGLE pos=[0,0.5,8] lookAt=[0,4,0] fov=55 shake=0.01
- **PERSONAGEM:** estado=SOFRENDO_MEDO pos=[0,0,0] escala=4.0x rotY=0 (gigante entre prédios)
- **DESTAQUE_LUMINOSO:** personagem | cor=#FF6B35 | intensidade=0.8
- **NARRAÇÃO:** "Segundo passo: do tamanho de um prédio. Carros param. Sirenes tocam." | emoção=CHOCADO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_3

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (10 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Chão/Rua | PlaneGeometry | 30x30 | [0,-0.01,0] | #555555 | Standard metalness=0.1 roughness=0.9 |
| 2 | Prédio alto 1 | BoxGeometry | 4x12x3 | [-5,6,-4] | #778899 | Standard metalness=0.3 roughness=0.6 |
| 3 | Prédio alto 2 | BoxGeometry | 3.5x15x3 | [5,7.5,-5] | #667788 | Standard metalness=0.3 roughness=0.6 |
| 4 | Prédio alto 3 | BoxGeometry | 5x10x4 | [0,5,-8] | #8899AA | Standard metalness=0.3 roughness=0.6 |
| 5 | Janelas prédio 1 (grid) | BoxGeometry x12 | 0.4x0.5x0.05 | [-5±1, 2..10, -2.5] | #FFEE88 | Basic (emissive 0.3) |
| 6 | Carro minúsculo 1 | BoxGeometry | 0.4x0.2x0.15 | [-1,0.1,2] | #CC2222 | Standard metalness=0.6 roughness=0.4 |
| 7 | Carro minúsculo 2 | BoxGeometry | 0.4x0.2x0.15 | [1.5,0.1,1.5] | #22AA44 | Standard metalness=0.6 roughness=0.4 |
| 8 | Semáforo | CylinderGeometry + BoxGeometry | r=0.05,h=2 + 0.2x0.5x0.1 | [2,1,3] | #333333 | Standard metalness=0.5 roughness=0.4 |
| 9 | Luz semáforo (vermelha) | SphereGeometry | r=0.06 | [2,2.3,3.06] | #FF0000 | Basic (emissive) |
| 10 | Faixa de pedestre | PlaneGeometry | 2x0.15 x5 | [0,0.01,2.5+i*0.4] | #FFFFFF | Standard metalness=0.0 roughness=0.9 |

---

## CENA 3 — ATRAVESSA_NUVENS_TERCEIRO_PASSO
- **AMBIENTE:** Céu/Altitude
- **COR_FUNDO:** #4A90D9 (azul céu profundo)
- **DURAÇÃO:** 6.0s (12.0–18.0)
- **CÂMERA:** tipo=WIDE pos=[5,8,10] lookAt=[0,6,0] fov=50 shake=0.005
- **PERSONAGEM:** estado=SOFRENDO_VENTO pos=[0,5,0] escala=6.0x rotY=0 (cabeça nas nuvens)
- **DESTAQUE_LUMINOSO:** nuvens ao redor | cor=#FFFFFF | intensidade=0.6
- **NARRAÇÃO:** "Terceiro passo: você atravessa nuvens. Aviões desviam de você." | emoção=TENSO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_4

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (10 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Nuvem 1 | SphereGeometry x3 agrupadas | r=1.5+1.2+1.0 | [-3,6,-2] | #FFFFFF | Standard metalness=0.0 roughness=1.0 transparent opacity=0.7 |
| 2 | Nuvem 2 | SphereGeometry x3 agrupadas | r=1.8+1.4+1.1 | [4,7,1] | #F0F0FF | Standard metalness=0.0 roughness=1.0 transparent opacity=0.6 |
| 3 | Nuvem 3 | SphereGeometry x2 agrupadas | r=1.0+0.8 | [-1,5,3] | #FFFFFF | Standard metalness=0.0 roughness=1.0 transparent opacity=0.5 |
| 4 | Nuvem 4 (abaixo) | SphereGeometry x4 | r=2.0+1.5+1.2+1.0 | [0,3,-4] | #E8E8FF | Standard metalness=0.0 roughness=1.0 transparent opacity=0.4 |
| 5 | Avião pequeno (fuselagem) | CylinderGeometry | r=0.15, h=1.2 | [3,6.5,-1] | #CCCCCC | Standard metalness=0.7 roughness=0.3 |
| 6 | Avião pequeno (asa) | BoxGeometry | 1.5x0.03x0.3 | [3,6.5,-1] | #BBBBBB | Standard metalness=0.7 roughness=0.3 |
| 7 | Cidade lá embaixo (bloco 1) | BoxGeometry | 0.3x0.5x0.3 | [-2,0,-8] | #667788 | Standard metalness=0.2 roughness=0.7 |
| 8 | Cidade lá embaixo (bloco 2) | BoxGeometry | 0.2x0.8x0.2 | [-1.5,0,-7.5] | #778899 | Standard metalness=0.2 roughness=0.7 |
| 9 | Cidade lá embaixo (bloco 3) | BoxGeometry | 0.4x0.3x0.3 | [-2.5,0,-8.5] | #556677 | Standard metalness=0.2 roughness=0.7 |
| 10 | Pássaro 1 | ConeGeometry | r=0.05, h=0.15 | [2,5.5,2] | #333333 | Standard metalness=0.0 roughness=0.8 |

---

## CENA 4 — CHINA_MURALHA_QUARTO_PASSO
- **AMBIENTE:** China/Ásia
- **COR_FUNDO:** #FFB347 (pôr do sol dourado)
- **DURAÇÃO:** 7.0s (18.0–25.0)
- **CÂMERA:** tipo=WIDE pos=[-4,6,12] lookAt=[0,4,0] fov=55 shake=0.0
- **PERSONAGEM:** estado=SOFRENDO_CALOR pos=[0,3,0] escala=8.0x rotY=0.2 (olhando a muralha)
- **DESTAQUE_LUMINOSO:** muralha da china | cor=#FFD700 | intensidade=0.7
- **NARRAÇÃO:** "Quarto passo: teleportado para o meio da China. A Muralha parece um brinquedo." | emoção=CHOCADO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_5

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (12 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Terreno/Montanhas | PlaneGeometry + displacement | 30x30 | [0,0,0] | #4A7C3F | Standard metalness=0.0 roughness=0.9 |
| 2 | Muralha segmento 1 | BoxGeometry | 8x0.8x0.5 | [0,0.4,-3] | #C4A882 | Standard metalness=0.1 roughness=0.8 |
| 3 | Muralha segmento 2 | BoxGeometry | 6x0.8x0.5 | [5,0.6,-5] rotY=0.4 | #C4A882 | Standard metalness=0.1 roughness=0.8 |
| 4 | Muralha segmento 3 | BoxGeometry | 5x0.8x0.5 | [-4,0.5,-4] rotY=-0.3 | #C4A882 | Standard metalness=0.1 roughness=0.8 |
| 5 | Torre muralha 1 | BoxGeometry + ConeGeometry | 1x1.5x1 + r=0.7,h=0.8 | [0,1.2,-3] | #B8976A | Standard metalness=0.1 roughness=0.8 |
| 6 | Torre muralha 2 | BoxGeometry + ConeGeometry | 0.8x1.2x0.8 + r=0.6,h=0.7 | [5,1.0,-5] | #B8976A | Standard metalness=0.1 roughness=0.8 |
| 7 | Templo (base) | BoxGeometry | 2x1.5x2 | [-6,0.75,-2] | #8B0000 | Standard metalness=0.1 roughness=0.7 |
| 8 | Templo (telhado curvo) | ConeGeometry | r=1.5, h=1.0 | [-6,2.0,-2] | #2F1B14 | Standard metalness=0.2 roughness=0.6 |
| 9 | Lanterna vermelha 1 | SphereGeometry | r=0.15 | [-5.5,2.8,-1.5] | #FF0000 | Basic (emissive 0.5) |
| 10 | Lanterna vermelha 2 | SphereGeometry | r=0.15 | [-6.5,2.8,-2.5] | #FF0000 | Basic (emissive 0.5) |
| 11 | Sol poente | SphereGeometry | r=2.0 | [8,6,-15] | #FF8C00 | Basic (emissive 1.0) |
| 12 | Arrozais (terraços) | PlaneGeometry x4 | 3x0.5 cada | [3,-0.1+i*0.3,-1-i*0.5] | #7CBA3F | Standard metalness=0.0 roughness=0.8 |

---

## CENA 5 — OCEANO_TORNOZELOS_QUINTO_PASSO
- **AMBIENTE:** Oceano
- **COR_FUNDO:** #1E90FF (azul profundo)
- **DURAÇÃO:** 7.0s (25.0–32.0)
- **CÂMERA:** tipo=LOW_ANGLE pos=[3,1,8] lookAt=[0,3,0] fov=50 shake=0.008
- **PERSONAGEM:** estado=PARADO_OBSERVANDO pos=[0,0,0] escala=10.0x rotY=-0.1 (pernas na água)
- **DESTAQUE_LUMINOSO:** navios minúsculos | cor=#00D4FF | intensidade=0.5
- **NARRAÇÃO:** "Quinto passo: o oceano só molha seus tornozelos. Navios são formiguinhas." | emoção=CURIOSO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_6

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (10 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Oceano (plano água) | PlaneGeometry | 40x40 | [0,0,0] | #1565C0 | Standard metalness=0.3 roughness=0.2 transparent opacity=0.85 |
| 2 | Navio cargueiro 1 | BoxGeometry | 0.8x0.2x0.2 | [-3,0.1,-4] | #8B4513 | Standard metalness=0.3 roughness=0.6 |
| 3 | Navio cargueiro 2 | BoxGeometry | 0.6x0.15x0.15 | [4,0.08,-6] | #555555 | Standard metalness=0.4 roughness=0.5 |
| 4 | Navio cargueiro 3 | BoxGeometry | 0.5x0.12x0.12 | [-1,0.06,-8] | #666666 | Standard metalness=0.4 roughness=0.5 |
| 5 | Ilha distante 1 | SphereGeometry (half) | r=1.5 | [8,0,-12] | #4A7C3F | Standard metalness=0.0 roughness=0.9 |
| 6 | Ilha distante 2 | SphereGeometry (half) | r=1.0 | [-7,0,-14] | #3D6B35 | Standard metalness=0.0 roughness=0.9 |
| 7 | Gaivota 1 | ConeGeometry | r=0.04, h=0.12 | [2,2,1] | #FFFFFF | Standard metalness=0.0 roughness=0.8 |
| 8 | Gaivota 2 | ConeGeometry | r=0.04, h=0.12 | [-1.5,2.5,0.5] | #FFFFFF | Standard metalness=0.0 roughness=0.8 |
| 9 | Espuma (partículas) | SphereGeometry x8 | r=0.08 | [±0.5, 0.05, ±0.5] | #FFFFFF | Basic transparent opacity=0.6 |
| 10 | Horizonte pôr do sol | PlaneGeometry | 40x8 | [0,4,-20] | #FF8C00 | Basic gradient opacity=0.3 |

---

## CENA 6 — TERRA_NA_MAO_SEXTO_PASSO
- **AMBIENTE:** Espaço
- **COR_FUNDO:** #0a0a2e (azul escuro ESTRELADO)
- **DURAÇÃO:** 7.0s (32.0–39.0)
- **CÂMERA:** tipo=CLOSE pos=[2,2,5] lookAt=[0,1,0] fov=35 shake=0.0
- **PERSONAGEM:** estado=SOFRENDO_MEDO pos=[0,0,1] escala=12.0x rotY=0 (segurando a Terra)
- **DESTAQUE_LUMINOSO:** globo terrestre | cor=#39FF14 | intensidade=1.0
- **NARRAÇÃO:** "Sexto passo: a Terra inteira é uma bola na sua mão. Cidades são pontos de luz." | emoção=CHOCADO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_7

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (10 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Globo terrestre (oceano) | SphereGeometry | r=0.8 | [0,1.5,0] | #1565C0 | Standard metalness=0.2 roughness=0.4 |
| 2 | Continente 1 (Américas) | SphereGeometry (partial) | r=0.82 | [0,1.5,0] offset | #2E7D32 | Standard metalness=0.0 roughness=0.8 |
| 3 | Continente 2 (África/Europa) | SphereGeometry (partial) | r=0.82 | [0,1.5,0] offset | #388E3C | Standard metalness=0.0 roughness=0.8 |
| 4 | Estrelas (particles) | Points geometry x200 | spread 30x30x30 | [random] | #FFFFFF | PointsMaterial size=0.05 |
| 5 | Nebulosa 1 | SphereGeometry | r=3.0 | [-5,3,-8] | #9C27B0 | Basic transparent opacity=0.15 |
| 6 | Nebulosa 2 | SphereGeometry | r=2.5 | [4,2,-10] | #E91E63 | Basic transparent opacity=0.12 |
| 7 | Satélite 1 | BoxGeometry | 0.1x0.05x0.3 | [1.2,2.0,0.5] | #AAAAAA | Standard metalness=0.8 roughness=0.2 |
| 8 | Satélite 2 | BoxGeometry | 0.08x0.04x0.25 | [-0.8,1.8,0.8] | #999999 | Standard metalness=0.8 roughness=0.2 |
| 9 | Lua | SphereGeometry | r=0.2 | [2,2.5,-1] | #CCCCCC | Standard metalness=0.1 roughness=0.9 |
| 10 | Pontos de luz (cidades) | Points geometry x30 | r=0.83 surface | [on globe surface] | #FFDD44 | PointsMaterial size=0.03 emissive |

---

## CENA 7 — NAO_PARA_DE_CRESCER_CTA
- **AMBIENTE:** Espaço profundo
- **COR_FUNDO:** #050520 (azul quase preto COM estrelas)
- **DURAÇÃO:** 6.0s (39.0–45.0)
- **CÂMERA:** tipo=DUTCH pos=[0,3,7] lookAt=[0,2,0] fov=45 shake=0.015 roll=8°
- **PERSONAGEM:** estado=SOFRENDO_MEDO pos=[0,1,0] escala=15.0x rotY=0 (desesperado, crescendo sem parar)
- **DESTAQUE_LUMINOSO:** personagem | cor=#FF4400 | intensidade=1.2
- **NARRAÇÃO:** "Mas tem um problema... você não para de crescer. E não tem como voltar." | emoção=TENSO
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=0.5s alvo=CENA_8

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (10 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Estrelas distorcidas (particles) | Points geometry x300 | spread 40x40x40 stretched | [random radial] | #FFFFFF | PointsMaterial size=0.08 |
| 2 | Galáxia espiral 1 | RingGeometry | rInner=0.5, rOuter=2.0 | [-6,4,-12] | #E1BEE7 | Basic transparent opacity=0.2 |
| 3 | Galáxia espiral 2 | RingGeometry | rInner=0.3, rOuter=1.5 | [5,3,-15] | #BBDEFB | Basic transparent opacity=0.18 |
| 4 | Buraco negro | SphereGeometry | r=0.8 | [0,5,-10] | #000000 | Basic |
| 5 | Disco de acreção | RingGeometry | rInner=0.9, rOuter=2.0 | [0,5,-10] | #FF6F00 | Basic transparent opacity=0.4 |
| 6 | Aura vermelha personagem | SphereGeometry | r=2.0 | [0,2,0] | #FF4400 | Basic transparent opacity=0.15 |
| 7 | Partículas sugadas x20 | SphereGeometry | r=0.04 | [spiral path toward BH] | #FFAB40 | Basic emissive |
| 8 | Nebulosa caos 1 | SphereGeometry | r=4.0 | [-3,6,-8] | #B71C1C | Basic transparent opacity=0.1 |
| 9 | Nebulosa caos 2 | SphereGeometry | r=3.5 | [4,5,-9] | #4A148C | Basic transparent opacity=0.08 |
| 10 | Linha de força radial x8 | CylinderGeometry | r=0.01, h=8 | [radial from center] | #FF8A80 | Basic transparent opacity=0.3 |

---

## CENA 8 — PERGUNTA_FINAL_FADE
- **AMBIENTE:** Espaço profundo (mesmo da cena 7, câmera diferente)
- **COR_FUNDO:** #050520 (azul quase preto COM estrelas)
- **DURAÇÃO:** 5.0s (45.0–50.0)
- **CÂMERA:** tipo=HIGH_ANGLE pos=[0,8,5] lookAt=[0,2,0] fov=40 shake=0.0
- **PERSONAGEM:** estado=APONTANDO pos=[0,2,0] escala=15.0x rotY=0 (apontando para o espectador)
- **DESTAQUE_LUMINOSO:** null
- **NARRAÇÃO:** "Você continuaria andando... ou pararia para sempre?" | emoção=TRIUNFANTE
- **TRANSIÇÃO_SAÍDA:** FADE_TO_STARS duração=2.0s (NÃO fade to black — fade para campo estelar)

### DETALHAMENTO GEOMÉTRICO OBRIGATÓRIO (8 elementos)
| # | Elemento | Geometria | Dimensões | Posição [x,y,z] | Cor | Material |
|---|----------|-----------|-----------|-----------------|-----|----------|
| 1 | Estrelas (particles) | Points geometry x250 | spread 35x35x35 | [random] | #FFFFFF | PointsMaterial size=0.06 |
| 2 | Texto "ANDAR" (3D) | TextGeometry/BoxGeometry proxy | 2x0.4x0.1 | [-1.5,4,0] | #FF6B35 | Basic emissive |
| 3 | Texto "ou" (3D) | TextGeometry/BoxGeometry proxy | 0.5x0.3x0.1 | [0,3.5,0] | #FFFFFF | Basic emissive |
| 4 | Texto "PARAR?" (3D) | TextGeometry/BoxGeometry proxy | 2x0.4x0.1 | [1.5,3,0] | #00D4FF | Basic emissive |
| 5 | Aura pulsante personagem | SphereGeometry | r=2.5 | [0,2,0] | #FF6B35 | Basic transparent opacity=0.1 pulsing |
| 6 | Galáxia fundo | RingGeometry | rInner=1, rOuter=3 | [0,6,-12] | #CE93D8 | Basic transparent opacity=0.15 |
| 7 | Nebulosa suave | SphereGeometry | r=5.0 | [0,4,-10] | #1A237E | Basic transparent opacity=0.08 |
| 8 | Partículas flutuantes x15 | SphereGeometry | r=0.03 | [random slow drift] | #FFD740 | Basic emissive |

---

### Notas de Produção v14

#### Workflow:
1. **FASE A (AGORA):** Roteiro apresentado → aguardar aprovação do usuário
2. **FASE B (depois):** Implementar visual cena por cena → validar com screenshots → aprovar cada cena
3. **FASE C (só após aprovação total):** Gerar áudio via VoiceStudio
4. **FASE D (final):** Juntar vídeo + áudio via ffmpeg

#### Ambientes (ZERO fundo preto):
- Cena 1-2: Cidade urbana (céu azul #87CEEB)
- Cena 3: Céu/altitude (azul profundo #4A90D9)
- Cena 4: China (pôr do sol dourado #FFB347)
- Cena 5: Oceano (azul profundo #1E90FF)
- Cena 6-8: Espaço (azul escuro ESTRELADO #0a0a2e — NUNCA preto puro)

#### Personagem sofre conforme roteiro:
- Cena 1: Parado observando → crescendo
- Cena 2: Sofrendo medo (gigante entre prédios)
- Cena 3: Sofrendo vento (cabeça nas nuvens)
- Cena 4: Sofrendo calor (sol da China)
- Cena 5: Parado observando (oceano nos tornozelos)
- Cena 6: Sofrendo medo (Terra na mão)
- Cena 7: Sofrendo medo extremo (crescendo sem parar)
- Cena 8: Apontando (CTA final)

#### Câmera variada (NUNCA mesma posição consecutiva):
- Cena 1: Medium Shot
- Cena 2: Low-Angle Dramático
- Cena 3: Wide Shot Épico
- Cena 4: Wide Shot lateral
- Cena 5: Low-Angle do oceano
- Cena 6: Close-Up da Terra na mão
- Cena 7: Dutch Angle (caos/desorientação)
- Cena 8: High-Angle (vulnerabilidade)

#### Detalhamento geométrico:
- Cada cena tem 8-12 elementos especificados com geometria Three.js exata
- Dimensões, posição [x,y,z], cor hex e material com metalness/roughness
- Total: 82 elementos geométricos especificados para 8 cenas

#### Anti-repetição:
- Tema verificado contra `historias-usadas.json`
- Nicho "Sobrevivência / Situações Absurdas" — diferente dos 4 anteriores
- Zero repetição de conteúdo garantida