# 🎬 ROTEIRO — "E Se o Oceano Engolisse Sua Cidade?"
## Nicho: Curiosidades / Natureza Extrema
## Formato: Escalada narrativa progressiva ("O que aconteceria primeiro...")
## Duração: 48 segundos | ~135 palavras

---

### Texto Corrido (Pronto para Narrar)

E se o oceano começasse a subir agora... bem na sua rua?

Primeiro: o som. Um rugido distante que vai ficando mais alto.

Depois: a água. Não uma onda — um muro. Subindo devagar, mas sem parar.

Os carros param. As pessoas correm. Você sobe no telhado.

A água já cobre as janelas do segundo andar. Carros flutuam como brinquedos.

A correnteza arrasta postes. A luz apaga. Só resta o som da água.

Você olha pro horizonte — não existe mais terra. Só mar, até onde a vista alcança.

Um tubarão passa nadando onde antes era sua escola.

Quando a água baixar... nada vai ser igual.

Você sobreviveria ao primeiro dia?

---

### Tabela de Cenas (8 cenas + fade final)

| Cena | Tempo | Fala | Ambiente 3D (PERSISTENTE — mesma base, muda estado) | Câmera | Animação Interativa |
|---|---|---|---|---|---|
| 1-Hook | 0-5s | "E se o oceano começasse a subir agora?" | Rua urbana seca: asfalto, prédios, carros estacionados, árvores, céu azul claro | Estática frontal elevada (z=14) | Personagem parado olhando horizonte; folhas balançam; carros têm reflexo; nuvens derivam |
| 2-Som | 5-10s | "Primeiro: o som. Um rugido distante." | MESMA rua, céu escurecendo levemente, névoa baixa entrando | Mesma posição | Personagem vira cabeça; pássaros voam em bando assustados; lixo voa; ventania aumenta; partículas de poeira |
| 3-Muro | 10-16s | "Depois: a água. Um muro subindo." | MESMA rua, nível de água Y=0.5 (tornozelos), ondulação realista, reflexos | Mesma posição | Água animada com ondas sinusoidais; personagem recua 1 passo; carros começam a boiar levemente; espuma nas bordas |
| 4-Telhado | 16-22s | "Você sobe no telhado." | MESMA rua, água Y=2.5 (primeiro andar), carros flutuando, correnteza | Mesma posição | Personagem em cima de prédio (climb animation); carros à deriva com rotação; galhos passam; bolhas sobem |
| 5-Escuro | 22-28s | "A luz apaga. Só resta o som." | MESMA rua, água Y=4.0, iluminação noturna emergencial, postes apagados | Mesma posição | Janelas piscam e apagam sequencialmente; chuva começa; relâmpago ilumina cena brevemente; água turbulenta |
| 6-Mar | 28-35s | "Não existe mais terra. Só mar." | MESMA base, água Y=6.0 cobrindo quase tudo, só topos visíveis, horizonte infinito | Mesma posição | Ondas grandes; personagem agarrado ao topo; detritos flutuam; gaivotas voam; céu tempestuoso |
| 7-Tubarão | 35-42s | "Um tubarão passa onde era sua escola." | MESMA base, água Y=6.0, silhueta de tubarão nadando entre prédios submersos | Mesma posição | Tubarão com animação de natação (cauda oscilando); bolhas; cardume menor; personagem observa de cima |
| 8-CTA | 42-48s | "Você sobreviveria ao primeiro dia?" | MESMA base, água baixando lentamente Y=3.0, destroços expostos, amanhecer | Mesma posição | Personagem exausto sentado; gotas caem dos prédios; sol nascendo; texto flutuante SOBREVIVER / RECONSTRUIR |
| 9-Fade | 48-50s | (silêncio) | Fade to black gradual | — | — |

---

### Notas de Produção — AMBIENTE PERSISTENTE

**PRINCÍPIO FUNDAMENTAL:** O cenário é UM SÓ objeto Three.js persistente. NENHUM `clearSceneObjects()` entre cenas.

#### Transições por Mutação de Estado:
- **Nível da água:** `waterMesh.position.y` interpolado suavemente entre cenas (0 → 0.5 → 2.5 → 4.0 → 6.0 → 3.0)
- **Iluminação:** `keyLight.intensity`, `ambientLight.color`, `fog.density` transicionam via lerp
- **Clima:** Partículas de chuva ativadas/desativadas; velocidade do vento ajustada
- **Objetos dinâmicos:** Carros mudam de estático → flutuante → à deriva via flags `userData.state`
- **Personagem:** Posição muda via animação procedural (idle → recuar → subir → agarrar → sentado)

#### Vantagens:
- Zero distorção entre cenas (mesmos objetos, mesma geometria)
- Transições suaves e cinematográficas
- Performance superior (sem rebuild de cena)
- Continuidade visual perfeita

#### Animações Interativas Obrigatórias:
- Personagem reage a cada fase (olha, recua, sobe, agarra, senta)
- Água com física visual (ondas, correnteza, bolhas, espuma)
- Objetos respondem à água (carros boiam, galhos flutuam, postes caem)
- NPCs/criaturas com IA simples (tubarão segue spline, pássaros fogem, cardume dispersa)
- Clima dinâmico (vento, chuva, relâmpagos com timing)