# Guia Rápido: Ativar Upload Automático no YouTube (API Oficial)

O script [youtube_auto_uploader.cjs](youtube_auto_uploader.cjs) já faz **tudo** automaticamente (lê título, descrição, tags e horário do kit do episódio, envia o `.mp4` e agenda no seu canal).

Como a Google Cloud exige login na sua conta Google para emitir a chave OAuth, **você só precisa fazer estes 4 passos uma única vez**:

---

## Os 4 passos no Google Cloud Console

1. **Criar/escolher um projeto**
   - Acesse: https://console.cloud.google.com/
   - No topo, clique no seletor de projeto e crie um projeto novo (ex.: `Duplo Sentido Uploader`).

2. **Ativar a YouTube Data API v3**
   - No menu esquerdo: **APIs e Serviços → Biblioteca** (ou acesse https://console.cloud.google.com/apis/library/youtube.googleapis.com).
   - Pesquise por **`YouTube Data API v3`** e clique em **ATIVAR**.

3. **Configurar a Tela de permissão OAuth**
   - No menu esquerdo: **APIs e Serviços → Tela de permissão OAuth** (ou **Google Auth Platform → Público-alvo**).
   - Escolha **Externo** (*External*), preencha o nome do app (ex.: `Duplo Sentido Uploader`) e seu e-mail.
   - Em **Usuários de teste** (*Test users*), clique em **+ ADD USERS** e adicione o **e-mail Google que administra o seu canal do YouTube**.

4. **Baixar o arquivo JSON (`App para computador`)**
   - Vá em **APIs e Serviços → Credenciais → + CRIAR CREDENCIAIS → ID do cliente OAuth**.
   - Em **Tipo de aplicativo**, selecione **App para computador** (*Desktop app*).
   - Clique em **Criar** e depois em **FAZER DOWNLOAD DO JSON** (`client_secret_...json`).
   - Deixe o arquivo na sua pasta `Downloads` (ou salve em `.youtube-auth/client_secret.json`) e me avise **"pronto, baixei"**!

---

## Como eu conecto e agendo depois disso

Quando você baixar o JSON, eu rodo:
```bash
node series/duplo-sentido-3d/youtube_auto_uploader.cjs auth
```
Isso abre a tela do Google no seu navegador uma única vez para você clicar em **Permitir**. Depois disso, qualquer episódio aprovado é enviado e agendado em segundos direto do terminal!

---

## Regras oficiais importantes da YouTube Data API v3

- **Vídeos privados em projeto novo sem auditoria:** Por regra oficial do Google, projetos criados após 28/07/2020 que ainda não passaram pela *YouTube API Compliance Audit* podem ter envios via API travados como **Privado** na hora da publicação até completar a auditoria gratuita do Google (ou liberar em 1 clique no Studio). O agendamento com `privacyStatus: "private"` + `publishAt` funciona na criação do upload.
- **Comentário fixado:** A API consegue postar comentários (`commentThreads.insert`) depois que o vídeo está público ou não listado, mas **fixar** o comentário no topo continua exigindo 1 clique no YouTube Studio.
