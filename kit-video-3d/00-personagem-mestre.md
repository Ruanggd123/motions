# FICHA DE PERSONAGEM MESTRE — ATUALIZADA COM REFERÊNCIAS VISUAIS
## Estilo: 3D Semi-Realista (Pixar/Disney Moderno)
## Proporção: Cabeça 1:5.5 (levemente maior que realismo), corpo jovem atlético
---
## 1. ANÁLISE DAS REFERÊNCIAS VISUAIS
**Características extraídas das 3 imagens:**
- **Cabelo:** Castanho escuro, bagunçado, com volume natural, franja caindo sobre a testa
- **Rosto:** Olhos castanhos expressivos, sobrancelhas levemente franzidas (expressão determinada/preocupada), nariz pequeno, boca neutra
- **Pele:** Tom claro natural, textura semi-realista suave
- **Moletom:** Amarelo-mostarda com capuz, cordões visíveis, textura de tecido macio
- **Colete:** Verde-oliva tático/utilitário com múltiplos bolsos frontais, textura de nylon/lona resistente
- **Calça:** Cargo cinza-escura/carvão com bolsos laterais grandes, joelheiras sutis, textura de algodão grosso
- **Botas/Tênis:** Marrom desgastados, estilo trilha/hiking, solado visível
- **Mochila:** Grande, marrom/cáqui, com garrafa d'água azul presa lateralmente, lanterna/acessórios pendurados, alças ajustáveis visíveis
- **Proporção corporal:** Cabeça levemente maior que o realismo humano (proporção 1:5.5 em vez de 1:7), ombros estreitos de adolescente, braços finos mas definidos, pernas proporcionais
- **Iluminação:** Soft cinematic studio lighting, sombras suaves, highlights sutis no cabelo e tecido
- **Fundo:** Cinza claro neutro com linhas de grade sutis (character sheet style)
---
## 2. PROMPT MESTRE DE REFERÊNCIA (Character Sheet)
**Use este prompt para gerar a imagem base que servirá de referência para TODAS as cenas.**
```text
3D animated character reference sheet, vertical 9:16 aspect ratio, showing the same character in three views: front view, three-quarter view, and back view, arranged side by side on a clean light gray background with subtle grid lines.
CHARACTER DESCRIPTION:
A young teenage boy adventurer (approximately 14-16 years old) with messy dark brown hair that falls naturally over his forehead, expressive brown eyes with a slightly worried but determined expression, small nose, neutral mouth, fair skin with soft semi-realistic texture.
OUTFIT (must be identical in all three views):
- Mustard yellow hoodie with visible hood and drawstrings, soft fabric texture
- Olive green tactical utility vest worn over the hoodie, featuring multiple front pockets with flaps, nylon/canvas texture
- Dark charcoal gray cargo pants with large side pockets and subtle knee reinforcement, thick cotton texture
- Worn brown hiking boots/sneakers with visible soles and laces
- Large detailed hiking backpack in brown/khaki color with a blue water bottle attached to the side, camping lantern and gear straps visible, adjustable shoulder straps
STYLE AND TECHNICAL:
High-end 3D animation style similar to modern Pixar or Disney films (semi-realistic, not cartoonish), soft cinematic studio lighting with gentle shadows and subtle highlights on hair and fabric, highly detailed textures showing fabric weave and material differences, character proportions with slightly larger head (1:5.5 ratio) for expressive appeal while maintaining realistic body structure, sharp focus throughout, 8K resolution quality, Octane render aesthetic, Unreal Engine 5 level detail.
CRITICAL CONSISTENCY RULES:
- The character must look IDENTICAL in all three views (same face, same hair, same outfit details)
- No text, no watermark, no labels
- Clean neutral background only
- Full body visible from head to toe in each view
- Natural standing pose with arms at sides
```
**Parâmetros por plataforma:**
| Plataforma | Configuração |
|---|---|
| **Midjourney v6** | `--ar 9:16 --style raw --v 6.0 --q 2` + use `--cref [URL_DE_UMA_DAS_IMAGENS_REFERENCIA] --cw 100` para forçar consistência |
| **DALL-E 3** | Tamanho: Portrait 1024x1792, Qualidade: HD |
| **Leonardo AI** | Modelo: Leonardo Vision XL ou Phoenix, Aspect Ratio: 9:16, Image Guidance: ON com uma das referências |
| **Stable Diffusion XL** | Negative prompt: `text, watermark, signature, low quality, blurry, deformed, extra limbs, bad anatomy, cartoonish, flat shading` |
---
## 3. PROMPT DE INJEÇÃO PARA CENAS (Substitui a ficha antiga)
**Copie este bloco em inglês e cole em TODOS os prompts de cena do arquivo `03-direcao-3d.md`:**
```text
A young teenage boy adventurer with messy dark brown hair falling over his forehead, expressive brown eyes with determined expression, fair skin, wearing a mustard yellow hoodie under an olive green tactical utility vest with multiple pockets, dark charcoal gray cargo pants with side pockets, worn brown hiking boots, carrying a large brown hiking backpack with blue water bottle and camping gear attached. Style is high-end 3D semi-realistic animation similar to modern Pixar films, soft cinematic lighting, highly detailed fabric and material textures, character proportions with slightly larger head for expressive appeal.
```
---
## 4. NOTAS DE PROPORÇÃO E CONSISTÊNCIA
**Regras obrigatórias para manter o personagem igual em todas as cenas:**
1. **Cabeça:** Sempre levemente maior que o realismo (proporção 1:5.5), nunca 1:7 ou menor
2. **Cabelo:** Sempre castanho escuro bagunçado, nunca penteado ou diferente
3. **Moletom:** Sempre amarelo-mostarda, nunca outra cor
4. **Colete:** Sempre verde-oliva tático, nunca removido ou substituído
5. **Calça:** Sempre cargo cinza-escura, nunca jeans ou outra cor
6. **Botas/Tênis:** Sempre marrom desgastados, nunca sapatos sociais
7. **Mochila:** Sempre presente nas cenas de aventura, pode ser removida apenas em cenas internas específicas
8. **Expressão facial:** Pode variar (preocupado, determinado, surpreso, sério) mas a estrutura do rosto nunca muda
9. **Iluminação:** Sempre "soft cinematic lighting" para manter o visual 3D limpo
10. **Texturas:** Moletom = tecido macio, colete = nylon/lona, calça = algodão grosso, mochila = couro/nylon resistente
---
## 5. COMO USAR ESTA REFERÊNCIA
1. **Gere a imagem mestre** com o prompt da seção 2 acima
2. **Salve como** `personagem-referencia-final.png` na pasta `kit-video-3d/`
3. **Em todos os prompts de cena** (arquivo `03-direcao-3d.md`), substitua a descrição antiga do personagem pela nova descrição da seção 3
4. **Se usar Midjourney**, use sempre o parâmetro `--cref` apontando para a imagem mestre gerada para garantir consistência absoluta entre cenas
5. **Se usar Leonardo AI**, ative "Image Guidance" com a imagem mestre em todos os prompts
6. **Valide cada cena gerada** contra esta ficha antes de aprovar: o personagem está com a mesma roupa? A proporção da cabeça está correta? As texturas estão semi-realistas?
---
## 6. CHECKLIST RÁPIDO DE VALIDAÇÃO POR CENA
Antes de aprovar qualquer imagem gerada, verifique:
- [ ] Cabelo castanho escuro bagunçado?
- [ ] Moletom amarelo-mostarda visível?
- [ ] Colete verde-oliva com bolsos?
- [ ] Calça cargo cinza-escura?
- [ ] Botas/tênis marrom?
- [ ] Proporção da cabeça levemente maior que realismo?
- [ ] Texturas semi-realistas (não cartoon flat)?
- [ ] Iluminação cinematográfica suave?
- [ ] Sem texto ou marca d'água?
- [ ] Personagem reconhecível como o mesmo das outras cenas?
Se qualquer item falhar, regenere com o prompt ajustado.