# 🎬 Motions — Central de Criação de Vídeos Verticais (9:16)

> Três estúdios de animação e vídeo 100% independentes para TikTok, Reels e Shorts com skills dedicadas no Antigravity e Claude Code.

---

## 🌐 Hub Central de Navegação
Abra o dashboard no navegador para acessar e testar todos os projetos com 1 clique:
👉 **[`hub-projetos.html`](./hub-projetos.html)** (ou via servidor local: `http://localhost:8000/hub-projetos.html`)

---

## 🎭 Os 3 Formatos de Vídeo & Suas Skills Dedicadas

### 1. 🎬 Séries de Animação 2D Interativa ("Você Decide o Fim")
- **Comando da Skill:** `/animacao-2d`
- **Pasta:** [`series/condominio-bloco-c/`](./series/condominio-bloco-c/)
- **Player de Aprovação Visual:** [`series/condominio-bloco-c/estudio-aprovacao-visual.html`](./series/condominio-bloco-c/estudio-aprovacao-visual.html)
- **Características:**
  - Personagens modulares com rig ósseo vetorial Bézier (`VoceMorador.js`, `SeuValdirPorteiro.js`).
  - Cenários 2.5D com 4 camadas de paralaxe e reflexo real no piso (`PortariaBlocoC.js`).
  - Dublagem multi-voz realista com sincronia labial e VoiceStudio.
  - Overlay interativo minimalista de decisão via emojis virais (`🏃‍♂️` vs `🛡️`).

### 2. 🥊 Combate 3D & Biomecânica de Nocaute ("Fighter Arena")
- **Comando da Skill:** `/luta-3d` ou `/luta`
- **Pasta / Arquivos:**
  - Showcase Anatômico: [`fighter-showcase.html`](./fighter-showcase.html)
  - Biomecânica Nocaute: [`biomecanica-nocaute-3d.html`](./biomecanica-nocaute-3d.html)
  - Combo Mortal: [`combo-mortal-3d.html`](./combo-mortal-3d.html)
  - Soco no Queixo: [`soco-no-queixo-3d.html`](./soco-no-queixo-3d.html)
  - Módulos de Suporte: [`src/fighter/`](./src/fighter/) e [`src/kodeo-scene-builder.js`](./src/kodeo-scene-builder.js)
- **Características:**
  - Manequim anatômico 3D de alta performance com Three.js.
  - Modo Raio-X seletivo (crânio, costelas, mandíbula, coluna).
  - Vetores físicos de força em Newtons (N) e torque cervical.
  - Hitstop dramático (congelamento no milissegundo do impacto) com câmera 60fps.

### 3. 🌌 Cinema 3D Cósmico & Curiosidades Virais ("Buraco Negro / O Que Aconteceria Se...")
- **Comando da Skill:** `/video-3d` ou `/video`
- **Arquivos:**
  - [`buraco-negro-3d.html`](./buraco-negro-3d.html)
  - [`estrela-neutrons-3d.html`](./estrela-neutrons-3d.html)
  - [`gravidade-zero-3d.html`](./gravidade-zero-3d.html)
  - [`gato-schrodinger-3d.html`](./gato-schrodinger-3d.html)
  - [`implosao-submarino-3d.html`](./implosao-submarino-3d.html)
  - [`oxigenio-5-segundos-3d.html`](./oxigenio-5-segundos-3d.html)
  - [`teletransporte-3d.html`](./teletransporte-3d.html)
  - [`terra-parou-3d.html`](./terra-parou-3d.html)
  - Kit Viral: [`kit-video-3d/`](./kit-video-3d/)
- **Características:**
  - 12 cenários procedurais tridimensionais distintos por vídeo.
  - Personagem sofrendo ações físicas diretas (expressões Pixar, dor, queda, alívio respiratório).
  - Tela 3D pura sem poluição de legendas no DOM (pins 3D flutuantes).
  - Áudio VoiceStudio contínuo sem cortes (+2s tail margin).
  - Renderizador acelerado Dual-GPU e Kit Viral do YouTube Shorts (Títulos A/B + SEO).

---

## 🛠️ Comandos Globais de Produção

```bash
# Iniciar servidor local (porta 8000)
node series/condominio-bloco-c/serve.js

# Renderizar vídeo 3D com aceleração Turbo Dual-GPU
node scripts/render-turbo-gpu.mjs <arquivo.html> <audio.wav> <saida.mp4> <duracao_segundos>

# Executar suíte de validação de projeto
node "C:\Users\Ruan Gomes\.claude\scripts\verify-project.mjs"
```
