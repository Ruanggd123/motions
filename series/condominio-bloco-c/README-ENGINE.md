# Motor de Animação 2.5D — Condomínio Solaris · Bloco C

Este documento é a fonte de verdade técnica da série. Ele descreve os
motores, os contratos e as regras que impedem os defeitos que já
aconteceram de voltarem.

> Leia junto com [`scenes/README.md`](scenes/README.md) (catálogo de cenas) e
> [`ROTEIRO-ESTRUTURA.md`](ROTEIRO-ESTRUTURA.md) (curva narrativa).

---

## 1. Visão geral

```
characters/   um arquivo por personagem (rig vetorial próprio + rig compartilhado)
engine/       motores reutilizáveis (câmera, corpo, profundidade)
scenarios/    cenários legados por camada (portaria, exterior, guarita lateral…)
scenes/       biblioteca de cenas aprovadas (uma cena = um arquivo + registro)
audio/        vozes, timeline e SFX
tools/        geração de áudio, render MP4 e QA
estudio-epNN.html   montagem do episódio (diretor + timeline + overlays)
```

Nada de desenhar personagem ou cena aprovada dentro do HTML do episódio. O
episódio **consome**:

```js
new window.StudioCharacters.VoceMorador({ ... })
window.StudioScenes.play('portaria_noturna_2.5d', ctx, { W, H, t, voce, valdir })
```

---

## 2. Os três motores

### 2.1 `StudioEngine.BodyRig2D` — corpo em perfil

Arquivo: [`engine/BodyRig2D.js`](engine/BodyRig2D.js)

| Função | Para que serve |
| :--- | :--- |
| `legCycle(phase, cfg)` | cinemática do passo; joelho sempre dobra para trás (`kn >= 0`) |
| `armLayers(phase, cfg)` | ângulos dos dois braços, em oposição |
| `resolveProfileArms(opts)` | junta passo + reação + direção de leitura |
| `applyReaction(layers, localDir, amount)` | coloca o braço certo à frente na reação |
| `reactLocalDirection(worldSide, facingRight)` | converte "veio da direita" para a direção local |
| `drawArmChain(ctx, cfg)` | ombro → braço → cotovelo → antebraço → punho → mão |
| `drawProfileHair(ctx, spec)` | massa de cabelo presa ao crânio |
| `drawBun(ctx, spec)` | coque **atrás** da cabeça |
| `drawGroundShadow(ctx, cfg)` | sombra elíptica padrão |

**Convenção de ângulo:** um membro desenhado para baixo, girando `theta`, leva
`(0, L)` para `(-L·senθ, L·cosθ)`. Logo `theta < 0` = para a **frente** e
`theta > 0` = para **trás**. O cotovelo é negativo quando dobra para frente.

#### Regras que não se violam

1. **Braço próximo é o lado 1**, desenhado depois do tronco. O lado 0 fica atrás.
   O que alterna entre eles é o ângulo, em oposição.
2. **Nunca** dar ao braço traseiro um balanço próprio desligado de `walkCycle`.
   Foi isso que fazia os dois braços ficarem do mesmo lado do tronco.
3. **Reação lateral** sempre por `reactToSide(side, amount)`. O lado de onde vem
   a ameaça comanda qual braço vai à frente.
4. **Cabelo**: o topo da massa sobe no máximo ~2 px acima do crânio. Volume vai
   para a nuca. Coque atrás, nunca no topo — no topo vira crista/moicano.

#### Como usar no personagem

```js
_drawProfile(ctx) {
  const Rig = global.StudioEngine && global.StudioEngine.BodyRig2D;
  const arms = Rig ? Rig.resolveProfileArms({
    phase: this.walkCycle,
    walking: this.isWalking,
    reactSide: this.reactSide,
    reactAmount: this.reactAmount,
    facingRight: !this.flipX
  }) : null;

  // braço de trás (antes do tronco)
  Rig.drawArmChain(ctx, { ...arms.back, color: '#0c2338', skin: '#b87d4e' });

  // ...tronco e cabeça...

  // braço da frente (depois do tronco)
  Rig.drawArmChain(ctx, { ...arms.front, color: '#153a5b', skin: '#c99060' });
}
```

### 2.2 `StudioEngine.DepthScene2D` — kit de planos 2.5D

Arquivo: [`engine/DepthScene2D.js`](engine/DepthScene2D.js)

Profundidade em 2D vem de quatro sinais, não de desenhar mais coisa:

| Sinal | API | Efeito |
| :--- | :--- | :--- |
| Atmosfera | `layer({ haze })`, `fogBank()` | o longe perde contraste |
| Foco | `layer({ blur })` | plano de ação nítido, resto desfocado |
| Paralaxe | `layer({ depth })` + `camOffsetX` | cada plano desloca diferente |
| Luz | `lightShaft()`, `glow()`, `vignette()` | separa frente de fundo |

Apoio: `rain()`, `grain()`, `shadowBars()`, `contactShadow()`, `poseActor()`,
`elenco(S)`, `hash(i)` (determinístico, substitui `Math.random()`).

**Mínimo de planos por cena: 4.** O plano de foco tem `blur: 0`.

```js
const D = window.StudioEngine.DepthScene2D;
const fundo = D.layer({ name: 'rua', depth: 0.12, blur: 5, haze: 0.35,
  draw(c) { /* céu, prédios, massa negra */ } });
const foco = D.layer({ name: 'ator', depth: 0.6, draw(c) {
  D.poseActor(actor, c, { x: 540, y: 1400, scale: 1.6, viewMode: 'profile' });
}});
const frente = D.layer({ name: 'moldura', depth: 1.1, blur: 7, draw(c) { /* gotas */ } });

D.compose(ctx, { W, H, t }, [fundo]);
D.compose(ctx, { W, H, t }, [foco]);
D.compose(ctx, { W, H, t }, [frente]);
D.vignette(ctx, W, H, 0.72);
```

### 2.3 `StudioEngine.CameraRig2D` — câmera

Arquivo: [`engine/CameraRig2D.js`](engine/CameraRig2D.js)

Mola criticamente amortecida (`damping = 2·√stiffness`), com `cut()` para corte
seco, `panTo()` para dolly suave e `shake(intensity)` para impacto. A câmera
trava nos limites do mundo — nunca aparece faixa preta.

---

## 3. Personagens e o contrato de opções

Todos aceitam:

```js
{
  x, y, scale, flipX,
  emotion,        // varia por personagem
  pose,           // pose estática
  viewMode,       // 'auto' | 'profile' | 'front'
  isWalking, walkCycle, walkSpeed, walkDir,
  reactSide,      // 'left' | 'right' | null  ← novo
  reactAmount     // 0..1
}
```

E expõem `reactToSide(side, amount)` para trocar a reação em tempo real.

| Personagem | Emotions | Poses |
| :--- | :--- | :--- |
| `VoceMorador` | neutral, tense, shocked, scared, command, determined | idle, phone_look, step_back, pointing, pointing_valdir, pointing_window, listening, hands_counter, window_look, gesturing_urgent, holding_spotlight |
| `SeuValdirPorteiro` | neutral, focused, serious, worried, panicked, command | radio_talk, point_monitors, hands_desk, holding_spotlight, holding_switch, pulling_lever |
| `LucasEntregador` | neutral, tired, desperate, terrified | hold_bag, bang_gate, look_back, hands_glass, cover_eyes |
| `CamilaEPacoca` | neutral, alert, scared, whisper | idle, hold_leash, point_elevator |

---

## 4. Regras de continuidade (Bíblia §5 e §6)

- Personagens **frontais** em repouso e diálogo; **perfil** apenas em
  deslocamento ou quando o roteiro pede a lateral.
- `viewMode: 'auto'` já faz isso sozinho: entra em perfil só enquanto
  `isWalking === true`.
- Continuidade física herdada: vidro trincado, grade deformada, giroflex
  vermelho, câmera CAM 02 com a criatura. Não "resetar" esses estados.

---

## 5. Gate de qualidade (obrigatório antes do render)

```bash
# 1. sintaxe de tudo que foi tocado
node --check series/condominio-bloco-c/engine/BodyRig2D.js
node --check series/condominio-bloco-c/engine/DepthScene2D.js
node --check series/condominio-bloco-c/scenes/*.js
node --check series/condominio-bloco-c/characters/*.js
```

```bash
# 2. o <script> inline do HTML também é código
node series/condominio-bloco-c/tools/check-inline.mjs series/condominio-bloco-c/estudio-ep03.html
```

```bash
# 3. frames de prova
node series/condominio-bloco-c/tools/tmp/baseline_scenes.mjs
```

Só depois de **olhar** os frames e confirmar que cada cena aparece em
`StudioScenes.list()` é que se roda `render_ep03_mp4.mjs`.

Armadilhas já registradas:

- Chave de objeto com ponto (`portaria_noturna_2.5d:`) é erro de sintaxe;
  use aspas: `'portaria_noturna_2.5d': [...]`.
- `Math.random()` numa cena quebra a reprodução frame a frame.
- Reflexo no chão se faz espelhando em torno da linha do piso
  (`translate(0, 2·floorY); scale(1, -1)`), não em torno do personagem.

---

## 6. Onde cada coisa mora

| Preciso de… | Vá para |
| :--- | :--- |
| mudar como um braço se move | `engine/BodyRig2D.js` |
| criar cena nova | `scenes/` + registrar no `_registry.js` |
| ver todas as cenas | `scenes/README.md` |
| escrever o próximo episódio | `ROTEIRO-ESTRUTURA.md` |
| mexer no áudio/SFX | `tools/build_cenaNN_audio.py` + `audio/sfx/` |
| renderizar o MP4 | `tools/render_ep03_mp4.mjs` |
