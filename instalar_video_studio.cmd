@echo off
setlocal enabledelayedexpansion
title Instalador do Estudio de Video Agente e Engenharia Reversa
echo =====================================================================
echo   Iniciando Instalacao do Estudio de Video e Skills de IA
echo =====================================================================

:: 1. Definir diretorios base
set "BASE=%USERPROFILE%\ai-video-studio"
set "SKILLS=%USERPROFILE%\.claude\skills"

echo [*] Criando estrutura de pastas em: %BASE%
if not exist "%BASE%\01-motion-code" mkdir "%BASE%\01-motion-code"
if not exist "%BASE%\02-capcut-reverse" mkdir "%BASE%\02-capcut-reverse"
if not exist "%BASE%\03-nle-bridges" mkdir "%BASE%\03-nle-bridges"
if not exist "%BASE%\04-pipelines-autocut" mkdir "%BASE%\04-pipelines-autocut"
if not exist "%BASE%\05-generative-apis" mkdir "%BASE%\05-generative-apis"
if not exist "%BASE%\06-skills-hubs" mkdir "%BASE%\06-skills-hubs"

if not exist "%SKILLS%\public\vectcut-api" mkdir "%SKILLS%\public\vectcut-api"
if not exist "%SKILLS%\moneyprinterturbo-video" mkdir "%SKILLS%\moneyprinterturbo-video"

:: 2. Instalar Skills Globais e Servidores MCP essenciais
echo [*] Instalando Skills Globais via NPX...
call npx -y skills add heygen-com/hyperframes --global --yes
call npx -y skills add heygen-com/hyperframes-community-skills --global --yes
call npx -y skills add remotion-dev/skills --global --yes
call npx -y skills add artubss/SKILLS-CLAUDE-CODE --skill motion-canvas --agent claude-code

echo [*] Instalando Servidores MCP via NPM Global...
call npm install -g remotion-media-mcp mcp-kling @ahmeterdempmk/mcp-motion

:: 3. Clonar Ferramentas de Motion Graphics e Video-as-Code
echo [*] Clonando ferramentas de Motion Graphics...
cd /d "%BASE%\01-motion-code"
if not exist "hyperframes" git clone --depth 1 https://github.com/heygen-com/hyperframes.git
if not exist "hyperframes-community-skills" git clone --depth 1 https://github.com/heygen-com/hyperframes-community-skills.git
if not exist "claude-remotion-skill" git clone --depth 1 https://github.com/haidrrrry/claude-remotion-skill.git
if not exist "claude-code-video-toolkit" git clone --depth 1 https://github.com/digitalsamba/claude-code-video-toolkit.git
if not exist "Claude-Code-Video-Toolkit" git clone --depth 1 https://github.com/wilwaldon/Claude-Code-Video-Toolkit.git
if not exist "remotion-mcp-app" git clone --depth 1 https://github.com/mcp-use/remotion-mcp-app.git
if not exist "manim-skill" git clone --depth 1 https://github.com/awesome-skills/manim-skill.git
if not exist "manim-mcp-server" git clone --depth 1 https://github.com/abhiemj/manim-mcp-server.git
if not exist "manim-mcp" git clone --depth 1 https://github.com/paulnegz/manim-mcp.git

:: 4. Clonar Engenharia Reversa do CapCut e JianYing
echo [*] Clonando ferramentas do CapCut e JianYing...
cd /d "%BASE%\02-capcut-reverse"
if not exist "pyCapCut" git clone --depth 1 https://github.com/GuanYixuan/pyCapCut.git
if not exist "pyJianYingDraft" git clone --depth 1 https://github.com/GuanYixuan/pyJianYingDraft.git
if not exist "VectCutAPI" git clone --depth 1 https://github.com/sun-guannan/VectCutAPI.git
if not exist "vectcut-skill" git clone --depth 1 https://github.com/HUNSETO1413/vectcut-skill.git
if not exist "capcut-cli" git clone --depth 1 https://github.com/renezander030/capcut-cli.git

:: 5. Clonar Pontes MCP para NLEs Profissionais (DaVinci, FCP, Blender)
echo [*] Clonando pontes de editores profissionais...
cd /d "%BASE%\03-nle-bridges"
if not exist "samuelgursky-resolve-mcp" git clone --depth 1 https://github.com/samuelgursky/davinci-resolve-mcp.git samuelgursky-resolve-mcp
if not exist "lordhoell-resolve-mcp" git clone --depth 1 https://github.com/lordhoell/davinci-resolve-mcp.git lordhoell-resolve-mcp
if not exist "hiteshk03-resolve-free-bridge" git clone --depth 1 https://github.com/hiteshK03/davinci-resolve-mcp.git hiteshk03-resolve-free-bridge
if not exist "mateo-resolve-lua-bridge" git clone --depth 1 https://github.com/mateo-khalil/davinci-resolve-mcp.git mateo-resolve-lua-bridge
if not exist "fcp-mcp" git clone --depth 1 https://github.com/dreliq9/fcp-mcp.git
if not exist "mcp-blender" git clone --depth 1 https://github.com/RFingAdam/mcp-blender.git

:: 6. Clonar Pipelines Completos e Corte por Transcricao
echo [*] Clonando pipelines completos e cortadores de audio...
cd /d "%BASE%\04-pipelines-autocut"
if not exist "MoneyPrinterTurbo" git clone --depth 1 https://github.com/harry0703/MoneyPrinterTurbo.git
if not exist "VideoLingo" git clone --depth 1 https://github.com/Huanshere/VideoLingo.git
if not exist "cut-video" git clone --depth 1 https://github.com/louisedesadeleer/cut-video.git
if not exist "auto-editor" git clone --depth 1 https://github.com/wyattblue/auto-editor.git

:: 7. Clonar Wrappers de APIs Generativas e GPU Local
echo [*] Clonando wrappers generativos e ComfyUI-MCP...
cd /d "%BASE%\05-generative-apis"
if not exist "comfyui-mcp" git clone --depth 1 https://github.com/artokun/comfyui-mcp.git
if not exist "runway-api" git clone --depth 1 https://github.com/useapi/runway-api.git
if not exist "kling-api" git clone --depth 1 https://github.com/aself101/kling-api.git
if not exist "Luma-API" git clone --depth 1 https://github.com/LumaAI-API/Luma-API.git

:: 8. Clonar Catalogos e Hubs de Skills
echo [*] Clonando catalogos de skills de video...
cd /d "%BASE%\06-skills-hubs"
if not exist "awesome-claude-video-skills" git clone --depth 1 https://github.com/zhuyansen/awesome-claude-video-skills.git
if not exist "motion-skills" git clone --depth 1 https://github.com/iart-ai/motion-skills.git
if not exist "avenoxskills" git clone --depth 1 https://github.com/avenoxai/avenoxskills.git

:: 9. Copiar Skills Locais para a pasta de leitura do Claude Code / OpenCode
echo [*] Copiando skills para a pasta de contexto do agente...
xcopy /E /I /Y "%BASE%\01-motion-code\claude-remotion-skill\remotion-motion-graphics" "%SKILLS%\remotion-motion-graphics"
xcopy /E /I /Y "%BASE%\02-capcut-reverse\vectcut-skill\skill\*" "%SKILLS%\public\vectcut-api"
xcopy /E /I /Y "%BASE%\01-motion-code\manim-skill" "%SKILLS%\manim-skill"
xcopy /E /I /Y "%BASE%\04-pipelines-autocut\cut-video" "%SKILLS%\cut-video"
xcopy /E /I /Y "%BASE%\04-pipelines-autocut\MoneyPrinterTurbo\docs\skill" "%SKILLS%\moneyprinterturbo-video"

:: 10. Configurar Ambiente Python com UV
echo [*] Configurando ambiente Python com UV...
cd /d "%BASE%"
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [*] Instalando UV no sistema...
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
)
call uv venv --python 3.11
call uv pip install pycapcut mpt manim mcp requests

echo =====================================================================
echo   Instalacao Finalizada com Sucesso!
echo   Pastas: %BASE%
echo   Skills: %SKILLS%
echo =====================================================================
pause