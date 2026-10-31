# 🎬 SUPER-PROMPT MESTRE DE GERAÇÃO AUTÔNOMA (`/video` v10)
## Como Usar:
Basta digitar no chat:
```bash
/video "E se a gravidade da Terra dobrasse por 5 minutos?"
```
Ou simplesmente mandar:
```bash
/video gere um vídeo completo novo escolhendo o melhor tema
```

O sistema `/video` v10 agora aciona automaticamente as **Skills Restauradas** (`motion-cinema-3d`, `video-storyboard-director`, `remotion-cinematic-master`, `motion-audio-sfx-sync`, `video-render-qa-studio`) e roteia entre os **Modelos Claude Code Ideais**:
- **`claude-opus-5-5`**: Roteiro cinematográfico (`video-1-storyboard`), Rig 3D Articulado estilo Pixar (`video-6-character-designer`), Shaders GLSL + Direção de Câmera Multi-Plano (`video-2-motion-designer`) e Motor 3D Three.js (`video-3-remotion-eng`).
- **`claude-sonnet-5` (~250ms)**: Seleção de Nicho (`video-8-story-tracker`), Prompts de Cena para Midjourney/Kling/Runway (`video-7-scene-assets`), Locução Emocional (`video-9-narration-engine`), Web Audio API (`video-4-audio-sfx`) e Auditoria QA (`video-5-qa-render`).

---

## 📋 O Template de Prompt Interno que o `/video` Executa Automaticamente:

```markdown
Atue como o Showrunner do Estúdio /video v10. Execute as 9 fases em modo One-Shot Autônomo (sem parar para perguntas):

1. [video-8-story-tracker | claude-sonnet-5] Consulte `kit-video-3d/nichos-validados.md` e `historias-usadas.json`. Escolha um tema inédito de altíssima retenção (se o usuário não passou um).
2. [video-1-storyboard | claude-opus-5-5] Escreva o roteiro de escalada narrativa (45-50s, 120-150 palavras, 8 cenas + fade) onde cada frase é uma transformação visual clara no cenário.
3. [video-6-character-designer | claude-opus-5-5] Aplique a skill `motion-cinema-3d`:
   - Garanta que o Personagem Mestre 3D (`src/character3d.js`) use 100% geometrias orgânicas (cápsulas, esferas e cilindros com taper — ZERO BoxGeometry crua no corpo).
   - Mantenha a hierarquia esquelética completa: `pelvisPivot` -> `torso` -> `head` (com pálpebras piscando, duplo catchlight especular, sobrancelhas e boca expressivas), `leftArm/rightArm` -> `leftElbow/rightElbow` -> `leftHand/rightHand`, e `leftLeg/rightLeg` -> `leftKnee/rightKnee` -> `leftFoot/rightFoot` (botas presas às pernas).
4. [video-2-motion-designer | claude-opus-5-5] Configure `CAMERA_SHOTS` em `src/videoEngine.js` com planos cinematográficos variados por cena (Close-Up no Hook/CTA, Medium Shot na reação, Low-Angle na ameaça, Wide/High-Angle no clímax) — NUNCA câmera estática distante a z=18.
5. [video-7-scene-assets | claude-sonnet-5] Gere `PROMPTS-IMAGENS-PRONTOS.md` na pasta do vídeo com o bloco fixo do Personagem Mestre injetado em todos os Image Prompts (Midjourney v6 `--cref` / Leonardo Phoenix) e Video Prompts (Kling 1.6 / Runway Gen-3 / Veo 2).
6. [video-3-remotion-eng | claude-opus-5-5] Atualize `src/sceneBuilder3d.js` e `src/videoEngine.js` com PRNG semeado determinístico (`createSeededRandom`), corredor de visão limpo para a câmera e shader GLSL `celShader.js` com `smoothstep` + Fresnel Rim Light.
7. [video-9-narration-engine | claude-sonnet-5] Gere `05-narracao.md` com tags `[Curioso]`, `[Chocado]`, `[Tenso]`, `(PAUSA)` e números por extenso.
8. [video-4-audio-sfx | claude-sonnet-5] Sincronize `src/audioEngine.js` e `src/subtitles.js`.
9. [video-5-qa-render | claude-sonnet-5] Execute `npm run build` no terminal e valide 0 erros.
```
