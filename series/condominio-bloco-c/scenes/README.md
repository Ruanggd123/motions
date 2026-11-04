# 🎬 Biblioteca de Cenas — Condomínio Solaris · Bloco C

Cada cena mora num arquivo próprio em `scenes/` e se registra no
`StudioScenes`. Os episódios **consomem** a cena em vez de reimplementar o
desenho no HTML — assim uma cena aprovada nunca mais se perde numa reescrita.

## Como usar num episódio

```html
<script src="./scenes/_registry.js"></script>
<script src="./scenes/alavanca-macro.js"></script>
```

```js
window.StudioScenes.play('alavanca_macro', ctx, {
  W, H, t,
  pullStart: 15.80,
  pullDuration: 0.42
});
```

`play()` devolve `false` se a cena não estiver registrada — sempre trate esse
caso com um fundo sólido, para nunca gerar tela preta no vídeo.

## Como criar uma cena nova

```js
(function (global) {
  global.StudioScenes.define('minha_cena', {
    meta: {
      nome: 'Nome legível',
      angulo: 'frontal | 3/4 | perfil | close-up',
      profundidade: 'quantos planos focais',
      criadoEm: '2026-11-04',
      pinned: true
    },
    draw(ctx, { W, H, t, /* estado do episódio */ }) {
      // desenho completo, determinístico (só depende de t)
    }
  });
})(window);
```

Regras que garantem reaproveitamento:

- **Determinístico:** o desenho depende só de `t` e do estado recebido. Nada de
  `Math.random()` — o render frame a frame precisa ser reproduzível.
- **`pinned: true`** trava a cena: o registry se recusa a sobrescrevê-la e
  emite aviso. Para evoluir, crie `nome_v2` e aponte o episódio novo para ela.
- **Cobrir o quadro inteiro:** comece com um `fillRect(0, 0, W, H)`. Sem isso
  aparecem faixas transparentes no vídeo renderizado.
- **Ordem de camadas explícita:** fundo → objetos → personagens → objetos na
  frente. Use a mesma ordem para mãos e braços: o membro que está à frente do
  corpo tem de ser desenhado depois do tronco.

## Cenas disponíveis

| Nome | Ângulo | Profundidade | Usada em |
| :--- | :--- | :--- | :--- |
| `alavanca_macro` | close-up frontal | parede → quadro → mão | Ep.03 · 15,6s–16,4s |
| `cctv_eclusa_3planos` | CCTV atrás da grade | 3 planos focais | Ep.03 · 28,8s–36,5s |
| `guarita_3q` | 3/4 (duas paredes) | 1 ponto de fuga | Ep.03 · 6,9s–13,7s |
| `guarita_perfil_janela` | perfil lateral | interior → vidro → rua | Ep.03 · 47,6s–51,4s |
| `lucas_chegada_costas` | frontal pelas costas | rua em fuga → guarita → Lucas | Ep.03 · 36,6s–38,2s |
| `grade_cedendo` | frontal, 1º plano | massa → criatura → grade | Ep.03 · 66,2s–68,6s |

## Sequência de planos do Ep.03

| # | Tempo | Cena | Função narrativa |
| :-- | :--- | :--- | :--- |
| 1 | 0,0–6,9s | `portaria` (frontal) | estabelecimento + resultado da votação |
| 2 | 6,9–13,8s | `guarita_3q` | Você ordena o holofote (ângulo 3/4) |
| 3 | 13,8–15,7s | `portaria` | Valdir caminha até o quadro |
| 4 | 15,7–16,5s | `alavanca_macro` | a mão puxa a alavanca |
| 5 | 16,5–21,4s | `exterior_light` | a luz acende e varre a rua |
| 6 | 21,4–28,8s | `portaria` | reação em choque |
| 7 | 28,8–35,5s | `cctv_eclusa_3planos` | a criatura é revelada |
| 8 | 35,5–36,6s | `portaria` | rosto do Valdir em choque |
| 9 | 36,6–38,3s | `lucas_chegada_costas` | **Lucas correndo de costas** |
| 10 | 38,3–44,2s | `lucas_lateral` | **Lucas de perfil batendo no vidro** |
| 11 | 44,2–47,6s | `intercom_macro` | Donа Camila no interfone |
| 12 | 47,6–51,4s | `guarita_perfil_janela` | perfil pela janela |
| 13 | 51,4–66,2s | `portaria` | pedido para salvar Lucas |
| 14 | 66,2–68,6s | `grade_cedendo` | **a grade entorta (ação)** |
| 15 | 68,6–81,1s | `portaria` | clímax + dilema de 10kV |
| 16 | 81,1–97,6s | `portaria` + overlay | votação aberta |

## Por que estas cenas existem

O Ep.03 original passava quase todo o tempo num único plano frontal, com a
guarita chapada. As cenas de 3/4 e de perfil existem para dar **profundidade e
variação de ângulo** ao mesmo espaço — o espectador entende a guarita como um
lugar, não como um cenário de fundo.

## Onde ficam os SFX

Os efeitos da cena da alavanca são sintetizados do zero (zero samples de
terceiros, sem risco de direitos autorais):

```bash
python tools/generate_lever_sfx.py
```

Gera `alavanca_curso.mp3`, `chave_contato_industrial.mp3`,
`capacitor_carregando.mp3` e `leds_sequencia.mp3` em `audio/sfx/`.
