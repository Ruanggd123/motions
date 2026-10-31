# Super-Prompt de Instalação Autônoma — Estúdio de Vídeo & Engenharia Reversa

> **Como usar:** Copie todo o conteúdo abaixo e cole diretamente no terminal do Claude Code ou OpenCode. O agente executará toda a instalação de forma autônoma.

---

Atue como Engenheiro de Infraestrutura de Automação de Vídeo. Sua missão é configurar e instalar na minha máquina local a suíte completa de ferramentas de engenharia reversa de vídeo, frameworks de motion graphics e pontes MCP para uso direto pelo Claude Code e OpenCode.

Execute todas as ações no terminal de forma autônoma (sem pedir confirmação a cada comando, aplicando flags silenciosas/não interativas quando disponíveis).

Siga rigorosamente este plano de execução:

## 1. DEFINIÇÃO DA ÁRVORE DE DIRETÓRIOS

Crie a pasta raiz no diretório de usuário:
- Windows: `%USERPROFILE%\ai-video-studio`
- Linux/macOS: `~/ai-video-studio`

Dentro dela, crie as seguintes subpastas:
- `01-motion-code`
- `02-capcut-reverse`
- `03-nle-bridges`
- `04-pipelines-autocut`
- `05-generative-apis`
- `06-skills-hubs`

Crie também a pasta de skills do agente:
- `%USERPROFILE%\.claude\skills\` (ou `~/.claude/skills/`)
- Subpasta: `public/vectcut-api`

## 2. INSTALAÇÃO DE SKILLS OFICIAIS E MCPs GLOBAIS

Execute os comandos de instalação de skills e servidores MCP globais para que os pacotes fiquem prontos para uso:

```bash
npx -y skills add heygen-com/hyperframes --global --yes
npx -y skills add heygen-com/hyperframes-community-skills --global --yes
npx -y skills add remotion-dev/skills --global --yes
npx -y skills add artubss/SKILLS-CLAUDE-CODE --skill motion-canvas --agent claude-code
npm install -g remotion-media-mcp mcp-kling @ahmeterdempmk/mcp-motion
```

## 3. CLONAGEM DOS REPOSITÓRIOS VIA GIT (--depth 1)

Navegue até as respectivas subpastas e clone os projetos:

### Em `01-motion-code`:
```bash
git clone --depth 1 https://github.com/heygen-com/hyperframes.git
git clone --depth 1 https://github.com/heygen-com/hyperframes-community-skills.git
git clone --depth 1 https://github.com/haidrrrry/claude-remotion-skill.git
git clone --depth 1 https://github.com/digitalsamba/claude-code-video-toolkit.git
git clone --depth 1 https://github.com/wilwaldon/Claude-Code-Video-Toolkit.git
git clone --depth 1 https://github.com/mcp-use/remotion-mcp-app.git
git clone --depth 1 https://github.com/awesome-skills/manim-skill.git
git clone --depth 1 https://github.com/abhiemj/manim-mcp-server.git
git clone --depth 1 https://github.com/paulnegz/manim-mcp.git
```

### Em `02-capcut-reverse`:
```bash
git clone --depth 1 https://github.com/GuanYixuan/pyCapCut.git
git clone --depth 1 https://github.com/GuanYixuan/pyJianYingDraft.git
git clone --depth 1 https://github.com/sun-guannan/VectCutAPI.git
git clone --depth 1 https://github.com/HUNSETO1413/vectcut-skill.git
git clone --depth 1 https://github.com/renezander030/capcut-cli.git
```

### Em `03-nle-bridges`:
```bash
git clone --depth 1 https://github.com/samuelgursky/davinci-resolve-mcp.git samuelgursky-resolve-mcp
git clone --depth 1 https://github.com/lordhoell/davinci-resolve-mcp.git lordhoell-resolve-mcp
git clone --depth 1 https://github.com/hiteshK03/davinci-resolve-mcp.git hiteshk03-resolve-free-bridge
git clone --depth 1 https://github.com/mateo-khalil/davinci-resolve-mcp.git mateo-resolve-lua-bridge
git clone --depth 1 https://github.com/dreliq9/fcp-mcp.git
git clone --depth 1 https://github.com/RFingAdam/mcp-blender.git
```

### Em `04-pipelines-autocut`:
```bash
git clone --depth 1 https://github.com/harry0703/MoneyPrinterTurbo.git
git clone --depth 1 https://github.com/Huanshere/VideoLingo.git
git clone --depth 1 https://github.com/louisedesadeleer/cut-video.git
git clone --depth 1 https://github.com/wyattblue/auto-editor.git
```

### Em `05-generative-apis`:
```bash
git clone --depth 1 https://github.com/artokun/comfyui-mcp.git
git clone --depth 1 https://github.com/useapi/runway-api.git
git clone --depth 1 https://github.com/aself101/kling-api.git
git clone --depth 1 https://github.com/LumaAI-API/Luma-API.git
```

### Em `06-skills-hubs`:
```bash
git clone --depth 1 https://github.com/zhuyansen/awesome-claude-video-skills.git
git clone --depth 1 https://github.com/iart-ai/motion-skills.git
git clone --depth 1 https://github.com/avenoxai/avenoxskills.git
```

## 4. INTEGRAÇÃO DAS SKILLS LOCAIS

Copie os arquivos de instruções para que seu próprio ambiente de agente os reconheça:

```bash
# Windows (xcopy)
xcopy /E /I /Y "%USERPROFILE%\ai-video-studio\01-motion-code\claude-remotion-skill\remotion-motion-graphics" "%USERPROFILE%\.claude\skills\remotion-motion-graphics"
xcopy /E /I /Y "%USERPROFILE%\ai-video-studio\02-capcut-reverse\vectcut-skill\skill\*" "%USERPROFILE%\.claude\skills\public\vectcut-api"
xcopy /E /I /Y "%USERPROFILE%\ai-video-studio\01-motion-code\manim-skill" "%USERPROFILE%\.claude\skills\manim-skill"
xcopy /E /I /Y "%USERPROFILE%\ai-video-studio\04-pipelines-autocut\cut-video" "%USERPROFILE%\.claude\skills\cut-video"
xcopy /E /I /Y "%USERPROFILE%\ai-video-studio\04-pipelines-autocut\MoneyPrinterTurbo\docs\skill" "%USERPROFILE%\.claude\skills\moneyprinterturbo-video"

# Linux/macOS (cp -r)
cp -r ~/ai-video-studio/01-motion-code/claude-remotion-skill/remotion-motion-graphics ~/.claude/skills/
cp -r ~/ai-video-studio/02-capcut-reverse/vectcut-skill/skill/* ~/.claude/skills/public/vectcut-api/
cp -r ~/ai-video-studio/01-motion-code/manim-skill ~/.claude/skills/
cp -r ~/ai-video-studio/04-pipelines-autocut/cut-video ~/.claude/skills/
cp -r ~/ai-video-studio/04-pipelines-autocut/MoneyPrinterTurbo/docs/skill ~/.claude/skills/moneyprinterturbo-video
```

## 5. CONFIGURAÇÃO DE DEPENDÊNCIAS PYTHON

Verifique se o `uv` está instalado. Se não estiver, instale-o:

```bash
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Na raiz `ai-video-studio`, crie um ambiente virtual com Python 3.11 e instale as bibliotecas base:

```bash
cd %USERPROFILE%\ai-video-studio   # ou cd ~/ai-video-studio
uv venv --python 3.11
uv pip install pycapcut mpt manim mcp requests
```

## 6. VERIFICAÇÃO FINAL

Liste os diretórios criados e apresente um resumo confirmando que as skills e repositórios estão prontos para execução.

### Comandos de teste pós-instalação:

```bash
# Motion graphics determinísticos (HTML/CSS/GSAP)
/hyperframes:hyperframes crie um vídeo de 5 segundos de apresentação do meu produto com fundo gradiente e tipografia cinética

# Edição com Remotion + FFmpeg
"Crie uma animação de logo em Remotion aplicando as regras de motion graphics e validando os frames gerados"

# Drafts do CapCut/JianYing
"Utilize a vectcut-skill para montar um draft vertical 1080x1920 com cortes e legendas"

# DaVinci Resolve Free
"Liste os clipes na timeline atual e faça um corte no segundo 5"
```