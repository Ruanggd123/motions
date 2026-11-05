# Estrutura de Episódio — Condomínio Solaris · Bloco C

Checklist para escrever e produzir qualquer episódio novo. Seguir isto é o que
mantém a série **interessante e sempre bem montada**, com suspense real e sem
os defeitos que já apareceram.

> Documento irmão: [`README-ENGINE.md`](README-ENGINE.md) (motores e contratos)
> e [`scenes/README.md`](scenes/README.md) (catálogo de cenas).

---

## 1. A curva de suspense (60–100 s)

| # | Bloco | Tempo alvo | Objetivo | Recurso obrigatório |
| :-- | :--- | :--- | :--- | :--- |
| 1 | **Hook** | 0,0–3,0 s | uma imagem que prende antes de explicar | corte seco + SFX de impacto + shake curto |
| 2 | **Prova social** | 0,0–6,5 s | mostrar que o público decidiu o episódio | overlay UGC com o comentário vencedor |
| 3 | **Estabelecimento** | 5–10 s | o lugar, o problema, quem está onde | plano aberto com **4+ planos** de profundidade |
| 4 | **Escalada** | 15–25 s | a ameaça cresce por evidência | SFX a cada 3–4 s; um ângulo novo a cada 6–8 s |
| 5 | **Reação** | 3–5 s | elenco reage ao lado exato da ameaça | `reactToSide('left' \| 'right')` |
| 6 | **Clímax** | 6–10 s | ação física e consequência | shake + SFX nos frames de impacto |
| 7 | **Dilema** | 8–16 s | duas escolhas inequívocas | overlay + countdown + silêncio antes |

**Regra de ângulo:** nenhum plano segura mais de 8 s. Se a cena é boa, ela
merece um segundo ângulo, não mais tempo.

---

## 2. Checklist de cada episódio

### 2.1 Antes de escrever
- [ ] Ler a Bíblia (`biblia-condominio.md`) e o Canon Ledger: o que já
      aconteceu não pode "resetar" (vidro trincado, grade torta, giroflex...).
- [ ] Consultar `scenes/README.md` antes de criar cena nova.
- [ ] Definir em uma frase o **dilema** do final.

### 2.2 Roteiro
- [ ] Cada fala tem um personagem e um tempo; nada de narração explicando o
      que a imagem já mostra.
- [ ] Toda fala de reação corresponde a um lado da tela (para `reactToSide`).
- [ ] O clímax tem uma ação física verificável (algo cede, quebra ou cede
      energia), não só olhares.

### 2.3 Cena e rig
- [ ] Toda cena nova usa `DepthScene2D` com mínimo de 4 planos.
- [ ] Personagens em repouso são **frontais**; perfil só andando.
- [ ] Braços alternam frente/trás pelo `BodyRig2D` (nunca balanço solto).
- [ ] Cabelo de perfil preso ao crânio; coque **atrás** da cabeça.
- [ ] Zero `Math.random()`; variação por `hash(i)` e `t`.

### 2.4 Áudio
- [ ] SFX nunca por cima da fala (0,1–0,3 s de folga).
- [ ] Drone sub em toda cena de tensão (volume ≤ 0,60).
- [ ] Batida de coração acelerando só na reta final.
- [ ] Silêncio de ~0,4 s antes do impacto principal.
- [ ] Ducking da trilha para ~35% durante qualquer fala.
- [ ] Margem de 2,0–2,5 s depois da última palavra (nunca cortar o final).

### 2.5 Gate técnico
```bash
node tools/check-inline.mjs estudio-epNN.html
node --check characters/*.js
node --check scenes/*.js
node --check engine/*.js
node tools/tmp/baseline_scenes.mjs        # gera frames em output/qa_motor
```
- [ ] Olhar os frames gerados.
- [ ] Confirmar que cada cena nova aparece em `StudioScenes.list()`.
- [ ] Só então rodar `tools/render_epNN_mp4.mjs`.

---

## 3. Banco de ganchos de suspense (usar com moderação)

- "A regra dizia: nunca abra a porta depois da meia-noite."
- "O elevador desceu do 4º andar. Vazio."
- "O que a câmera 2 gravou não é uma pessoa."
- "A luz revelou algo, mas acabou com a bateria."
- "Eles ouviram três batidas. Mas o vidro tem quatro lados."

Um gancho por episódio. Mais de um vira ruído.

---

## 4. O que torna o episódio chato (evitar)

| Sintoma | Causa real | Correção |
| :--- | :--- | :--- |
| Plano parado muito tempo | falta de variação de ângulo | cortar para outro plano da biblioteca |
| Cena "de cartaz" | profundidade só de desenho | usar `DepthScene2D` com desfoque e atmosfera |
| Personagem sem peso | braços pendurados e cabelo flutuando | `BodyRig2D` + `reactToSide` |
| Susto que não assusta | impacto sem contraste | silêncio antes + SFX no frame exato + shake |
| Final cortado | áudio sem margem | +2,0 a 2,5 s após a última palavra |
| Explicação demais | narração descrevendo a imagem | mostrar, não narrar |

---

## 5. Estados de continuidade (Canon Ledger resumido)

| Elemento | Estado a partir do Ep.03 |
| :--- | :--- |
| Vidro blindado | trincado e laminado; visível de perfil como delaminação |
| Grade da eclusa | deformada no centro com marcas de garra |
| Luz de emergência | giroflex vermelho ativo |
| Quadro de força | 10 kV, com arcos elétricos quando sobrecarregado |
| Eclusa | dupla grade travada magneticamente |
| Massa negra | na rua, engolindo postes; cresce a cada episódio |

Atualize esta tabela ao final de cada episódio.

---

## 6. Pendências conhecidas do motor

| # | Pendência | Evidência | Onde corrigir |
| :-- | :--- | :--- | :--- |
| 1 | Pés 14–38 px acima da sombra nos quatro rigs | medido em `probe_feet` no commit `8eba69f` **e** no atual (mesmo delta) — pré-existente | `_drawProfileLeg` de cada personagem e o `y` da sombra em `_drawProfile` |
| 2 | Cena `portaria_noturna_2.5d` cobre o elenco com vinheta pesada em planos fechados | aparece quando o estúdio soma a própria vinheta | baixar `vignette()` da cena ou aplicar só no estúdio |
| 3 | `blendLayers` troca de camada em `k > 0.5` sem interpolar a ordem | troca é abrupta num frame | interpolar opacidade entre as duas camadas no meio do blend |

Corrigir a #1 antes de qualquer episódio novo: é o defeito visual mais
antigo e o mais fácil de notar em plano aberto.
