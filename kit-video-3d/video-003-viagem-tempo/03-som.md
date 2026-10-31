# 🔊 FASE 8 — AUDIO SFX & SOUND DESIGN
## Tema: E Se Você Voltasse 10 Segundos no Tempo?
## Duração Total: ~45 segundos
---
## Tabela de Efeitos Sonoros (Sincronização via Código)
| Tempo (s) | Frame Inicial | Ação na tela | Efeito sonoro (descrição) | Volume |
|---|---|---|---|---|
| 0-2 | 0 | Relógio girando reverso | Whoosh reverso suave + tick de relógio acelerado | Médio |
| 2-4 | 60 | "Dez segundos" aparece | Pop metálico do número + eco curto | Médio |
| 4-7 | 120 | Café caindo reverso | Cerâmica deslizando reverso + líquido voltando | Alto |
| 7-11 | 210 | "Já está segurando" | Catch abafado (pano) + suspiro de alívio | Médio |
| 11-14 | 330 | Carro avançando | Motor acelerando + pneu cantando | Alto |
| 14-18 | 420 | "Desvia antes de buzinar" | Buzina cortada abruptamente + whoosh de esquiva | Alto→Baixo |
| 18-21 | 540 | Bola voltando no tempo | Som de bola reverso + crowd noise fading | Médio |
| 21-25 | 630 | "Marca o gol" | Impacto de bola na rede + crowd explosion | Alto |
| 25-26 | 750 | (PAUSA) — momento de silêncio | Silêncio quase total (0.5s) | Nenhum |
| 26-30 | 780 | Tela glitchando | Glitch digital stutter + static noise | Médio |
| 30-33 | 900 | "Algo muda sem perceber" | Sub-bass rumble crescente + heartbeat | Alto |
| 33-38 | 990 | Duas opções flutuando | Chime etéreo duplo (usar/medo) | Baixo |
| 38-40 | 1140 | Corte seco para preto | Hard cut audio blackout | Nenhum |
## Prompt de Música (Inglês) — Gerar via Suno/Udio
```
Minimalist electronic suspense underscore with reverse clock ticking pulse, dark ambient pads underneath, building tension through each time rewind moment, dynamic swells only during pause moments, never overpowers narration, cinematic curiosity-driven tension escalating to glitch climax at 0:26, then dropping to eerie silence for the closing dilemma, total duration 45 seconds, 80 BPM with reverse percussion elements, dark minor key with occasional major resolution, no melody, no vocals, clean mix with generous headroom for voiceover, style reference: sci-fi thriller meets lo-fi ambient.
```
## Componente de Áudio Remotion (Ducking Dinâmico)
```typescript
// src/components/AudioTrack.tsx
import { Audio, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { staticFile } from 'remotion';
export const AudioTrack: React.FC = () => {
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
// Ducking: música baixa quando narração está ativa (frame 30-1140)
const musicVolume = interpolate(
frame,
[0, 30, 1140, 1200],
[0.5, 0.1, 0.1, 0.5],
{ extrapolateRight: 'clamp' }
);
return (
<>
<Audio src={staticFile('audio/narration.mp3')} volume={1} />
<Audio src={staticFile('audio/music.mp3')} volume={musicVolume} />
{/* SFX sincronizados por frame */}
<Audio src={staticFile('audio/sfx/clock-rewind.mp3')} startFrom={0} volume={0.8} />
<Audio src={staticFile('audio/sfx/coffee-catch.mp3')} startFrom={4} volume={0.85} />
<Audio src={staticFile('audio/sfx/car-horn.mp3')} startFrom={11} volume={0.9} />
<Audio src={staticFile('audio/sfx/goal-score.mp3')} startFrom={21} volume={0.9} />
<Audio src={staticFile('audio/sfx/glitch.mp3')} startFrom={26} volume={0.7} />
<Audio src={staticFile('audio/sfx/heartbeat.mp3')} startFrom={30} volume={0.6} />
</>
);
};
```
## Notas de Mixagem
- Voz sempre -3dB acima da música
- SFX acontecem NO MOMENTO EXATO da ação visual (não na palavra)
- O momento de PAUSA (25-26s) é o mais importante — silêncio cria peso
- O glitch (26-30s) é o clímax sonoro — stutter digital + sub-bass
- Corte seco final (38-40s) é áudio e vídeo simultâneos — zero fade-out
- Ducking dinâmico: música 0.5 sem voz, 0.1 durante voz