# 🎨 FICHA MESTRE DO PERSONAGEM — Leo v10

## Perfil do Personagem
- **Nome:** Leo
- **Idade Aparente:** 12-14 anos
- **Estilo Visual:** Pixar/Stylized Cel-Shaded
- **Arquétipo:** Curioso observador em situação extrema
- **Função Narrativa:** Proxy do espectador (reações humanas progressivas)

## Anatomia Articulada (Pivôs Críticos)
- **Cabeça:** Rotação X/Y/Z completa (expressões faciais via blendshapes)
- **Olhos:** Auto-Blink + Saccades (movimento involuntário realista)
- **Sobrancelhas:** Blendshapes de emoção (surpresa, medo, choque)
- **Ombros/Cotovelos:** IK natural para gestos de apontar/equilibrar
- **Quadril/Joelhos/Tornozelos:** Animação de corrida/subida procedural
- **Pálpebras:** Fechamento suave com easing spring

## Prompt Reference Sheet — 3 Vistas

### Vista Frontal (Front View)
```
Leo v10, front view, full body, stylized cel-shaded character, 
yellow hoodie with drawstrings, dark blue jeans, white sneakers, 
backpack with small lantern attached, expressive large eyes, 
soft rounded features, Pixar-style proportions, clean lineart, 
neutral pose, T-pose arms slightly relaxed, height 1.4m equivalent, 
warm skin tone, short brown hair with subtle highlights, 
studio lighting, plain background --ar 9:16 --v 6.0
```

### Vista Lateral (Side View)
```
Leo v10, side profile view, full body, stylized cel-shaded character, 
yellow hoodie hood visible from side, backpack depth shown, 
lantern protruding from backpack, posture slightly forward-leaning, 
sneaker sole thickness visible, ear shape clear, hair volume from side, 
clean silhouette, Pixar-style proportions, neutral expression, 
studio lighting, plain background --ar 9:16 --v 6.0
```

### Vista Posterior (Back View)
```
Leo v10, back view, full body, stylized cel-shaded character, 
yellow hoodie back panel, backpack straps and main compartment, 
lantern light glow visible, hood resting on shoulders, 
jeans fit and sneaker heel detail, hair cowlick at crown, 
Pixar-style proportions, clean lineart, studio lighting, 
plain background --ar 9:16 --v 6.0
```

## Bloco Fixo `--cref` (Character Reference)
```
--cref [URL_DA_IMAGEM_MASTER_LEO_V10] --cw 100
```
**Nota:** Manter consistência absoluta de proporções, cores do moletom amarelo (#F4C430), jeans azul escuro (#1E3A5F) e tênis brancos em todas as gerações de assets derivados.

## Estados Emocionais (Blendshapes)
| Emoção | Configuração Facial | Contexto de Uso |
|--------|---------------------|-----------------|
| Curioso | Sobrancelhas levemente erguidas, olhos arregalados 10%, boca neutra | Cena 1-Hook, Cena 6-Mar |
| Chocado | Sobrancelhas altas, olhos arregalados 40%, boca aberta pequena | Cena 3-Muro, Cena 5-Escuro |
| Tenso | Sobrancelhas franzidas, olhos semi-arregalados, mandíbula firme | Cena 4-Telhado, Cena 7-Tubarão |
| Exausto | Pálpebras caídas 20%, boca relaxada, cabeça inclinada | Cena 8-CTA |

## Especificações de Renderização
- **Shader:** Cel-Shaded com 3 tons de sombra
- **Rim Light:** Fresnel azul claro (#87CEFA) para separação do fundo
- **Borda:** Outline preto suave (0.8px) estilo anime/Pixar 2D
- **Textura:** Pele com subsurface scattering leve, tecido do moletom com noise sutil

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>