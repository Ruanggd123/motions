# ✅ CHECKLIST DE QUALIDADE 3D — 12 Pontos Críticos

## 1. Consistência Visual do Personagem
- [ ] Leo v10 mantém proporções idênticas em todas as 8 cenas (altura 1.4m equivalente)
- [ ] Moletom amarelo (#F4C430) sem variação de cor entre iluminações diferentes
- [ ] Blendshapes faciais ativam corretamente (curioso/chocado/tenso/exausto)
- [ ] Auto-Blink funciona com intervalo realista (3-6s aleatório)
- [ ] Animação de respiração visível mas sutil (peito expande 2-3%)

## 2. Cenário Persistente Sem Distortion
- [ ] Mesma geometria de cidade em todas as transições (zero `clearSceneObjects()`)
- [ ] Nível da água interpola suavemente entre cenas (sem saltos bruscos)
- [ ] Carros mudam de estado corretamente: estático → flutuante → deriva
- [ ] Prédios mantêm posição fixa (sem jitter ou sliding entre frames)
- [ ] Fog density transiciona suavemente (clareza → névoa → escuridão → amanhecer)

## 3. Direção de Câmera Cinematográfica
- [ ] 8 planos de câmera posicionados conforme especificação (pos/lookAt/FOV)
- [ ] Push-in lento acumula até 0.22 unidades ao longo de cada cena
- [ ] Handheld shake ativo apenas nas cenas 2-7 (valores 0.015-0.035)
- [ ] Transições de câmera usam lerp de 45% em cortes de cena
- [ ] FOV transiciona suavemente entre planos (38° → 46°)

## 4. Iluminação e Rim Light
- [ ] Key Light muda temperatura corretamente (5500K → 6500K → 3200K → 7500K → 4500K)
- [ ] Ambient Light ajusta cor e intensidade por cena
- [ ] Rim Light Fresnel (#87CEFA) sempre ativo separando personagem do fundo
- [ ] Relâmpagos na cena 5 iluminam cena brevemente (flash de 0.15s com fade 0.3s)
- [ ] Lanterna da mochila acende progressivamente (intensidade 0.2 → 2.4 → 0.6)

## 5. Física da Água
- [ ] Ondas sinusoidais animadas com frequência realista (0.5-1.2Hz)
- [ ] Espuma nas bordas dos objetos submersos
- [ ] Bolhas subindo da água (partículas com velocidade ascendente)
- [ ] Correnteza arrasta objetos leves (galhos, detritos) com direção consistente
- [ ] Reflexos na superfície da água atualizam em tempo real

## 6. Animação do Tubarão
- [ ] Modelo estilizado cel-shaded consistente com estética do Leo
- [ ] Natação procedural com oscilação de cauda (freq 1.8Hz, amplitude 0.4rad)
- [ ] Trajetória segue spline entre prédios submersos (sem clipping)
- [ ] Cardume menor dispersa quando tubarão se aproxima
- [ ] Silhueta visível através da água turva (shader de profundidade)

## 7. Sistema de Partículas
- [ ] Pássaros fogem em bando coordenado na cena 2 (flocking behavior)
- [ ] Chuva ativada na cena 5 com densidade crescente (0 → 100% em 1.5s)
- [ ] Partículas de poeira/lixo voando com vento na cena 2-3
- [ ] Bolhas emergem de objetos submersos continuamente
- [ ] Todas as partículas respeitam safe zone 9:16 (não cortadas em mobile)

## 8. Tipografia e Legendas
- [ ] Fonte Inter/San Francisco Bold, 42px, tracking -0.02em
- [ ] Background rgba(10, 14, 24, 0.88) com border-radius 28px
- [ ] Texto centralizado, max-width 86%, shadow 0 2px 12px rgba(0,0,0,0.7)
- [ ] Fade in/out de 0.15s sincronizado com áudio
- [ ] Posição bottom 12% (dentro da safe zone vertical)

## 9. Performance e Renderização
- [ ] 60fps sustentado em preview (Three.js WebGL)
- [ ] Zero memory leaks após 5 loops completos de playback
- [ ] ShadowMap PCFSoft ativo sem artifacts de z-fighting
- [ ] ACESFilmicToneMapping com exposição ajustável (1.12 → 0 no fade)
- [ ] Pixel ratio limitado a 2x (evita overload em telas Retina)

## 10. Sincronia Audiovisual
- [ ] SFX disparam no frame exato (tolerância ±1 frame a 30fps)
- [ ] Locução sincronizada com texto das legendas (delay < 50ms)
- [ ] Audio ducking reduz trilha para -18dB durante fala
- [ ] Relâmpagos coincidem com picos de trovão no áudio
- [ ] Fade out final de 2s sincronizado com black screen

## 11. Acessibilidade e Safe Zones
- [ ] Contraste texto/background ≥ 4.5:1 (WCAG AA aprovado)
- [ ] Elementos críticos dentro de safe zone 9:16 (central 80% horizontal, 85% vertical)
- [ ] Reduced motion respected: se prefers-reduced-motion ativo, desativar shake/push-in
- [ ] Alt text descritivo para thumbnail exportado
- [ ] Legendas opcionais toggle on/off sem quebrar layout

## 12. Validação Final de Exportação
- [ ] Resolução exata 1080x1920 pixels (sem scaling inadvertido)
- [ ] Frame rate constante 30fps (zero dropped frames no render final)
- [ ] Duração total 50.0s ± 0.1s
- [ ] Codec H.264 High Profile, bitrate ≥ 15Mbps
- [ ] Áudio WAV 48kHz 24-bit, pico máximo -1dB
- [ ] Teste de playback em: iPhone (Portrait), Android (Portrait), Desktop (vertical embed)
- [ ] Zero artifacts de compressão visíveis em áreas de gradiente (céu/água)
- [ ] Arquivo final ≤ 150MB (otimizado para upload em redes sociais)

## Critério de Aprovação
**APROVADO PARA RENDER:** Mínimo 11/12 pontos verificados como OK.
**REPROVADO:** Qualquer item crítico (1, 2, 9, 12) falhar requer refatoração antes de render final.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>