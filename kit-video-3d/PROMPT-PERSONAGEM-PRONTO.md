# PROMPT MESTRE DO PERSONAGEM — PRONTO PARA COPIAR E COLAR
## Baseado nas 3 imagens de referência (garoto aventureiro 3D Pixar-style)

---

## 🎯 PROMPT PRINCIPAL (Character Sheet — 3 vistas)

Copie este bloco inteiro e cole no seu gerador de imagem:

```
3D animated character reference sheet, vertical 9:16 aspect ratio, showing the same character in three views side by side: front view, three-quarter view, and back view, on a clean light gray background with subtle horizontal grid lines.

CHARACTER: A young teenage boy adventurer (14-16 years old) with messy dark brown hair falling naturally over his forehead, expressive large brown eyes with a slightly worried but determined expression, small nose, neutral closed mouth, fair skin with soft semi-realistic texture, slightly larger head proportion (1:5.5 ratio) for expressive appeal while maintaining realistic teenage body structure, narrow shoulders, thin but defined arms, proportional legs.

OUTFIT (identical in all three views):
- Mustard yellow hoodie with visible hood resting on back, drawstrings hanging, soft cotton fabric texture with subtle wrinkles
- Olive green tactical utility vest worn OVER the hoodie, featuring multiple front pockets with button flaps, nylon/canvas texture with visible stitching
- Dark charcoal gray cargo pants with large side pockets and subtle knee reinforcement panels, thick cotton twill texture
- Worn brown hiking sneakers/boots with visible rubber soles, laces, and slight scuff marks
- Large detailed hiking backpack in olive brown/khaki color with: a blue water bottle attached to the left side, a camping lantern hanging from the right side, rolled sleeping pad strapped to the bottom, adjustable padded shoulder straps visible from front, multiple buckles and gear loops

STYLE: High-end 3D animation render similar to modern Pixar or Disney films (semi-realistic, NOT cartoonish, NOT flat toon shading), soft cinematic studio lighting with gentle key light from upper left, subtle rim light on hair and shoulders, soft fill light, highly detailed PBR textures showing fabric weave differences between hoodie cotton, vest nylon, pants twill, and backpack canvas, subsurface scattering on skin, sharp focus throughout, 8K resolution quality, Octane render aesthetic, Unreal Engine 5 level material detail.

CRITICAL RULES:
- Character must look IDENTICAL in all three views (same face, same hair mess, same outfit details, same backpack gear placement)
- Full body visible from head to toe in each view
- Natural relaxed standing pose with arms at sides
- No text, no watermark, no labels, no annotations
- Clean neutral light gray background only
- Consistent lighting across all three views
```

---

## ⚙️ PARÂMETROS POR PLATAFORMA

### Midjourney v6
```
[prompt acima] --ar 9:16 --style raw --v 6.0 --q 2
```
**Para consistência entre cenas:** use `--cref [URL_DA_IMAGEM_MESTRE_GERADA] --cw 100` em todos os prompts subsequentes.

### DALL-E 3 (ChatGPT Plus)
- Tamanho: **Portrait 1024x1792**
- Qualidade: **HD**
- Cole o prompt acima diretamente

### Leonardo AI
- Modelo: **Leonardo Vision XL** ou **Phoenix**
- Aspect Ratio: **9:16** (1024x1792)
- **Image Guidance: ON** — faça upload de uma das 3 imagens de referência como guia
- Guidance Strength: **0.65-0.75** (ajuste se o personagem mudar muito)

### Stable Diffusion XL (Local ou WebUI)
- Resolution: **768x1344** ou **832x1472**
- Sampler: **DPM++ 2M Karras**
- Steps: **30-40**
- CFG Scale: **7-8**
- Negative prompt:
```
text, watermark, signature, low quality, blurry, deformed, extra limbs, bad anatomy, cartoonish, flat shading, cel shading, anime, 2D, illustration, painting, sketch, multiple characters, different outfits, inconsistent face
```

### Kling AI / Runway Gen-3
- Cole o prompt acima
- Aspect Ratio: **9:16**
- Mode: **High Quality**

---

## 🔄 PROMPT DE INJEÇÃO PARA CENAS INDIVIDUAIS

Depois de gerar a imagem mestre acima, use este bloco em inglês em TODOS os prompts de cena individual (substitui a descrição do personagem):

```
A young teenage boy adventurer with messy dark brown hair falling over his forehead, expressive large brown eyes, fair skin, wearing a mustard yellow hoodie under an olive green tactical utility vest with multiple pockets, dark charcoal gray cargo pants, worn brown hiking sneakers, carrying a large olive brown hiking backpack with blue water bottle and camping lantern attached. High-end 3D semi-realistic Pixar-style animation render, soft cinematic lighting, highly detailed fabric textures, slightly larger head proportion for expressive appeal.
```

---

## ✅ CHECKLIST DE VALIDAÇÃO (antes de aprovar qualquer geração)

- [ ] Cabelo castanho escuro bagunçado caindo na testa?
- [ ] Olhos castanhos grandes e expressivos?
- [ ] Moletom amarelo-mostarda com capuz visível?
- [ ] Colete verde-oliva tático com bolsos por cima do moletom?
- [ ] Calça cargo cinza-escura/carvão?
- [ ] Tênis/botas marrom desgastados?
- [ ] Mochila grande com garrafa d'água AZUL na lateral?
- [ ] Lanterna de camping pendurada na mochila?
- [ ] Proporção da cabeça levemente maior que realismo (1:5.5)?
- [ ] Texturas semi-realistas (NÃO cartoon flat, NÃO anime)?
- [ ] Iluminação cinematográfica suave com sombras naturais?
- [ ] Fundo cinza claro neutro limpo?
- [ ] Sem texto, sem marca d'água?
- [ ] Personagem reconhecível como o mesmo das referências?

**Se qualquer item falhar → regenere ajustando o prompt ou aumentando o peso do `--cref` / Image Guidance.**

---

## 📁 ARQUIVOS DO KIT ATUALIZADOS

| Arquivo | Status |
|---|---|
| `00-personagem-mestre.md` | ✅ Atualizado com análise completa das referências |
| `01-roteiro.md` | ✅ Pronto (tema: "E se você pudesse ver 1 segundo no futuro?") |
| `02-narracao.md` | ✅ Pronto (texto formatado para voz sintética) |
| `03-direcao-3d.md` | ✅ Atualizado com prompts de cena no novo estilo Pixar |
| `04-som.md` | ✅ Pronto (tabela SFX + prompt de música) |
| `05-checklist.md` | ✅ Pronto (10 critérios validados) |
| `PROMPT-PERSONAGEM-PRONTO.md` | ✅ Este arquivo — prompt master pronto para colar |

---

## 🚀 PRÓXIMOS PASSOS

1. **Gere a imagem mestre** com o prompt acima no seu gerador preferido
2. **Salve como** `personagem-referencia-final.png` nesta pasta
3. **Valide** contra o checklist acima
4. **Use como referência** (`--cref` no Midjourney ou Image Guidance no Leonardo) em todos os prompts de cena do arquivo `03-direcao-3d.md`
5. **Gere as 6 cenas** seguindo os prompts individuais de `03-direcao-3d.md`
6. **Sintetize a voz** com o texto de `02-narracao.md`
7. **Componha o áudio** seguindo a tabela de `04-som.md`
8. **Edite na timeline** seguindo a tabela de blocos de `01-roteiro.md`