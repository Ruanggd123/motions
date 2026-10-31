# 🎬 ROTEIRO — "E Se a Terra Parasse de Girar?"
## Nicho: Ciência Extrema / Apocalipse Natural
## Formato: Escalada narrativa progressiva ("O que aconteceria primeiro...")
## Duração: 50 segundos | ~140 palavras

---

### Texto Corrido (Pronto para Narração)
E se a Terra parasse de girar agora... neste exato segundo?

Primeiro: o vento. Não uma brisa — um furacão global de 1600 km/h. Tudo que não está preso voa.

Depois: os oceanos. A água continua se movendo e invade continentes inteiros em minutos. Cidades costeiras somem.

Então: o calor. Um lado da Terra ferve sob sol eterno. O outro congela na escuridão perpétua.

As plantas morrem. Sem ciclo dia-noite, fotossíntese colapsa. Florestas viram desertos cinzentos.

Os animais entram em pânico. Relógios biológicos quebrados. Migrações impossíveis. Caos total.

A atmosfera começa a escapar. Sem rotação, o campo magnético enfraquece. Radiação solar bombardeia a superfície.

Em semanas: a Terra vira dois mundos. Um forno. Um freezer. Nada vive no meio.

Você sobreviveria ao lado quente... ou ao lado frio?

---

### Tabela de Cenas (9 cenas + fade final)
| Cena | Tempo | Fala | Ambiente 3D (VARIEDO — muda completamente entre cenas) | Câmera | Animação Interativa |
|---|---|---|---|---|---|
| 1-Hook | 0-5s | "E se a Terra parasse de girar agora?" | Cidade urbana densa: prédios altos, carros, pessoas andando normalmente | Estática frontal elevada | Personagem parado olhando horizonte; nuvens derivam; tráfego normal; pássaros voam |
| 2-Vento | 5-10s | "Primeiro: o vento. Furacão de 1600 km/h." | MESMA cidade, mas caos: árvores arrancadas, carros voando, detritos no ar, céu escuro | Mesma posição | Partículas de detritos horizontais; árvores balançando violentamente; carros sendo arrastados; personagem agarrado a poste |
| 3-Oceano | 10-16s | "Os oceanos invadem continentes." | Costa marítima: onda gigante avançando sobre cidade litorânea, prédios submersos parcialmente | Low-angle dramático | Água avançando com vertex displacement; carros boiando; espuma; bolhas; personagem em telhado observando |
| 4-Calor | 16-22s | "Um lado ferve. Sol eterno." | Deserto árido: chão rachado, sol gigante no céu, vegetação seca e queimada, miragens | Wide shot épico | Ondas de calor (distortion); partículas de poeira; cactos secos; personagem protegendo olhos |
| 5-Frio | 22-28s | "O outro congela. Escuridão perpétua." | Oceano congelado: icebergs, neve caindo, aurora boreal no céu noturno, gelo azul | Medium shot atmosférico | Neve caindo; cristais de gelo flutuando; aurora pulsando; personagem encolhido de frio |
| 6-Plantas | 28-33s | "Florestas viram desertos cinzentos." | Floresta morta: árvores sem folhas, troncos cinzas, chão coberto de cinzas, céu laranja | Tracking lateral lento | Cinzas caindo; galhos quebrando; fumaça residual; personagem caminhando entre árvores mortas |
| 7-Animais | 33-38s | "Relógios biológicos quebrados. Caos." | Savana caótica: animais correndo em todas direções, céu dividido (metade sol/metade noite) | Wide shot dinâmico | Animais correndo (NPCs derivados); nuvens turbulentas; relâmpagos; personagem observando confuso |
| 8-Radiação | 38-43s | "Campo magnético enfraquece. Radiação." | Espaço orbital: Terra vista de cima, metade brilhante/metade escura, auroras distorcidas | Overhead cinematográfico | Terra rotacionando lentamente; auroras pulsando; satélites orbitando; partículas solares |
| 9-CTA | 43-48s | "Lado quente ou lado frio?" | Tela dividida: esquerda=fogo/deserto, direita=gelo/neve, personagem no centro decidindo | Estática frontal simétrica | Lado esquerdo pulsa vermelho; lado direito pulsa azul; texto flutuante QUENTE/FRIO; personagem apontando |
| 10-Fade | 48-50s | (silêncio) | Fade to black gradual | — | — |

---

### Notas de Produção — AMBIENTES VARIADOS
**PRINCÍPIO:** Cada cena tem um ambiente COMPLETAMENTE diferente para manter interesse visual.
- Cena 1-2: Cidade urbana (mesma base, estado diferente)
- Cena 3: Costa marítima (novo cenário)
- Cena 4: Deserto árido (novo cenário)
- Cena 5: Oceano congelado (novo cenário)
- Cena 6: Floresta morta (novo cenário)
- Cena 7: Savana caótica (novo cenário)
- Cena 8: Espaço orbital (novo cenário)
- Cena 9: Tela dividida (composição especial)

#### Transições:
- Entre cenas 1-2: Mutação de estado (mesma geometria, muda clima/caos)
- Entre demais cenas: Crossfade suave com rebuild de cenário (cada ambiente é único)
- Exceção: Cena 9 usa composição split-screen programática

#### Áudio Open Source (Web Audio API):
- SFX procedurais: whoosh (vento), crash (onda), crackle (fogo), howl (frio), rustle (folhas), stampede (animais), static (radiação)
- Música ambient: drone grave crescente + pads tensos + percussão tribal nas cenas de caos
- Ducking automático durante legendas
- ZERO arquivos externos — tudo gerado em código

#### Auto-Fix de Bugs:
- Verificar console errors antes de cada transição
- Validar posição do personagem dentro do frustum da câmera
- Garantir hitbox ativa para todos os objetos dinâmicos
- Se bug detectado → aplicar correção instantânea e logar no bug-journal