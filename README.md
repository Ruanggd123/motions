# 🎬 Motions — Estúdio de Animações & Vídeos 3D Verticais (9:16)

> Pipeline de produção audiovisual autônoma para Reels, Shorts e TikTok com **Three.js**, **VoiceStudio**, renderizador acelerado **Turbo Dual-GPU** e kits virais automatizados para YouTube.

---

## 🚀 Destaques da Arquitetura

- **Single-File 3D HTML Interativo:** Cada projeto é gerado em um único arquivo `.html` autônomo com áudio master embutido em Base64, HUD com barra de progresso segmentada, legendas cinéticas e pins 3D projetados em tempo real (`camera.updateMatrixWorld()`).
- **Visão de Cima (Top-Down) & Transparência Raio-X:** Câmera elevada (`45°–60°`) com paredes translúcidas (`opacity: 0.05`, `depthWrite: false`) e contorno luminoso ciano para visualização 100% desobstruída de mecanismos internos.
- **Motor de Interpolação Suave (`evaluateAndRenderAtTime`):** Transições contínuas com curva `easeInOutCubic` (1.35s) eliminando cortes secos e agitação mecânica.
- **VoiceStudio Neural + Analog DSP (`http://127.0.0.1:8000`):** Locução em tomada única contínua (`edge-tts -f` + timestamps `.vtt`), sem interrupções entre frases, masterizada com Pad documental em `C maj9`, ducking IIR suave e Soft-Knee Limiter (`Math.tanh`).
- **Renderizador Turbo Dual-GPU (`scripts/render-turbo-gpu.mjs`):** Aceleração de hardware via Direct3D11 ANGLE com múltiplos processos paralelos Chrome headless, entregando vídeo HD 720×1280 @ 30fps (`H.264 / AAC 192k`) em alta velocidade.
- **Kit Viral para Redes Sociais (`scripts/generate-youtube-kit.mjs`):** Geração automática de títulos de alto CTR, descrição SEO com capítulos temporizados (`MM:SS`) e tags prontas para o YouTube Studio.

---

## 📦 Projetos Produzidos

### 1. 🐈📦 O Gato de Schrödinger
- **HTML Interativo:** [`gato-schrodinger-3d.html`](./gato-schrodinger-3d.html)
- **Vídeo Final MP4:** [`output/video-gato-schrodinger.mp4`](./output/video-gato-schrodinger.mp4)
- **Kit Viral do YouTube:** [`output/youtube-kit-gato-schrodinger.md`](./output/youtube-kit-gato-schrodinger.md)

### 2. ⚡🧬 O Paradoxo do Teletransporte
- **HTML Interativo:** [`teletransporte-3d.html`](./teletransporte-3d.html)
- **Vídeo Final MP4:** [`output/video-teletransporte-quantico.mp4`](./output/video-teletransporte-quantico.mp4)
- **Kit Viral do YouTube:** [`output/youtube-kit-teletransporte-quantico.md`](./output/youtube-kit-teletransporte-quantico.md)

---

## 🛠️ Comandos Rápidos

```bash
# Iniciar servidor VoiceStudio (porta 8000)
node scripts/voicestudio-server.mjs

# Renderizar vídeo HD com aceleração Turbo Dual-GPU
node scripts/render-turbo-gpu.mjs <arquivo.html> <audio.wav> <saida.mp4> <duracao_segundos>

# Gerar Kit Viral do YouTube (Títulos, Descrição e Tags)
node scripts/generate-youtube-kit.mjs
```
