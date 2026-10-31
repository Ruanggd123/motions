# 🔊 MAPA DE SOM — Sincronização Audiovisual (50s)

## Trilha Sonora Principal
- **Gênero:** Cinematic Ambient / Tensão Progressiva
- **BPM:** 60 → 90 (aceleração gradual até cena 5, depois desacelera)
- **Instrumentação:**
  - Cena 1-2: Piano minimalista + pads atmosféricos graves
  - Cena 3-4: Cordas staccato (violinos em trêmolo) + sub-bass
  - Cena 5-6: Percussão tribal grave (taikos distantes) + sintetizador dark ambient
  - Cena 7: Silêncio parcial (apenas drone profundo + batimento cardíaco)
  - Cena 8: Piano solo melancólico com reverb longo (amanhecer sonoro)
- **Key:** D menor (tensão/mistério) → F maior (esperança no final)

## Mapa de SFX (Frame-Perfect Sync)

| Tempo | Cena | SFX | Descrição Técnica | Volume (dB) |
|-------|------|-----|-------------------|-------------|
| 0.0s | 1-Hook | Ambience urbana suave | Tráfego distante, vento leve, pássaros esparsos | -18dB |
| 2.5s | 1-Hook | Whoosh sutil | Vento aumenta levemente (preparação) | -15dB |
| 5.0s | 2-Som | Rugido grave (low-end) | Frequência 40-80Hz, swell de 2s, filtro passa-baixa abrindo | -12dB |
| 6.5s | 2-Som | Bando de pássaros | Asas batendo rápido + cantoria aguda em pânico | -14dB |
| 8.0s | 2-Som | Vento forte | White noise filtrado, intensidade crescente | -10dB |
| 10.0s | 3-Muro | Splash inicial | Água impactando asfalto, gotas grandes | -11dB |
| 11.5s | 3-Muro | Ondulação contínua | Som de correnteza baixa, bolhas subindo | -13dB |
| 13.0s | 3-Muro | Carro boiando | Metal rangendo + plástico flutuando | -16dB |
| 16.0s | 4-Telhado | Passos correndo | Tênis em telha de cerâmica (3 passos rápidos) | -12dB |
| 17.5s | 4-Telhado | Escalada | Mãos agarrando borda + esforço vocal sutil | -14dB |
| 19.0s | 4-Telhado | Carros colidindo | Batida metálica abafada pela água | -10dB |
| 22.0s | 5-Escuro | Apagão elétrico | Buzz de transformador falhando + click seco | -13dB |
| 23.5s | 5-Escuro | Chuva começando | Gotas individuais → chuva constante (filtro abre em 1.5s) | -11dB |
| 25.0s | 5-Escuro | Relâmpago 1 | Trovão distante (reverb 3s, low-pass) | -9dB |
| 26.5s | 5-Escuro | Relâmpago 2 | Trovão próximo (crack agudo + boom grave) | -8dB |
| 28.0s | 6-Mar | Onda grande | Swell oceânico completo (0-20kHz), duração 4s | -10dB |
| 30.0s | 6-Mar | Gaivotas | 2-3 chamados distantes com reverb de espaço aberto | -15dB |
| 32.0s | 6-Mar | Detritos flutuando | Madeira/plástico batendo suavemente | -17dB |
| 35.0s | 7-Tubarão | Splash subaquático | Bolhas grandes + movimento de água densa | -12dB |
| 36.5s | 7-Tubarão | Nadada de tubarão | Cauda cortando água (whoosh grave rítmico, 3 ciclos) | -13dB |
| 38.0s | 7-Tubarão | Cardume dispersando | Pequenos splashes rápidos (staccato aquático) | -14dB |
| 42.0s | 8-CTA | Gotejamento | Gotas caindo de prédios (eco metálico, intervalos irregulares) | -16dB |
| 43.5s | 8-CTA | Amanhecer sonoro | Pássaro solitário (cantoria suave, reverb curto) | -18dB |
| 45.0s | 8-CTA | Vento calmo | Brisa suave (contrastando com tempestade anterior) | -19dB |
| 48.0s | 9-Fade | Fade out geral | Todos os elementos reduzem volume linearmente em 2s | -∞dB |

## Audio Ducking (Mix Inteligente)

### Regras de Prioridade
1. **Locução** sempre em -3dB peak (prioridade máxima)
2. **Trilha sonora** reduz para -18dB quando locução está ativa
3. **SFX críticos** (relâmpago, tubarão) mantêm -8dB mesmo com locução
4. **SFX ambientais** reduzem para -20dB durante locução

### Curvas de Ducking
- **Attack:** 50ms (rápido o suficiente para não cortar início da fala)
- **Release:** 300ms (suave, evita "pumping" audível)
- **Threshold:** -20dB (aciona apenas quando locução ultrapassa esse nível)
- **Ratio:** 4:1 (compressão moderada na trilha)

## Especificações de Exportação
- **Formato:** WAV 48kHz 24-bit estéreo
- **Nome do arquivo:** `mix_mundo_submerso_v1.wav`
- **Duração total:** 50.0s exatos
- **Normalização:** -1dB peak (headroom para plataforma de vídeo)
- **Canais:**
  - Left: Trilha 40% + SFX 60% + Locução 100%
  - Right: Trilha 40% + SFX 60% + Locução 100%
  - Centro (LFE): Sub-bass da trilha + trovões (mono abaixo de 120Hz)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>